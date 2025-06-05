import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import Video from "react-native-video";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Colors from "../../styles/colors";
import { auth } from "../../services/firebase/config";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

const videoSource = require("../../assets/securepassword.mp4");

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email: verifiedEmail, isReset } = route.params || {};
  const isResetFlow = isReset === true || isReset === "true";

  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Create refs for input fields
  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isResetFlow && verifiedEmail) {
        // User will reset via email link, just go to login
        navigation.replace("Login");
      } else {
        const user = auth.currentUser;
        if (!user) throw new Error("User not logged in");
        if (user.email) {
          const credential = EmailAuthProvider.credential(
            user.email,
            data.currentPassword
          );
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, data.newPassword);
          ToastAndroid.show("Password updated successfully!", ToastAndroid.SHORT);
          navigation.replace("Home");
        } else {
          throw new Error("User email not available");
        }
      }
    } catch (error) {
      let errorMessage = "Failed to update password. Please try again.";
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "New password is too weak.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log in again before changing your password.";
      }
      ToastAndroid.show(errorMessage, ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  const PasswordVisibilityToggle = ({ isVisible, toggleVisibility }) => (
    <TouchableOpacity onPress={toggleVisibility} style={styles.visibilityIcon}>
      <Ionicons
        name={isVisible ? "eye-outline" : "eye-off-outline"}
        size={wp(5)}
        color="#8E8E93"
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.headerText}>
            {isResetFlow ? "RESET PASSWORD" : "CHANGE PASSWORD"}
          </Text>

          {/* Video at the top */}
          <Video
            source={videoSource}
            style={styles.videoLogo}
            resizeMode="contain"
            repeat
            muted
            paused={false}
            ignoreSilentSwitch="obey"
          />

          <View style={styles.form}>
            {isResetFlow ? (
              <>
                <Text style={styles.instructionText}>
                  A password reset email has been sent to {verifiedEmail}. Please check your inbox and follow the link
                  to reset your password.
                </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => navigation.replace("Login")}
                  >
                    <Text style={styles.resetButtonText}>BACK TO LOGIN</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.instructionText}>
                  Enter your current password and new password below.
                </Text>

                {/* Current Password Field */}
                <View style={styles.inputWrapper}>
                  <Controller
                    control={control}
                    name="currentPassword"
                    rules={{
                      required: "Current password is required",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={styles.inputContainer}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={wp(5)}
                          color="white"
                          style={styles.icon}
                        />
                        <TextInput
                          ref={currentPasswordRef}
                          style={styles.input}
                          placeholder="Current Password"
                          secureTextEntry={!showCurrentPassword}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          returnKeyType="next"
                          onSubmitEditing={() => newPasswordRef.current?.focus()}
                        />
                        <PasswordVisibilityToggle
                          isVisible={showCurrentPassword}
                          toggleVisibility={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        />
                      </View>
                    )}
                  />
                  {errors.currentPassword && (
                    <Text style={styles.errorText}>
                      {errors.currentPassword.message}
                    </Text>
                  )}
                </View>

                {/* New Password Field */}
                <View style={styles.inputWrapper}>
                  <Controller
                    control={control}
                    name="newPassword"
                    rules={{
                      required: "New password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters long",
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={styles.inputContainer}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={wp(5)}
                          color="white"
                          style={styles.icon}
                        />
                        <TextInput
                          ref={newPasswordRef}
                          style={styles.input}
                          placeholder="New Password"
                          secureTextEntry={!showNewPassword}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          returnKeyType="next"
                          onSubmitEditing={() =>
                            confirmPasswordRef.current?.focus()
                          }
                        />
                        <PasswordVisibilityToggle
                          isVisible={showNewPassword}
                          toggleVisibility={() =>
                            setShowNewPassword(!showNewPassword)
                          }
                        />
                      </View>
                    )}
                  />
                  {errors.newPassword && (
                    <Text style={styles.errorText}>
                      {errors.newPassword.message}
                    </Text>
                  )}
                </View>

                {/* Confirm Password Field */}
                <View style={styles.inputWrapper}>
                  <Controller
                    control={control}
                    name="confirmPassword"
                    rules={{
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === getValues("newPassword") ||
                        "Passwords do not match",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={styles.inputContainer}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={wp(5)}
                          color="white"
                          style={styles.icon}
                        />
                        <TextInput
                          ref={confirmPasswordRef}
                          style={styles.input}
                          placeholder="Confirm Password"
                          secureTextEntry={!showConfirmPassword}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          returnKeyType="done"
                          onSubmitEditing={handleSubmit(onSubmit)}
                        />
                        <PasswordVisibilityToggle
                          isVisible={showConfirmPassword}
                          toggleVisibility={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        />
                      </View>
                    )}
                  />
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword.message}
                    </Text>
                  )}
                </View>

                {/* Reset Password Button */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.resetButtonText}>
                        UPDATE PASSWORD
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(5),
  },
  headerText: {
    fontSize: wp(7),
    color: Colors.primary,
    fontWeight: "bold",
    marginBottom: hp(1),
  },
  videoLogo: {
    width: wp(90),
    height: hp(35),
    resizeMode: "contain",
  },
  form: {
    width: wp(90),
    backgroundColor: "white",
    padding: wp(5),
    borderRadius: wp(7),
    elevation: 5,
    shadowRadius: 10,
    borderColor: Colors.secondary,
    borderWidth: wp(0.2),
  },
  instructionText: {
    textAlign: "center",
    color: Colors.secondary,
    fontWeight: "bold",
    fontSize: wp(4),
    marginBottom: hp(3),
  },
  inputWrapper: {
    marginBottom: hp(2),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: wp(12),
    height: hp(7),
    padding: wp(3),
    backgroundColor: Colors.secondary,
    borderTopLeftRadius: wp(3),
    borderBottomLeftRadius: wp(3),
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: hp(7),
    width: wp(58), // Reduced to make room for the visibility toggle
    paddingHorizontal: wp(3),
    color: "black",
    borderWidth: wp(0.3),
    borderColor: Colors.secondary,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  visibilityIcon: {
    height: hp(7),
    width: wp(12),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderWidth: wp(0.3),
    borderLeftWidth: 0,
    borderColor: Colors.secondary,
    borderTopRightRadius: wp(3),
    borderBottomRightRadius: wp(3),
  },
  errorText: {
    color: "red",
    fontSize: wp(3.5),
    marginTop: hp(1),
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: hp(3),
    marginBottom: hp(3),
  },
  resetButton: {
    backgroundColor: Colors.secondary,
    borderRadius: wp(7.5),
    height: hp(7),
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: hp(2.5),
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: hp(2),
    color: "#666666",
  },
  loginLink: {
    fontSize: hp(2),
    color: Colors.ternary,
  },
})