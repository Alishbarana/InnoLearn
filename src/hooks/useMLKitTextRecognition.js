import { useState, useCallback } from "react"
import textRecognitionService from "../services/mlkit/textRecognitionService"

export const useMLKitTextRecognition = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  // Recognize IT term from image
  const recognizeText = useCallback(
    async (imageUri) => {
      if (isProcessing) {
        throw new Error("Recognition already in progress")
      }

      try {
        setIsProcessing(true)
        setError(null)

        console.log("Starting text recognition for:", imageUri)

        const result = await textRecognitionService.recognizeITTerm(imageUri)

        setIsProcessing(false)
        return result
      } catch (err) {
        console.error("Text recognition failed:", err)
        setError(err)
        setIsProcessing(false)
        throw err
      }
    },
    [isProcessing],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    recognizeText,
    isProcessing,
    error,
    clearError,
    isReady: true, // ML Kit is always ready, no model loading needed
  }
}
