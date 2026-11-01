// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtYxmdcMYeZ5er5zLGgB2N_yypA1N1wMw",
  authDomain: "emp-lov.firebaseapp.com",
  databaseURL: "https://emp-lov-default-rtdb.firebaseio.com",
  projectId: "emp-lov",
  storageBucket: "emp-lov.firebasestorage.app",
  messagingSenderId: "210831116108",
  appId: "1:210831116108:web:ea2fa85196a87fbb9531e9",
  measurementId: "G-L2H3G14FZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
