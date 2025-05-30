import { useState, useEffect, useRef } from "react"
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  Platform,
  Alert,
  Animated,
} from "react-native"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import Feather from "react-native-vector-icons/Feather"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"
import LinearGradient from "react-native-linear-gradient"
import Colors from "../../styles/colors"


const EducationalTopics = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [fadeAnim] = useState(new Animated.Value(0))
  const navigation = useNavigation()

  // Animate content on load
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [])

  const dsTopics = [
    {
      id: "1",
      title: "Arrays",
      description: "Fundamental data structure for storing collections of items",
      difficulty: "Beginner",
      color: "#4285F4", // Blue
    },
    {
      id: "2",
      title: "Linked Lists",
      description: "Linear collection of elements pointing to the next element",
      difficulty: "Intermediate",
      color: "#EA4335", // Red
    },
    {
      id: "3",
      title: "Stack",
      description: "LIFO (Last In First Out) data structure",
      difficulty: "Beginner",
      color: "#FBBC05", // Yellow
    },
    {
      id: "4",
      title: "Queue",
      description: "FIFO (First In First Out) data structure",
      difficulty: "Beginner",
      color: "#34A853", // Green
    },
    {
      id: "5",
      title: "Binary Trees",
      description: "Hierarchical data structure with parent and child nodes",
      difficulty: "Advanced",
      color: "#8E44AD", // Purple
    },
    {
      id: "6",
      title: "Merge Sort",
      description: "Divide and conquer algorithm for sorting arrays",
      difficulty: "Advanced",
      color: "#F39C12", // Orange
    },
  ]

  const networkingTopics = [
    {
      id: "1",
      title: "OSI Model",
      description: "Reference model for how applications can communicate over a network",
      difficulty: "Advanced", 
      color: "#3498DB", // Blue
    },
    {
      id: "2",
      title: "FireWall",
      description: "Security system that monitors and controls incoming and outgoing network traffic",
      difficulty: "Intermediate",
      color: "#2ECC71", // Green
    },
    {
      id: "3",
      title: "Router",
      description: "Device that forwards data packets between computer networks",
      difficulty: "Beginner",
      color: "#E74C3C", // Red
    },
    {
      id: "4",
      title: "Client-Server Model",
      description: "Model for communication between two computers",
      difficulty: "Beginner",
      color: "#9B59B6", // Purple
    },
  ]

  const handleSearch = (text) => {
    setLoading(true)
    setSearchQuery(text)
    setTimeout(() => setLoading(false), 500)
  }

  const handleTopicPress = (topic, category) => {
    navigation.navigate("ContentDetail", { title: topic.title, category })
  }

  const filterTopics = (topics) => {
    return topics.filter((topic) => topic.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const handleProgressPress = () => {
    navigation.navigate("Progress")
  }

  // Add Firebase signOut function with manual navigation
  const handleSignOut = async () => {
    navigation.replace("Welcome")
  }

  const renderTopicCard = ({ item, category, index }) => {
    return <TopicCard item={item} category={category} index={index} onPress={() => handleTopicPress(item, category)} />
  }

  const filteredDsTopics = filterTopics(dsTopics)
  const filteredNetworkingTopics = filterTopics(networkingTopics)

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons name="file-search-outline" size={wp(15)} color={Colors.ternary} />
      <Text style={styles.emptyStateText}>No topics found matching "{searchQuery}"</Text>
      <Text style={styles.emptyStateSubText}>Try searching with different keywords</Text>
    </View>
  )

  const TopicCard = ({ item, category, index, onPress }) => {
    // Animated values for interactive effects
    const scaleAnim = useRef(new Animated.Value(1)).current
    const rotateAnim = useRef(new Animated.Value(0)).current

    // Determine difficulty badge color
    let difficultyColor = "#4CAF50" // Green for Beginner
    if (item.difficulty === "Intermediate") difficultyColor = "#FF9800" // Orange
    if (item.difficulty === "Advanced") difficultyColor = "#F44336" // Red

    // Handle press animation
    const handlePressIn = () => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }

    const handlePressOut = () => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }

    // Calculate rotation for 3D effect
    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "2deg"],
    })

    return (
      <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View
          style={[
            styles.topicCard,
            {
              transform: [{ scale: scaleAnim }, { rotateY: rotate }],
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            {/* Decorative elements instead of icons */}
            <View style={styles.cardDecoration}>
              <View style={[styles.decorationCircle, { backgroundColor: item.color, opacity: 0.8 }]} />
              <View style={[styles.decorationSquare, { backgroundColor: item.color, opacity: 0.6 }]} />
            </View>

            <View style={styles.cardContent}>
              {/* Difficulty indicator */}
              <View style={[styles.difficultyIndicator, { backgroundColor: difficultyColor }]}>
                <Text style={styles.difficultyText}>{item.difficulty}</Text>
              </View>

              {/* Title with first letter highlighted */}
              <View style={styles.titleContainer}>
                <Text style={styles.cardTitleFirstLetter}>{item.title.charAt(0)}</Text>
                <Text style={styles.cardTitleRest}>{item.title.slice(1)}</Text>
              </View>

              {/* Description */}
              <Text style={styles.cardDescription}>{item.description}</Text>

              {/* Interactive element */}
              <View style={styles.cardFooter}>
                <Text style={styles.startLearningText}>Start Learning</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with gradient background */}
      <View style={styles.headerContainer}>
        {/* Status bar background */}
        <View style={styles.statusBarBg} />

        {/* Main header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>U</Text>
            </View>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Hello,</Text>
              <Text style={styles.nameText} numberOfLines={1}>
                User
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={handleProgressPress} activeOpacity={0.7}>
              <Ionicons name="stats-chart" size={wp(5.5)} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleSignOut} activeOpacity={0.7}>
              <Feather name="log-out" size={wp(5)} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured card */}
        <View style={styles.featuredCardContainer}>
          <LinearGradient
            colors={[Colors.secondary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.featuredCard}
          >
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>Computer Science Explorer</Text>
              <Text style={styles.featuredSubtitle}>Discover and master key concepts</Text>
              <View style={styles.featuredStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>10</Text>
                  <Text style={styles.statLabel}>Topics</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>2</Text>
                  <Text style={styles.statLabel}>Categories</Text>
                </View>
              </View>
            </View>
            <View style={styles.featuredIconContainer}>
              <MaterialCommunityIcons name="code-braces" size={wp(12)} color="rgba(255,255,255,0.2)" />
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Search and Progress Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={wp(5)} color={Colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
          {loading && <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />}
        </View>
      </View>

      {/* Content */}
      <Animated.View style={{ opacity: fadeAnim }}>
        {searchQuery && filteredDsTopics.length === 0 && filteredNetworkingTopics.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Data Structures Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Data Structures</Text>
                <MaterialCommunityIcons name="database" size={wp(6)} color={Colors.primary} />
              </View>

              <FlatList
                data={filteredDsTopics}
                renderItem={({ item, index }) => renderTopicCard({ item, category: "Data Structures", index })}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                snapToInterval={wp(75) + wp(4)}
                decelerationRate="fast"
                snapToAlignment="start"
              />
            </View>

            {/* Computer Networking Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Computer Networking</Text>
                <MaterialCommunityIcons name="lan" size={wp(6)} color={Colors.primary} />
              </View>

              <FlatList
                data={filteredNetworkingTopics}
                renderItem={({ item, index }) => renderTopicCard({ item, category: "Computer Networking", index })}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                snapToInterval={wp(75) + wp(4)}
                decelerationRate="fast"
                snapToAlignment="start"
              />
            </View>
          </>
        )}

        {/* Visual Recognition Button */}
        <TouchableOpacity style={styles.aiButton} onPress={() => navigation.navigate("AIRecognition")} activeOpacity={0.8}>
          <LinearGradient
            colors={[Colors.secondary, Colors.ternary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiButtonGradient}
          >
            <View style={styles.aiButtonContent}>
              <MaterialCommunityIcons name="cube-scan" size={wp(8)} color="white" />
              <View style={styles.aiButtonTextContainer}>
                <Text style={styles.aiButtonTitle}>Visual Recognition</Text>
                <Text style={styles.aiButtonSubtitle}>Scan Images to learn more</Text>
              </View>
              <Ionicons name="chevron-forward" size={wp(6)} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    backgroundColor: "#fff",
    paddingBottom: hp(2),
  },
  statusBarBg: {
    height: hp(4),
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatarText: {
    color: "#fff",
    fontSize: wp(5),
    fontWeight: "bold",
  },
  welcomeContainer: {
    marginLeft: wp(3),
  },
  welcomeText: {
    fontSize: wp(3.5),
    color: Colors.ternary,
  },
  nameText: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: Colors.primary,
    maxWidth: wp(40),
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: Colors.quartery,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp(2),
  },
  featuredCardContainer: {
    paddingHorizontal: wp(5),
    marginTop: hp(1),
    marginBottom: hp(3),
  },
  featuredCard: {
    borderRadius: wp(4),
    padding: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: "#FFF",
  },
  featuredSubtitle: {
    fontSize: wp(3.5),
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: hp(0.5),
    marginBottom: hp(1.5),
  },
  featuredIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  featuredStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#FFF",
  },
  statLabel: {
    fontSize: wp(3),
    color: "rgba(255, 255, 255, 0.8)",
  },
  statDivider: {
    height: hp(3),
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: wp(4),
  },
  searchWrapper: {
    paddingHorizontal: wp(5),
    marginBottom: hp(3),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    height: hp(6),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sectionContainer: {
    marginBottom: hp(3),
    paddingHorizontal: wp(5),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: wp(5.5),
    fontWeight: "bold",
    color: Colors.primary,
  },
  flatListContent: {
    paddingRight: wp(5),
  },
  topicCard: {
    width: wp(75),
    height: hp(22),
    marginRight: wp(4),
    borderRadius: wp(4),
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardGradient: {
    flex: 1,
    padding: wp(4),
  },
  cardDecoration: {
    position: "absolute",
    top: -wp(5),
    right: -wp(5),
    width: wp(30),
    height: wp(30),
    zIndex: 0,
  },
  decorationCircle: {
    position: "absolute",
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    top: wp(10),
    right: wp(10),
  },
  decorationSquare: {
    position: "absolute",
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2),
    transform: [{ rotate: "45deg" }],
    top: wp(5),
    right: wp(5),
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    zIndex: 1,
  },
  difficultyIndicator: {
    alignSelf: "flex-start",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(10),
  },
  difficultyText: {
    color: "#FFF",
    fontSize: wp(3),
    fontWeight: "600",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: hp(1),
  },
  cardTitleFirstLetter: {
    fontSize: wp(8),
    fontWeight: "bold",
    color: "#FFF",
  },
  cardTitleRest: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: wp(1),
  },
  cardDescription: {
    fontSize: wp(3.5),
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: hp(0.5),
    marginBottom: hp(1),
  },
  cardFooter: {
    marginTop: hp(1),
  },
  progressBar: {
    height: hp(0.8),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: wp(1),
    marginBottom: hp(1),
  },
  progressIndicator: {
    width: "30%", // Simulating progress
    height: "100%",
    backgroundColor: "#FFF",
    borderRadius: wp(1),
  },
  startLearningText: {
    color: "#FFF",
    fontSize: wp(3.5),
    fontWeight: "600",
  },
  aiButton: {
    marginHorizontal: wp(5),
    marginVertical: hp(3),
    borderRadius: wp(4),
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  aiButtonGradient: {
    padding: wp(4),
  },
  aiButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  aiButtonTextContainer: {
    flex: 1,
    marginLeft: wp(3),
  },
  aiButtonTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: "#FFF",
  },
  aiButtonSubtitle: {
    fontSize: wp(3.5),
    color: "rgba(255, 255, 255, 0.9)",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: wp(10),
    marginTop: hp(5),
  },
  emptyStateText: {
    fontSize: wp(4.5),
    color: Colors.secondary,
    textAlign: "center",
    marginTop: hp(2),
    fontWeight: "600",
  },
  emptyStateSubText: {
    fontSize: wp(3.5),
    color: Colors.ternary,
    textAlign: "center",
    marginTop: hp(1),
  },
})

export default EducationalTopics


