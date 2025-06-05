import React, { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../services/firebase/config"
import SplashScreen from "../screens/Onboarding/SplashScreen"
import WelcomeScreen from "../screens/Onboarding/WelcomeScreen"
import LoginScreen from "../screens/Auth/LoginScreen"
import SignupScreen from "../screens/Auth/SignupScreen"
import EmailVerificationScreen from "../screens/Auth/EmailVerificationScreen"
import ChangePasswordScreen from "../screens/Auth/ChangePasswordScreen"
import HomeScreen from "../screens/Main/HomeScreen"
import ProgressScreen from "../screens/Main/ProgressScreen"
import ContentDetailScreen from "../screens/Main/ContentDetailScreen"
import AIRecognitionScreen from "../screens/AI/AIRecognitionScreen"
import ARViewerScreen from "../screens/AR/ARViewerScreen"
import SimpleARScreen from "../screens/AR/SimpleARScreen"

const Stack = createStackNavigator()

export default function AppNavigator() {
  const [initializing, setInitializing] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (initializing) setInitializing(false)
    })
    return unsubscribe
  }, [])

  if (initializing) return null // Or a splash/loading screen

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Progress" component={ProgressScreen} />
            <Stack.Screen name="ContentDetail" component={ContentDetailScreen} />
            <Stack.Screen name="ARViewer" component={ARViewerScreen} />
            <Stack.Screen name="SimpleAR" component={SimpleARScreen} />
            <Stack.Screen name="AIRecognition" component={AIRecognitionScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
