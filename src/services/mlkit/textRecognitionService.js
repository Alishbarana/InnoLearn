import TextRecognition from "@react-native-ml-kit/text-recognition"

// Your 10 IT terms to match against
const IT_TERMS = [
  "array",
  "binary tree",
  "client server",
  "firewall",
  "linked list",
  "merge sort",
  "osi model",
  "queue",
  "router",
  "stack",
]

class TextRecognitionService {
  // Extract text from image using ML Kit
  async extractText(imageUri) {
    try {
      console.log("Extracting text using ML Kit...")

      const result = await TextRecognition.recognize(imageUri)

      console.log("ML Kit result:", result)
      return result.text
    } catch (error) {
      console.error("Text recognition failed:", error)
      throw error
    }
  }

  // Match extracted text with IT terms
  matchITTerms(extractedText) {
    const text = extractedText.toLowerCase().trim()
    console.log("Matching text:", text)

    // Direct matching (exact or contains)
    for (const term of IT_TERMS) {
      const termLower = term.toLowerCase()

      // Check if text contains the term
      if (text.includes(termLower)) {
        return {
          recognizedTerm: term.replace(" ", "_"),
          confidence: 95,
          matchType: "exact",
          extractedText: extractedText,
        }
      }

      // Check individual words for compound terms
      const termWords = termLower.split(" ")
      const textWords = text.split(/\s+/)

      if (termWords.length > 1) {
        const foundWords = termWords.filter((word) =>
          textWords.some((textWord) => textWord.includes(word) || word.includes(textWord)),
        )

        if (foundWords.length === termWords.length) {
          return {
            recognizedTerm: term.replace(" ", "_"),
            confidence: 90,
            matchType: "partial",
            extractedText: extractedText,
          }
        }
      }
    }

    // Fuzzy matching using similarity
    let bestMatch = null
    let bestScore = 0

    for (const term of IT_TERMS) {
      const similarity = this.calculateSimilarity(text, term.toLowerCase())
      if (similarity > bestScore && similarity > 0.6) {
        bestScore = similarity
        bestMatch = {
          recognizedTerm: term.replace(" ", "_"),
          confidence: similarity * 100,
          matchType: "fuzzy",
          extractedText: extractedText,
        }
      }
    }

    return (
      bestMatch || {
        recognizedTerm: null,
        confidence: 0,
        matchType: "none",
        extractedText: extractedText,
      }
    )
  }

  // Calculate text similarity
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  // Levenshtein distance calculation
  levenshteinDistance(str1, str2) {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  // Main function to recognize IT terms from image
  async recognizeITTerm(imageUri) {
    try {
      console.log("Starting IT term recognition...")

      // Extract text using ML Kit
      const extractedText = await this.extractText(imageUri)

      if (!extractedText || extractedText.trim().length === 0) {
        return {
          recognizedTerm: null,
          confidence: 0,
          matchType: "no_text",
          extractedText: "",
          error: "No text found in image",
        }
      }

      // Match with IT terms
      const result = this.matchITTerms(extractedText)

      console.log("Recognition result:", result)
      return result
    } catch (error) {
      console.error("IT term recognition failed:", error)
      return {
        recognizedTerm: null,
        confidence: 0,
        matchType: "error",
        extractedText: "",
        error: error.message,
      }
    }
  }
}

export default new TextRecognitionService()
