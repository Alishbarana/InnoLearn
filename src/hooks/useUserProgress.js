import { useState, useEffect } from "react"
// import {
//   collection,
//   doc,
//   getDoc,
//   setDoc,
//   updateDoc,
//   Timestamp,
//   query,
//   where,
//   getDocs,
//   orderBy,
//   limit,
// } from "firebase/firestore"
// import { auth, db } from "../services/firebase/config" // <-- updated path

// Define all available categories and their topics
const CATEGORIES = {
  "Data Structures": ["Arrays", "Linked Lists", "Stack", "Queue", "Binary Trees", "Merge Sort"],
  "Computer Networking": ["OSI Model", "FireWall", "Router", "Client-Server Model"],
  // Add other categories as needed
}

export const useUserProgress = () => {
  // Mock progress data
  return {
    progress: {
      completedTopics: 3,
      streak: 2,
      averageScore: 90,
      totalStudyTime: 45,
      categoryCompletion: {
        "Data Structures": { completed: 2, total: 6, percentage: 33, isComplete: false },
        "Computer Networking": { completed: 1, total: 4, percentage: 25, isComplete: false },
      },
      recentActivities: [],
      achievements: [],
    },
    loading: false,
    error: null,
  }
}

// Function to track when a user views a topic
export const trackTopicView = async () => {
  // No-op for mock
  return true
}

// Helper function to get icon for category
const getIconForCategory = (category) => {
  const icons = {
    "Data Structures": "database",
    Algorithms: "code",
    Programming: "laptop-code",
    "Web Development": "globe",
    "Mobile Development": "mobile-alt",
    "Computer Networking": "network-wired",
  }

  return icons[category] || "book-open-variant"
}