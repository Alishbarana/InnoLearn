"use client"

import React, { useState } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Share,
  Dimensions,
  StatusBar,
  Animated,
  BackHandler,
} from "react-native"
import { useUserProgress } from "../../hooks/useUserProgress"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import Ionicons from "react-native-vector-icons/Ionicons"
import LinearGradient from "react-native-linear-gradient"
import * as Animatable from "react-native-animatable"
import { useFocusEffect } from "@react-navigation/native"

const { width } = Dimensions.get("window")

const ProgressScreen = ({ navigation }) => {
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
    refreshProgress,
  } = useUserProgress()

  const [activeTab, setActiveTab] = useState("overview")
  const [refreshing, setRefreshing] = useState(false)

  const stats = getProgressStats()

  // App colors matching your theme
  const Colors = {
    primary: "#384959",
    secondary: "#6A89A7",
    ternary: "#88bdf2",
    quartery: "#BDDDFC",
    quinary: "#EFF8FB",
    background: "#ffffff",
    text: "#333333",
    error: "#e74c3c",
    success: "#4CAF50",
    warning: "#FFC107",
  }

  // Professional back button handling
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack()
        } else {
          navigation.navigate("Home")
        }
        return true
      }

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress)
      return () => subscription.remove()
    }, [navigation]),
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshProgress()
    setRefreshing(false)
  }

  const handleExportProgress = async () => {
    try {
      const exportData = await exportProgress()
      if (exportData) {
        const shareOptions = {
          title: "📊 My Learning Progress Report",
          message: `🎓 Learning Progress Report
📅 Exported: ${new Date(exportData.exportedAt).toLocaleDateString()}

📚 Study Statistics:
⏱️ Total Time: ${formatTime(stats?.totalTimeSpent || 0)}
📖 Topics Studied: ${stats?.totalTermsVisited || 0}
🔍 OCR Searches: ${stats?.totalOCRSearches || 0}
🥽 AR Model Views: ${stats?.totalModelViews || 0}

Keep learning! 🚀`,
        }
        await Share.share(shareOptions)
      }
    } catch (err) {
      Alert.alert("Export Error", "Failed to export progress data")
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getProgressPercentage = (timeSpent, maxTime) => {
    if (!maxTime) return 0
    return Math.min((timeSpent / maxTime) * 100, 100)
  }

  const renderOverview = () => {
    if (!stats)
      return (
        <View style={styles.emptyContainer}>
          <Animatable.View animation="fadeInUp" duration={800}>
            <MaterialCommunityIcons name="chart-line" size={wp(20)} color={Colors.ternary} />
            <Text style={styles.emptyText}>Start Your Learning Journey</Text>
            <Text style={styles.emptySubText}>Begin exploring topics to see your progress!</Text>
          </Animatable.View>
        </View>
      )

    const maxTimeSpent = Math.max(...termsProgress.map((t) => t.totalTimeSpent), 1)

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Hero Stats Cards */}
        <View style={styles.heroStatsContainer}>
          <Animatable.View animation="fadeInLeft" delay={100}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.heroStatCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="clock-outline" size={wp(8)} color="#fff" />
              <Text style={styles.heroStatNumber}>{formatTime(stats.totalTimeSpent)}</Text>
              <Text style={styles.heroStatLabel}>Total Study Time</Text>
            </LinearGradient>
          </Animatable.View>

          <Animatable.View animation="fadeInRight" delay={200}>
            <LinearGradient
              colors={[Colors.ternary, Colors.quartery]}
              style={styles.heroStatCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="book-open-variant" size={wp(8)} color="#fff" />
              <Text style={styles.heroStatNumber}>{stats.totalTermsVisited}</Text>
              <Text style={styles.heroStatLabel}>Topics Mastered</Text>
            </LinearGradient>
          </Animatable.View>
        </View>

        {/* Quick Stats Grid */}
        <Animatable.View animation="fadeInUp" delay={300}>
          <View style={styles.quickStatsGrid}>
            <View style={styles.quickStatItem}>
              <View style={[styles.quickStatIcon, { backgroundColor: Colors.success }]}>
                <MaterialCommunityIcons name="magnify" size={wp(5)} color="#fff" />
              </View>
              <Text style={styles.quickStatNumber}>{stats.totalOCRSearches || 0}</Text>
              <Text style={styles.quickStatLabel}>OCR Searches</Text>
            </View>

            <View style={styles.quickStatItem}>
              <View style={[styles.quickStatIcon, { backgroundColor: Colors.warning }]}>
                <MaterialCommunityIcons name="cube-scan" size={wp(5)} color="#fff" />
              </View>
              <Text style={styles.quickStatNumber}>{stats.totalModelViews || 0}</Text>
              <Text style={styles.quickStatLabel}>AR Views</Text>
            </View>

            <View style={styles.quickStatItem}>
              <View style={[styles.quickStatIcon, { backgroundColor: Colors.error }]}>
                <MaterialCommunityIcons name="target" size={wp(5)} color="#fff" />
              </View>
              <Text style={styles.quickStatNumber}>{Math.floor((stats.totalTimeSpent || 0) / 60)}</Text>
              <Text style={styles.quickStatLabel}>Minutes</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Most Studied Topic */}
        {stats.mostViewedTerm && (
          <Animatable.View animation="fadeInUp" delay={400}>
            <View style={styles.featuredCard}>
              <LinearGradient colors={[Colors.quinary, "#fff"]} style={styles.featuredCardGradient}>
                <View style={styles.featuredCardHeader}>
                  <MaterialCommunityIcons name="star" size={wp(6)} color={Colors.warning} />
                  <Text style={styles.featuredCardTitle}>Most Studied Topic</Text>
                </View>
                <Text style={styles.featuredTopicName}>{stats.mostViewedTerm.termName}</Text>
                <View style={styles.featuredStats}>
                  <Text style={styles.featuredStatText}>
                    {formatTime(stats.mostViewedTerm.totalTimeSpent)} • {stats.mostViewedTerm.visitCount} visits
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </Animatable.View>
        )}

        {/* Learning Streak */}
        <Animatable.View animation="fadeInUp" delay={500}>
          <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <MaterialCommunityIcons name="fire" size={wp(6)} color={Colors.error} />
              <Text style={styles.streakTitle}>Learning Activity</Text>
            </View>
            <Text style={styles.streakText}>
              Last activity: {stats.recentActivity ? formatDate(stats.recentActivity) : "No recent activity"}
            </Text>
          </View>
        </Animatable.View>
      </ScrollView>
    )
  }

  const renderTermsProgress = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {termsProgress.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animatable.View animation="bounceIn" duration={1000}>
            <MaterialCommunityIcons name="book-outline" size={wp(20)} color={Colors.ternary} />
            <Text style={styles.emptyText}>No Topics Yet</Text>
            <Text style={styles.emptySubText}>Start reading content to track your progress!</Text>
          </Animatable.View>
        </View>
      ) : (
        termsProgress.map((term, index) => {
          const maxTime = Math.max(...termsProgress.map((t) => t.totalTimeSpent))
          const progressPercentage = getProgressPercentage(term.totalTimeSpent, maxTime)

          return (
            <Animatable.View
              key={term.termId}
              animation="fadeInUp"
              delay={index * 100}
              style={styles.modernProgressItem}
            >
              <LinearGradient
                colors={["#fff", Colors.quinary]}
                style={styles.progressItemGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.progressItemHeader}>
                  <View style={styles.progressItemLeft}>
                    <View style={[styles.progressItemIcon, { backgroundColor: Colors.primary }]}>
                      <MaterialCommunityIcons name="book" size={wp(5)} color="#fff" />
                    </View>
                    <View style={styles.progressItemInfo}>
                      <Text style={styles.progressItemTitle}>{term.termName}</Text>
                      <Text style={styles.progressItemSubtitle}>
                        {term.visitCount} visits • Last: {formatDate(term.lastVisited)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressItemRight}>
                    <Text style={styles.progressItemTime}>{formatTime(term.totalTimeSpent)}</Text>
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progressPercentage}%`,
                          backgroundColor: Colors.ternary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercentageText}>{Math.round(progressPercentage)}%</Text>
                </View>
              </LinearGradient>
            </Animatable.View>
          )
        })
      )}
    </ScrollView>
  )

  const renderOCRHistory = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {ocrHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animatable.View animation="pulse" iterationCount="infinite">
            <MaterialCommunityIcons name="text-recognition" size={wp(20)} color={Colors.ternary} />
            <Text style={styles.emptyText}>No Searches Yet</Text>
            <Text style={styles.emptySubText}>Use the camera to search for terms!</Text>
          </Animatable.View>
        </View>
      ) : (
        ocrHistory.map((search, index) => (
          <Animatable.View
            key={search.searchId}
            animation="slideInRight"
            delay={index * 50}
            style={styles.modernHistoryItem}
          >
            <View style={styles.historyItemHeader}>
              <View style={[styles.historyItemIcon, { backgroundColor: Colors.ternary }]}>
                <MaterialCommunityIcons name="magnify" size={wp(5)} color="#fff" />
              </View>
              <View style={styles.historyItemContent}>
                <Text style={styles.historyItemTitle} numberOfLines={1}>
                  "{search.searchText}"
                </Text>
                <Text style={styles.historyItemDetails}>
                  {search.resultsCount} results • {search.processingTime}ms • {formatDate(search.searchedAt)}
                </Text>
              </View>
            </View>

            {search.results && search.results.length > 0 && (
              <View style={styles.resultsContainer}>
                {search.results.slice(0, 2).map((result, idx) => (
                  <View key={idx} style={styles.resultTag}>
                    <Text style={styles.resultTagText}>{result}</Text>
                  </View>
                ))}
                {search.results.length > 2 && (
                  <Text style={styles.moreResultsText}>+{search.results.length - 2} more</Text>
                )}
              </View>
            )}
          </Animatable.View>
        ))
      )}
    </ScrollView>
  )

  const renderModelViews = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {modelStats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animatable.View animation="rotate" duration={2000} iterationCount="infinite">
            <MaterialCommunityIcons name="cube-outline" size={wp(20)} color={Colors.ternary} />
          </Animatable.View>
          <Text style={styles.emptyText}>No AR Models Yet</Text>
          <Text style={styles.emptySubText}>Use AR features to view 3D models!</Text>
        </View>
      ) : (
        modelStats.map((model, index) => {
          const maxTime = Math.max(...modelStats.map((m) => m.totalViewTime))
          const progressPercentage = getProgressPercentage(model.totalViewTime, maxTime)

          return (
            <Animatable.View key={model.modelId} animation="zoomIn" delay={index * 100} style={styles.modernModelItem}>
              <LinearGradient
                colors={[Colors.secondary, Colors.ternary]}
                style={styles.modelItemGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.modelItemHeader}>
                  <MaterialCommunityIcons name="cube-scan" size={wp(8)} color="#fff" />
                  <View style={styles.modelItemInfo}>
                    <Text style={styles.modelItemTitle}>{model.modelName}</Text>
                    <Text style={styles.modelItemSubtitle}>
                      {model.viewCount} views • {formatTime(model.totalViewTime)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modelProgressContainer}>
                  <View style={styles.modelProgressBar}>
                    <Animated.View style={[styles.modelProgressFill, { width: `${progressPercentage}%` }]} />
                  </View>
                  <Text style={styles.modelLastViewed}>Last viewed: {formatDate(model.lastViewed)}</Text>
                </View>
              </LinearGradient>
            </Animatable.View>
          )
        })
      )}
    </ScrollView>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animatable.View animation="pulse" iterationCount="infinite">
          <MaterialCommunityIcons name="chart-line" size={wp(15)} color={Colors.ternary} />
        </Animatable.View>
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={wp(15)} color={Colors.error} />
        <Text style={styles.errorText}>Oops! Something went wrong</Text>
        <Text style={styles.errorSubText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshProgress}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Modern Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack()
              } else {
                navigation.navigate("Home")
              }
            }}
          >
            <Ionicons name="arrow-back" size={wp(6)} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Learning Progress</Text>
            <Text style={styles.headerSubtitle}>Track your journey</Text>
          </View>

          <TouchableOpacity style={styles.exportButton} onPress={handleExportProgress}>
            <MaterialCommunityIcons name="share-variant" size={wp(6)} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Modern Tab Container */}
      <View style={styles.tabContainer}>
        {[
          { id: "overview", name: "Overview", icon: "view-dashboard" },
          { id: "terms", name: "Topics", icon: "book-multiple" },
          { id: "ocr", name: "Searches", icon: "magnify" },
          { id: "models", name: "AR Models", icon: "cube-scan" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={wp(5)}
              color={activeTab === tab.id ? Colors.primary : "#999"}
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {activeTab === "overview" && renderOverview()}
          {activeTab === "terms" && renderTermsProgress()}
          {activeTab === "ocr" && renderOCRHistory()}
          {activeTab === "models" && renderModelViews()}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: StatusBar.currentHeight + hp(3),
    paddingBottom: hp(3),
    borderBottomLeftRadius: wp(8),
    borderBottomRightRadius: wp(8),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(5),
  },
  backButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: wp(3.5),
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: hp(0.5),
  },
  exportButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: -hp(2),
    marginHorizontal: wp(5),
    borderRadius: wp(4),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: hp(2),
    alignItems: "center",
    borderRadius: wp(4),
  },
  activeTab: {
    backgroundColor: "#f8f9fa",
  },
  tabText: {
    fontSize: wp(3),
    color: "#999",
    marginTop: hp(0.5),
    fontWeight: "500",
  },
  activeTabText: {
    color: "#384959",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    marginTop: hp(2),
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: wp(5),
  },

  // Hero Stats
  heroStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(3),
  },
  heroStatCard: {
    width: "48%",
    padding: wp(5),
    borderRadius: wp(4),
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  heroStatNumber: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: "#fff",
    marginTop: hp(1),
  },
  heroStatLabel: {
    fontSize: wp(3.5),
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginTop: hp(0.5),
  },

  // Quick Stats Grid
  quickStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(3),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickStatItem: {
    alignItems: "center",
  },
  quickStatIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(1),
  },
  quickStatNumber: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: "#384959",
  },
  quickStatLabel: {
    fontSize: wp(3),
    color: "#666",
    marginTop: hp(0.5),
  },

  // Featured Card
  featuredCard: {
    marginBottom: hp(3),
    borderRadius: wp(4),
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  featuredCardGradient: {
    padding: wp(5),
  },
  featuredCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1),
  },
  featuredCardTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#384959",
    marginLeft: wp(2),
  },
  featuredTopicName: {
    fontSize: wp(5.5),
    fontWeight: "bold",
    color: "#384959",
    marginBottom: hp(1),
  },
  featuredStats: {
    marginTop: hp(1),
  },
  featuredStatText: {
    fontSize: wp(3.5),
    color: "#6A89A7",
  },

  // Streak Card
  streakCard: {
    backgroundColor: "#fff",
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(3),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1),
  },
  streakTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#384959",
    marginLeft: wp(2),
  },
  streakText: {
    fontSize: wp(3.5),
    color: "#666",
  },

  // Modern Progress Items
  modernProgressItem: {
    marginBottom: hp(2),
    borderRadius: wp(4),
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  progressItemGradient: {
    padding: wp(4),
  },
  progressItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  progressItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  progressItemIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  progressItemInfo: {
    flex: 1,
  },
  progressItemTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#384959",
  },
  progressItemSubtitle: {
    fontSize: wp(3),
    color: "#6A89A7",
    marginTop: hp(0.3),
  },
  progressItemRight: {
    alignItems: "flex-end",
  },
  progressItemTime: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: "#384959",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBarBackground: {
    flex: 1,
    height: hp(0.8),
    backgroundColor: "#e0e0e0",
    borderRadius: hp(0.4),
    overflow: "hidden",
    marginRight: wp(3),
  },
  progressBarFill: {
    height: "100%",
    borderRadius: hp(0.4),
  },
  progressPercentageText: {
    fontSize: wp(3),
    color: "#666",
    fontWeight: "600",
  },

  // Modern History Items
  modernHistoryItem: {
    backgroundColor: "#fff",
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(2),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  historyItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1),
  },
  historyItemIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: "#384959",
  },
  historyItemDetails: {
    fontSize: wp(3),
    color: "#6A89A7",
    marginTop: hp(0.3),
  },
  resultsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: hp(1),
  },
  resultTag: {
    backgroundColor: "#EFF8FB",
    borderRadius: wp(3),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    marginRight: wp(1),
    marginBottom: hp(0.5),
  },
  resultTagText: {
    fontSize: wp(3),
    color: "#384959",
    fontWeight: "500",
  },
  moreResultsText: {
    fontSize: wp(3),
    color: "#88bdf2",
    fontStyle: "italic",
    alignSelf: "center",
  },

  // Modern Model Items
  modernModelItem: {
    marginBottom: hp(2),
    borderRadius: wp(4),
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  modelItemGradient: {
    padding: wp(4),
  },
  modelItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  modelItemInfo: {
    marginLeft: wp(3),
    flex: 1,
  },
  modelItemTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#fff",
  },
  modelItemSubtitle: {
    fontSize: wp(3.5),
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: hp(0.3),
  },
  modelProgressContainer: {
    marginTop: hp(1),
  },
  modelProgressBar: {
    height: hp(0.8),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: hp(0.4),
    overflow: "hidden",
    marginBottom: hp(1),
  },
  modelProgressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: hp(0.4),
  },
  modelLastViewed: {
    fontSize: wp(3),
    color: "rgba(255, 255, 255, 0.8)",
  },

  // Empty States
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(10),
  },
  emptyText: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: "#384959",
    textAlign: "center",
    marginTop: hp(2),
  },
  emptySubText: {
    fontSize: wp(3.5),
    color: "#6A89A7",
    textAlign: "center",
    marginTop: hp(1),
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    fontSize: wp(4),
    color: "#6A89A7",
    marginTop: hp(2),
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: wp(5),
  },
  errorText: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#e74c3c",
    textAlign: "center",
    marginTop: hp(2),
  },
  errorSubText: {
    fontSize: wp(3.5),
    color: "#666",
    textAlign: "center",
    marginTop: hp(1),
    marginBottom: hp(3),
  },
  retryButton: {
    backgroundColor: "#384959",
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
  },
  retryButtonText: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "600",
  },
})

export default ProgressScreen
