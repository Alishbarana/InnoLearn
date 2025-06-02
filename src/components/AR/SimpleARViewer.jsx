"use client"

import { useRef, useEffect, useState } from "react"
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from "react-native"
import { WebView } from "react-native-webview"
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions"

const SimpleARViewer = ({ modelName = "array", confidence = 95, onClose, style }) => {
  const webViewRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      const result = await check(PERMISSIONS.ANDROID.CAMERA)

      if (result === RESULTS.GRANTED) {
        setHasPermission(true)
      } else if (result === RESULTS.DENIED) {
        const requestResult = await request(PERMISSIONS.ANDROID.CAMERA)
        setHasPermission(requestResult === RESULTS.GRANTED)
      } else {
        setHasPermission(false)
        setError("Camera permission is required for AR functionality")
      }
    } catch (error) {
      console.error("Permission check error:", error)
      setError("Failed to check camera permission")
    }
  }

  const getARSource = () => {
    const params = new URLSearchParams({
      model: modelName,
      confidence: confidence.toString(),
    }).toString()

    return {
      uri: `file:///android_asset/ar/simple-ar-viewer.html?${params}`,
    }
  }

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      console.log("AR WebView message:", data)

      switch (data.type) {
        case "close_ar":
          if (onClose) {
            onClose()
          }
          break
        case "model_loaded":
          setIsLoading(false)
          break
        case "ar_error":
          setError(data.message || "An error occurred in AR view")
          break
        case "camera_ready":
          setIsLoading(false)
          break
      }
    } catch (error) {
      console.error("Error parsing AR WebView message:", error)
    }
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, style]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null)
            checkCameraPermission()
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.centerContent, style]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={getARSource()}
        originWhitelist={["*"]}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          console.error("AR WebView error:", nativeEvent)
          setError("Failed to load AR experience")
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          console.error("AR WebView HTTP error:", nativeEvent)
        }}
        cacheEnabled={false}
        incognito={false}
        mixedContentMode="compatibility"
        allowsFullscreenVideo={true}
        allowsBackForwardNavigationGestures={false}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading AR Experience...</Text>
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default SimpleARViewer
