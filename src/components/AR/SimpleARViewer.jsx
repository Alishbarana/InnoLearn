import React, { useRef, useEffect, useState } from "react"
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Platform, __DEV__ } from "react-native"
import { WebView } from "react-native-webview"
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions"

const SimpleARViewer = ({ modelName = "array", confidence = 95, onClose, style }) => {
  const webViewRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState(null)
  const [arMode, setArMode] = useState("checking") // "webxr", "camera", "none"
  const [debugInfo, setDebugInfo] = useState({})

  // Map your app's model names to GitHub Pages model names
  const modelMapping = {
    array: "array",
    binary_tree: "binary_tree",
    linked_list: "linked_list",
    stack: "stack",
    queue: "queue",
    merge_sort: "merge_sort",
    osi_model: "osi_model",
    client_server: "client_server",
    firewall: "firewall",
    router: "router",
    // Add more mappings as needed
  }

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
    // Map the model name to the correct format
    const mappedModelName = modelMapping[modelName?.toLowerCase()] || "array"

    const params = new URLSearchParams({
      model: mappedModelName,
      confidence: confidence.toString(),
      timestamp: Date.now(),
    }).toString()

    // Replace with your GitHub Pages URL
    return {
      uri: `https://alishbarana.github.io/Ar-viewer-web/?${params}`,
    }
  }

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      console.log("AR WebView message:", data)

      switch (data.type) {
        case "close_ar":
        case "exit_ar":
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
          setIsLoading(false)
          break
        case "webxr_session_started":
          console.log("✅ WebXR session started")
          setIsLoading(false)
          break
        case "webxr_session_ended":
          console.log("WebXR session ended")
          break
        case "debug_info":
          setDebugInfo(data.info)
          break
        case "ar_ready":
          setIsLoading(false)
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
        host: location.host,
        isWebView: /wv/.test(navigator.userAgent)
      };
      
      console.log('Environment info:', envInfo);
      
      // Send debug info back to React Native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'debug_info',
          info: envInfo
        }));
      }
      
      // Add communication channel from WebXR to React Native
      window.sendToReactNative = function(data) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
      };
      
      // Listen for AR session events
      if (navigator.xr) {
        navigator.xr.addEventListener('sessionstart', function() {
          console.log('WebXR session started');
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'webxr_session_started'
            }));
          }
        });
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
            setIsLoading(true)
            checkCameraPermission()
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: "#666" }]} onPress={onClose}>
          <Text style={styles.retryButtonText}>Close</Text>
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
        allowsFullscreenVideo={true}
        // WebXR and AR specific settings
        allowsBackForwardNavigationGestures={false}
        bounces={false}
        scrollEnabled={false}
        // Performance settings
        startInLoadingState={true}
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
          // But set a timeout in case we don't get a message
          setTimeout(() => {
            setIsLoading(false)
          }, 8000)
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          console.error("AR WebView error:", nativeEvent)
          setError("Failed to load AR experience")
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          console.error("AR WebView HTTP error:", nativeEvent)
          if (nativeEvent.statusCode >= 400) {
            setError(`Failed to load AR experience (${nativeEvent.statusCode})`)
          }
        }}
        onPermissionRequest={(request) => {
          console.log("WebView permission request:", request)
          request.grant()
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
          <Text style={styles.subLoadingText}>
            Model: {modelName} | Confidence: {confidence}%
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
              {key}: {typeof value === "boolean" ? (value ? "✅" : "❌") : String(value)}
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
    fontSize: 18,
    marginTop: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  subLoadingText: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 8,
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  debugOverlay: {
    position: "absolute",
    top: 50,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    borderRadius: 5,
    maxWidth: "90%",
  },
  debugTitle: {
    color: "#4CAF50",
    fontWeight: "bold",
    marginBottom: 5,
  },
  debugText: {
    color: "#fff",
    fontSize: 11,
    marginBottom: 2,
  },
})

export default SimpleARViewer
