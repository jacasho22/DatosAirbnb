/**
 * Script principal para la página de inicio
 * Maneja la selección de apartamento, fecha y número de huéspedes
 */

console.log('Script cargado');

// Función para inicializar el formulario
function initForm() {
    console.log('Inicializando formulario');
    
    // Referencia al botón de inicio de check-in
    const startCheckinBtn = document.getElementById('start-checkin-btn');
    console.log('Botón encontrado:', startCheckinBtn);
    
    // Manejar el clic en el botón de inicio de check-in
    if (startCheckinBtn) {
        startCheckinBtn.addEventListener('click', handleStartCheckin);
        console.log('Evento click agregado al botón');
    } else {
        console.error('No se encontró el botón con ID start-checkin-btn');
        // Intentar nuevamente después de un breve retraso
        setTimeout(initForm, 500);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initForm);

// Como respaldo, también intentar inicializar después de que la ventana se cargue completamente
window.addEventListener('load', initForm);

/**
 * Maneja el clic en el botón de inicio de check-in
 */
function handleStartCheckin() {
    console.log('Botón de inicio de check-in clickeado');
    
    try {
        // Obtener los valores del formulario
        const apartment = document.getElementById('apartment').value;
        const checkInDate = document.getElementById('checkin-date').value;
        const guestsCount = document.getElementById('guests').value;
        console.log('Apartamento:', apartment, 'Fecha de entrada:', checkInDate, 'Huéspedes:', guestsCount);
        
        // Validar que todos los campos estén completos
        if (!apartment || !checkInDate || !guestsCount) {
            alert('Por favor, completa todos los campos.');
            return;
        }
        
        // Guardar los datos en localStorage para usarlos en la página del formulario
        const checkInData = {
            apartment,
            checkInDate,
            guestsCount: parseInt(guestsCount, 10)
        };
        
        saveCheckInData(checkInData);
        
        // Redirigir a la página del formulario
        console.log('Redirigiendo a form.html');
        window.location.href = 'form.html';
    } catch (error) {
        console.error('Error al iniciar check-in:', error);
    }
}

/**
 * Guarda los datos de check-in en localStorage
 * @param {Object} data - Datos de check-in
 */
function saveCheckInData(data) {
    // Añadir el idioma actual a los datos
    if (window.i18n && typeof window.i18n.getCurrentLanguage === 'function') {
        data.language = window.i18n.getCurrentLanguage();
    } else {
        data.language = 'es'; // Idioma por defecto
    }
    console.log('Guardando datos de check-in en localStorage:', data);
    localStorage.setItem('checkInData', JSON.stringify(data));
    console.log('Datos guardados en localStorage');
}