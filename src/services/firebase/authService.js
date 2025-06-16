import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
} from '@react-native-firebase/auth';
import database, {
  getDatabase,
  ref,
  set,
  update,
  remove,
  onValue,
} from '@react-native-firebase/database';

const app = getApp();
const auth = getAuth(app);
const db = getDatabase(app);

class AuthService {
  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, { displayName });

      // Create user data in Realtime Database
      await set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        email: user.email,
        displayName,
        createdAt: database.ServerValue.TIMESTAMP,
        lastLoginAt: database.ServerValue.TIMESTAMP,
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Optionally update lastLoginAt in Realtime Database
      await update(ref(db, `users/${userCredential.user.uid}`), {
        lastLoginAt: database.ServerValue.TIMESTAMP, // <-- FIXED HERE
      });
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  // Sign out
  async signOut() {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  // Update user password
  async updateUserPassword(newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      await user.updatePassword(newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete user account and data
  async deleteAccount() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      // Delete user data from Realtime Database
      await remove(ref(db, `users/${user.uid}`));
      // Delete user account
      await user.delete();
      return { success: true };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  // Send verification email to the current user
  async sendEmailVerification() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      await user.sendEmailVerification();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Check if the user's email is verified
  isEmailVerified() {
    const user = auth.currentUser;
    return user ? user.emailVerified : false;
  }

  // Auth state listener
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Handle authentication errors
  handleAuthError(error) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Email address is already in use.';
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
}

export default new AuthService();