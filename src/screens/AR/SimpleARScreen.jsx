import { useEffect, useState, useRef } from "react"

import { View, StyleSheet, StatusBar, Text, ActivityIndicator, Alert, Linking } from "react-native"

import { useUserProgress } from "../../hooks/useUserProgress"

const SimpleARScreen = ({ route, navigation }) => {
  const { recognizedTerm } = route.params || {}

  const [error, setError] = useState(null)

  const [loading, setLoading] = useState(true)

  const [viewStartTime] = useState(Date.now())

  const timeoutRef = useRef(null)

  // Progress tracking hook

  const { track3DModelView } = useUserProgress()

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

  const modelKey = modelMapping[recognizedTerm] || "array"

  const arUrl = `https://alishbarana.github.io/Ar-viewer-web/?model=${encodeURIComponent(modelKey)}&term=${encodeURIComponent(recognizedTerm)}&timestamp=${Date.now()}`

  console.log("Opening AR with:", { recognizedTerm, modelKey, arUrl })

  // Safe navigation function
  const safeGoBack = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack()
      }
    } catch (navError) {
      console.log("Navigation error (non-critical):", navError)
    }
  }

  // Track 3D model view when component unmounts

  useEffect(() => {
    return () => {
      // Clear timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Calculate view duration when component unmounts

      const viewDuration = Math.floor((Date.now() - viewStartTime) / 1000)

      // Track the 3D model view

      if (recognizedTerm && viewDuration > 0) {
        track3DModelView(
          modelKey,

          recognizedTerm.replace("_", " "),

          viewDuration,
        ).catch((error) => {
          console.log("Progress tracking error (non-critical):", error)
        })
      }
    }
  }, [recognizedTerm, modelKey, viewStartTime, track3DModelView])

  useEffect(() => {
    const openUrl = async () => {
      try {
        console.log("Attempting to open URL:", arUrl)

        await Linking.openURL(arUrl)

        setLoading(false)

        timeoutRef.current = setTimeout(() => {
          safeGoBack()
        }, 1000)
      } catch (err) {
        console.error("Failed to open AR URL:", err)

        setError("Failed to open AR experience. Please check your internet connection.")

        setLoading(false)
      }
    }

    if (recognizedTerm) {
      openUrl()
    } else {
      setError("No recognized term provided")

      setLoading(false)
    }
  }, [arUrl, navigation, recognizedTerm])

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK", onPress: () => safeGoBack() }])
    }
  }, [error, navigation])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {loading && !error && (
        <>
          <ActivityIndicator size="large" color="#667eea" />

          <Text style={styles.text}>Opening AR experience for: {recognizedTerm}</Text>

          <Text style={styles.subText}>Model: {modelKey}</Text>
        </>
      )}

      {error && <Text style={[styles.text, { color: "red" }]}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#000",

    justifyContent: "center",

    alignItems: "center",

    padding: 20,
  },

  text: {
    color: "#fff",

    marginTop: 20,

    fontSize: 16,

    textAlign: "center",
  },

  subText: {
    color: "#ccc",

    marginTop: 10,

    fontSize: 14,

    textAlign: "center",
  },
})

export default SimpleARScreen
