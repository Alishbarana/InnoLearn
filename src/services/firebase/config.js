// import { initializeApp, getApps, getApp } from "firebase/app";
// import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Firebase config
// const firebaseConfig = {
//   apiKey: "AIzaSyCM_NPcRgIYzArCF8ZZ2kLdrgBwaLaxlY0",
//   authDomain: "ar-authentication-c0989.firebaseapp.com",
//   projectId: "ar-authentication-c0989",
//   storageBucket: "ar-authentication-c0989.appspot.com", // <-- FIXED: should be .appspot.com
//   messagingSenderId: "1036797103905",
//   appId: "1:1036797103905:web:5ad735500062cd4b8a3860"
// };

// // Avoid reinitializing the app
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// // Always initialize Auth with persistence for React Native
// let auth;
// try {
//   auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(AsyncStorage),
//   });
// } catch (e) {
//   auth = getAuth(app);
// }

// // Firestore
// const db = getFirestore(app);

// export { auth, db };
// export default app;