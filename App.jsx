"use client"

import { useState, useRef, useEffect } from "react"
import { View, StyleSheet, Animated, Dimensions, StatusBar } from "react-native"
import { getApp } from "@react-native-firebase/app"
import auth from "@react-native-firebase/auth"
import AppNavigator from "./src/navigation/AppNavigator"
import SplashScreen from "./src/screens/Onboarding/SplashScreen"

const { height } = Dimensions.get("window")

// Get the default app instance
const app = getApp()

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(null)

  const appNamePosition = useRef(new Animated.Value(0)).current
  const splashImageScale = useRef(new Animated.Value(1)).current
  const splashOpacity = useRef(new Animated.Value(1)).current
  const splashTranslateY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Listen for auth state changes using the modular API
    const unsubscribe = auth(app).onAuthStateChanged((user) => {
      console.log("Auth state changed:", !!user) // Debug log
      setIsLoggedIn(!!user)
    })

    return unsubscribe
  }, [])

  const handleSplashComplete = () => {
    Animated.sequence([
      Animated.timing(splashImageScale, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(splashTranslateY, {
          toValue: -height * 0.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setTimeout(() => {
        setShowSplash(false)
        setSplashAnimationComplete(true)
      }, 100)
    })
  }

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      handleSplashComplete()
    }, 2500)

    return () => {
      clearTimeout(splashTimer)
    }
  }, [])

  // Show splash screen while determining auth state or during splash animation
  if (isLoggedIn === null || !splashAnimationComplete) {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        {showSplash && (
          <Animated.View
            style={[
              styles.splashContainer,
              {
                opacity: splashOpacity,
                transform: [{ translateY: splashTranslateY }, { scale: splashImageScale }],
              },
            ]}
          >
            <SplashScreen appNamePosition={appNamePosition} />
          </Animated.View>
        )}
      </View>
    )
  }

  // Once auth state is determined and splash is complete, show the app
  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <AppNavigator isLoggedIn={isLoggedIn} />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
})
