import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, BackHandler } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen"
import Colors from "../../styles/colors"

// Expanded Topic Content
const topicContent = {
  Arrays: {
    description: "An array is a fundamental data structure that stores multiple elements of the same type in a contiguous memory location, allowing easy and quick access to elements.",
    keyPoints: [
      "Elements are stored in adjacent memory locations",
      "Indexed from 0 to (length - 1)",
      "Allows random access to elements",
      "Fixed size in most programming languages",
      "Can store primitive types and objects"
    ],
    timeComplexity: {
      access: "O(1)",
      search: "O(n)",
      insertion: "O(n)",
      deletion: "O(n)"
    },
    realWorldAnalogy: "Think of an array like a row of lockers in a school, where each locker has a unique number, and you can quickly access any locker directly by its number.",
    useCases: [
      "Storing lists of similar items",
      "Implementing other data structures",
      "Mathematical calculations",
      "Buffering in computer memory"
    ]
  },
  "Linked Lists": {
    description: "A linked list is a linear data structure where elements are stored in nodes, with each node containing data and a reference to the next node in the sequence.",
    keyPoints: [
      "Dynamic size and memory allocation",
      "Elements are not stored in contiguous memory",
      "Easy insertion and deletion of elements",
      "Requires traversal for accessing elements",
      "Can be singly, doubly, or circularly linked"
    ],
    timeComplexity: {
      access: "O(n)",
      search: "O(n)",
      insertion: "O(1)",
      deletion: "O(1)"
    },
    realWorldAnalogy: "Imagine a treasure hunt where each clue points to the location of the next clue. You have to follow the chain to find the treasure.",
    useCases: [
      "Implementing stacks and queues",
      "Music playlists with song connections",
      "Undo functionality in software",
      "Browser history navigation"
    ]
  },
  Stack: {
    description: "A stack is a linear data structure that follows the Last-In-First-Out (LIFO) principle, where the last element added is the first one to be removed.",
    keyPoints: [
      "Elements are added and removed from the same end (top)",
      "Two primary operations: Push (add) and Pop (remove)",
      "Can be implemented using arrays or linked lists",
      "Limited access to elements"
    ],
    timeComplexity: {
      push: "O(1)",
      pop: "O(1)",
      peek: "O(1)"
    },
    realWorldAnalogy: "Think of a stack of plates in a cafeteria. You can only add or remove plates from the top.",
    useCases: [
      "Function call management in programming",
      "Undo mechanisms in text editors",
      "Expression evaluation",
      "Backtracking algorithms"
    ]
  },
  Queue: {
    description: "A queue is a linear data structure that follows the First-In-First-Out (FIFO) principle, where the first element added is the first one to be removed.",
    keyPoints: [
      "Elements are added at the rear and removed from the front",
      "Two primary operations: Enqueue (add) and Dequeue (remove)",
      "Can be implemented using arrays or linked lists",
      "Maintains order of insertion"
    ],
    timeComplexity: {
      enqueue: "O(1)",
      dequeue: "O(1)",
      peek: "O(1)"
    },
    realWorldAnalogy: "Similar to a line of people waiting at a ticket counter. The first person who arrives gets served first.",
    useCases: [
      "Task scheduling in operating systems",
      "Breadth-first search algorithms",
      "Print job management",
      "Handling asynchronous data transfer"
    ]
  },
  "Binary Trees": {
    description: "A binary tree is a hierarchical data structure where each node has at most two children, referred to as the left child and the right child.",
    keyPoints: [
      "Root node at the top of the hierarchy",
      "Each node can have 0, 1, or 2 children",
      "Left subtree and right subtree concept",
      "Used in many search and sorting algorithms"
    ],
    timeComplexity: {
      search: "O(log n) - balanced tree",
      insertion: "O(log n) - balanced tree",
      deletion: "O(log n) - balanced tree"
    },
    realWorldAnalogy: "Like a family tree where each person can have up to two direct descendants.",
    useCases: [
      "Hierarchical data representation",
      "Efficient searching",
      "Expression parsing",
      "Huffman coding"
    ]
  },
  "Merge Sort": {
    description: "Merge sort is an efficient, stable sorting algorithm that uses the divide-and-conquer strategy to sort elements.",
    keyPoints: [
      "Divides the array into two halves recursively",
      "Sorts and merges the sub-arrays",
      "Guaranteed O(n log n) time complexity",
      "Works well for large datasets"
    ],
    timeComplexity: {
      average: "O(n log n)",
      worst: "O(n log n)",
      best: "O(n log n)",
      space: "O(n)"
    },
    realWorldAnalogy: "Like organizing a messy library by splitting books into smaller groups, sorting them, and then combining them back.",
    useCases: [
      "External sorting",
      "Sorting linked lists",
      "Inversion count problems",
      "Database sorting"
    ]
  },
  "OSI Model": {
    description: "The Open Systems Interconnection (OSI) model is a conceptual framework that describes how data communication occurs between devices in a network.",
    keyPoints: [
      "7 layers representing different network functions",
      "Provides a standardized approach to network communication",
      "Each layer has specific protocols and responsibilities",
      "Helps in understanding network communication process"
    ],
    layers: [
      "Application Layer",
      "Presentation Layer",
      "Session Layer",
      "Transport Layer",
      "Network Layer",
      "Data Link Layer",
      "Physical Layer"
    ],
    realWorldAnalogy: "Like a postal system where each department has a specific role in delivering a package.",
    useCases: [
      "Network troubleshooting",
      "Protocol design",
      "Understanding network interactions",
      "Developing network technologies"
    ]
  },
  FireWall: {
    description: "A firewall is a network security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules.",
    keyPoints: [
      "Acts as a barrier between trusted and untrusted networks",
      "Filters traffic based on IP addresses, ports, and protocols",
      "Can be hardware or software-based",
      "Provides protection against unauthorized access"
    ],
    types: [
      "Packet Filtering Firewalls",
      "Stateful Inspection Firewalls",
      "Proxy Firewalls",
      "Next-Generation Firewalls"
    ],
    realWorldAnalogy: "Like a security guard checking and filtering people entering a restricted area.",
    useCases: [
      "Network security",
      "Preventing cyber attacks",
      "Access control",
      "Monitoring network traffic"
    ]
  },
  Router: {
    description: "A router is a networking device that forwards data packets between computer networks, determining the best path for data transmission.",
    keyPoints: [
      "Connects different networks together",
      "Uses routing tables and protocols",
      "Operates at the network layer of OSI model",
      "Assigns IP addresses"
    ],
    functions: [
      "Packet forwarding",
      "Path selection",
      "Network address translation",
      "Security features"
    ],
    realWorldAnalogy: "Like a traffic controller directing vehicles on different roads to their destination.",
    useCases: [
      "Internet connectivity",
      "Home and office networks",
      "Inter-network communication",
      "Load balancing"
    ]
  },
  "Client-Server Model": {
    description: "The client-server model is a distributed computing architecture where tasks are divided between providers of resources (servers) and requesters of resources (clients).",
    keyPoints: [
      "Clients request services or resources",
      "Servers provide and manage resources",
      "Communication through network protocols",
      "Scalable and flexible architecture"
    ],
    components: [
      "Client application",
      "Server application",
      "Network infrastructure"
    ],
    realWorldAnalogy: "Like a restaurant where customers (clients) place orders, and waiters and kitchen staff (servers) prepare and deliver the food.",
    useCases: [
      "Web applications",
      "Email services",
      "Database systems",
      "Cloud computing"
    ]
  }
}

