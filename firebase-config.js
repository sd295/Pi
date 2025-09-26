// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVDgbl4pUfkznjhcESEZPczlYi3b98J_Y",
  authDomain: "pi-nord.firebaseapp.com",
  projectId: "pi-nord",
  storageBucket: "pi-nord.firebasestorage.app",
  messagingSenderId: "517448730993",
  appId: "1:517448730993:web:5fdf457e0af94621cc0ed0",
  measurementId: "G-JF0RKFPKSN"
};

// Initialize Firebase
// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);

export const analytics = getAnalytics(app); // This is line 22, which was causing the error