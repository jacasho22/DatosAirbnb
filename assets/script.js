/**
 * Script principal para la página de inicio
 * Maneja la selección de apartamento, fecha y número de huéspedes
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referencia al formulario inicial
    const initialForm = document.getElementById('initial-form');
    
    // Manejar el envío del formulario inicial
    if (initialForm) {
        initialForm.addEventListener('submit', handleInitialFormSubmit);
    }
});

/**
 * Maneja el envío del formulario inicial
 * @param {Event} event - El evento de envío del formulario
 */
function handleInitialFormSubmit(event) {
    event.preventDefault();
    
    // Obtener los valores del formulario
    const apartment = document.getElementById('apartment').value;
    const checkInDate = document.getElementById('check-in-date').value;
    const guestsCount = document.getElementById('guests').value;
    
    // Validar que todos los campos estén completos
    if (!apartment || !checkInDate || !guestsCount) {
        alert(window.i18n.getText('required_field'));
        return;
    }
    
    // Validar que la fecha no sea anterior a hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(checkInDate);
    
    if (selectedDate < today) {
        alert(window.i18n.getText('invalid_date'));
        return;
    }
    
    // Guardar los datos en localStorage para usarlos en la página del formulario
    saveCheckInData(apartment, checkInDate, guestsCount);
    
    // Redirigir a la página del formulario
    window.location.href = 'form.html';
}

/**
 * Guarda los datos de check-in en localStorage
 * @param {string} apartment - El número de apartamento
 * @param {string} checkInDate - La fecha de entrada
 * @param {string} guestsCount - El número de huéspedes
 */
function saveCheckInData(apartment, checkInDate, guestsCount) {
    const checkInData = {
        apartment,
        checkInDate,
        guestsCount: parseInt(guestsCount, 10),
        language: window.i18n.getCurrentLanguage()
    };
    
    localStorage.setItem('checkInData', JSON.stringify(checkInData));
}