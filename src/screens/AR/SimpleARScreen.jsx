"use client"

import { View, StyleSheet, StatusBar } from "react-native"
import SimpleARViewer from "../../components/AR/SimpleARViewer"

const SimpleARScreen = ({ route, navigation }) => {
  const { recognizedTerm, confidence, imageUri } = route.params || {}

  const handleCloseAR = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <SimpleARViewer
        modelName={recognizedTerm}
        confidence={confidence}
        onClose={handleCloseAR}
        style={styles.arViewer}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  arViewer: {
    flex: 1,
  },
})

export default SimpleARScreen
