import { getApp } from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

class ProgressService {
  constructor() {
    this.userId = null;
    this.progressRef = null;
    this.app = null;
    this.initializeApp();
    this.initializeUser();
  }

  initializeApp() {
    try {
      this.app = getApp();
      console.log('Firebase app initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase app:', error);
    }
  }

  initializeUser() {
    auth().onAuthStateChanged((user) => {
      if (user) {
        this.userId = user.uid;
        // Use the app instance with database
        this.progressRef = database(this.app).ref(`userProgress/${this.userId}`);
        console.log('Progress tracking initialized for user:', this.userId);
      } else {
        console.log('No authenticated user for progress tracking');
        this.userId = null;
        this.progressRef = null;
      }
    });
  }

  // Track term visit and time spent
  async trackTermVisit(termId, termName, timeSpent = 0) {
    if (!this.userId || !this.progressRef) {
      console.log('Progress tracking: No authenticated user');
      return false;
    }

    const timestamp = Date.now();
    const visitData = {
      termId,
      termName,
      timeSpent,
      visitedAt: timestamp,
      lastUpdated: timestamp
    };

    try {
      // Update or create term progress
      const termRef = this.progressRef.child(`terms/${termId}`);
      const snapshot = await termRef.once('value');
      
      if (snapshot.exists()) {
        const existingData = snapshot.val();
        await termRef.update({
          totalTimeSpent: (existingData.totalTimeSpent || 0) + timeSpent,
          visitCount: (existingData.visitCount || 0) + 1,
          lastVisited: timestamp,
          lastUpdated: timestamp
        });
      } else {
        await termRef.set({
          ...visitData,
          totalTimeSpent: timeSpent,
          visitCount: 1,
          firstVisited: timestamp
        });
      }

      // Update overall stats
      await this.updateOverallStats('termVisits');
      
      console.log('Term visit tracked:', { termId, termName, timeSpent });
      return true;
    } catch (error) {
      console.error('Error tracking term visit:', error);
      return false;
    }
  }

  // Track OCR search
  async trackOCRSearch(searchText, results = [], processingTime = 0) {
    if (!this.userId || !this.progressRef) {
      console.log('Progress tracking: No authenticated user');
      return null;
    }

    const timestamp = Date.now();
    const searchData = {
      searchText,
      resultsCount: results.length,
      results: results.slice(0, 10), // Store only first 10 results
      processingTime,
      searchedAt: timestamp
    };

    try {
      const searchRef = this.progressRef.child(`ocrSearches`).push();
      await searchRef.set(searchData);

      // Update OCR stats
      await this.updateOCRStats(searchText, results.length);
      await this.updateOverallStats('ocrSearches');

      console.log('OCR search tracked:', { searchText, resultsCount: results.length, processingTime });
      return searchRef.key;
    } catch (error) {
      console.error('Error tracking OCR search:', error);
      return null;
    }
  }

  // Track 3D model view
  async track3DModelView(modelId, modelName, viewDuration = 0) {
    if (!this.userId || !this.progressRef) {
      console.log('Progress tracking: No authenticated user');
      return null;
    }

    const timestamp = Date.now();
    const viewData = {
      modelId,
      modelName,
      viewDuration,
      viewedAt: timestamp
    };

    try {
      // Add to 3D model views
      const modelViewRef = this.progressRef.child(`modelViews`).push();
      await modelViewRef.set(viewData);

      // Update model-specific stats
      const modelStatsRef = this.progressRef.child(`modelStats/${modelId}`);
      const snapshot = await modelStatsRef.once('value');
      
      if (snapshot.exists()) {
        const existingData = snapshot.val();
        await modelStatsRef.update({
          totalViewTime: (existingData.totalViewTime || 0) + viewDuration,
          viewCount: (existingData.viewCount || 0) + 1,
          lastViewed: timestamp
        });
      } else {
        await modelStatsRef.set({
          modelId,
          modelName,
          totalViewTime: viewDuration,
          viewCount: 1,
          firstViewed: timestamp,
          lastViewed: timestamp
        });
      }

      await this.updateOverallStats('modelViews');
      
      console.log('3D model view tracked:', { modelId, modelName, viewDuration });
      return modelViewRef.key;
    } catch (error) {
      console.error('Error tracking 3D model view:', error);
      return null;
    }
  }

