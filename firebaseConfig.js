// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClNfZQy118K5vXxwKvBkOchLHaLlt2X30",
  authDomain: "hush-48602.firebaseapp.com",
  projectId: "hush-48602",
  storageBucket: "hush-48602.appspot.com",
  messagingSenderId: "299017687433",
  appId: "1:299017687433:web:e86490f15ff80e7cd2d158",
  measurementId: "G-DPSC87LPKB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);



export default app
