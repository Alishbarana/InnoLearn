import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/Onboarding/SplashScreen';

const { height } = Dimensions.get("window");

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  const appNamePosition = useRef(new Animated.Value(0)).current;
  const splashImageScale = useRef(new Animated.Value(1)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashTranslateY = useRef(new Animated.Value(0)).current;

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
        setShowSplash(false);
        setSplashAnimationComplete(true);
      }, 100);
    });
  };

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      handleSplashComplete();
    }, 2500);

    return () => {
      clearTimeout(splashTimer);
    };
  }, []);

  // Show splash animation first
  if (!splashAnimationComplete) {
    return (
      <View style={styles.container}>
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
    );
  }

  // After splash, show main navigation (which includes WelcomeScreen as a route)
  return <AppNavigator />;
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
});