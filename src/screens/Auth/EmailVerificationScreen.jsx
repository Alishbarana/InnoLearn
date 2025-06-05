import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ToastAndroid,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useForm, Controller } from "react-hook-form";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import Video from "react-native-video";
import Colors from "../../styles/colors";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/firebase/config";

const videoSource = require("../../assets/forgetpassword.mp4");

export default function EmailVerificationScreen() {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigation = useNavigation();

  // Create a ref for the email input field
  const emailInputRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setEmailSent(true);
      ToastAndroid.show("Reset email sent!", ToastAndroid.SHORT);
      const verifiedEmail = data.email;
      navigation.navigate("ChangePassword", { email: verifiedEmail, isReset: true });
    } catch (error) {
      let errorMessage = "Failed to send reset email. Please try again.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Try again later.";
      }
      ToastAndroid.show(errorMessage, ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Manually navigate back to login
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Forget Password!</Text>

          <Video
            source={videoSource}
            style={styles.videoLogo}
            resizeMode="contain"
            repeat
            muted
            paused={false}
            onLoad={() => setIsVideoReady(true)}
          />

          <View style={styles.form}>
            <Text style={styles.instructionText}>
              {emailSent ? "Check your email for a password reset link" : "Please Enter Your Email to Reset PASSWORD."}
            </Text>

            {!emailSent ? (
              <>
                <View style={styles.inputWrapper}>
                  <Controller
                    control={control}
                    name="email"
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email format",
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={styles.inputContainer}>
                        <FontAwesome5 name="envelope" size={wp(6)} color="white" style={styles.icon} />
                        <TextInput
                          ref={emailInputRef}
                          style={styles.input}
                          placeholder="Email ID"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          returnKeyType="done"
                          onSubmitEditing={handleSubmit(onSubmit)}
                          placeholderTextColor="grey"
                        />
                      </View>
                    )}
                  />
                  {errors.email && <Text style={styles.errorMessage}>{errors.email.message}</Text>}
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitButtonText}>CONFIRM EMAIL</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleBackToLogin}>
                  <Text style={styles.submitButtonText}>BACK TO LOGIN</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text style={styles.loginLink}>Login here</Text>
              </TouchableOpacity>
            </View>
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
  title: {
    fontSize: wp(8),
    fontWeight: "bold",
    color: Colors.primary,
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
    color: Colors.ternary,
    fontWeight: "bold",
    fontSize: wp(4.5),
    marginBottom: hp(3),
  },
  inputWrapper: {
    marginBottom: hp(3),
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
    width: wp(70),
    paddingHorizontal: wp(3),
    color: "black",
    borderWidth: wp(0.3),
    borderColor: Colors.secondary,
    borderTopRightRadius: wp(3),
    borderBottomRightRadius: wp(3),
  },
  errorMessage: {
    color: "red",
    fontSize: wp(3.5),
    marginTop: hp(1),
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: hp(3),
  },
  submitButton: {
    backgroundColor: Colors.secondary,
    borderRadius: wp(7.5),
    height: hp(8),
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
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
});