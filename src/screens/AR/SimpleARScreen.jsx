"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  BackHandler,
  Dimensions,
  Animated,
} from "react-native"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import Ionicons from "react-native-vector-icons/Ionicons"
import LinearGradient from "react-native-linear-gradient"
import { useFocusEffect } from "@react-navigation/native"
import { useUserProgress } from "../../hooks/useUserProgress"

const { width, height } = Dimensions.get("window")

const SimpleARScreen = ({ route, navigation }) => {
  const { recognizedTerm } = route.params || {}
  const [isARActive, setIsARActive] = useState(false)
  const [viewStartTime] = useState(Date.now())
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current

  // Progress tracking hook
  const { trackModelView } = useUserProgress()

  const Colors = {
    primary: "#384959",
    secondary: "#6A89A7",
    ternary: "#88bdf2",
    quartery: "#BDDDFC",
    quinary: "#EFF8FB",
    background: "#ffffff",
    text: "#333333",
    error: "#e74c3c",
    success: "#4CAF50",
    warning: "#FFC107",
  }

  // Professional safe navigation
  const safeGoBack = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        // Navigate to Home within MainApp
        navigation.navigate("Home")
      }
    } catch (navError) {
      console.log("Navigation error:", navError)
      // Last resort - try to navigate to Home
      try {
        navigation.navigate("Home")
      } catch (fallbackError) {
        console.log("Fallback navigation failed:", fallbackError)
      }
    }
  }

  // Handle back button professionally
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        safeGoBack()
        return true
      }

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress)
      return () => subscription.remove()
    }, [navigation]),
  )

  // Track model view when component unmounts
  useEffect(() => {
    return () => {
      // Calculate time spent when component unmounts
      const timeSpent = Math.floor((Date.now() - viewStartTime) / 1000)

      // Track the model view
      if (recognizedTerm && timeSpent > 0) {
        trackModelView(recognizedTerm, getModelName(recognizedTerm), timeSpent).catch((error) => {
          console.log("Model view tracking error (non-critical):", error)
        })
      }
    }
  }, [recognizedTerm, viewStartTime, trackModelView])

  useEffect(() => {
    // Animate content on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const getModelName = (term) => {
    const modelNames = {
      array: "Array Data Structure",
      linked_list: "Linked List",
      stack: "Stack Structure",
      queue: "Queue Structure",
      binary_tree: "Binary Tree",
      merge_sort: "Merge Sort Algorithm",
      osi_model: "OSI Model Layers",
      firewall: "Network Firewall",
      router: "Network Router",
      client_server: "Client-Server Architecture",
    }
    return modelNames[term] || "3D Model"
  }

  const getModelDescription = (term) => {
    const descriptions = {
      array: "Interactive 3D visualization of array elements and memory allocation",
      linked_list: "See how nodes connect through pointers in 3D space",
      stack: "Watch LIFO operations with animated push and pop actions",
      queue: "Visualize FIFO operations with enqueue and dequeue animations",
      binary_tree: "Explore tree traversal and node relationships in 3D",
      merge_sort: "Step-by-step visualization of the divide and conquer algorithm",
      osi_model: "Interactive 7-layer network model with data flow",
      firewall: "3D representation of network security filtering",
      router: "Visualize packet routing and network connections",
      client_server: "Interactive model showing request-response patterns",
    }
    return descriptions[term] || "3D visualization of computer science concepts"
  }

  const handleStartAR = () => {
    setIsARActive(true)
    // Simulate AR initialization
    setTimeout(() => {
      Alert.alert(
        "AR Mode Active",
        `Now viewing ${getModelName(recognizedTerm)} in AR mode. Move your device to explore the 3D model.`,
        [
          {
            text: "Exit AR",
            onPress: () => setIsARActive(false),
          },
        ],
      )
    }, 1000)
  }

  const handleInteractiveDemo = () => {
    Alert.alert(
      "Interactive Demo",
      `This would launch an interactive demo for ${getModelName(recognizedTerm)}. Feature coming soon!`,
      [{ text: "OK" }],
    )
  }

  if (!recognizedTerm) {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={safeGoBack}>
              <Ionicons name="arrow-back" size={wp(6)} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>AR Viewer</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="cube-off-outline" size={wp(20)} color={Colors.ternary} />
          <Text style={styles.errorTitle}>No Model Selected</Text>
          <Text style={styles.errorText}>Please select a topic to view its 3D model.</Text>
          <TouchableOpacity style={styles.goBackButton} onPress={safeGoBack}>
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={safeGoBack}>
            <Ionicons name="arrow-back" size={wp(6)} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>AR Viewer</Text>
            <Text style={styles.headerSubtitle}>{getModelName(recognizedTerm)}</Text>
          </View>
          <TouchableOpacity style={styles.infoButton}>
            <MaterialCommunityIcons name="information" size={wp(6)} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* AR Content */}
      <Animated.View
        style={[
          styles.arContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {!isARActive ? (
          // AR Preview/Setup Screen
          <View style={styles.previewContainer}>
            <LinearGradient
              colors={[Colors.quinary, "#fff"]}
              style={styles.previewCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.modelIconContainer}>
                <MaterialCommunityIcons name="cube-scan" size={wp(20)} color={Colors.ternary} />
              </View>

              <Text style={styles.modelTitle}>{getModelName(recognizedTerm)}</Text>
              <Text style={styles.modelDescription}>{getModelDescription(recognizedTerm)}</Text>

              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons name="rotate-3d-variant" size={wp(5)} color={Colors.primary} />
                  <Text style={styles.featureText}>360° Rotation</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons name="gesture-pinch" size={wp(5)} color={Colors.primary} />
                  <Text style={styles.featureText}>Zoom & Scale</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons name="animation-play" size={wp(5)} color={Colors.primary} />
                  <Text style={styles.featureText}>Animations</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.startARButton} onPress={handleStartAR}>
                <LinearGradient
                  colors={[Colors.ternary, Colors.secondary]}
                  style={styles.startARGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons name="play" size={wp(6)} color="#fff" />
                  <Text style={styles.startARText}>Start AR Experience</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.demoButton} onPress={handleInteractiveDemo}>
                <Text style={styles.demoButtonText}>Interactive Demo</Text>
                <MaterialCommunityIcons name="arrow-right" size={wp(4)} color={Colors.primary} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          // AR Active Screen (Simulated)
          <View style={styles.arActiveContainer}>
            <LinearGradient colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.4)"]} style={styles.arOverlay}>
              <View style={styles.arControls}>
                <Text style={styles.arStatusText}>AR Mode Active</Text>
                <Text style={styles.arInstructionText}>Move your device to explore the 3D model</Text>

                <View style={styles.arButtonsContainer}>
                  <TouchableOpacity style={styles.arControlButton}>
                    <MaterialCommunityIcons name="rotate-3d-variant" size={wp(6)} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.arControlButton}>
                    <MaterialCommunityIcons name="animation-play" size={wp(6)} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.arControlButton}>
                    <MaterialCommunityIcons name="information" size={wp(6)} color="#fff" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.exitARButton} onPress={() => setIsARActive(false)}>
                  <Text style={styles.exitARText}>Exit AR</Text>
                </TouchableOpacity>
              </View>

              {/* Simulated AR Model Placeholder */}
              <View style={styles.arModelPlaceholder}>
                <MaterialCommunityIcons name="cube-outline" size={wp(30)} color="rgba(255,255,255,0.3)" />
                <Text style={styles.arModelText}>{getModelName(recognizedTerm)}</Text>
              </View>
            </LinearGradient>
          </View>
        )}
      </Animated.View>

      {/* Instructions */}
      {!isARActive && (
        <Animated.View style={[styles.instructionsContainer, { opacity: fadeAnim }]}>
          <Text style={styles.instructionsTitle}>How to use AR:</Text>
          <View style={styles.instructionItem}>
            <MaterialCommunityIcons name="numeric-1-circle" size={wp(5)} color={Colors.ternary} />
            <Text style={styles.instructionText}>Point your camera at a flat surface</Text>
          </View>
          <View style={styles.instructionItem}>
            <MaterialCommunityIcons name="numeric-2-circle" size={wp(5)} color={Colors.ternary} />
            <Text style={styles.instructionText}>Tap "Start AR Experience"</Text>
          </View>
          <View style={styles.instructionItem}>
            <MaterialCommunityIcons name="numeric-3-circle" size={wp(5)} color={Colors.ternary} />
            <Text style={styles.instructionText}>Move around to explore the 3D model</Text>
          </View>
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: StatusBar.currentHeight + hp(2),
    paddingBottom: hp(3),
    borderBottomLeftRadius: wp(8),
    borderBottomRightRadius: wp(8),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(5),
  },
  backButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: wp(5.5),
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: wp(3.5),
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: hp(0.5),
  },
  infoButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: wp(10),
  },
  arContainer: {
    flex: 1,
    padding: wp(5),
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
  },
  previewCard: {
    borderRadius: wp(6),
    padding: wp(6),
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  modelIconContainer: {
    marginBottom: hp(3),
  },
  modelTitle: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: "#384959",
    textAlign: "center",
    marginBottom: hp(2),
  },
  modelDescription: {
    fontSize: wp(4),
    color: "#6A89A7",
    textAlign: "center",
    lineHeight: wp(6),
    marginBottom: hp(4),
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: hp(4),
  },
  featureItem: {
    alignItems: "center",
  },
  featureText: {
    fontSize: wp(3),
    color: "#384959",
    marginTop: hp(1),
    fontWeight: "500",
  },
  startARButton: {
    width: "80%",
    height: hp(7),
    borderRadius: wp(8),
    overflow: "hidden",
    marginBottom: hp(2),
  },
  startARGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  startARText: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#fff",
    marginLeft: wp(2),
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: wp(6),
    borderWidth: 2,
    borderColor: "#384959",
  },
  demoButtonText: {
    fontSize: wp(4),
    color: "#384959",
    fontWeight: "600",
    marginRight: wp(2),
  },
  arActiveContainer: {
    flex: 1,
    borderRadius: wp(4),
    overflow: "hidden",
  },
  arOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: wp(5),
  },
  arControls: {
    alignItems: "center",
  },
  arStatusText: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: hp(1),
  },
  arInstructionText: {
    fontSize: wp(3.5),
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: hp(3),
  },
  arButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    marginBottom: hp(3),
  },
  arControlButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  exitARButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(6),
  },
  exitARText: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "600",
  },
  arModelPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  arModelText: {
    fontSize: wp(4),
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: hp(2),
  },
  instructionsContainer: {
    backgroundColor: "#fff",
    margin: wp(5),
    marginTop: 0,
    borderRadius: wp(4),
    padding: wp(4),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  instructionsTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#384959",
    marginBottom: hp(2),
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  instructionText: {
    fontSize: wp(3.5),
    color: "#6A89A7",
    marginLeft: wp(3),
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp(5),
  },
  errorTitle: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: "#384959",
    marginTop: hp(3),
    marginBottom: hp(2),
  },
  errorText: {
    fontSize: wp(4),
    color: "#6A89A7",
    textAlign: "center",
    marginBottom: hp(4),
  },
  goBackButton: {
    backgroundColor: "#384959",
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(6),
  },
  goBackButtonText: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "600",
  },
})

export default SimpleARScreen
