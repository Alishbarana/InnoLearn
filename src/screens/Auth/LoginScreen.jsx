import React, { useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ToastAndroid,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useForm, Controller } from "react-hook-form"
import Colors from "../../styles/colors"
import { useNavigation } from "@react-navigation/native"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen"
// import { signInWithEmailAndPassword } from "firebase/auth"
// import { auth } from "../../services/firebase/config"

const LoginScreen = () => {
  const navigation = useNavigation()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  // Create refs for each input field for keyboard navigation
  const emailInputRef = useRef(null)
  const passwordInputRef = useRef(null)

  const onSubmit = async (data) => {
    // Mock login: just navigate to Home
    navigation.replace("Home")
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>{/* Header content is commented out in original code */}</View>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>InnoLearn</Text>

        {/* Form Content */}
        <View style={styles.content}>
          {/* Email Field */}
          <Controller
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email format",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                ref={emailInputRef}
                icon="mail-outline"
                placeholder="Email@gmail.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            )}
            name="email"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

          {/* Password Field */}
          <Controller
            control={control}
            rules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                ref={passwordInputRef}
                icon="lock-closed-outline"
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showPassword}
                toggleVisibility={() => setShowPassword(!showPassword)}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
            name="password"
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate("EmailVerification")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity style={styles.signupButton} onPress={handleSubmit(onSubmit)}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.signupButtonText}>LOGIN</Text>}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signinContainer}>
            <Text style={styles.signinText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.signinLink}>Sign up from here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// Enhanced InputField Component with forwardRef
const InputField = React.forwardRef(
  (
    {
      icon,
      placeholder,
      value,
      onChangeText,
      onBlur,
      secureTextEntry,
      toggleVisibility,
      keyboardType,
      autoCapitalize,
      returnKeyType,
      onSubmitEditing,
      blurOnSubmit,
    },
    ref,
  ) => (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={wp(5)} color="#BDDDFC" style={styles.inputIcon} />
      <TextInput
        ref={ref}
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "sentences"}
        returnKeyType={returnKeyType || "default"}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit}
      />
      {toggleVisibility && (
        <TouchableOpacity onPress={toggleVisibility}>
          <Ionicons name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={wp(5)} color="#8E8E93" />
        </TouchableOpacity>
      )}
    </View>
  ),
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    height: hp(22),
    borderBottomRightRadius: hp(50),
    marginTop: -hp(2),
  },
  header: {
    flexDirection: "column",
    padding: wp(3),
    marginTop: hp(3),
  },
  backButton: {
    width: wp(10),
    height: hp(5),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -wp(6),
  },
  logoText: {
    fontSize: hp(5),
    color: "white",
    marginTop: hp(0.3),
  },
  subtitle: {
    color: "white",
    marginTop: hp(3.5),
    fontSize: hp(3),
  },
  appName: {
    textAlign: "center",
    fontSize: hp(5),
    color: Colors.secondary,
    fontWeight: "bold",
    marginTop: hp(4),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(4),
    marginTop: hp(5),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: wp(6.5),
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    height: hp(8),
  },
  inputIcon: {
    marginRight: wp(3),
  },
  input: {
    flex: 1,
    fontSize: hp(2.3),
    color: "#000000",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: hp(3),
  },
  forgotPasswordText: {
    fontSize: hp(2),
    color: Colors.ternary,
  },
  signupButton: {
    backgroundColor: Colors.secondary,
    borderRadius: wp(7.5),
    height: hp(8),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(3),
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: hp(2.5),
    fontWeight: "bold",
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signinText: {
    fontSize: hp(2),
    color: "#666666",
  },
  signinLink: {
    fontSize: hp(2),
    color: Colors.ternary,
  },
  errorText: {
    color: "red",
    fontSize: hp(2),
    marginBottom: hp(1),
  },
})

export default LoginScreen