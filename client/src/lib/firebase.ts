import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBsurLU6VQbP8WZgaI86HY52KJnQLBRMaE",
  authDomain: "intelligent-trading.firebaseapp.com",
  projectId: "intelligent-trading",
  storageBucket: "intelligent-trading.firebasestorage.app",
  messagingSenderId: "967893900364",
  appId: "1:967893900364:web:62dc9946b043212e6828e9",
  measurementId: "G-Z84KVQ4QHQ"
};

// تجنب تهيئة Firebase مرتين
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// تكوين Google provider
googleProvider.addScope('email');
googleProvider.addScope('profile');

// تكوين Apple provider
appleProvider.addScope('email');
appleProvider.addScope('name');

export default app;
