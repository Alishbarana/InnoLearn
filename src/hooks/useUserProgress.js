import { useState, useEffect, useCallback } from 'react';
import progressService from '../services/firebase/progressService';

export const useUserProgress = () => {
  const [progressData, setProgressData] = useState(null);
  const [termsProgress, setTermsProgress] = useState([]);
  const [ocrHistory, setOcrHistory] = useState([]);
  const [modelViews, setModelViews] = useState([]);
  const [modelStats, setModelStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial progress data
  const loadProgressData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [progress, terms, ocr, models, stats] = await Promise.all([
        progressService.getUserProgress(),
        progressService.getTermsProgress(),
        progressService.getOCRHistory(),
        progressService.getModelViews(),
        progressService.getModelStats()
      ]);

      setProgressData(progress);
      setTermsProgress(terms);
      setOcrHistory(ocr);
      setModelViews(models);
      setModelStats(stats);
    } catch (err) {
      setError(err.message);
      console.error('Error loading progress data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Track term visit
  const trackTermVisit = useCallback(async (termId, termName, timeSpent) => {
    try {
      const success = await progressService.trackTermVisit(termId, termName, timeSpent);
      if (success) {
        // Refresh terms progress
        const updatedTerms = await progressService.getTermsProgress();
        setTermsProgress(updatedTerms);
      }
      return success;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  // Track OCR search
  const trackOCRSearch = useCallback(async (searchText, results, processingTime) => {
    try {
      const searchId = await progressService.trackOCRSearch(searchText, results, processingTime);
      if (searchId) {
        // Refresh OCR history
        const updatedHistory = await progressService.getOCRHistory();
        setOcrHistory(updatedHistory);
      }
      return searchId;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Track 3D model view
  const track3DModelView = useCallback(async (modelId, modelName, viewDuration) => {
    try {
      const viewId = await progressService.track3DModelView(modelId, modelName, viewDuration);
      if (viewId) {
        // Refresh model data
        const [updatedViews, updatedStats] = await Promise.all([
          progressService.getModelViews(),
          progressService.getModelStats()
        ]);
        setModelViews(updatedViews);
        setModelStats(updatedStats);
      }
      return viewId;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Export progress data
  const exportProgress = useCallback(async () => {
    try {
      return await progressService.exportProgressData();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Calculate progress statistics
  const getProgressStats = useCallback(() => {
    if (!progressData) return null;

    const stats = progressData.overallStats || {};
    const totalTimeSpent = termsProgress.reduce((total, term) => total + (term.totalTimeSpent || 0), 0);
    const totalTermsVisited = termsProgress.length;
    const totalOCRSearches = ocrHistory.length;
    const totalModelViews = modelViews.length;

    return {
      totalTimeSpent,
      totalTermsVisited,
      totalOCRSearches,
      totalModelViews,
      averageTimePerTerm: totalTermsVisited > 0 ? Math.round(totalTimeSpent / totalTermsVisited) : 0,
      mostViewedTerm: termsProgress[0] || null,
      recentActivity: stats.lastActivity || null,
      ...stats
    };
  }, [progressData, termsProgress, ocrHistory, modelViews]);

  useEffect(() => {
    loadProgressData();

    // Set up real-time listener
    const unsubscribe = progressService.onProgressChange((data) => {
      setProgressData(data);
    });

    return unsubscribe;
  }, [loadProgressData]);

  return {
    progressData,
    termsProgress,
    ocrHistory,
    modelViews,
    modelStats,
    loading,
    error,
    trackTermVisit,
    trackOCRSearch,
    track3DModelView,
    exportProgress,
    getProgressStats,
    refreshProgress: loadProgressData
  };
};