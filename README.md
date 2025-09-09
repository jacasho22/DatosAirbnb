# Check-In Airbnb Web

Formulario de check-in obligatorio para huéspedes de apartamentos Airbnb, compatible con normativas policiales.

## ✨ Funcionalidades

- Selector de idioma (ES/EN)
- Formulario dinámico según número de huéspedes
- Subida de documentos
- Firma digital
- Envío automático de datos
- Totalmente estático, funcional desde GitHub Pages

## 📋 Descripción

Esta aplicación web permite a los huéspedes de apartamentos turísticos completar el formulario de registro obligatorio para la policía. Los huéspedes pueden:

- Elegir el idioma (español o inglés)
- Seleccionar el apartamento
- Ingresar la fecha de llegada
- Especificar el número de huéspedes
- Rellenar formularios para cada huésped con:
  - Datos personales
  - Subida de documento de identidad
  - Firma digital

## 🛠️ Tecnologías utilizadas

- HTML5
- JavaScript (Vanilla JS)
- TailwindCSS para estilos
- Almacenamiento local (localStorage)
- Formularios dinámicos

## 📁 Estructura del proyecto

```
/checkin-web
├── index.html               # Selector de idioma + entrada principal
├── form.html                # Formulario dinámico
├── assets/
│   ├── style.css            # Estilos personalizados (opcional)
│   ├── script.js            # JS para la página principal
│   ├── form.js              # JS para el formulario dinámico
│   └── i18n.js              # Textos en español/inglés
└── README.md                # Documentación
```

## 🚀 Publicar en GitHub Pages

1. Crea un repositorio en GitHub llamado `checkin-web`
2. Sube todos los archivos a la rama `main`
3. Activa GitHub Pages desde `Settings > Pages`
4. Selecciona la rama `main` como fuente
5. Tu sitio estará disponible en `https://usuario.github.io/checkin-web`

## 💾 Opciones de almacenamiento de datos

Actualmente, la aplicación está configurada para simular el envío de datos. Para implementar un almacenamiento real, puedes utilizar alguna de estas opciones:

### Google Forms

1. Crea un formulario de Google con los mismos campos
2. Habilita la subida de archivos
3. Obtén la URL de envío del formulario
4. Modifica la función `submitForm()` en `form.js` para enviar los datos al formulario de Google

### FormSubmit

1. Regístrate en [FormSubmit](https://formsubmit.co/)
2. Obtén tu endpoint personalizado
3. Modifica la función `submitForm()` para enviar los datos a FormSubmit

### Firebase (opción más avanzada)

1. Crea un proyecto en Firebase
2. Configura Firebase Storage para las imágenes
3. Configura Firestore para los datos del formulario
4. Implementa la autenticación si es necesario
5. Actualiza el código para utilizar las APIs de Firebase

## ⚠️ Consideraciones legales

- Esta aplicación cumple con el RGPD si se limita el tiempo de almacenamiento de los datos
- No recolecta más datos de los necesarios para el registro policial
- Se recomienda añadir una política de privacidad en el footer
- Los datos se envían de forma segura (implementar HTTPS)

## 🔧 Personalización

Puedes personalizar la aplicación modificando:

- Los textos en `i18n.js`
- Los estilos en TailwindCSS
- Añadir más apartamentos en el selector
- Implementar validaciones adicionales
- Añadir más idiomas

## 📱 Compatibilidad

La aplicación es compatible con:

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Dispositivos móviles y tablets
- Pantallas de diferentes tamaños (diseño responsive)

## 👥 Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar esta aplicación, puedes:

1. Hacer un fork del repositorio
2. Crear una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Hacer push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request