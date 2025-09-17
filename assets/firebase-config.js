// Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, query, where, orderBy, serverTimestamp, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBrYqngFt4M7Tz91WM4F5plJ-c6zqWZY7E",
    authDomain: "datosairbnb.firebaseapp.com",
    projectId: "datosairbnb",
    storageBucket: "datosairbnb.appspot.com",
    messagingSenderId: "404464824763",
    appId: "1:404464824763:web:abb8de8848a88ffe0d549e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Function to save form data to Firestore
export async function saveFormToFirestore(formData) {
    try {
        // Añadir estado activo y fecha de envío
        const dataToSave = {
            ...formData,
            status: 'active',
            submissionDate: serverTimestamp()
        };

        // Intentar guardar el documento
        const formSubmissionsRef = collection(db, 'formSubmissions');
        const docRef = await addDoc(formSubmissionsRef, dataToSave);
        console.log('Documento guardado con ID:', docRef.id);

        // Verificar que el documento se guardó correctamente
        const docSnapshot = await getDoc(docRef);
        if (!docSnapshot.exists()) {
            throw new Error('El documento no se guardó correctamente');
        }

        return true;
    } catch (error) {
        console.error('Error al guardar en Firestore:', error);
        throw error; // Propagar el error para manejarlo en el formulario
    }
}