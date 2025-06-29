import { getApp } from "@react-native-firebase/app"
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  push,
  get,
  query,
  orderByChild,
  limitToLast,
} from "@react-native-firebase/database"
import auth from "@react-native-firebase/auth"

class ProgressService {
  constructor() {
    this.userId = null
    this.progressRef = null
    this.database = null
    this.app = null
    this.initializeApp()
    this.initializeUser()
  }

  initializeApp() {
    try {
      this.app = getApp()
      this.database = getDatabase(this.app)
      console.log("Firebase app and database initialized successfully")
    } catch (error) {
      console.error("Error initializing Firebase app:", error)
    }
  }

  initializeUser() {
    auth().onAuthStateChanged((user) => {
      if (user) {
        this.userId = user.uid
        this.progressRef = ref(this.database, `userProgress/${this.userId}`)
        console.log("Progress tracking initialized for user:", this.userId)
      } else {
        console.log("No authenticated user for progress tracking")
        this.userId = null
        this.progressRef = null
      }
    })
  }

  // Track term visit and time spent
  async trackTermVisit(termId, termName, timeSpent = 0) {
    if (!this.userId || !this.progressRef) {
      console.log("Progress tracking: No authenticated user")
      return false
    }

    const timestamp = Date.now()
    const visitData = {
      termId,
      termName,
      timeSpent,
      visitedAt: timestamp,
      lastUpdated: timestamp,
    }

    try {
      const termRef = ref(this.database, `userProgress/${this.userId}/terms/${termId}`)
      const snapshot = await get(termRef)

      if (snapshot.exists()) {
        const existingData = snapshot.val()
        await update(termRef, {
          totalTimeSpent: (existingData.totalTimeSpent || 0) + timeSpent,
          visitCount: (existingData.visitCount || 0) + 1,
          lastVisited: timestamp,
          lastUpdated: timestamp,
        })
      } else {
        await set(termRef, {
          ...visitData,
          totalTimeSpent: timeSpent,
          visitCount: 1,
          firstVisited: timestamp,
        })
      }

      await this.updateOverallStats("termVisits")

      console.log("Term visit tracked:", { termId, termName, timeSpent })
      return true
    } catch (error) {
      console.error("Error tracking term visit:", error)
      return false
    }
  }

  // Track OCR search
  async trackOCRSearch(searchText, results = [], processingTime = 0) {
    if (!this.userId || !this.progressRef) {
      console.log("Progress tracking: No authenticated user")
      return null
    }

    const timestamp = Date.now()
    const searchData = {
      searchText,
      resultsCount: results.length,
      results: results.slice(0, 10),
      processingTime,
      searchedAt: timestamp,
    }

    try {
      const searchRef = push(ref(this.database, `userProgress/${this.userId}/ocrSearches`))
      await set(searchRef, searchData)
      await this.updateOCRStats(searchText, results.length)
      await this.updateOverallStats("ocrSearches")

      console.log("OCR search tracked:", { searchText, resultsCount: results.length, processingTime })
      return searchRef.key
    } catch (error) {
      console.error("Error tracking OCR search:", error)
      return null
    }
  }

  // Track 3D model view
  async track3DModelView(modelId, modelName, viewDuration = 0) {
    if (!this.userId || !this.progressRef) {
      console.log("Progress tracking: No authenticated user")
      return null
    }

    const timestamp = Date.now()
    const viewData = {
      modelId,
      modelName,
      viewDuration,
      viewedAt: timestamp,
    }

    try {
      const modelViewRef = push(ref(this.database, `userProgress/${this.userId}/modelViews`))
      await set(modelViewRef, viewData)

      const modelStatsRef = ref(this.database, `userProgress/${this.userId}/modelStats/${modelId}`)
      const snapshot = await get(modelStatsRef)

      if (snapshot.exists()) {
        const existingData = snapshot.val()
        await update(modelStatsRef, {
          totalViewTime: (existingData.totalViewTime || 0) + viewDuration,
          viewCount: (existingData.viewCount || 0) + 1,
          lastViewed: timestamp,
        })
      } else {
        await set(modelStatsRef, {
          modelId,
          modelName,
          totalViewTime: viewDuration,
          viewCount: 1,
          firstViewed: timestamp,
          lastViewed: timestamp,
        })
      }

      await this.updateOverallStats("modelViews")

      console.log("3D model view tracked:", { modelId, modelName, viewDuration })
      return modelViewRef.key
    } catch (error) {
      console.error("Error tracking 3D model view:", error)
      return null
    }
  }

