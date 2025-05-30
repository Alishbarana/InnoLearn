import { useState } from "react"
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import Colors from "../../styles/colors"
import { useUserProgress } from "../../hooks/useUserProgress"
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated"

const { width } = Dimensions.get("window")

export default function Progress() {
  const [activeTab, setActiveTab] = useState("overview")
  const { progress, loading, error } = useUserProgress()

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={wp("15%")} color={Colors.secondary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!progress) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="book-open-page-variant" size={wp("15%")} color={Colors.ternary} />
        <Text style={styles.emptyText}>No progress data available</Text>
      </View>
    )
  }

  // Format time for display (convert minutes to hours and minutes)
  const formatStudyTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`
    }
  }

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
      <Text style={styles.headerTitle}>Learning Progress</Text>
      <Text style={styles.headerSubtitle}>{progress.streak} Day Streak! 🔥</Text>
    </Animated.View>
  )

  const renderStats = () => (
    <Animated.View entering={FadeInUp.delay(400)} style={styles.statsContainer}>
      <View style={styles.statCard}>
        <MaterialCommunityIcons name="book-open-variant" size={wp("8%")} color={Colors.primary} />
        <Text style={styles.statNumber}>{progress.completedTopics}</Text>
        <Text style={styles.statLabel}>Topics Completed</Text>
      </View>
      <View style={styles.statCard}>
        <MaterialCommunityIcons name="clock-outline" size={wp("8%")} color={Colors.primary} />
        <Text style={styles.statNumber}>{formatStudyTime(progress.totalStudyTime).split(" ")[0]}</Text>
        <Text style={styles.statLabel}>
          {formatStudyTime(progress.totalStudyTime).includes("hr") ? "Hours Studied" : "Minutes Studied"}
        </Text>
      </View>
    </Animated.View>
  )

  const renderCategoryProgress = () => (
    <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
      <Text style={styles.sectionTitle}>Category Progress</Text>
      {Object.entries(progress.categoryCompletion).map(([category, data]) => (
        <View key={category} style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <Text style={styles.categoryPercentage}>{data.percentage}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${data.percentage}%` },
                data.percentage === 100 ? styles.progressBarComplete : {},
              ]}
            />
          </View>
          <Text style={styles.categoryDetails}>
            {data.completed} of {data.total} topics completed
          </Text>
        </View>
      ))}
    </Animated.View>
  )

  const renderActivities = () => (
    <Animated.View entering={FadeInUp.delay(700)} style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Activities</Text>
      {progress.recentActivities.length > 0 ? (
        progress.recentActivities.map((activity, index) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <FontAwesome5 name={activity.icon} size={wp("6%")} color={Colors.primary} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.topic}</Text>
              <Text style={styles.activityDate}>{activity.date}</Text>
            </View>
            <View style={styles.activityMetrics}>
              <Text style={styles.activityScore}>{activity.score}%</Text>
              {activity.duration > 0 && <Text style={styles.activityDuration}>{activity.duration} min</Text>}
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyActivities}>
          <Text style={styles.emptyActivitiesText}>No recent activities</Text>
          <Text style={styles.emptyActivitiesSubtext}>Start exploring topics to track your progress</Text>
        </View>
      )}
    </Animated.View>
  )

  const renderAchievements = () => (
    <Animated.View entering={FadeInUp.delay(800)} style={styles.section}>
      <Text style={styles.sectionTitle}>Achievements</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
        {progress.achievements.map((achievement) => (
          <View key={achievement.id} style={[styles.achievementCard, { opacity: achievement.achieved ? 1 : 0.6 }]}>
            <MaterialCommunityIcons
              name={achievement.icon}
              size={wp("10%")}
              color={achievement.achieved ? Colors.primary : Colors.ternary}
            />
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDesc}>{achievement.description}</Text>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  )

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      {renderStats()}
      {renderCategoryProgress()}
      {renderActivities()}
      {renderAchievements()}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: wp("5%"),
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: wp("5%"),
    borderBottomRightRadius: wp("5%"),
  },
  headerTitle: {
    fontSize: wp("8%"),
    fontWeight: "bold",
    color: Colors.background,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: wp("4%"),
    color: Colors.quinary,
    textAlign: "center",
    marginTop: hp("1%"),
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: wp("5%"),
    marginTop: -hp("5%"),
  },
  statCard: {
    backgroundColor: Colors.background,
    borderRadius: wp("4%"),
    padding: wp("5%"),
    width: wp("42%"),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: wp("8%"),
    fontWeight: "bold",
    color: Colors.primary,
    marginVertical: hp("1%"),
  },
  statLabel: {
    fontSize: wp("3.5%"),
    color: Colors.secondary,
    textAlign: "center",
  },
  section: {
    padding: wp("5%"),
  },
  sectionTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: hp("2%"),
  },
  categoryItem: {
    backgroundColor: Colors.quinary,
    padding: wp("4%"),
    borderRadius: wp("3%"),
    marginBottom: hp("1.5%"),
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  categoryTitle: {
    fontSize: wp("4%"),
    fontWeight: "600",
    color: Colors.primary,
  },
  categoryPercentage: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    color: Colors.primary,
  },
  progressBarContainer: {
    height: hp("1.5%"),
    backgroundColor: "#E0E0E0",
    borderRadius: wp("1%"),
    marginBottom: hp("1%"),
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.secondary,
    borderRadius: wp("1%"),
  },
  progressBarComplete: {
    backgroundColor: "#4CAF50",
  },
  categoryDetails: {
    fontSize: wp("3%"),
    color: Colors.secondary,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.quinary,
    padding: wp("4%"),
    borderRadius: wp("3%"),
    marginBottom: hp("1.5%"),
  },
  activityIcon: {
    backgroundColor: Colors.quartery,
    padding: wp("3%"),
    borderRadius: wp("2%"),
  },
  activityInfo: {
    flex: 1,
    marginLeft: wp("3%"),
  },
  activityTitle: {
    fontSize: wp("4%"),
    fontWeight: "600",
    color: Colors.primary,
  },
  activityDate: {
    fontSize: wp("3%"),
    color: Colors.secondary,
    marginTop: hp("0.5%"),
  },
  activityMetrics: {
    alignItems: "flex-end",
  },
  activityScore: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    color: Colors.primary,
  },
  activityDuration: {
    fontSize: wp("3%"),
    color: Colors.secondary,
    marginTop: hp("0.5%"),
  },
  achievementsScroll: {
    flexDirection: "row",
  },
  achievementCard: {
    backgroundColor: Colors.quinary,
    padding: wp("4%"),
    borderRadius: wp("4%"),
    width: wp("40%"),
    marginRight: wp("4%"),
    alignItems: "center",
  },
  achievementTitle: {
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: hp("1%"),
    textAlign: "center",
  },
  achievementDesc: {
    fontSize: wp("3%"),
    color: Colors.secondary,
    textAlign: "center",
    marginTop: hp("0.5%"),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: hp("2%"),
    fontSize: wp("4%"),
    color: Colors.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: wp("5%"),
  },
  errorText: {
    marginTop: hp("2%"),
    fontSize: wp("4%"),
    color: Colors.secondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: hp("3%"),
    backgroundColor: Colors.primary,
    paddingHorizontal: wp("8%"),
    paddingVertical: hp("1.5%"),
    borderRadius: wp("2%"),
  },
  retryText: {
    color: Colors.background,
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  emptyText: {
    marginTop: hp("2%"),
    fontSize: wp("4%"),
    color: Colors.ternary,
  },
  emptyActivities: {
    alignItems: "center",
    padding: wp("10%"),
    backgroundColor: Colors.quinary,
    borderRadius: wp("3%"),
  },
  emptyActivitiesText: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    color: Colors.secondary,
  },
  emptyActivitiesSubtext: {
    fontSize: wp("3.5%"),
    color: Colors.ternary,
    textAlign: "center",
    marginTop: hp("1%"),
  },
})


