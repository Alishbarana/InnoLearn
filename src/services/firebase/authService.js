import { getApp } from "@react-native-firebase/app"
import auth, {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
} from "@react-native-firebase/auth"
import { getDatabase, ref, set, update, remove, serverTimestamp } from "@react-native-firebase/database"

// Get the default app instance
const app = getApp()
const database = getDatabase(app) // Use modular API

class AuthService {
  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth(app), email, password)
      const user = userCredential.user

      // Update profile with display name
      await updateProfile(user, { displayName })

      // Create user data in Realtime Database using modular API
      await set(ref(database, `users/${user.uid}`), {
        uid: user.uid,
        email: user.email,
        displayName,
        createdAt: serverTimestamp(), // Fixed: Use serverTimestamp() instead of database.ServerValue.TIMESTAMP
        lastLoginAt: serverTimestamp(),
      })

      return { success: true, user }
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) }
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth(app), email, password)

      // Update lastLoginAt in Realtime Database using modular API
      await update(ref(database, `users/${userCredential.user.uid}`), {
        lastLoginAt: serverTimestamp(), // Fixed: Use serverTimestamp()
      })

      return { success: true, user: userCredential.user }
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) }
    }
  }

  // Sign out
  async signOut() {
    try {
      await firebaseSignOut(auth(app))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth(app), email)
      return { success: true }
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) }
    }
  }

  // Update user password
  async updateUserPassword(newPassword) {
    try {
      const user = auth(app).currentUser
      if (!user) throw new Error("No authenticated user")

      await user.updatePassword(newPassword)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Delete user account and data
  async deleteAccount() {
    try {
      const user = auth(app).currentUser
      if (!user) throw new Error("No authenticated user")

      // Delete user data from Realtime Database using modular API
      await remove(ref(database, `users/${user.uid}`))

      // Delete user account
      await user.delete()
      return { success: true }
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) }
    }
  }

  // Send verification email to the current user
  async sendEmailVerification() {
    try {
      const user = auth(app).currentUser
      if (!user) throw new Error("No authenticated user")

      await user.sendEmailVerification()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Check if the user's email is verified
  isEmailVerified() {
    const user = auth(app).currentUser
    return user ? user.emailVerified : false
  }

  // Auth state listener
  onAuthStateChanged(callback) {
    return auth(app).onAuthStateChanged(callback)
  }

  // Get current user
  getCurrentUser() {
    return auth(app).currentUser
  }

  // Get user data from database
  async getUserData(userId) {
    try {
      const { get } = await import("@react-native-firebase/database")
      const snapshot = await get(ref(database, `users/${userId}`))

      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() }
      } else {
        return { success: false, error: "User data not found" }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Update user profile data
  async updateUserData(userId, data) {
    try {
      await update(ref(database, `users/${userId}`), {
        ...data,
        updatedAt: serverTimestamp(),
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Handle authentication errors
  handleAuthError(error) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Email address is already in use."
      case "auth/invalid-email":
        return "Invalid email address format."
      case "auth/weak-password":
        return "Password is too weak. Please choose a stronger password."
      case "auth/user-not-found":
        return "No account found with this email address."
      case "auth/wrong-password":
        return "Incorrect password."
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later."
      case "auth/network-request-failed":
        return "Network error. Please check your connection."
      case "auth/requires-recent-login":
        return "This operation requires recent authentication. Please sign in again."
      case "auth/user-disabled":
        return "This account has been disabled."
      case "auth/operation-not-allowed":
        return "This operation is not allowed. Please contact support."
      case "auth/invalid-credential":
        return "Invalid credentials provided."
      default:
        return error.message || "An unexpected error occurred."
    }
  }
}

export default new AuthService()