  // Update overall statistics
  async updateOverallStats(type) {
    if (!this.userId || !this.progressRef) return

    try {
      const statsRef = ref(this.database, `userProgress/${this.userId}/overallStats`)
      const snapshot = await get(statsRef)
      const currentStats = snapshot.val() || {}

      const updates = {
        lastActivity: Date.now(),
        [`total${type.charAt(0).toUpperCase() + type.slice(1)}`]:
          (currentStats[`total${type.charAt(0).toUpperCase() + type.slice(1)}`] || 0) + 1,
      }

      await update(statsRef, updates)
    } catch (error) {
      console.error("Error updating overall stats:", error)
    }
  }

  // Update OCR-specific statistics
  async updateOCRStats(searchText, resultsCount) {
    if (!this.userId || !this.progressRef) return

    try {
      const ocrStatsRef = ref(this.database, `userProgress/${this.userId}/ocrStats`)
      const snapshot = await get(ocrStatsRef)
      const currentStats = snapshot.val() || {}

      const updates = {
        totalSearches: (currentStats.totalSearches || 0) + 1,
        totalResults: (currentStats.totalResults || 0) + resultsCount,
        lastSearchText: searchText,
        lastSearchTime: Date.now(),
        averageResults: Math.round(
          ((currentStats.totalResults || 0) + resultsCount) / ((currentStats.totalSearches || 0) + 1),
        ),
      }

      await update(ocrStatsRef, updates)
    } catch (error) {
      console.error("Error updating OCR stats:", error)
    }
  }

  // Get user progress data
  async getUserProgress() {
    if (!this.userId || !this.progressRef) return null

    try {
      const snapshot = await get(this.progressRef)
      return snapshot.val()
    } catch (error) {
      console.error("Error getting user progress:", error)
      return null
    }
  }

  // Get terms progress
  async getTermsProgress() {
    if (!this.userId || !this.progressRef) return []

    try {
      const snapshot = await get(ref(this.database, `userProgress/${this.userId}/terms`))
      const termsData = snapshot.val() || {}

      return Object.entries(termsData)
        .map(([termId, data]) => ({
          termId,
          ...data,
        }))
        .sort((a, b) => b.totalTimeSpent - a.totalTimeSpent)
    } catch (error) {
      console.error("Error getting terms progress:", error)
      return []
    }
  }

  // Get OCR search history
  async getOCRHistory(limit = 50) {
    if (!this.userId || !this.progressRef) return []

    try {
      const ocrRef = ref(this.database, `userProgress/${this.userId}/ocrSearches`)
      const queryRef = query(ocrRef, orderByChild("searchedAt"), limitToLast(limit))
      const snapshot = await get(queryRef)

      const searchData = snapshot.val() || {}

      return Object.entries(searchData)
        .map(([searchId, data]) => ({
          searchId,
          ...data,
        }))
        .sort((a, b) => b.searchedAt - a.searchedAt)
    } catch (error) {
      console.error("Error getting OCR history:", error)
      return []
    }
  }

  // Get 3D model views
  async getModelViews(limit = 50) {
    if (!this.userId || !this.progressRef) return []

    try {
      const viewsRef = ref(this.database, `userProgress/${this.userId}/modelViews`)
      const queryRef = query(viewsRef, orderByChild("viewedAt"), limitToLast(limit))
      const snapshot = await get(queryRef)

      const viewData = snapshot.val() || {}

      return Object.entries(viewData)
        .map(([viewId, data]) => ({
          viewId,
          ...data,
        }))
        .sort((a, b) => b.viewedAt - a.viewedAt)
    } catch (error) {
      console.error("Error getting model views:", error)
      return []
    }
  }

  // Get model statistics
  async getModelStats() {
    if (!this.userId || !this.progressRef) return []

    try {
      const snapshot = await get(ref(this.database, `userProgress/${this.userId}/modelStats`))
      const statsData = snapshot.val() || {}

      return Object.entries(statsData)
        .map(([modelId, data]) => ({
          modelId,
          ...data,
        }))
        .sort((a, b) => b.totalViewTime - a.totalViewTime)
    } catch (error) {
      console.error("Error getting model stats:", error)
      return []
    }
  }

  // Listen to progress changes - FIXED VERSION
  onProgressChange(callback) {
    if (!this.userId || !this.progressRef) return () => {}

    const unsubscribe = onValue(
      this.progressRef,
      (snapshot) => {
        callback(snapshot.val())
      },
      (error) => {
        console.error("Progress listener error:", error)
        callback(null)
      },
    )

    // Return the unsubscribe function directly
    return unsubscribe
  }

  // Export progress data
  async exportProgressData() {
    if (!this.userId || !this.progressRef) return null

    try {
      const progressData = await this.getUserProgress()
      return {
        userId: this.userId,
        exportedAt: Date.now(),
        data: progressData,
      }
    } catch (error) {
      console.error("Error exporting progress data:", error)
      return null
    }
  }
}

export default new ProgressService()
