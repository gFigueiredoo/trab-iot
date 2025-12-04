// Firebase Configuration for SeniorCare Dashboard
const firebaseConfig = {
    apiKey: "AIzaSyC...", // Sua API Key aqui
    authDomain: "meu-esp32.firebaseapp.com",
    databaseURL: "https://meu-esp32-default-rtdb.firebaseio.com/",
    projectId: "meu-esp32",
    storageBucket: "meu-esp32.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Export for use in other scripts
window.seniorCareDB = db;
