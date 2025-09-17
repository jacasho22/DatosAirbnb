/**
 * Sistema de internacionalización (i18n) para la aplicación de Check-In
 * Soporta español (es) e inglés (en)
 */

const translations = {
    es: {
        // Textos generales
        welcome: "Bienvenido al Check-In",
        form_title: "Formulario de Check-In",
        privacy_notice: "Los datos recopilados son utilizados únicamente para cumplir con los requisitos legales de registro de huéspedes y podrán ser compartidos con las autoridades competentes cuando sea requerido por ley.",
        data_protection: "Sus datos personales están protegidos de acuerdo con la normativa de protección de datos vigente.",
        
        // Página de inicio
        apartment: "Apartamento",
        select_apartment: "Selecciona un apartamento",
        apartment_1: "Residencial Camposol",
        apartment_2: "Piso Ramón Gallud",
        date: "Fecha de entrada",
        guests: "Número de huéspedes",
        start_checkin: "Iniciar Check-In",
        
        // Formulario
        guest_info: "Información del Huésped",
        full_name: "Nombre y apellidos",
        gender: "Sexo",
        male: "Hombre",
        female: "Mujer",
        other_gender: "Otro",
        birth_date: "Fecha de nacimiento",
        nationality: "Nacionalidad",
        address: "Dirección de residencia",
        municipality: "Municipio",
        postal_code: "Código postal",
        province: "Provincia",
        country: "País",
        phone: "Teléfono",
        email: "Correo electrónico",
        relationship: "Parentesco con otros huéspedes",
        checkin_date: "Fecha y hora de entrada",
        checkout_date: "Fecha y hora de salida",
        payment_method: "Datos de pago",
        current_date: "Fecha",
        document_type: "Tipo de documento",
        nie: "NIE",
        nif: "NIF",
        passport: "Pasaporte",
        foreign_document: "Otro Documento Extranjero",
        document_number: "Número de documento",
        support_doc: "Soporte DOC",
        document_photo: "Foto del documento",
        signature: "Firma del Viajero",
        clear_signature: "Borrar firma",
        reference_number: "Número de Referencia",
        
        // Navegación del formulario
        previous: "Anterior",
        next: "Siguiente",
        submit: "Enviar",
        progress: "Huésped {current} de {total}",
        
        // Modales
        confirm_submission: "Confirmar envío",
        confirm_text: "¿Estás seguro de que deseas enviar la información? Verifica que todos los datos sean correctos.",
        cancel: "Cancelar",
        confirm: "Confirmar",
        success_title: "¡Envío exitoso!",
        success_text: "Tu información ha sido enviada correctamente. ¡Gracias!",
        back_to_home: "Volver al inicio",
        
        // Mensajes de error
        required_field: "Este campo es obligatorio",
        invalid_date: "Fecha inválida",
        file_required: "Debes adjuntar una imagen del documento",
        signature_required: "La firma es obligatoria"
    },
    en: {
        // General texts
        welcome: "Welcome to Check-In",
        form_title: "Check-In Form",
        privacy_notice: "The collected data is used only to comply with legal requirements for guest registration and may be shared with competent authorities when required by law.",
        data_protection: "Your personal data is protected in accordance with current data protection regulations.",
        
        // Home page
        apartment: "Apartment",
        select_apartment: "Select an apartment",
        apartment_1: "Residencial Camposol",
        apartment_2: "Piso Ramón Gallud",
        date: "Check-in date",
        guests: "Number of guests",
        start_checkin: "Start Check-In",
        
        // Form
        guest_info: "Guest Information",
        full_name: "Full name",
        gender: "Gender",
        male: "Male",
        female: "Female",
        other_gender: "Other",
        birth_date: "Date of birth",
        nationality: "Nationality",
        address: "Residential address",
        municipality: "Municipality",
        postal_code: "Postal code",
        province: "Province",
        country: "Country",
        phone: "Phone",
        email: "Email",
        relationship: "Relationship with other guests",
        checkin_date: "Check-in date and time",
        checkout_date: "Check-out date and time",
        payment_method: "Payment details",
        current_date: "Date",
        document_type: "Document type",
        nie: "NIE",
        nif: "NIF",
        passport: "Passport",
        foreign_document: "Other Foreign Document",
        document_number: "Document number",
        support_doc: "Support DOC",
        document_photo: "Document photo",
        signature: "Guest signature",
        clear_signature: "Clear signature",
        reference_number: "Reference Number",
        
        // Form navigation
        previous: "Previous",
        next: "Next",
        submit: "Submit",
        progress: "Guest {current} of {total}",
        
        // Modals
        confirm_submission: "Confirm submission",
        confirm_text: "Are you sure you want to submit the information? Verify that all data is correct.",
        cancel: "Cancel",
        confirm: "Confirm",
        success_title: "Successful submission!",
        success_text: "Your information has been successfully submitted. Thank you!",
        back_to_home: "Back to home",
        
        // Error messages
        required_field: "This field is required",
        invalid_date: "Invalid date",
        file_required: "You must attach an image of the document",
        signature_required: "Signature is required"
    }
};

// Idioma predeterminado
let currentLanguage = 'es';

// Función para cambiar el idioma
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        updateTexts();
        // Guardar preferencia de idioma
        localStorage.setItem('language', lang);
    }
}

// Función para obtener un texto traducido
function getText(key, replacements = {}) {
    const text = translations[currentLanguage][key] || key;
    
    // Reemplazar variables en el texto si existen
    return text.replace(/{([^}]+)}/g, (match, key) => {
        return typeof replacements[key] !== 'undefined' ? replacements[key] : match;
    });
}

// Función para actualizar todos los textos en la página
function updateTexts() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        // Manejar caso especial para el texto de progreso
        if (key === 'progress' && element.id === 'progress-text') {
            // Los valores actuales se manejarán en el script principal
            return;
        }
        
        // Actualizar el texto del elemento
        element.textContent = getText(key);
        
        // Para elementos de formulario, actualizar también el placeholder si existe
        if (element.hasAttribute('placeholder')) {
            element.setAttribute('placeholder', getText(key + '_placeholder'));
        }
    });
}

// Inicializar el idioma cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Comprobar si hay un idioma guardado en localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
    }
    
    // Configurar los botones de cambio de idioma
    const btnEs = document.getElementById('lang-es');
    const btnEn = document.getElementById('lang-en');
    
    if (btnEs) {
        btnEs.addEventListener('click', () => setLanguage('es'));
    }
    
    if (btnEn) {
        btnEn.addEventListener('click', () => setLanguage('en'));
    }
    
    // Actualizar los textos iniciales
    updateTexts();
});

// Exportar funciones para uso en otros scripts
window.i18n = {
    setLanguage,
    getText,
    updateTexts,
    getCurrentLanguage: () => currentLanguage
};