import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Share
} from 'react-native';
import { useUserProgress } from '../../hooks/useUserProgress';
import Colors from '../../styles/colors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen"

const ProgressScreen = () => {
  const {
    progressData,
    termsProgress,
    ocrHistory,
    modelViews,
    modelStats,
    loading,
    error,
    getProgressStats,
    exportProgress,
    refreshProgress
  } = useUserProgress();

  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const stats = getProgressStats();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProgress();
    setRefreshing(false);
  };

  const handleExportProgress = async () => {
    try {
      const exportData = await exportProgress();
      if (exportData) {
        const shareOptions = {
          title: 'My Learning Progress',
          message: `Learning Progress Report\nExported on: ${new Date(exportData.exportedAt).toLocaleDateString()}\n\nTotal Time Spent: ${formatTime(stats?.totalTimeSpent || 0)}\nTerms Visited: ${stats?.totalTermsVisited || 0}\nOCR Searches: ${stats?.totalOCRSearches || 0}\nModel Views: ${stats?.totalModelViews || 0}`,
        };
        await Share.share(shareOptions);
      }
    } catch (err) {
      Alert.alert('Export Error', 'Failed to export progress data');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOverview = () => {
    if (!stats) return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No progress data available yet.</Text>
        <Text style={styles.emptySubText}>Start learning to see your progress!</Text>
      </View>
    );

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatTime(stats.totalTimeSpent)}</Text>
            <Text style={styles.statLabel}>Total Time Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalTermsVisited}</Text>
            <Text style={styles.statLabel}>Terms Visited</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalOCRSearches}</Text>
            <Text style={styles.statLabel}>OCR Searches</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalModelViews}</Text>
            <Text style={styles.statLabel}>Model Views</Text>
          </View>
        </View>

        {stats.mostViewedTerm && (
          <View style={styles.highlightCard}>
            <Text style={styles.highlightTitle}>Most Studied Term</Text>
            <Text style={styles.highlightContent}>{stats.mostViewedTerm.termName}</Text>
            <Text style={styles.highlightSubtext}>
              {formatTime(stats.mostViewedTerm.totalTimeSpent)} • {stats.mostViewedTerm.visitCount} visits
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderTermsProgress = () => (
    <ScrollView style={styles.tabContent}>
      {termsProgress.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No terms visited yet.</Text>
          <Text style={styles.emptySubText}>Start reading content to track your progress!</Text>
        </View>
      ) : (
        termsProgress.map((term, index) => (
          <View key={term.termId} style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>{term.termName}</Text>
              <Text style={styles.progressTime}>{formatTime(term.totalTimeSpent)}</Text>
            </View>
            <View style={styles.progressDetails}>
              <Text style={styles.progressDetail}>Visits: {term.visitCount}</Text>
              <Text style={styles.progressDetail}>
                Last visited: {formatDate(term.lastVisited)}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((term.totalTimeSpent / (stats?.totalTimeSpent || 1)) * 100, 100)}%` }
                ]} 
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderOCRHistory = () => (
    <ScrollView style={styles.tabContent}>
      {ocrHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No OCR searches yet.</Text>
          <Text style={styles.emptySubText}>Use the camera to search for terms!</Text>
        </View>
      ) : (
        ocrHistory.map((search, index) => (
          <View key={search.searchId} style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>"{search.searchText}"</Text>
              <Text style={styles.historyTime}>{formatDate(search.searchedAt)}</Text>
            </View>
            <Text style={styles.historyDetails}>
              {search.resultsCount} results • {search.processingTime}ms
            </Text>
            {search.results && search.results.length > 0 && (
              <View style={styles.resultsContainer}>
                {search.results.slice(0, 3).map((result, idx) => (
                  <Text key={idx} style={styles.resultItem}>• {result}</Text>
                ))}
                {search.results.length > 3 && (
                  <Text style={styles.moreResults}>
                    +{search.results.length - 3} more results
                  </Text>
                )}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderModelViews = () => (
    <ScrollView style={styles.tabContent}>
      {modelStats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No 3D models viewed yet.</Text>
          <Text style={styles.emptySubText}>Use AR features to view 3D models!</Text>
        </View>
      ) : (
        modelStats.map((model, index) => (
          <View key={model.modelId} style={styles.modelItem}>
            <View style={styles.modelHeader}>
              <Text style={styles.modelTitle}>{model.modelName}</Text>
              <Text style={styles.modelTime}>{formatTime(model.totalViewTime)}</Text>
            </View>
            <View style={styles.modelDetails}>
              <Text style={styles.modelDetail}>Views: {model.viewCount}</Text>
              <Text style={styles.modelDetail}>
                Last viewed: {formatDate(model.lastViewed)}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min((model.totalViewTime / Math.max(...modelStats.map(m => m.totalViewTime))) * 100, 100)}%`,
                    backgroundColor: Colors.secondary
                  }
                ]} 
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshProgress}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Progress</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportProgress}>
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {['overview', 'terms', 'ocr', 'models'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'terms' && renderTermsProgress()}
          {activeTab === 'ocr' && renderOCRHistory()}
          {activeTab === 'models' && renderModelViews()}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(5),
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#fff',
  },
  exportButton: {
    backgroundColor: '#fff',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(2),
  },
  exportButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: wp(3.5),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: hp(2),
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: wp(4),
    color: '#666',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: wp(5),
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: hp(3),
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: wp(4),
    borderRadius: wp(3),
    width: '48%',
    marginBottom: hp(2),
    elevation: 2,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: hp(0.5),
  },
  statLabel: {
    fontSize: wp(3.5),
    color: '#666',
    textAlign: 'center',
  },
  highlightCard: {
    backgroundColor: Colors.primary,
    padding: wp(5),
    borderRadius: wp(3),
    marginBottom: hp(3),
  },
  highlightTitle: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#fff',
    marginBottom: hp(1),
  },
  highlightContent: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: hp(0.5),
  },
  highlightSubtext: {
    fontSize: wp(3.5),
    color: '#fff',
    opacity: 0.8,
  },
  progressItem: {
    backgroundColor: '#f8f9fa',
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(2),
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  progressTitle: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  progressTime: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1.5),
  },
  progressDetail: {
    fontSize: wp(3.5),
    color: '#666',
  },
  progressBar: {
    height: hp(0.8),
    backgroundColor: '#e0e0e0',
    borderRadius: hp(0.4),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: hp(0.4),
  },
  historyItem: {
    backgroundColor: '#f8f9fa',
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(2),
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(1),
  },
  historyTitle: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: wp(3),
  },
  historyTime: {
    fontSize: wp(3),
    color: '#666',
  },
  historyDetails: {
    fontSize: wp(3.5),
    color: '#666',
    marginBottom: hp(1),
  },
  resultsContainer: {
    marginTop: hp(1),
  },
  resultItem: {
    fontSize: wp(3.5),
    color: '#333',
    marginBottom: hp(0.3),
  },
  moreResults: {
    fontSize: wp(3.5),
    color: Colors.primary,
    fontStyle: 'italic',
    marginTop: hp(0.5),
  },
  modelItem: {
    backgroundColor: '#f8f9fa',
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(2),
    elevation: 2,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  modelTitle: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  modelTime: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  modelDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1.5),
  },
  modelDetail: {
    fontSize: wp(3.5),
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  emptyText: {
    fontSize: wp(4.5),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  emptySubText: {
    fontSize: wp(3.5),
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: wp(4.5),
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: wp(5),
  },
  errorText: {
    fontSize: wp(4),
    color: 'red',
    textAlign: 'center',
    marginBottom: hp(3),
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: '600',
  },
});

export default ProgressScreen;