import React, { useEffect, useState } from "react"
import { View, StyleSheet, StatusBar, Text, ActivityIndicator, Alert, Linking } from "react-native"

const SimpleARScreen = ({ route, navigation }) => {
  const { recognizedTerm } = route.params || {}
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const modelName = recognizedTerm || "array"
  const arUrl = `https://alishbarana.github.io/Ar-viewer-web/?model=${encodeURIComponent(modelName)}`

  useEffect(() => {
    Linking.openURL(arUrl)
      .then(() => {
        setLoading(false)
        navigation.goBack()
      })
      .catch(() => {
        setError("Failed to open AR experience.")
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    }
  }, [error])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {loading && !error && (
        <>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.text}>
            Opening AR experience in your browser...
          </Text>
        </>
      )}
      {error && (
        <Text style={[styles.text, { color: "red" }]}>{error}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
  },
})

export default SimpleARScreen