  // Update overall statistics
  async updateOverallStats(type) {
    if (!this.userId || !this.progressRef) return;

    try {
      const statsRef = this.progressRef.child('overallStats');
      const snapshot = await statsRef.once('value');
      const currentStats = snapshot.val() || {};

      const updates = {
        lastActivity: Date.now(),
        [`total${type.charAt(0).toUpperCase() + type.slice(1)}`]: 
          (currentStats[`total${type.charAt(0).toUpperCase() + type.slice(1)}`] || 0) + 1
      };

      await statsRef.update(updates);
    } catch (error) {
      console.error('Error updating overall stats:', error);
    }
  }

  // Update OCR-specific statistics
  async updateOCRStats(searchText, resultsCount) {
    if (!this.userId || !this.progressRef) return;

    try {
      const ocrStatsRef = this.progressRef.child('ocrStats');
      const snapshot = await ocrStatsRef.once('value');
      const currentStats = snapshot.val() || {};

      const updates = {
        totalSearches: (currentStats.totalSearches || 0) + 1,
        totalResults: (currentStats.totalResults || 0) + resultsCount,
        lastSearchText: searchText,
        lastSearchTime: Date.now(),
        averageResults: Math.round(((currentStats.totalResults || 0) + resultsCount) / ((currentStats.totalSearches || 0) + 1))
      };

      await ocrStatsRef.update(updates);
    } catch (error) {
      console.error('Error updating OCR stats:', error);
    }
  }

  // Get user progress data
  async getUserProgress() {
    if (!this.userId || !this.progressRef) return null;

    try {
      const snapshot = await this.progressRef.once('value');
      return snapshot.val();
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  // Get terms progress
  async getTermsProgress() {
    if (!this.userId || !this.progressRef) return [];

    try {
      const snapshot = await this.progressRef.child('terms').once('value');
      const termsData = snapshot.val() || {};
      
      return Object.entries(termsData).map(([termId, data]) => ({
        termId,
        ...data
      })).sort((a, b) => b.totalTimeSpent - a.totalTimeSpent);
    } catch (error) {
      console.error('Error getting terms progress:', error);
      return [];
    }
  }

  // Get OCR search history
  async getOCRHistory(limit = 50) {
    if (!this.userId || !this.progressRef) return [];

    try {
      const snapshot = await this.progressRef
        .child('ocrSearches')
        .orderByChild('searchedAt')
        .limitToLast(limit)
        .once('value');
      
      const searchData = snapshot.val() || {};
      
      return Object.entries(searchData).map(([searchId, data]) => ({
        searchId,
        ...data
      })).sort((a, b) => b.searchedAt - a.searchedAt);
    } catch (error) {
      console.error('Error getting OCR history:', error);
      return [];
    }
  }

  // Get 3D model views
  async getModelViews(limit = 50) {
    if (!this.userId || !this.progressRef) return [];

    try {
      const snapshot = await this.progressRef
        .child('modelViews')
        .orderByChild('viewedAt')
        .limitToLast(limit)
        .once('value');
      
      const viewData = snapshot.val() || {};
      
      return Object.entries(viewData).map(([viewId, data]) => ({
        viewId,
        ...data
      })).sort((a, b) => b.viewedAt - a.viewedAt);
    } catch (error) {
      console.error('Error getting model views:', error);
      return [];
    }
  }

  // Get model statistics
  async getModelStats() {
    if (!this.userId || !this.progressRef) return [];

    try {
      const snapshot = await this.progressRef.child('modelStats').once('value');
      const statsData = snapshot.val() || {};
      
      return Object.entries(statsData).map(([modelId, data]) => ({
        modelId,
        ...data
      })).sort((a, b) => b.totalViewTime - a.totalViewTime);
    } catch (error) {
      console.error('Error getting model stats:', error);
      return [];
    }
  }

  // Listen to progress changes
  onProgressChange(callback) {
    if (!this.userId || !this.progressRef) return () => {};

    const listener = this.progressRef.on('value', (snapshot) => {
      callback(snapshot.val());
    });

    return () => this.progressRef.off('value', listener);
  }

  // Export progress data
  async exportProgressData() {
    if (!this.userId || !this.progressRef) return null;

    try {
      const progressData = await this.getUserProgress();
      return {
        userId: this.userId,
        exportedAt: Date.now(),
        data: progressData
      };
    } catch (error) {
      console.error('Error exporting progress data:', error);
      return null;
    }
  }

  // Test connection
  async testConnection() {
    try {
      const testRef = database(this.app).ref('.info/connected');
      const snapshot = await testRef.once('value');
      const connected = snapshot.val();
      console.log('Firebase Realtime Database connected:', connected);
      return connected;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return false;
    }
  }
}

export default new ProgressService();