// import { initializeApp, getApps, getApp } from "firebase/app";
// import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
// import { getDatabase } from "firebase/database";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Firebase config from google-services.json
// const firebaseConfig = {
//   apiKey: "AIzaSyC5bEA0EMe1-1RXBeyNrZwH1_k4F3F37Bk",
//   authDomain: "innolearn-77ad7.firebaseapp.com",
//   databaseURL: "https://innolearn-77ad7-default-rtdb.firebaseio.com",
//   projectId: "innolearn-77ad7",
//   storageBucket: "innolearn-77ad7.firebasestorage.app",
//   messagingSenderId: "298647833909",
//   appId: "1:298647833909:android:9b5a5d39fd11c70219107c"
// };

// // Initialize Firebase app
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// // Initialize Auth with persistence for React Native
// let auth;
// try {
//   auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(AsyncStorage),
//   });
// } catch (e) {
//   auth = getAuth(app);
// }

// // Initialize Realtime Database
// const db = getDatabase(app);

// export { auth, db };
// export default app;