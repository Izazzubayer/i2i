// Firebase configuration for Google Authentication
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgHRNnp9jukepq0qY9-fird6QxDVfsdaE",
  authDomain: "i2iauth.firebaseapp.com",
  projectId: "i2iauth",
  storageBucket: "i2iauth.firebasestorage.app",
  messagingSenderId: "74177209244",
  appId: "1:74177209244:web:dfee71596d0dbe97f29e59",
  measurementId: "G-YP87E5CQ9P"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider()

export default app
