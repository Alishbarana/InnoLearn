import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

class AuthService {
  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await user.updateProfile({ displayName });
      
      // Create user document in Firestore
      await this.createUserDocument(user, { displayName });
      
      return { success: true, user };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Signin error:', error);
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  // Sign out
  async signOut() {
    try {
      await auth().signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await auth().sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  // Update user password
  async updateUserPassword(newPassword) {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('No authenticated user');
      
      await user.updatePassword(newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  // Delete user account
  async deleteAccount() {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('No authenticated user');
      
      // Delete user document from Firestore
      await this.deleteUserDocument(user.uid);
      
      // Delete user account
      await user.delete();
      return { success: true };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  // Create user document in Firestore
  async createUserDocument(user, additionalData = {}) {
    try {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firestore.FieldValue.serverTimestamp(),
        ...additionalData
      };
      
      await firestore().collection('users').doc(user.uid).set(userData);
      return { success: true };
    } catch (error) {
      console.error('Error creating user document:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user document from Firestore
  async getUserDocument(uid) {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();
      
      if (userDoc.exists) {
        return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
      } else {
        return { success: false, error: 'User document not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update user document
  async updateUserDocument(uid, data) {
    try {
      await firestore().collection('users').doc(uid).update({
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete user document
  async deleteUserDocument(uid) {
    try {
      await firestore().collection('users').doc(uid).delete();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Auth state listener
  onAuthStateChanged(callback) {
    return auth().onAuthStateChanged(callback);
  }

  // Get current user
  getCurrentUser() {
    return auth().currentUser;
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