"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Animated,
  ScrollView,
} from "react-native"
import { Camera, useCameraDevices } from "react-native-vision-camera"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen"
import Ionicons from "react-native-vector-icons/Ionicons"
import Colors from "../../styles/colors"
import { useMLKitTextRecognition } from "../../hooks/useMLKitTextRecognition"
import AIRecognitionUpdate from "../../components/common/AIRecognitionUpdate"

const AIRecognitionScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [recognitionResult, setRecognitionResult] = useState(null)
  const cameraRef = useRef(null)
  const fadeAnim = useRef(new Animated.Value(1)).current // For guide text fade animation

  const devices = useCameraDevices()
  console.log("Available camera devices:", devices)

  // Find the first back camera device
  const device = Array.isArray(devices) ? devices.find((d) => d.position === "back") : undefined

  // Use the ML Kit text recognition hook
  const { recognizeText, isProcessing, error: modelError, isReady, clearError } = useMLKitTextRecognition()

  useEffect(() => {
    ;(async () => {
      const cameraPermission = await Camera.requestCameraPermission()
      console.log("Camera permission status (useEffect):", cameraPermission)
      setHasPermission(cameraPermission === "authorized" || cameraPermission === "granted")
    })()
  }, [])

  // Fade animation for guide text
  useEffect(() => {
    if (hasPermission && device && !capturedImage) {
      // Start fade animation after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [hasPermission, device, capturedImage, fadeAnim])

  // Reset fade animation when camera resets
  useEffect(() => {
    if (!capturedImage) {
      fadeAnim.setValue(1)
    }
  }, [capturedImage, fadeAnim])

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        // Take a photo
        const photo = await cameraRef.current.takePhoto({
          flash: "off",
          quality: 90,
        })

        const imageUri = `file://${photo.path}`
        setCapturedImage(imageUri)

        // Process the image with ML Kit
        await processImage(imageUri)
      } catch (error) {
        console.error("Error taking picture:", error)
        Alert.alert("Error", "Failed to take picture. Please try again.")
      }
    }
  }

  const processImage = async (imageUri) => {
    try {
      console.log("Processing image with ML Kit...")

      // Run text recognition
      const result = await recognizeText(imageUri)

      // Set the recognition result
      setRecognitionResult(result)

      console.log("Image processed successfully:", result)

      // Show alert if no term was recognized
      if (!result.recognizedTerm) {
        Alert.alert(
          "No IT Term Found",
          `Extracted text: "${result.extractedText}"\n\n${
            result.suggestions && result.suggestions.length > 0
              ? `Suggestions: ${result.suggestions.map((s) => s.term).join(", ")}`
              : "Please try again with clearer text."
          }`,
          [{ text: "OK" }],
        )
      }
    } catch (error) {
      console.error("Error processing image:", error)
      Alert.alert("Processing Error", "Failed to analyze the image. Please try again.")
      setRecognitionResult(null)
    }
  }

  const resetCamera = () => {
    setCapturedImage(null)
    setRecognitionResult(null)
    clearError()
  }

  // Show permission request screen
  if (!hasPermission) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={wp(15)} color={Colors.primary} />
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={async () => {
            const cameraPermission = await Camera.requestCameraPermission()
            console.log("Camera permission status (button):", cameraPermission)
            setHasPermission(cameraPermission === "authorized" || cameraPermission === "granted")
            if (cameraPermission === "denied" || cameraPermission === "blocked") {
              Alert.alert(
                "Permission Required",
                "Camera permission is permanently denied. Please enable it in app settings.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Open Settings", onPress: () => Linking.openSettings() },
                ],
              )
            }
          }}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Show error screen
  if (modelError) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning-outline" size={wp(15)} color="red" />
        <Text style={styles.errorText}>Text Recognition Error</Text>
        <Text style={styles.errorSubText}>{modelError.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={clearError}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Show loading screen while camera loads
  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        <>
          <Camera ref={cameraRef} style={styles.camera} device={device} isActive={true} photo={true} />
          <View style={styles.overlay}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={wp(6)} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerText}>Text Recognition</Text>
              <View style={styles.modelStatus}>
                <Ionicons name="checkmark-circle" size={wp(5)} color="#4CAF50" />
              </View>
            </View>

            {/* Animated Guide Box */}
            <Animated.View style={[styles.guideBox, { opacity: fadeAnim }]}>
              <Text style={styles.guideText}>Position the IT term clearly in the frame</Text>
              <Text style={styles.guideSubText}>Works with handwritten and printed text</Text>
            </Animated.View>

            <View style={styles.captureContainer}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.resultContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />

          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.processingText}>Recognizing text...</Text>
            </View>
          ) : recognitionResult ? (
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.recognitionContainer}>
                {recognitionResult.recognizedTerm ? (
                  <>
                    <View style={styles.resultHeader}>
                      <Text style={styles.recognizedLabel}>
                        Recognized:{" "}
                        <Text style={styles.recognizedTerm}>{recognitionResult.recognizedTerm.replace("_", " ")}</Text>
                      </Text>
                      {recognitionResult.specificTerm && (
                        <Text style={styles.specificTermText}>
                          Found: <Text style={styles.specificTerm}>{recognitionResult.specificTerm}</Text>
                        </Text>
                      )}
                      <Text style={styles.confidenceText}>Confidence: {recognitionResult.confidence.toFixed(1)}%</Text>
                      <Text style={styles.matchTypeText}>Match Type: {recognitionResult.matchType}</Text>
                    </View>

                    {recognitionResult.extractedText && (
                      <View style={styles.extractedTextContainer}>
                        <Text style={styles.extractedTextLabel}>Extracted Text:</Text>
                        <Text style={styles.extractedText}>"{recognitionResult.extractedText}"</Text>
                      </View>
                    )}

                    {recognitionResult.keywords && recognitionResult.keywords.length > 0 && (
                      <View style={styles.keywordsContainer}>
                        <Text style={styles.keywordsLabel}>Keywords Found:</Text>
                        <Text style={styles.keywordsText}>{recognitionResult.keywords.join(", ")}</Text>
                      </View>
                    )}

                    {recognitionResult.allMatches && recognitionResult.allMatches.length > 1 && (
                      <View style={styles.alternativeMatchesContainer}>
                        <Text style={styles.alternativeMatchesLabel}>Alternative Matches:</Text>
                        {recognitionResult.allMatches.slice(1, 3).map((match, index) => (
                          <Text key={index} style={styles.alternativeMatchText}>
                            • {match.specificTerm} ({match.confidence.toFixed(1)}%)
                          </Text>
                        ))}
                      </View>
                    )}

                    <AIRecognitionUpdate
                      recognizedTerm={recognitionResult.recognizedTerm}
                      confidence={recognitionResult.confidence}
                      capturedImage={capturedImage}
                      resetCamera={resetCamera}
                    />
                  </>
                ) : (
                  <View style={styles.noMatchContainer}>
                    <Text style={styles.noMatchText}>No IT term recognized</Text>
                    {recognitionResult.extractedText && (
                      <View style={styles.extractedTextContainer}>
                        <Text style={styles.extractedTextLabel}>Extracted Text:</Text>
                        <Text style={styles.extractedText}>"{recognitionResult.extractedText}"</Text>
                      </View>
                    )}

                    {recognitionResult.suggestions && recognitionResult.suggestions.length > 0 && (
                      <View style={styles.suggestionsContainer}>
                        <Text style={styles.suggestionsLabel}>Did you mean:</Text>
                        {recognitionResult.suggestions.map((suggestion, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => {
                              // Handle suggestion selection
                              setRecognitionResult({
                                ...recognitionResult,
                                recognizedTerm: suggestion.mainCategory,
                                specificTerm: suggestion.term,
                                confidence: 80,
                                matchType: "suggestion",
                              })
                            }}
                          >
                            <Text style={styles.suggestionText}>• {suggestion.term}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity style={styles.retryButton} onPress={resetCamera}>
                      <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to recognize text</Text>
              <TouchableOpacity style={styles.retryButton} onPress={resetCamera}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: wp(4),
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: wp(4),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: hp(2),
  },
  headerBackButton: {
    padding: wp(2),
  },
  headerText: {
    color: "#fff",
    fontSize: wp(4.5),
    fontWeight: "600",
    flex: 1,
    marginLeft: wp(2),
  },
  modelStatus: {
    padding: wp(1),
  },
  guideBox: {
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: wp(3),
    borderRadius: wp(2),
    marginBottom: hp(10),
  },
  guideText: {
    color: "#fff",
    fontSize: wp(3.5),
    textAlign: "center",
  },
  guideSubText: {
    color: "#ffeb3b",
    fontSize: wp(3),
    textAlign: "center",
    marginTop: wp(1),
  },
  captureContainer: {
    alignItems: "center",
    marginBottom: hp(4),
  },
  captureButton: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    backgroundColor: "#fff",
  },
  resultContainer: {
    flex: 1,
  },
  capturedImage: {
    width: "100%",
    height: "40%",
    resizeMode: "contain",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  processingText: {
    fontSize: wp(4),
    color: Colors.primary,
    marginTop: hp(2),
  },
  recognitionContainer: {
    padding: wp(4),
    paddingBottom: hp(10), // Extra padding for scroll
  },
  resultHeader: {
    marginBottom: hp(2),
    padding: wp(3),
    backgroundColor: "#f8f9fa",
    borderRadius: wp(2),
  },
  recognizedLabel: {
    fontSize: wp(4),
    marginBottom: hp(0.5),
  },
  recognizedTerm: {
    fontWeight: "bold",
    color: Colors.primary,
    textTransform: "capitalize",
  },
  specificTermText: {
    fontSize: wp(3.5),
    marginBottom: hp(0.5),
  },
  specificTerm: {
    fontWeight: "600",
    color: "#007AFF",
  },
  confidenceText: {
    fontSize: wp(3.5),
    color: "#666",
    marginBottom: hp(0.5),
  },
  matchTypeText: {
    fontSize: wp(3),
    color: "#888",
    textTransform: "capitalize",
  },
  extractedTextContainer: {
    marginBottom: hp(2),
    padding: wp(3),
    backgroundColor: "#f0f0f0",
    borderRadius: wp(2),
  },
  extractedTextLabel: {
    fontSize: wp(3.5),
    fontWeight: "600",
    marginBottom: hp(0.5),
    color: "#333",
  },
  extractedText: {
    fontSize: wp(3.5),
    color: "#666",
    fontStyle: "italic",
  },
  keywordsContainer: {
    marginBottom: hp(2),
    padding: wp(3),
    backgroundColor: "#e8f4fd",
    borderRadius: wp(2),
  },
  keywordsLabel: {
    fontSize: wp(3.5),
    fontWeight: "600",
    marginBottom: hp(0.5),
    color: "#333",
  },
  keywordsText: {
    fontSize: wp(3.5),
    color: "#007AFF",
  },
  alternativeMatchesContainer: {
    marginBottom: hp(2),
    padding: wp(3),
    backgroundColor: "#fff3cd",
    borderRadius: wp(2),
  },
  alternativeMatchesLabel: {
    fontSize: wp(3.5),
    fontWeight: "600",
    marginBottom: hp(0.5),
    color: "#333",
  },
  alternativeMatchText: {
    fontSize: wp(3.5),
    color: "#856404",
    marginBottom: hp(0.25),
  },
  noMatchContainer: {
    alignItems: "center",
    paddingVertical: hp(2),
  },
  noMatchText: {
    fontSize: wp(4),
    color: "#ff6b35",
    marginBottom: hp(2),
    textAlign: "center",
  },
  suggestionsContainer: {
    marginTop: hp(2),
    padding: wp(3),
    backgroundColor: "#f8f9fa",
    borderRadius: wp(2),
    width: "100%",
  },
  suggestionsLabel: {
    fontSize: wp(3.5),
    fontWeight: "600",
    marginBottom: hp(1),
    color: "#333",
  },
  suggestionItem: {
    paddingVertical: hp(0.5),
  },
  suggestionText: {
    fontSize: wp(3.5),
    color: "#007AFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: wp(4),
    color: Colors.primary,
    marginTop: hp(2),
    textAlign: "center",
  },
  permissionText: {
    fontSize: wp(4),
    color: "#333",
    textAlign: "center",
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  errorText: {
    fontSize: wp(4),
    color: "red",
    marginBottom: hp(2),
    textAlign: "center",
  },
  errorSubText: {
    fontSize: wp(3),
    color: "#666",
    marginBottom: hp(2),
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: wp(2),
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "600",
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: wp(2),
    marginTop: hp(2),
  },
  retryButtonText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#666",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: wp(2),
  },
  backButtonText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "600",
  },
})

export default AIRecognitionScreen
