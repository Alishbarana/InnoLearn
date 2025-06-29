"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  BackHandler,
  Alert,
  Animated,
  Dimensions,
} from "react-native"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import Ionicons from "react-native-vector-icons/Ionicons"
import LinearGradient from "react-native-linear-gradient"
import { useFocusEffect } from "@react-navigation/native"
import { useUserProgress } from "../../hooks/useUserProgress"

const { width } = Dimensions.get("window")

const ContentDetailScreen = ({ route, navigation }) => {
  const { title, category } = route.params
  const [viewStartTime] = useState(Date.now())
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Progress tracking hook
  const { trackTermVisit } = useUserProgress()

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

  // Professional safe navigation
  const safeGoBack = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        // Navigate to Home within MainApp
        navigation.navigate("Home")
      }
    } catch (navError) {
      console.log("Navigation error:", navError)
      // Last resort - try to navigate to Home
      try {
        navigation.navigate("Home")
      } catch (fallbackError) {
        console.log("Fallback navigation failed:", fallbackError)
        // If all else fails, reset to main stack
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      }
    }
  }

  // Handle back button professionally
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        safeGoBack()
        return true
      }

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress)
      return () => subscription.remove()
    }, [navigation]),
  )

  // Track term visit when component unmounts
  useEffect(() => {
    return () => {
      // Calculate time spent when component unmounts
      const timeSpent = Math.floor((Date.now() - viewStartTime) / 1000)

      // Track the term visit
      if (title && timeSpent > 0 && trackTermVisit) {
        trackTermVisit(title.toLowerCase().replace(/\s+/g, "_"), title, timeSpent).catch((error) => {
          console.log("Progress tracking error (non-critical):", error)
        })
      }
    }
  }, [title, viewStartTime, trackTermVisit])

  useEffect(() => {
    // Animate content on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Content data for different topics (keeping your existing content data)
  const getContentData = () => {
    const contentMap = {
      // Data Structures
      Arrays: {
        definition:
          "An array is a collection of elements stored at contiguous memory locations. It is the simplest data structure where each data element can be accessed directly by only using its index number.",
        keyPoints: [
          "Elements are stored in contiguous memory locations",
          "Fixed size (in most programming languages)",
          "Random access to elements using index",
          "Same data type for all elements",
          "Zero-based indexing in most languages",
        ],
        advantages: [
          "Fast access to elements (O(1) time complexity)",
          "Memory efficient",
          "Simple to understand and implement",
          "Cache friendly due to locality of reference",
        ],
        disadvantages: [
          "Fixed size (cannot be changed during runtime)",
          "Insertion and deletion can be expensive",
          "Memory waste if not fully utilized",
          "No built-in bounds checking in some languages",
        ],
        applications: [
          "Storing data in tabular form",
          "Implementation of other data structures",
          "Mathematical operations on matrices",
          "Database indexing",
          "Image processing",
        ],
        timeComplexity: {
          access: "O(1)",
          search: "O(n)",
          insertion: "O(n)",
          deletion: "O(n)",
        },
      },
      "Linked Lists": {
        definition:
          "A linked list is a linear data structure where elements are stored in nodes, and each node contains data and a reference (or link) to the next node in the sequence.",
        keyPoints: [
          "Dynamic size - can grow or shrink during runtime",
          "Elements (nodes) are not stored in contiguous memory",
          "Each node contains data and a pointer to the next node",
          "Sequential access to elements",
          "No random access to elements",
        ],
        advantages: [
          "Dynamic size allocation",
          "Efficient insertion and deletion at beginning",
          "Memory is allocated as needed",
          "No memory waste",
        ],
        disadvantages: [
          "No random access to elements",
          "Extra memory overhead for storing pointers",
          "Not cache friendly",
          "Sequential access only",
        ],
        applications: [
          "Implementation of stacks and queues",
          "Music playlist management",
          "Browser history",
          "Undo functionality in applications",
          "Memory management in operating systems",
        ],
        timeComplexity: {
          access: "O(n)",
          search: "O(n)",
          insertion: "O(1) at beginning",
          deletion: "O(1) at beginning",
        },
      },
      Stack: {
        definition:
          "A stack is a linear data structure that follows the Last In First Out (LIFO) principle. Elements can only be added or removed from the top of the stack.",
        keyPoints: [
          "LIFO (Last In First Out) principle",
          "Two main operations: push (add) and pop (remove)",
          "Access only to the top element",
          "Can be implemented using arrays or linked lists",
          "No random access to middle elements",
        ],
        advantages: [
          "Simple implementation",
          "Memory efficient",
          "Fast insertion and deletion (O(1))",
          "Automatic memory management",
        ],
        disadvantages: [
          "Limited access (only top element)",
          "No random access",
          "Size limitations in array implementation",
          "Stack overflow possibility",
        ],
        applications: [
          "Function call management",
          "Expression evaluation and syntax parsing",
          "Undo operations in applications",
          "Browser back button functionality",
          "Depth-First Search (DFS) algorithm",
        ],
        timeComplexity: {
          push: "O(1)",
          pop: "O(1)",
          peek: "O(1)",
          search: "O(n)",
        },
      },
      Queue: {
        definition:
          "A queue is a linear data structure that follows the First In First Out (FIFO) principle. Elements are added at the rear and removed from the front.",
        keyPoints: [
          "FIFO (First In First Out) principle",
          "Two main operations: enqueue (add) and dequeue (remove)",
          "Elements added at rear, removed from front",
          "Can be implemented using arrays or linked lists",
          "Circular queue variant for efficient space utilization",
        ],
        advantages: [
          "Fair scheduling (first come, first served)",
          "Efficient for sequential processing",
          "Simple implementation",
          "Predictable behavior",
        ],
        disadvantages: [
          "No random access to elements",
          "Limited access (only front and rear)",
          "Memory waste in array implementation",
          "Size limitations in static implementation",
        ],
        applications: [
          "CPU scheduling in operating systems",
          "Print job management",
          "Breadth-First Search (BFS) algorithm",
          "Handling requests in web servers",
          "Buffer for data streams",
        ],
        timeComplexity: {
          enqueue: "O(1)",
          dequeue: "O(1)",
          front: "O(1)",
          search: "O(n)",
        },
      },
      "Binary Trees": {
        definition:
          "A binary tree is a hierarchical data structure where each node has at most two children, referred to as the left child and right child.",
        keyPoints: [
          "Hierarchical structure with parent-child relationships",
          "Each node has at most two children",
          "Root node at the top, leaf nodes at the bottom",
          "Various traversal methods (inorder, preorder, postorder)",
          "Binary Search Tree (BST) is a special type",
        ],
        advantages: [
          "Efficient searching in BST (O(log n))",
          "Dynamic size",
          "Hierarchical representation",
          "Efficient insertion and deletion in balanced trees",
        ],
        disadvantages: [
          "Can become unbalanced",
          "No constant time access to arbitrary elements",
          "Complex implementation compared to linear structures",
          "Memory overhead for storing pointers",
        ],
        applications: [
          "File system organization",
          "Expression parsing",
          "Database indexing",
          "Huffman coding for data compression",
          "Decision trees in machine learning",
        ],
        timeComplexity: {
          search: "O(log n) average, O(n) worst",
          insertion: "O(log n) average, O(n) worst",
          deletion: "O(log n) average, O(n) worst",
          traversal: "O(n)",
        },
      },
      "Merge Sort": {
        definition:
          "Merge Sort is a divide-and-conquer algorithm that divides the array into two halves, sorts them separately, and then merges them back together.",
        keyPoints: [
          "Divide-and-conquer approach",
          "Stable sorting algorithm",
          "Consistent O(n log n) time complexity",
          "Requires additional space for merging",
          "Recursive implementation",
        ],
        advantages: [
          "Guaranteed O(n log n) time complexity",
          "Stable sorting (maintains relative order)",
          "Predictable performance",
          "Works well for large datasets",
          "Parallelizable",
        ],
        disadvantages: [
          "Requires O(n) extra space",
          "Slower for small datasets",
          "Not in-place sorting",
          "Recursive overhead",
        ],
        applications: [
          "External sorting for large files",
          "Sorting linked lists",
          "Inversion count problems",
          "Stable sorting requirements",
          "Parallel processing environments",
        ],
        timeComplexity: {
          best: "O(n log n)",
          average: "O(n log n)",
          worst: "O(n log n)",
          space: "O(n)",
        },
      },
      // Networking
      "OSI Model": {
        definition:
          "The OSI (Open Systems Interconnection) Model is a conceptual framework that standardizes the functions of a telecommunication or computing system into seven abstraction layers.",
        keyPoints: [
          "Seven layers: Physical, Data Link, Network, Transport, Session, Presentation, Application",
          "Each layer serves the layer above and is served by the layer below",
          "Provides a standard for network communication",
          "Helps in troubleshooting network issues",
          "Vendor-independent framework",
        ],
        advantages: [
          "Standardized approach to networking",
          "Easier troubleshooting and maintenance",
          "Modular design allows for flexibility",
          "Vendor interoperability",
          "Educational framework for understanding networks",
        ],
        disadvantages: [
          "Theoretical model, not always practical",
          "Can be overly complex for simple networks",
          "Not all protocols fit neatly into layers",
          "Performance overhead due to layering",
        ],
        applications: [
          "Network design and architecture",
          "Protocol development",
          "Network troubleshooting",
          "Education and training",
          "Standardization efforts",
        ],
        layers: {
          "Layer 7": "Application - User interface",
          "Layer 6": "Presentation - Data formatting",
          "Layer 5": "Session - Connection management",
          "Layer 4": "Transport - End-to-end delivery",
          "Layer 3": "Network - Routing",
          "Layer 2": "Data Link - Frame delivery",
          "Layer 1": "Physical - Bit transmission",
        },
      },
      FireWall: {
        definition:
          "A firewall is a network security device that monitors and controls incoming and outgoing network traffic based on predetermined security rules.",
        keyPoints: [
          "Acts as a barrier between trusted and untrusted networks",
          "Can be hardware-based, software-based, or both",
          "Uses rules to allow or block traffic",
          "Different types: packet filtering, stateful, application-level",
          "Essential component of network security",
        ],
        advantages: [
          "Prevents unauthorized access",
          "Monitors network traffic",
          "Customizable security rules",
          "Logs security events",
          "Can prevent malware spread",
        ],
        disadvantages: [
          "Can slow down network performance",
          "Requires proper configuration",
          "May block legitimate traffic if misconfigured",
          "Cannot protect against all types of attacks",
          "Maintenance overhead",
        ],
        applications: [
          "Corporate network security",
          "Home network protection",
          "Server protection",
          "Cloud security",
          "IoT device security",
        ],
        types: {
          "Packet Filtering": "Examines packets and allows/blocks based on rules",
          Stateful: "Tracks connection state and context",
          "Application Gateway": "Operates at application layer",
          "Next-Generation": "Combines multiple security functions",
        },
      },
      Router: {
        definition:
          "A router is a networking device that forwards data packets between computer networks. It connects multiple networks and determines the best path for data transmission.",
        keyPoints: [
          "Operates at the Network Layer (Layer 3)",
          "Uses routing tables to determine packet paths",
          "Connects different networks",
          "Performs Network Address Translation (NAT)",
          "Can provide wireless connectivity",
        ],
        advantages: [
          "Connects multiple networks",
          "Intelligent path selection",
          "Network segmentation",
          "Built-in security features",
          "Wireless connectivity options",
        ],
        disadvantages: [
          "More expensive than switches",
          "Complex configuration",
          "Potential bottleneck",
          "Requires regular updates",
          "Power consumption",
        ],
        applications: [
          "Home internet connectivity",
          "Enterprise network infrastructure",
          "Internet service provider networks",
          "Data center networking",
          "Wireless access points",
        ],
        functions: {
          Routing: "Determining best path for packets",
          Switching: "Forwarding packets to correct interface",
          NAT: "Translating private to public IP addresses",
          DHCP: "Assigning IP addresses to devices",
          Firewall: "Basic security filtering",
        },
      },
      "Client-Server Model": {
        definition:
          "The Client-Server Model is a distributed application structure that partitions tasks between providers of a resource (servers) and service requesters (clients).",
        keyPoints: [
          "Clients request services from servers",
          "Servers provide services to multiple clients",
          "Communication over a network",
          "Centralized resource management",
          "Scalable architecture",
        ],
        advantages: [
          "Centralized data management",
          "Resource sharing",
          "Scalability",
          "Security control",
          "Easier maintenance",
        ],
        disadvantages: [
          "Single point of failure",
          "Network dependency",
          "Server overload possibility",
          "Higher infrastructure costs",
          "Complexity in implementation",
        ],
        applications: ["Web applications", "Email systems", "Database management", "File sharing", "Online gaming"],
        types: {
          "Two-tier": "Client directly communicates with server",
          "Three-tier": "Includes presentation, application, and data tiers",
          "N-tier": "Multiple layers for complex applications",
          "Peer-to-peer": "Hybrid model where clients can also be servers",
        },
      },
    }

    return (
      contentMap[title] || {
        definition: "Content not available for this topic.",
        keyPoints: [],
        advantages: [],
        disadvantages: [],
        applications: [],
      }
    )
  }

  const content = getContentData()

  // UPDATED: Navigate to SimpleAR screen with the recognized term for browser-based AR
  const handleARView = () => {
    const termMapping = {
      Arrays: "array",
      "Linked Lists": "linked_list",
      Stack: "stack",
      Queue: "queue",
      "Binary Trees": "binary_tree",
      "Merge Sort": "merge_sort",
      "OSI Model": "osi_model",
      FireWall: "firewall",
      Router: "router",
      "Client-Server Model": "client_server",
    }

    const recognizedTerm = termMapping[title]
    if (recognizedTerm) {
      try {
        navigation.navigate("SimpleAR", { recognizedTerm })
      } catch (navError) {
        console.log("Navigation error:", navError)
        Alert.alert("Navigation Error", "Unable to open AR viewer. Please try again.")
      }
    } else {
      Alert.alert("AR Not Available", "AR view is not available for this topic yet.")
    }
  }

  const renderSection = (sectionTitle, items, icon) => {
    if (!items || items.length === 0) return null

    return (
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name={icon} size={wp(5)} color={Colors.primary} />
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        </View>
        {Array.isArray(items)
          ? items.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))
          : Object.entries(items).map(([key, value], index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>
                  <Text style={styles.boldText}>{key}:</Text> {value}
                </Text>
              </View>
            ))}
      </Animated.View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={safeGoBack}>
            <Ionicons name="arrow-back" size={wp(6)} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{category}</Text>
          </View>

          <TouchableOpacity style={styles.arButton} onPress={handleARView}>
            <MaterialCommunityIcons name="cube-scan" size={wp(6)} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Definition Section */}
        <Animated.View
          style={[
            styles.definitionCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient colors={[Colors.quinary, "#fff"]} style={styles.definitionGradient}>
            <View style={styles.definitionHeader}>
              <MaterialCommunityIcons name="book-open-variant" size={wp(6)} color={Colors.primary} />
              <Text style={styles.definitionTitle}>Definition</Text>
            </View>
            <Text style={styles.definitionText}>{content.definition}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Key Points */}
        {renderSection("Key Points", content.keyPoints, "key-variant")}

        {/* Advantages */}
        {renderSection("Advantages", content.advantages, "thumb-up")}

        {/* Disadvantages */}
        {renderSection("Disadvantages", content.disadvantages, "thumb-down")}

        {/* Applications */}
        {renderSection("Applications", content.applications, "application")}

        {/* Time Complexity (for data structures) */}
        {content.timeComplexity && renderSection("Time Complexity", content.timeComplexity, "clock-fast")}

        {/* Layers (for OSI Model) */}
        {content.layers && renderSection("OSI Layers", content.layers, "layers")}

        {/* Types (for various topics) */}
        {content.types && renderSection("Types", content.types, "format-list-bulleted")}

        {/* Functions (for Router) */}
        {content.functions && renderSection("Functions", content.functions, "cog")}

        {/* Add some bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: StatusBar.currentHeight + hp(2),
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
    fontSize: wp(5.5),
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: wp(3.5),
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: hp(0.5),
  },
  arButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  definitionCard: {
    marginBottom: hp(3),
    borderRadius: wp(4),
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  definitionGradient: {
    padding: wp(5),
  },
  definitionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  definitionTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: "#384959",
    marginLeft: wp(2),
  },
  definitionText: {
    fontSize: wp(4),
    lineHeight: wp(6),
    color: "#333",
    textAlign: "justify",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(2),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: "#BDDDFC",
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#384959",
    marginLeft: wp(2),
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp(1),
  },
  bullet: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
    backgroundColor: "#88bdf2",
    marginTop: hp(0.8),
    marginRight: wp(3),
  },
  listText: {
    flex: 1,
    fontSize: wp(3.8),
    lineHeight: wp(5.5),
    color: "#333",
  },
  boldText: {
    fontWeight: "bold",
    color: "#384959",
  },
  bottomPadding: {
    height: hp(3),
  },
})

export default ContentDetailScreen
