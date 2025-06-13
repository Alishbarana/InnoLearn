import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  StatusBar,
  FlatList,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import * as Animatable from "react-native-animatable";

const { width, height } = Dimensions.get("window");

const EducationalTopics = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTerms, setFilteredTerms] = useState([]);
  
  // Animation values
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const searchBarAnimation = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // Your app colors
  const Colors = {
    primary: '#384959',
    secondary: '#6A89A7',
    ternary: '#88bdf2',
    quartery: '#BDDDFC',
    quinary: "#EFF8FB",
    background: '#ffffff',
    text: '#333333',
    error: '#e74c3c',
    success: '#4CAF50',
    warning: '#FFC107',
  };

  // All 10 terms from your original app
  const allTerms = [
    // Data Structures
    { id: "1", title: "Arrays", category: "dataStructures", icon: "code-array", color: Colors.primary },
    { id: "2", title: "Linked Lists", category: "dataStructures", icon: "link-variant", color: Colors.secondary },
    { id: "3", title: "Stack", category: "dataStructures", icon: "layers-outline", color: Colors.ternary },
    { id: "4", title: "Queue", category: "dataStructures", icon: "format-list-numbered", color: Colors.success },
    { id: "5", title: "Binary Trees", category: "dataStructures", icon: "file-tree", color: Colors.warning },
    { id: "6", title: "Merge Sort", category: "dataStructures", icon: "sort", color: Colors.error },
    
    // Networking
    { id: "7", title: "OSI Model", category: "networking", icon: "layers", color: Colors.primary },
    { id: "8", title: "FireWall", category: "networking", icon: "security", color: Colors.secondary },
    { id: "9", title: "Router", category: "networking", icon: "router-wireless", color: Colors.ternary },
    { id: "10", title: "Client-Server Model", category: "networking", icon: "server-network", color: Colors.success },
  ];

  useEffect(() => {
    // Animate elements on mount
    Animated.stagger(150, [
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(searchBarAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Pulse animation for the scan button
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Filter terms based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTerms([]);
    } else {
      const filtered = allTerms.filter(term =>
        term.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTerms(filtered);
    }
  }, [searchQuery]);

  const categories = [
    { id: "featured", name: "Featured", icon: "star" },
    { id: "dataStructures", name: "Data Structure", icon: "database" },
    { id: "networking", name: "Networking", icon: "lan" },
  ];

  // Featured content for featured tab only
  const getFeaturedContent = () => {
    return [
      {
        id: "ai",
        title: "AI Recognition",
        description: "Advanced OCR for text recognition from images",
        icon: "text-recognition",
        color: Colors.ternary,
        type: "feature"
      },
      {
        id: "ar",
        title: "AR Models",
        description: "3D visualization of computer science concepts",
        icon: "cube-scan",
        color: Colors.secondary,
        type: "feature"
      },
      {
        id: "concepts",
        title: "Interactive Learning",
        description: "Hands-on practice with real examples",
        icon: "book-open-page-variant",
        color: Colors.primary,
        type: "feature"
      },
    ];
  };

  // Get topics based on category for horizontal bars
  const getTopicsForBars = () => {
    if (activeCategory === "dataStructures") {
      return allTerms.filter(term => term.category === "dataStructures");
    } else if (activeCategory === "networking") {
      return allTerms.filter(term => term.category === "networking");
    }
    return [];
  };

  const handleCategoryPress = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleTopicPress = (topic) => {
    if (topic.type === "feature") {
      // Handle feature navigation - only navigate to existing screens
      switch (topic.id) {
        case "ai":
          navigation.navigate("AIRecognition");
          break;
        case "ar":
          // Navigate to existing AR screen or create a placeholder
          navigation.navigate("Progress"); // Using existing screen as placeholder
          break;
        case "concepts":
          // Navigate to existing screen
          navigation.navigate("Progress"); // Using existing screen as placeholder
          break;
      }
    } else {
      // Navigate to topic detail
      navigation.navigate("ContentDetail", { 
        title: topic.title, 
        category: topic.category === "dataStructures" ? "Data Structures" : "Computer Networking"
      });
    }
  };

  const handleSearchTermPress = (term) => {
    navigation.navigate("ContentDetail", { 
      title: term.title, 
      category: term.category === "dataStructures" ? "Data Structures" : "Computer Networking"
    });
  };

  const handleScanPress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate("AIRecognition");
    });
  };

  const renderSearchResults = () => {
    if (searchQuery.trim() === "") return null;
    
    if (filteredTerms.length === 0) {
      return (
        <View style={styles.emptySearchContainer}>
          <MaterialCommunityIcons name="file-search-outline" size={wp(12)} color={Colors.ternary} />
          <Text style={styles.emptySearchText}>No topics found</Text>
          <Text style={styles.emptySearchSubText}>Try searching with different keywords</Text>
        </View>
      );
    }

    return (
      <View style={styles.searchResultsContainer}>
        <Text style={styles.searchResultsTitle}>Search Results ({filteredTerms.length})</Text>
        {filteredTerms.map((term) => (
          <TouchableOpacity
            key={term.id}
            style={styles.searchResultItem}
            onPress={() => handleSearchTermPress(term)}
          >
            <View style={[styles.searchResultIcon, { backgroundColor: term.color }]}>
              <MaterialCommunityIcons name={term.icon} size={wp(5)} color="#fff" />
            </View>
            <View style={styles.searchResultContent}>
              <Text style={styles.searchResultTitle}>{term.title}</Text>
              <Text style={styles.searchResultCategory}>
                {term.category === "dataStructures" ? "Data Structures" : "Networking"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={wp(5)} color={Colors.primary} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render simple horizontal topic bar
  const renderHorizontalTopicBar = (item, index) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.horizontalTopicBar}
        onPress={() => handleTopicPress(item)}
        activeOpacity={0.7}
      >
        <Animatable.View
          animation="fadeInUp"
          delay={index * 100}
          duration={500}
          style={styles.horizontalBarContent}
        >
          <View style={styles.horizontalBarLeft}>
            <View style={[styles.horizontalBarIcon, { backgroundColor: item.color }]}>
              <MaterialCommunityIcons name={item.icon} size={wp(6)} color="#fff" />
            </View>
            <Text style={styles.horizontalBarTitle}>{item.title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={wp(5)} color={Colors.secondary} />
        </Animatable.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header,
          { 
            opacity: headerAnimation,
            transform: [{ translateY: headerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0]
            })}]
          }
        ]}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>U</Text>
              </View>
              <View>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.nameText}>User</Text>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate("Progress")}
              >
                <Ionicons name="stats-chart" size={wp(5.5)} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.replace("Welcome")}
              >
                <Feather name="log-out" size={wp(5)} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Search Bar */}
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            opacity: searchBarAnimation,
            transform: [{ translateY: searchBarAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })}]
          }
        ]}
      >
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={wp(5)} color={Colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search from 10 CS topics..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={wp(5)} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Show search results if searching */}
        {searchQuery.trim() !== "" ? renderSearchResults() : (
          <>
            {/* Categories */}
            <View style={styles.categoriesContainer}>
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScrollContent}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      activeCategory === category.id && styles.activeCategoryButton
                    ]}
                    onPress={() => handleCategoryPress(category.id)}
                  >
                    <MaterialCommunityIcons 
                      name={category.icon} 
                      size={wp(4)} 
                      color={activeCategory === category.id ? "#fff" : Colors.primary}
                      style={{ marginRight: wp(2) }}
                    />
                    <Text 
                      style={[
                        styles.categoryText,
                        activeCategory === category.id && styles.activeCategoryText
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Dynamic Content Based on Category */}
            {activeCategory === "featured" ? (
              <>
                {/* Featured Content - Carousel Style */}
                <View style={styles.contentContainer}>
                  <Text style={styles.sectionTitle}>App Features</Text>
                  
                  <FlatList
                    data={getFeaturedContent()}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={width - wp(15)}
                    decelerationRate="fast"
                    contentContainerStyle={styles.carouselContent}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handleTopicPress(item)}
                      >
                        <Animatable.View
                          animation="fadeInUp"
                          delay={index * 100}
                          duration={500}
                          style={styles.carouselItem}
                        >
                          <LinearGradient
                            colors={[item.color, `${item.color}CC`]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.carouselGradient}
                          >
                            <View style={styles.topicIconContainer}>
                              <MaterialCommunityIcons 
                                name={item.icon} 
                                size={wp(12)} 
                                color="rgba(255,255,255,0.4)" 
                              />
                            </View>
                            
                            <View style={styles.topicContent}>
                              <Text style={styles.topicTitle}>{item.title}</Text>
                              <Text style={styles.topicDescription}>{item.description}</Text>
                            </View>
                            
                            {/* Decorative Elements */}
                            <View style={[styles.decorElement, styles.decorCircle]} />
                            <View style={[styles.decorElement, styles.decorSquare]} />
                          </LinearGradient>
                        </Animatable.View>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                {/* Quick Stats - Only in Featured */}
                <View style={styles.statsContainer}>
                  <View style={[styles.statCard, { backgroundColor: Colors.quinary }]}>
                    <MaterialCommunityIcons name="database" size={wp(8)} color={Colors.primary} />
                    <Text style={[styles.statNumber, { color: Colors.primary }]}>6</Text>
                    <Text style={[styles.statLabel, { color: Colors.secondary }]}>Data Structures</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: Colors.quinary }]}>
                    <MaterialCommunityIcons name="lan" size={wp(8)} color={Colors.secondary} />
                    <Text style={[styles.statNumber, { color: Colors.primary }]}>4</Text>
                    <Text style={[styles.statLabel, { color: Colors.secondary }]}>Networking</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: Colors.quinary }]}>
                    <MaterialCommunityIcons name="robot" size={wp(8)} color={Colors.ternary} />
                    <Text style={[styles.statNumber, { color: Colors.primary }]}>AI</Text>
                    <Text style={[styles.statLabel, { color: Colors.secondary }]}>Powered</Text>
                  </View>
                </View>
              </>
            ) : (
              /* Simple Horizontal Topic Bars for Data Structure and Networking */
              <View style={styles.horizontalBarsContainer}>
                <Text style={styles.sectionTitle}>
                  {activeCategory === "dataStructures" ? "Data Structures" : "Networking"}
                </Text>
                
                {/* Using map instead of FlatList to avoid nesting error */}
                <View style={styles.horizontalBarsContent}>
                  {getTopicsForBars().map((item, index) => renderHorizontalTopicBar(item, index))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      {/* Floating Scan Button */}
      <Animated.View 
        style={[
          styles.scanButtonContainer,
          {
            transform: [{ scale: buttonScale }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScanPress}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.ternary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanGradient}
          >
            <MaterialCommunityIcons name="text-recognition" size={wp(7)} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.scanText}>Scan</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    width: '100%',
    height: hp(25),
  },
  headerGradient: {
    flex: 1,
    borderBottomLeftRadius: wp(8),
    borderBottomRightRadius: wp(8),
  },
  headerContent: {
    flex: 1,
    paddingTop: StatusBar.currentHeight + hp(2),
    paddingHorizontal: wp(5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  avatarText: {
    color: '#fff',
    fontSize: wp(6),
    fontWeight: 'bold',
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: wp(3.5),
  },
  nameText: {
    color: '#fff',
    fontSize: wp(5),
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(3),
  },
  searchContainer: {
    paddingHorizontal: wp(5),
    marginTop: -hp(3),
    zIndex: 10,
  },
  searchInputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: wp(5),
    height: hp(7),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#BDDDFC',
  },
  searchIcon: {
    marginRight: wp(2),
  },
  searchInput: {
    flex: 1,
    fontSize: wp(4),
    color: '#333333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(10),
  },
  categoriesContainer: {
    marginTop: hp(3),
    marginBottom: hp(2),
  },
  categoriesScrollContent: {
    paddingHorizontal: wp(5),
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: wp(8),
    marginRight: wp(3),
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#BDDDFC',
  },
  activeCategoryButton: {
    backgroundColor: '#384959',
  },
  categoryText: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: '#666',
  },
  activeCategoryText: {
    color: '#fff',
  },
  contentContainer: {
    marginTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(5.5),
    fontWeight: 'bold',
    color: '#384959',
    marginBottom: hp(2),
    paddingHorizontal: wp(5),
  },
  carouselContent: {
    paddingLeft: wp(5),
    paddingRight: wp(10),
  },
  carouselItem: {
    width: width - wp(15),
    height: hp(20),
    marginRight: wp(5),
    borderRadius: wp(5),
    overflow: 'hidden',
  },
  carouselGradient: {
    flex: 1,
    padding: wp(4),
    flexDirection: 'row',
  },
  topicIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(20),
  },
  topicContent: {
    flex: 1,
    justifyContent: 'center',
  },
  topicTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: hp(1),
  },
  topicDescription: {
    fontSize: wp(3.5),
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: hp(2),
  },
  decorElement: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorCircle: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    top: -wp(5),
    right: -wp(5),
  },
  decorSquare: {
    width: wp(10),
    height: wp(10),
    transform: [{ rotate: '45deg' }],
    bottom: -wp(5),
    right: wp(5),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: wp(5),
    marginTop: hp(4),
  },
  statCard: {
    borderRadius: wp(4),
    padding: wp(4),
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: wp(25),
    borderWidth: 1,
    borderColor: '#BDDDFC',
  },
  statNumber: {
    fontSize: wp(6),
    fontWeight: 'bold',
    marginTop: hp(1),
  },
  statLabel: {
    fontSize: wp(3),
    marginTop: hp(0.5),
  },
  // Simple Horizontal Topic Bars Styles
  horizontalBarsContainer: {
    marginTop: hp(2),
    paddingHorizontal: wp(5),
  },
  horizontalBarsContent: {
    paddingBottom: hp(5),
  },
  horizontalTopicBar: {
    backgroundColor: '#ffffff',
    borderRadius: wp(4),
    marginBottom: hp(2.5),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: '#BDDDFC',
    width: '100%',
  },
  horizontalBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp(4),
  },
  horizontalBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  horizontalBarIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  horizontalBarTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#384959',
    flex: 1,
  },
  // Search Results Styles
  searchResultsContainer: {
    paddingHorizontal: wp(5),
    marginTop: hp(2),
  },
  searchResultsTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#384959',
    marginBottom: hp(2),
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: hp(2),
    padding: wp(4),
    borderRadius: wp(4),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#BDDDFC',
  },
  searchResultIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: '#384959',
    marginBottom: hp(0.5),
  },
  searchResultCategory: {
    fontSize: wp(3),
    color: '#88bdf2',
    fontWeight: '500',
  },
  emptySearchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(8),
    paddingHorizontal: wp(5),
  },
  emptySearchText: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: '#384959',
    marginTop: hp(2),
  },
  emptySearchSubText: {
    fontSize: wp(3.5),
    color: '#6A89A7',
    marginTop: hp(1),
    textAlign: 'center',
  },
  scanButtonContainer: {
    position: 'absolute',
    bottom: hp(3),
    right: wp(5),
    alignItems: 'center',
  },
  scanButton: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  scanGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    marginTop: hp(1),
    color: '#384959',
    fontWeight: '600',
  },
});

export default EducationalTopics;