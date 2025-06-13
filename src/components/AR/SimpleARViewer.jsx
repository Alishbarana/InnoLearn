"use client"

import { useRef, useEffect, useState } from "react"
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Platform } from "react-native"
import { WebView } from "react-native-webview"
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions"

const SimpleARViewer = ({ modelName = "array", confidence = 95, onClose, style }) => {
  const webViewRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState(null)
  const [arMode, setArMode] = useState("checking") // "webxr", "camera", "none"
  const [debugInfo, setDebugInfo] = useState({})

  useEffect(() => {
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      const permission = Platform.OS === "android" ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA

      const result = await check(permission)

      if (result === RESULTS.GRANTED) {
        setHasPermission(true)
      } else if (result === RESULTS.DENIED) {
        const requestResult = await request(permission)
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
    // Use the model name to determine which 3D model to load
    const params = new URLSearchParams({
      model: modelName,
      confidence: confidence.toString(),
      timestamp: Date.now(), // Prevent caching
    }).toString()

    return {
      uri: `file:///android_asset/ar/webxr-ar-viewer.html?${params}`,
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
          console.log("✅ Model loaded:", data.modelName)
          break
        case "ar_error":
          setError(data.message || "An error occurred in AR view")
          break
        case "ar_mode":
          setArMode(data.mode)
          console.log("AR mode set to:", data.mode)
          break
        case "debug_info":
          setDebugInfo(data.info)
          break
        case "webxr_session_started":
          console.log("✅ WebXR session started")
          setIsLoading(false)
          break
        case "camera_ar_started":
          console.log("✅ Camera AR fallback started")
          setIsLoading(false)
          break
        case "cone_placed":
          console.log("✅ Cone placed at:", data.position)
          break
      }
    } catch (error) {
      console.error("Error parsing AR WebView message:", error)
    }
  }

  // This script injects code to help with WebXR detection and debugging
  const injectedJavaScript = `
    (function() {
      console.log('🚀 Injecting WebXR enablement script...');
      
      // Log environment info for debugging
      const envInfo = {
        userAgent: navigator.userAgent,
        webXR: !!navigator.xr,
        camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        https: location.protocol === 'https:',
        host: location.host
      };
      console.log('Environment info:', envInfo);
      
      // Send debug info back to React Native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'debug_info',
          info: envInfo
        }));
      }
      
      // Enable camera access logging
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('✅ Camera API available');
        
        // Wrap getUserMedia to log calls
        const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = function(constraints) {
          console.log('📷 Camera access requested:', constraints);
          return originalGetUserMedia(constraints);
        };
      } else {
        console.log('❌ Camera API not available');
      }
      
      true; // Required for injected JavaScript
    })();
  `

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
        // File access permissions
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        // JavaScript and DOM
        javaScriptEnabled={true}
        domStorageEnabled={true}
        // Media permissions
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        // WebXR and AR specific settings
        allowsFullscreenVideo={true}
        allowsBackForwardNavigationGestures={false}
        bounces={false}
        scrollEnabled={false}
        // Performance settings
        startInLoadingState={false}
        scalesPageToFit={true}
        cacheEnabled={false}
        incognito={false}
        // Android specific
        mixedContentMode="compatibility"
        // Inject WebXR enablement script
        injectedJavaScript={injectedJavaScript}
        // Event handlers
        onMessage={handleWebViewMessage}
        onLoadStart={() => {
          console.log("WebView loading started")
          setIsLoading(true)
        }}
        onLoadEnd={() => {
          console.log("WebView loading finished")
          // Don't set loading to false here, wait for specific messages
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          console.error("AR WebView error:", nativeEvent)
          setError("Failed to load AR experience")
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          console.error("AR WebView HTTP error:", nativeEvent)
        }}
        style={styles.webview}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {arMode === "webxr"
              ? "Starting WebXR..."
              : arMode === "camera"
                ? "Starting Camera AR..."
                : "Loading AR Experience..."}
          </Text>
          {arMode !== "checking" && (
            <Text style={[styles.arModeIndicator, { color: arMode === "webxr" ? "#4CAF50" : "#FF9800" }]}>
              {arMode === "webxr" ? "WebXR Mode" : arMode === "camera" ? "Camera AR Mode" : "Checking AR Support..."}
            </Text>
          )}
        </View>
      )}

      {/* Debug overlay - remove in production */}
      {__DEV__ && Object.keys(debugInfo).length > 0 && (
        <View style={styles.debugOverlay}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          {Object.entries(debugInfo).map(([key, value]) => (
            <Text key={key} style={styles.debugText}>
              {key}: {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
            </Text>
          ))}
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
  arModeIndicator: {
    fontSize: 14,
    marginTop: 5,
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
  debugOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
    maxWidth: "80%",
  },
  debugTitle: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  debugText: {
    color: "#fff",
    fontSize: 10,
  },
})

export default SimpleARViewer
