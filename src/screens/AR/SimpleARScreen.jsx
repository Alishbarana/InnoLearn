import { useEffect, useState } from "react"
import { View, StyleSheet, StatusBar, Text, ActivityIndicator, Alert, Linking } from "react-native"

const SimpleARScreen = ({ route, navigation }) => {
  const { recognizedTerm } = route.params || {}
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // Model mapping to match your HTML file's MODEL_CONFIGS
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

  // Map the recognized term to the correct model key
  const modelKey = modelMapping[recognizedTerm] || "array"

  // Build the AR URL with proper parameters
  const arUrl = `https://alishbarana.github.io/Ar-viewer-web/?model=${encodeURIComponent(modelKey)}&term=${encodeURIComponent(recognizedTerm)}&timestamp=${Date.now()}`

  console.log("Opening AR with:", { recognizedTerm, modelKey, arUrl })

  useEffect(() => {
    const openUrl = async () => {
      try {
        console.log("Attempting to open URL:", arUrl)
        await Linking.openURL(arUrl)
        setLoading(false)
        setTimeout(() => {
          navigation.goBack()
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
      Alert.alert("Error", error, [{ text: "OK", onPress: () => navigation.goBack() }])
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
