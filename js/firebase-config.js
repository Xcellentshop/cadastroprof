const firebaseConfig = {
    apiKey: "AIzaSyDEuY8d33WsWNcVGhaYUHEdCjvdPwUid94",
    authDomain: "gotas-vivas.firebaseapp.com",
    projectId: "gotas-vivas",
    storageBucket: "gotas-vivas.firebasestorage.app",
    messagingSenderId: "432316217812",
    appId: "1:432316217812:web:5c5c4ffac55ff33745fe41"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
