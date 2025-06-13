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
// import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
// import { auth } from "../../services/firebase/config"

const SignupScreen = () => {
  const navigation = useNavigation()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = React.useState(false)
  const [acceptTerms, setAcceptTerms] = React.useState(false)

  // Create refs for each input field for keyboard navigation
  const nameInputRef = useRef(null)
  const emailInputRef = useRef(null)
  const passwordInputRef = useRef(null)
  const repeatPasswordInputRef = useRef(null)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      // await updateProfile(userCredential.user, { displayName: data.name })
      // navigation.replace("Home")
      ToastAndroid.show("Firebase disabled: Signup not performed.", ToastAndroid.SHORT)
    } catch (error) {
      let errorMessage = "Signup failed. Please try again."
      // if (error.code === "auth/email-already-in-use") {
      //   errorMessage = "Email already in use."
      // } else if (error.code === "auth/invalid-email") {
      //   errorMessage = "Invalid email format."
      // } else if (error.code === "auth/weak-password") {
      //   errorMessage = "Password is too weak."
      // }
      ToastAndroid.show(errorMessage, ToastAndroid.LONG)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View style={{ flexDirection: "row", marginLeft: -wp(3) }}>
              <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
                <Ionicons name="chevron-back" size={wp(15)} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.logoText}>Sign Up!</Text>
            </View>
            <Text style={styles.subtitle}>Create an Account</Text>
          </View>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>InnoLearn</Text>

        {/* Form Content */}
        <View style={styles.content}>
          {/* Name Field */}
          <Controller
            control={control}
            rules={{
              required: "Name is required",
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                ref={nameInputRef}
                icon="person-outline"
                placeholder="Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            )}
            name="name"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

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
                returnKeyType="next"
                onSubmitEditing={() => repeatPasswordInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            )}
            name="password"
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

          {/* Repeat Password Field */}
          <Controller
            control={control}
            rules={{
              required: "Repeat password is required",
              validate: (value) => value === control._formValues.password || "Passwords do not match",
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                ref={repeatPasswordInputRef}
                icon="lock-closed-outline"
                placeholder="Repeat password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showRepeatPassword}
                toggleVisibility={() => setShowRepeatPassword(!showRepeatPassword)}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
            name="repeatPassword"
          />
          {errors.repeatPassword && <Text style={styles.errorText}>{errors.repeatPassword.message}</Text>}

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <TouchableOpacity style={styles.checkbox} onPress={() => setAcceptTerms(!acceptTerms)}>
              {acceptTerms && <Ionicons name="checkmark" size={wp(4)} color="#4169E1" />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms and Conditions</Text>
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.signupButton} onPress={handleSubmit(onSubmit)}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.signupButtonText}>SIGN UP</Text>}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signinContainer}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.signinLink}>Sign in from here</Text>
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

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    height: hp(22),
    backgroundColor: Colors.primary,
    borderBottomRightRadius: hp(50),
    marginTop: -hp(2),
  },
  header: {
    flexDirection: "column",
    paddingTop: wp(3),
    marginTop: hp(3),
  },
  backButton: {
    width: wp(10),
    height: hp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: hp(5),
    color: "white",
    marginTop: hp(0.7),
    marginBottom: hp(2),
  },
  subtitle: {
    color: "white",
    marginTop: hp(1.2),
    marginLeft: wp(2),
    fontSize: hp(3),
  },
  appName: {
    textAlign: "center",
    fontSize: hp(4),
    color: Colors.secondary,
    fontWeight: "bold",
    marginTop: hp(2),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(4),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: wp(6.5),
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    height: hp(7),
  },
  inputIcon: {
    marginRight: wp(3),
  },
  input: {
    flex: 1,
    fontSize: hp(2.3),
    color: "#000000",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp(3),
  },
  checkbox: {
    width: wp(5),
    height: wp(5),
    borderWidth: 1,
    borderColor: Colors.ternary,
    borderRadius: wp(1),
    marginRight: wp(3),
    justifyContent: "center",
    alignItems: "center",
  },
  termsText: {
    fontSize: hp(2),
    color: "#666666",
  },
  termsLink: {
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

export default SignupScreen
