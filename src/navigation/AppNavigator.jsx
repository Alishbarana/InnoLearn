import React, { useEffect } from "react"
import { BackHandler, Platform } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
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
// import ARViewerScreen from "../screens/AR/ARViewerScreen"
import SimpleARScreen from "../screens/AR/SimpleARScreen"

const Stack = createStackNavigator()

export default function AppNavigator({ isLoggedIn }) {
  useEffect(() => {
    // Handle back button: exit app from Home
    const backAction = () => {
      // Only exit app if on Home screen
      // (You may want to use navigation state here for more complex flows)
      return false // Let HomeScreen handle it
    }

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    )
    return () => backHandler.remove()
  }, [])

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? "Home" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            {/* Prevent going back to auth screens after login */}
            <Stack.Screen name="Home" component={HomeScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="Progress" component={ProgressScreen} />
            <Stack.Screen name="ContentDetail" component={ContentDetailScreen} />
            {/* <Stack.Screen name="ARViewer" component={ARViewerScreen} /> */}
            <Stack.Screen name="SimpleAR" component={SimpleARScreen} />
            <Stack.Screen name="AIRecognition" component={AIRecognitionScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                gestureEnabled: false, // Disable swipe back
              }}
            />
            <Stack.Screen name="Progress" component={ProgressScreen} />
            <Stack.Screen name="ContentDetail" component={ContentDetailScreen} />
            {/* <Stack.Screen name="ARViewer" component={ARViewerScreen} /> */}
            <Stack.Screen name="SimpleAR" component={SimpleARScreen} />
            <Stack.Screen name="AIRecognition" component={AIRecognitionScreen} />
            {/* Auth screens are not available when logged in */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
