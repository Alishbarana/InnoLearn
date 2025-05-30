import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
} from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from '../../styles/colors'; // Adjusted path for colors
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  // Shared values for animations
  const hexagonScale = useSharedValue(1); // Hexagon scale animation
  const buttonScale = useSharedValue(1); // Button scale animation
  const illustrationOpacity = useSharedValue(0); // Illustration fade-in animation

  const navigation = useNavigation();

  // Hexagon animation style
  const hexagonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: hexagonScale.value }],
  }));

  // Button animation style
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Illustration fade-in animation style
  const illustrationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: illustrationOpacity.value,
  }));

  // Trigger animations on mount
  useEffect(() => {
    // Fade in the illustration
    illustrationOpacity.value = withTiming(1, { duration: 1000 });

    // Animate the hexagon (continuous hover effect)
    hexagonScale.value = withRepeat(
      withSpring(1.1, { damping: 10, stiffness: 100 }),
      -1, // Infinite repetition
      true // Reverse direction
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>InnoLearn</Text>
        </View>
      </View>

      {/* Main Illustration */}
      {/* <Animated.View style={[styles.illustrationContainer, illustrationAnimatedStyle]}> */}
      <Image
        source={require('../../assets/images/welcome1.png')}
        style={styles.illustration}
        resizeMode="contain"
      />
      {/* </Animated.View> */}
      <View style={styles.content}>
        <Text style={styles.title}>Innovate & Elevate</Text>
        <Text style={styles.subtitle}>
          Unlock your potential with cutting-edge
        </Text>
        <Text style={styles.subtitle}>
          tech skills.🚀
        </Text>
      </View>
      {/* Decorative Hexagon */}
      <Animated.View style={[styles.hexagon, hexagonAnimatedStyle]} />

      {/* Join Button */}
      <TouchableOpacity
        onPressIn={() => {
          buttonScale.value = withSpring(1.1); // Scale up on press
        }}
        onPressOut={() => {
          buttonScale.value = withSpring(1); // Scale back on release
        }}
        onPress={() => navigation.navigate('Login')}
      >
        <Animated.View style={[styles.button, buttonAnimatedStyle]}>
          <Text style={styles.buttonText}>Join</Text>
        </Animated.View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Styles (unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(4), // 4% of screen width
    borderRadius: wp(5), // 5% of screen width
  },
  card: {
    marginTop: hp(2), // 2% of screen height
    borderRadius: wp(5), // 5% of screen width
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1), // 1% of screen width
    marginBottom: hp(3), // 3% of screen height
    textAlign: "center",
    justifyContent: "center"
  },
  logoText: {
    fontSize: hp(4), // 2.5% of screen height
    fontWeight: 'bold',
    color: Colors.ternary,
    marginTop: hp(2)
  },
  content: {
    marginTop: hp(7), // 4% of screen height
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: hp(3), // 3% of screen height
    fontWeight: '700',
    marginBottom: hp(2), // 2% of screen height
    color: Colors.primary,
  },
  subtitle: {
    fontSize: hp(2), // 2% of screen height
    color: Colors.secondary,
  },
  hexagon: {
    position: "absolute",
    top: hp(15), // 15% of screen height
    right: wp(1), // 6% of screen width
    width: wp(80), // 20% of screen width
    height: wp(13), // 20% of screen width (square aspect ratio)
    backgroundColor: Colors.secondary,
    transform: [{ rotate: '45deg' }],
    borderRadius: wp(4), // 4% of screen width
    shadowOpacity: 0.1,
    shadowRadius: wp(7), // 1% of screen width
    elevation: 4,
    marginRight: wp(9), // 50% of screen width
    marginTop: hp(75), // 10% of screen height
  },
  illustrationContainer: {
    aspectRatio: 1, // Maintain a square aspect ratio
    marginTop: -hp(20), // 4% of screen height
  },
  illustration: {
    width: '100%', // Full width of the container
    height: '55%', // Full height of the container
    // marginTop: hp(1), // 10% of screen height
    resizeMode: 'contain',
  },
  button: {
    marginTop: hp(5.5), // 5% of screen height
    marginLeft: wp(40), // 10% of screen width
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: hp(3), // 2.5% of screen height
  },
});
