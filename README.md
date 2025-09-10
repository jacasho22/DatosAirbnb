# DatosAirbnb - Sistema de Registro de Huéspedes

## Configuración de Firebase

Para que la aplicación funcione correctamente, necesitas configurar Firebase siguiendo estos pasos:

1. Crear un proyecto en Firebase:
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Haz clic en "Agregar proyecto"
   - Sigue los pasos para crear un nuevo proyecto

2. Habilitar Firestore Database:
   - En la consola de Firebase, ve a "Firestore Database"
   - Haz clic en "Crear base de datos"
   - Selecciona "Comenzar en modo de prueba"

3. Obtener las credenciales de Firebase:
   - En la consola de Firebase, ve a la configuración del proyecto
   - En "General", desplázate hasta "Tus apps"
   - Haz clic en el icono de web (</>) para registrar una nueva aplicación
   - Sigue los pasos y copia la configuración de Firebase

4. Actualizar la configuración en el código:
   - Abre el archivo `assets/firebase-config.js`
   - Reemplaza los valores de `firebaseConfig` con los que obtuviste en el paso anterior:
   ```javascript

       const firebaseConfig = {
       apiKey: "AIzaSyBrYqngFt4M7Tz91WM4F5plJ-c6zqWZY7E",
       authDomain: "datosairbnb.firebaseapp.com",
       projectId: "datosairbnb",
       storageBucket: "datosairbnb.firebasestorage.app",
       messagingSenderId: "404464824763",
       appId: "1:404464824763:web:abb8de8848a88ffe0d549e",
       measurementId: "G-FNBBNY6E7H"
        };

5. Actualizar las reglas de Firestore:
   - En la consola de Firebase, ve a "Firestore Database" > "Reglas"
   - Reemplaza las reglas existentes con:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   Nota: Estas reglas permiten acceso público. En un entorno de producción, deberías implementar reglas más restrictivas.

## Estructura del Proyecto

- `index.html`: Página principal
- `form.html`: Formulario de registro de huéspedes
- `admin.html`: Panel de administración
- `assets/`
  - `form.js`: Lógica del formulario
  - `admin.js`: Lógica del panel de administración
  - `i18n.js`: Internacionalización
  - `firebase-config.js`: Configuración de Firebase

## Funcionalidades

- Registro de huéspedes con datos personales
- Captura de firmas digitales
- Carga de documentos de identidad
- Panel de administración protegido
- Almacenamiento en la nube con Firebase
- Exportación de datos a PDF
- Interfaz bilingüe (Español/Inglés)