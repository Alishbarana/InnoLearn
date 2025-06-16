import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// React Native Firebase automatically uses google-services.json
// No manual initialization needed!

// Test connection (remove in production)
console.log('🔥 Firebase Auth initialized:', !!auth());
console.log('🔥 Firebase Firestore initialized:', !!firestore());
console.log('🔥 Firebase Storage initialized:', !!storage());

export { auth, firestore, storage };