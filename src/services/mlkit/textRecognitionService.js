import TextRecognition from "@react-native-ml-kit/text-recognition"
import { IT_TERMS_MAPPING, STOP_WORDS, getAllTerms } from "../../config/termMappings"

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

  // Extract keywords from text
  extractKeywords(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ") // Remove punctuation
      .split(/\s+/)
      .filter((word) => word.length > 2) // Filter short words
      .filter((word) => !STOP_WORDS.includes(word)) // Remove stop words
  }

  // Calculate similarity between two strings using Levenshtein distance
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

  // Enhanced matching with hierarchical terms
  matchITTerms(extractedText) {
    const text = extractedText.toLowerCase().trim()
    const keywords = this.extractKeywords(text)

    console.log("Extracted keywords:", keywords)

    // Step 1: Direct exact matching
    for (const [mainTerm, subTerms] of Object.entries(IT_TERMS_MAPPING)) {
      for (const subTerm of subTerms) {
        if (text.includes(subTerm.toLowerCase())) {
          return {
            recognizedTerm: mainTerm,
            specificTerm: subTerm,
            confidence: 95,
            matchType: "exact",
            extractedText: extractedText,
            keywords: keywords,
          }
        }
      }
    }

    // Step 2: Keyword-based matching
    const keywordMatches = []

    for (const [mainTerm, subTerms] of Object.entries(IT_TERMS_MAPPING)) {
      for (const subTerm of subTerms) {
        const subTermKeywords = this.extractKeywords(subTerm)
        const matchingKeywords = keywords.filter((keyword) =>
          subTermKeywords.some((subKeyword) => keyword.includes(subKeyword) || subKeyword.includes(keyword)),
        )

        if (matchingKeywords.length > 0) {
          const confidence = (matchingKeywords.length / subTermKeywords.length) * 90
          keywordMatches.push({
            recognizedTerm: mainTerm,
            specificTerm: subTerm,
            confidence: confidence,
            matchType: "keyword",
            matchingKeywords: matchingKeywords,
          })
        }
      }
    }

    // Sort by confidence and return best match
    if (keywordMatches.length > 0) {
      const bestMatch = keywordMatches.sort((a, b) => b.confidence - a.confidence)[0]
      if (bestMatch.confidence > 60) {
        return {
          ...bestMatch,
          extractedText: extractedText,
          keywords: keywords,
          allMatches: keywordMatches.slice(0, 3), // Top 3 matches
        }
      }
    }

    // Step 3: Fuzzy matching
    let bestFuzzyMatch = null
    let bestFuzzyScore = 0

    for (const [mainTerm, subTerms] of Object.entries(IT_TERMS_MAPPING)) {
      for (const subTerm of subTerms) {
        const similarity = this.calculateSimilarity(text, subTerm.toLowerCase())
        if (similarity > bestFuzzyScore && similarity > 0.6) {
          bestFuzzyScore = similarity
          bestFuzzyMatch = {
            recognizedTerm: mainTerm,
            specificTerm: subTerm,
            confidence: similarity * 85,
            matchType: "fuzzy",
          }
        }
      }
    }

    if (bestFuzzyMatch) {
      return {
        ...bestFuzzyMatch,
        extractedText: extractedText,
        keywords: keywords,
      }
    }

    // Step 4: Partial word matching
    for (const keyword of keywords) {
      for (const [mainTerm, subTerms] of Object.entries(IT_TERMS_MAPPING)) {
        for (const subTerm of subTerms) {
          if (subTerm.toLowerCase().includes(keyword) || keyword.includes(subTerm.toLowerCase())) {
            return {
              recognizedTerm: mainTerm,
              specificTerm: subTerm,
              confidence: 70,
              matchType: "partial",
              extractedText: extractedText,
              keywords: keywords,
            }
          }
        }
      }
    }

    // No match found
    return {
      recognizedTerm: null,
      specificTerm: null,
      confidence: 0,
      matchType: "none",
      extractedText: extractedText,
      keywords: keywords,
      suggestions: this.getSuggestions(keywords),
    }
  }

  // Get suggestions for unmatched terms
  getSuggestions(keywords) {
    const suggestions = []
    const allTerms = getAllTerms()

    for (const keyword of keywords) {
      const matches = allTerms.filter((termObj) => termObj.term.toLowerCase().includes(keyword))
      suggestions.push(...matches.slice(0, 2)) // Top 2 suggestions per keyword
    }

    return suggestions.slice(0, 5) // Max 5 suggestions
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
          specificTerm: null,
          confidence: 0,
          matchType: "no_text",
          extractedText: "",
          error: "No text found in image",
        }
      }

      // Match with IT terms using enhanced algorithm
      const result = this.matchITTerms(extractedText)

      console.log("Recognition result:", result)
      return result
    } catch (error) {
      console.error("IT term recognition failed:", error)
      return {
        recognizedTerm: null,
        specificTerm: null,
        confidence: 0,
        matchType: "error",
        extractedText: "",
        error: error.message,
      }
    }
  }
}

export default new TextRecognitionService()
