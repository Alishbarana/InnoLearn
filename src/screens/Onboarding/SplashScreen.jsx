import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from '../../styles/colors';

export default function SplashScreen({ appNamePosition: externalAppNamePosition }) {
  // Use external appNamePosition if provided, otherwise create a local one
  const localAppNamePosition = useRef(new Animated.Value(20)).current;
  const appNamePosition = externalAppNamePosition || localAppNamePosition;

  // Create animation values
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (appNamePosition && typeof appNamePosition.setValue === 'function') {
      appNamePosition.setValue(20);
    }

    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(imageScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(appNamePosition, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [appNamePosition, imageOpacity, imageScale, textOpacity]);

  return (
    <View style={styles.container}>
      {/* Splash Image with animation */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: imageOpacity,
            transform: [{ scale: imageScale }],
          },
        ]}
      >
        <Image source={require("../../assets/images/splash.png")} style={styles.splashImage} resizeMode="contain" />
      </Animated.View>

      {/* Animated app name and tagline */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: appNamePosition }],
          },
        ]}
      >
        <Text style={styles.appName}>INNOLEARN</Text>
        <Text style={styles.title}>Where Innovation Meets Education!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: wp(80),
    height: hp(30),
    justifyContent: "center",
    alignItems: "center",
  },
  splashImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  textContainer: {
    marginTop: hp(4),
    alignItems: "center",
  },
  appName: {
    fontSize: hp(6),
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
  },
  title: {
    fontSize: hp(2),
    color: Colors.secondary,
    textAlign: "center",
    marginTop: hp(1),
  },
});