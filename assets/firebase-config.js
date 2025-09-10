// Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js';

const firebaseConfig = {
    apiKey: "AIzaSyBrYqngFt4M7Tz91WM4F5plJ-c6zqWZY7E",
    authDomain: "datosairbnb.firebaseapp.com",
    projectId: "datosairbnb",
    storageBucket: "datosairbnb.firebasestorage.app",
    messagingSenderId: "404464824763",
    appId: "1:404464824763:web:abb8de8848a88ffe0d549e",
    measurementId: "G-FNBBNY6E7H"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);

// Function to save form data to Firestore
export async function saveFormToFirestore(formData) {
    try {
        const docRef = await addDoc(collection(db, 'formSubmissions'), formData);
        console.log('Documento guardado con ID:', docRef.id);
        return true;
    } catch (error) {
        console.error('Error al guardar en Firestore:', error);
        return false;
    }
}