export default function ContentDetailScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const { title, category } = route.params || {}
  const content = topicContent[title] || {
    description: "Content coming soon...",
    keyPoints: [],
    timeComplexity: {},
  }

  // Track time spent on the topic
  const [startTime] = useState(new Date())
  const [hasTrackedInitialView, setHasTrackedInitialView] = useState(false)

  // Function to calculate duration in minutes
  const calculateDuration = () => {
    const endTime = new Date()
    const durationMs = endTime - startTime
    // Convert to minutes and ensure at least 1 minute for very short views
    return Math.max(1, Math.round(durationMs / (1000 * 60)))
  }

  // Track when user views this topic
  useEffect(() => {
    // Handle back button press on Android
    const handleBackPress = () => {
      trackDurationAndNavigateBack()
      return false // Let the default back action proceed
    }

    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress)

    return () => {
      subscription.remove()
      trackDurationAndNavigateBack()
    }
  }, [title, category])

  // Function to track duration and navigate back
  const trackDurationAndNavigateBack = async () => {
    // No-op: Tracking and auth removed as per requirements
  }

  // Additional rendering for extra content
  const renderAdditionalContent = () => {
    // Check for additional properties and render them
    return (
      <>
        {content.realWorldAnalogy && (
          <View style={styles.additionalSection}>
            <Text style={styles.sectionTitle}>Real-World Analogy</Text>
            <Text style={styles.description}>{content.realWorldAnalogy}</Text>
          </View>
        )}

        {content.useCases && (
          <View style={styles.additionalSection}>
            <Text style={styles.sectionTitle}>Use Cases</Text>
            {content.useCases.map((useCase, index) => (
              <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.pointText}>{useCase}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Render additional properties like layers, types, or functions if they exist */}
        {content.layers && (
          <View style={styles.additionalSection}>
            <Text style={styles.sectionTitle}>Layers</Text>
            {content.layers.map((layer, index) => (
              <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.pointText}>{layer}</Text>
              </View>
            ))}
          </View>
        )}
        {content.types && (
          <View style={styles.additionalSection}>
            <Text style={styles.sectionTitle}>Types</Text>
            {content.types.map((type, index) => (
              <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.pointText}>{type}</Text>
              </View>
            ))}
          </View>
        )}
        {content.functions && (
          <View style={styles.additionalSection}>
            <Text style={styles.sectionTitle}>Functions</Text>
            {content.functions.map((func, index) => (
              <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.pointText}>{func}</Text>
              </View>
            ))}
          </View>
        )}
        {content.components && (
          <View style={styles.additionalSection}>
            <Text style={styles.sectionTitle}>Components</Text>
            {content.components.map((comp, index) => (
              <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.pointText}>{comp}</Text>
              </View>
            ))}
          </View>
        )}
      </>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{content.description}</Text>

        <Text style={styles.sectionTitle}>Key Points</Text>
        {content.keyPoints.map((point, index) => (
          <View key={index} style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}

        {Object.keys(content.timeComplexity || {}).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Time Complexity</Text>
            {Object.entries(content.timeComplexity).map(([operation, complexity]) => (
              <View key={operation} style={styles.complexityItem}>
                <Text style={styles.operationText}>{operation}:</Text>
                <Text style={styles.complexityText}>{complexity}</Text>
              </View>
            ))}
          </>
        )}

        {/* Render additional content */}
        {renderAdditionalContent()}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    padding: wp("5%"),
    backgroundColor: Colors.primary,
  },
  category: {
    fontSize: wp("4%"),
    color: "#CEECF5",
    marginBottom: hp("1%"),
  },
  title: {
    fontSize: wp("7%"),
    fontWeight: "bold",
    color: "white",
  },
  content: {
    padding: wp("5%"),
  },
  sectionTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: Colors.secondary,
    marginTop: hp("3%"),
    marginBottom: hp("2%"),
  },
  description: {
    fontSize: wp("4%"),
    color: "#333",
    lineHeight: wp("6%"),
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: hp("1%"),
    paddingRight: wp("5%"),
  },
  bullet: {
    fontSize: wp("4%"),
    marginRight: wp("2%"),
    color: Colors.primary,
  },
  pointText: {
    fontSize: wp("4%"),
    color: "#333",
    flex: 1,
  },
  complexityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hp("1%"),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  operationText: {
    fontSize: wp("4%"),
    color: "#333",
    textTransform: "capitalize",
  },
  complexityText: {
    fontSize: wp("4%"),
    color: Colors.primary,
    fontWeight: "bold",
  },
  additionalSection: {
    marginTop: hp("2%"),
  },
})


