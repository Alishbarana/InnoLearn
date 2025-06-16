"use client"

import { useRef, useEffect, useState } from "react"
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Platform, __DEV__ } from "react-native"
import { WebView } from "react-native-webview"
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions"

const SimpleARViewer = ({ modelName = "array", confidence = 95, onClose, style }) => {
  const webViewRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState({})

  // Enhanced model mapping to match your HTML file exactly
  const modelMapping = {
    array: "array",
    binary_tree: "binary_tree",
    client_server: "client_server",
    firewall: "firewall",
    linked_list: "linked_list",
    merge_sort: "merge_sort",
    osi_model: "osi_model",
    queue: "queue",
    router: "router",
    stack: "stack",
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

    console.log("Model mapping:", {
      original: modelName,
      mapped: mappedModelName,
      available: Object.keys(modelMapping),
    })

    const params = new URLSearchParams({
      model: mappedModelName,
      confidence: confidence.toString(),
      timestamp: Date.now(),
      // Add debug parameter to help with troubleshooting
      debug: __DEV__ ? "true" : "false",
    }).toString()

    const url = `https://alishbarana.github.io/Ar-viewer-web/?${params}`
    console.log("Generated AR URL:", url)

    return { uri: url }
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
        case "model_load_error":
          console.error("❌ Model load error:", data.error)
          setError(`Failed to load model: ${data.error}`)
          setIsLoading(false)
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
        case "model_selected":
          console.log("Model selected in WebView:", data.model)
          break
      }
    } catch (error) {
      console.error("Error parsing AR WebView message:", error)
    }
  }

  // Enhanced injection script with better model handling
  const injectedJavaScript = `
    (function() {
      console.log('🚀 Injecting WebXR enablement script...');
      
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const modelParam = urlParams.get('model');
      const confidenceParam = urlParams.get('confidence');
      
      console.log('URL Parameters:', { model: modelParam, confidence: confidenceParam });
      
      // Log environment info for debugging
      const envInfo = {
        userAgent: navigator.userAgent,
        webXR: !!navigator.xr,
        camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        https: location.protocol === 'https:',
        host: location.host,
        isWebView: /wv/.test(navigator.userAgent),
        modelParam: modelParam,
        confidenceParam: confidenceParam
      };
      
      console.log('Environment info:', envInfo);
      
      // Send debug info back to React Native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'debug_info',
          info: envInfo
        }));
      }
      
      // Auto-select model if parameter is provided
      if (modelParam) {
        // Wait for DOM to be ready
        const checkAndSetModel = () => {
          const modelSelect = document.getElementById('model-select');
          if (modelSelect) {
            console.log('Setting model to:', modelParam);
            modelSelect.value = modelParam;
            
            // Trigger change event to update the model
            const event = new Event('change', { bubbles: true });
            modelSelect.dispatchEvent(event);
            
            // Notify React Native
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'model_selected',
                model: modelParam
              }));
            }
          } else {
            // Retry if model select not found yet
            setTimeout(checkAndSetModel, 100);
          }
        };
        
        // Start checking after a short delay
        setTimeout(checkAndSetModel, 500);
      }
      
      // Enhanced communication channel
      window.sendToReactNative = function(data) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
      };
      
      // Override console.error to catch model loading errors
      const originalError = console.error;
      console.error = function(...args) {
        originalError.apply(console, args);
        
        // Check if it's a model loading error
        const errorMessage = args.join(' ');
        if (errorMessage.includes('Error loading model') || errorMessage.includes('404')) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'model_load_error',
              error: errorMessage
            }));
          }
        }
      };
      
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
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        allowsFullscreenVideo={true}
        allowsBackForwardNavigationGestures={false}
        bounces={false}
        scrollEnabled={false}
        startInLoadingState={true}
        scalesPageToFit={true}
        cacheEnabled={false}
        incognito={false}
        mixedContentMode="compatibility"
        injectedJavaScript={injectedJavaScript}
        onMessage={handleWebViewMessage}
        onLoadStart={() => {
          console.log("WebView loading started")
          setIsLoading(true)
        }}
        onLoadEnd={() => {
          console.log("WebView loading finished")
          setTimeout(() => {
            setIsLoading(false)
          }, 3000)
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
          <Text style={styles.loadingText}>Loading AR Experience...</Text>
          <Text style={styles.subLoadingText}>Model: {modelMapping[modelName?.toLowerCase()] || "array"}</Text>
          <Text style={styles.subLoadingText}>Confidence: {confidence}%</Text>
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
