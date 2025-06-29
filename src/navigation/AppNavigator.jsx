"use client"

import { useEffect } from "react"
import { BackHandler } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import WelcomeScreen from "../screens/Onboarding/WelcomeScreen"
import LoginScreen from "../screens/Auth/LoginScreen"
import SignupScreen from "../screens/Auth/SignupScreen"
import EmailVerificationScreen from "../screens/Auth/EmailVerificationScreen"
import ChangePasswordScreen from "../screens/Auth/ChangePasswordScreen"

// Main App Screens
import HomeScreen from "../screens/Main/HomeScreen"
import ProgressScreen from "../screens/Main/ProgressScreen"
import ContentDetailScreen from "../screens/Main/ContentDetailScreen"
import AIRecognitionScreen from "../screens/AI/AIRecognitionScreen"
import SimpleARScreen from "../screens/AR/SimpleARScreen"

const AuthStack = createStackNavigator()
const MainStack = createStackNavigator()
const RootStack = createStackNavigator()

// Auth Stack - Only authentication related screens
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true, // Allow swipe back in auth flow
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <AuthStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </AuthStack.Navigator>
  )
}

// Main Stack - Only main app screens
function MainNavigator() {
  return (
    <MainStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true, // Allow swipe back in main app
      }}
    >
      <MainStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          gestureEnabled: false, // Disable swipe back on Home (professional behavior)
        }}
      />
      <MainStack.Screen name="Progress" component={ProgressScreen} />
      <MainStack.Screen name="ContentDetail" component={ContentDetailScreen} />
      <MainStack.Screen name="AIRecognition" component={AIRecognitionScreen} />
      <MainStack.Screen name="SimpleAR" component={SimpleARScreen} />
    </MainStack.Navigator>
  )
}

// Root Navigator - Switches between Auth and Main
export default function AppNavigator({ isLoggedIn }) {
  useEffect(() => {
    // Professional back button handling
    const backAction = () => {
      // Let individual screens handle their own back button logic
      return false
    }

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
    return () => backHandler.remove()
  }, [])

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          gestureEnabled: false, // Disable gesture on root level
        }}
      >
        {isLoggedIn ? (
          // User is logged in - show main app
          <RootStack.Screen
            name="MainApp"
            component={MainNavigator}
            options={{
              animationTypeForReplace: isLoggedIn ? "push" : "pop",
            }}
          />
        ) : (
          // User is not logged in - show auth flow
          <RootStack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              animationTypeForReplace: isLoggedIn ? "push" : "pop",
            }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
