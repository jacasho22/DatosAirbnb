/**
 * Script para el panel de administración
 * Maneja la autenticación, visualización y exportación de formularios
 */

// Verificar que CryptoJS esté disponible
console.log('CryptoJS disponible:', typeof CryptoJS !== 'undefined');

// Credenciales de administrador (en un entorno real, esto se manejaría en el servidor)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH = '9a4ec6f94a79d29a33ce56c0ad120ef0f00d83a0a7fc9a5b4a4fd12e97d4beeb'; // SHA-256 de 'balcones22'

import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { db } from './firebase-config.js';

// Variables globales
let formSubmissions = [];
let filteredSubmissions = [];

document.addEventListener('DOMContentLoaded', () => {
    // Configurar el formulario de login
    setupLoginForm();
    
    // Configurar los botones y eventos del panel de administración
    setupAdminPanel();
    
    // Configurar el modal de detalles
    setupDetailsModal();
    
    // Cargar los datos de formularios enviados desde Firestore
    loadFormSubmissions();
});

/**
 * Carga los formularios desde Firestore
 */
async function loadFormSubmissions() {
    try {
        const formRef = collection(db, 'formSubmissions');
        const q = query(formRef, orderBy('submissionDate', 'desc'));
        const querySnapshot = await getDocs(q);
        
        formSubmissions = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));
        
        // Actualizar la lista filtrada
        filteredSubmissions = [...formSubmissions];
        
        // Actualizar la interfaz
        updateSubmissionsTable();
        applyFilters();
    } catch (error) {
        console.error('Error al cargar los formularios:', error);
        alert('Error al cargar los formularios. Por favor, recarga la página.');
    }
}

/**
 * Configura el formulario de login
 */
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Verificar las credenciales
            if (verifyCredentials(username, password)) {
                // Ocultar la pantalla de login y mostrar el panel de administración
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('admin-panel').classList.remove('hidden');
                
                // Guardar el estado de autenticación en sessionStorage
                sessionStorage.setItem('adminAuthenticated', 'true');
            } else {
                // Mostrar mensaje de error
                if (loginError) {
                    loginError.classList.remove('hidden');
                }
            }
        });
    }
    
    // Comprobar si ya está autenticado
    if (sessionStorage.getItem('adminAuthenticated') === 'true') {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
    }
}

/**
 * Verifica las credenciales de administrador
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {boolean} - true si las credenciales son válidas, false en caso contrario
 */
function verifyCredentials(username, password) {
    // Verificar si estamos usando texto plano o hash
    if (username === 'admin' && password === 'balcones22') {
        console.log('Autenticación exitosa con credenciales en texto plano');
        return true;
    }
    
    // Calcular el hash SHA-256 de la contraseña
    const passwordHash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    
    // Verificar con las constantes globales
    if (username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH) {
        console.log('Autenticación exitosa con constantes globales');
        return true;
    }
    
    // Intentar verificar con el objeto adminCredentials si está disponible
    if (window.adminPanel && window.adminPanel.adminCredentials) {
        const usernameHash = CryptoJS.SHA256(username).toString(CryptoJS.enc.Hex);
        const adminCreds = window.adminPanel.adminCredentials;
        
        console.log('Verificando con adminCredentials:', {
            usernameHash,
            passwordHash,
            expectedUsernameHash: adminCreds.username,
            expectedPasswordHash: adminCreds.password,
            matchUsername: usernameHash === adminCreds.username,
            matchPassword: passwordHash === adminCreds.password
        });
        
        if (usernameHash === adminCreds.username && passwordHash === adminCreds.password) {
            console.log('Autenticación exitosa con adminCredentials');
            return true;
        }
    } else {
        console.log('adminCredentials no está disponible');
    }
    
    console.log('Autenticación fallida');
    return false;
}

/**
 * Configura los eventos y botones del panel de administración
 */
function setupAdminPanel() {
    // Configurar el botón de cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Eliminar el estado de autenticación
            sessionStorage.removeItem('adminAuthenticated');
            
            // Ocultar el panel de administración y mostrar la pantalla de login
            document.getElementById('admin-panel').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
            
            // Limpiar los campos del formulario de login
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('login-error').classList.add('hidden');
        });
    }
    
    // Configurar los filtros
    const dateFilter = document.getElementById('date-filter');
    const apartmentFilter = document.getElementById('apartment-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }
    
    if (apartmentFilter) {
        apartmentFilter.addEventListener('change', applyFilters);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            // Limpiar los filtros
            if (dateFilter) dateFilter.value = '';
            if (apartmentFilter) apartmentFilter.value = '';
            
            // Aplicar los filtros (mostrar todos)
            applyFilters();
        });
    }
}

/**
 * Configura el modal de detalles del formulario
 */
function setupDetailsModal() {
    const modal = document.getElementById('form-details-modal');
    const closeBtn = document.getElementById('close-details-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            const formId = modal.dataset.formId;
            const formData = formSubmissions.find(f => f.id === formId);
            if (formData) {
                generatePDF(formData);
            }
        });
    }
    
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            // Obtener el ID del formulario actual
            const formId = modal.dataset.formId;
            if (formId) {
                // Encontrar el formulario en los datos
                const formData = formSubmissions.find(form => form.id === formId);
                if (formData) {
                    generatePDF(formData);
                }
            }
        });
    }
}

// Función loadFormSubmissions ya está definida en la línea 54

/**
 * Aplica los filtros seleccionados a los datos
 */
function applyFilters() {
    const dateFilterElement = document.getElementById('date-filter');
    const apartmentFilterElement = document.getElementById('apartment-filter');
    
    // Verificar que los elementos existen antes de acceder a sus propiedades
    const dateFilter = dateFilterElement ? dateFilterElement.value : '';
    const apartmentFilter = apartmentFilterElement ? apartmentFilterElement.value : '';
    
    // Filtrar los datos
    filteredSubmissions = formSubmissions.filter(form => {
        // Filtro de fecha
        const dateMatch = !dateFilter || form.checkInDate === dateFilter;
        
        // Filtro de apartamento
        const apartmentMatch = !apartmentFilter || form.apartment === apartmentFilter;
        
        return dateMatch && apartmentMatch;
    });
    
    // Actualizar la tabla
    updateSubmissionsTable();
}

/**
 * Actualiza la tabla de formularios con los datos filtrados
 */
function updateSubmissionsTable() {
    const tableBody = document.getElementById('submissions-table');
    
    if (!tableBody) return;
    
    // Limpiar la tabla
    tableBody.innerHTML = '';
    
    if (filteredSubmissions.length === 0) {
        // Mostrar mensaje de "no hay datos"
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'submissions-empty-row';
        emptyRow.innerHTML = `
            <td colspan="4" class="py-4 text-center text-gray-500">No hay formularios enviados</td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Añadir filas para cada formulario
    filteredSubmissions.forEach(form => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        // Formatear la fecha
        const formattedDate = new Date(form.submissionDate).toLocaleDateString();
        
        row.innerHTML = `
            <td class="py-2 px-4 border-b">${formattedDate}</td>
            <td class="py-2 px-4 border-b">${form.apartment === '1' ? 'Residencial Camposol' : 'Piso Ramón Gallud'}</td>
            <td class="py-2 px-4 border-b">${form.guestsCount}</td>
            <td class="py-2 px-4 border-b">
                <button class="view-details-btn bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 transition duration-300 mr-2" data-id="${form.id}">Ver detalles</button>
                <button class="delete-form-btn bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition duration-300" data-id="${form.id}">Eliminar</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Añadir eventos a los botones de ver detalles
    const detailButtons = document.querySelectorAll('.view-details-btn');
    detailButtons.forEach(button => {
        button.addEventListener('click', () => {
            const formId = button.dataset.id;
            showFormDetails(formId);
        });
    });
    
    // Añadir eventos a los botones de eliminar
    const deleteButtons = document.querySelectorAll('.delete-form-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const formId = button.dataset.id;
            deleteForm(formId);
        });
    });
}

/**
 * Elimina un formulario de la lista
 * @param {string} formId - ID del formulario a eliminar
 */
function deleteForm(formId) {
    if (!formId) return;
    
    // Confirmar antes de eliminar
    if (confirm('¿Estás seguro de que deseas eliminar este formulario? Esta acción no se puede deshacer.')) {
        try {
            // Eliminar el documento de Firestore
            deleteDoc(doc(db, 'formSubmissions', formId))
                .then(() => {
                    // Actualizar la variable global
                    formSubmissions = formSubmissions.filter(form => form.id !== formId);
                    
                    // Aplicar filtros y actualizar la tabla
                    applyFilters();
                    
                    // Mostrar mensaje de éxito
                    alert('Formulario eliminado correctamente');
                })
                .catch(error => {
                    console.error('Error al eliminar el formulario:', error);
                    alert('Ocurrió un error al eliminar el formulario');
                });
        } catch (error) {
            console.error('Error al eliminar el formulario:', error);
            alert('Ocurrió un error al eliminar el formulario');
        }
    }
}

/**
 * Muestra los detalles de un formulario en el modal
 * @param {string} formId - ID del formulario
 */
function showFormDetails(formId) {
    const form = formSubmissions.find(f => f.id === formId);
    const modal = document.getElementById('form-details-modal');
    const content = document.getElementById('form-details-content');
    
    if (!form || !modal || !content) return;
    
    // Guardar el ID del formulario en el modal para usarlo al generar el PDF
    modal.dataset.formId = formId;
    
    // Formatear las fechas
    const submissionDate = new Date(form.submissionDate).toLocaleDateString();
    const checkInDate = new Date(form.checkInDate).toLocaleDateString();
    
    // Construir el contenido del modal
    let html = `
        <div class="bg-gray-100 p-4 rounded-md mb-4">
            <h3 class="font-semibold">Información general</h3>
            <p><strong>Fecha de envío:</strong> ${submissionDate}</p>
            <p><strong>Apartamento:</strong> ${form.apartment === '1' ? 'Residencial Camposol' : 'Piso Ramón Gallud'}</p>
            <p><strong>Fecha de entrada:</strong> ${checkInDate}</p>
            <p><strong>Número de huéspedes:</strong> ${form.guestsCount}</p>
        </div>
    `;
    
    // Añadir información de cada huésped
    for (let i = 0; i < form.guests.length; i++) {
        const guest = form.guests[i];
        const birthDate = new Date(guest.birthDate).toLocaleDateString();
        const checkoutDate = guest.checkoutDate ? new Date(guest.checkoutDate).toLocaleDateString() : 'No especificada';
        
        html += `
            <div class="border p-4 rounded-md">
                <h3 class="font-semibold">Huésped ${i + 1}</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <p><strong>Nombre:</strong> ${guest.fullName}</p>
                    <p><strong>Fecha de nacimiento:</strong> ${birthDate}</p>
                    <p><strong>Nacionalidad:</strong> ${guest.nationality}</p>
                    <p><strong>Dirección:</strong> ${guest.address || 'No especificada'}</p>
                    <p><strong>Parentesco:</strong> ${guest.relationship || 'No especificado'}</p>
                    <p><strong>Fecha de salida:</strong> ${checkoutDate}</p>
                    <p><strong>Tipo de documento:</strong> ${guest.documentType}</p>
                    <p><strong>Número de documento:</strong> ${guest.documentNumber}</p>
                </div>
                
                <div class="mt-4">
                    <h4 class="font-medium">Documento</h4>
                    <div class="mt-2 border p-2 rounded bg-gray-50">
                        <img src="${guest.documentPhoto}" alt="Documento" class="max-h-40 mx-auto">
                    </div>
                </div>
                
                <div class="mt-4">
                    <h4 class="font-medium">Firma</h4>
                    <div class="mt-2 border p-2 rounded bg-gray-50">
                        <img src="${guest.signature}" alt="Firma" class="max-h-20 mx-auto">
                    </div>
                </div>
            </div>
        `;
    }
    
    // Actualizar el contenido del modal
    content.innerHTML = html;
    
    // Mostrar el modal
    modal.classList.remove('hidden');
}

/**
 * Genera un PDF con los datos del formulario
 * @param {Object} formData - Datos del formulario
 */
function generatePDF(formData) {
    // Crear un nuevo documento PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurar fuente y tamaño
    doc.setFont('helvetica');
    doc.setFontSize(12);
    
    // Título
    doc.setFontSize(16);
    doc.text('Datos del Formulario', 20, 20);
    doc.setFontSize(12);
    
    // Información general
    doc.text('Información General:', 20, 35);
    doc.text(`Fecha de envío: ${new Date(formData.submissionDate).toLocaleDateString()}`, 20, 45);
    doc.text(`Apartamento: ${formData.apartment}`, 20, 55);
    doc.text(`Fecha de entrada: ${new Date(formData.checkInDate).toLocaleDateString()}`, 20, 65);
    doc.text(`Número de huéspedes: ${formData.guestsCount}`, 20, 75);
    
    // Información de cada huésped
    let yPos = 95;
    formData.guests.forEach((guest, index) => {
        // Verificar si necesitamos una nueva página
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text(`Huésped ${index + 1}`, 20, yPos);
        doc.setFontSize(12);
        
        yPos += 15;
        doc.text(`Nombre: ${guest.fullName}`, 20, yPos);
        yPos += 10;
        doc.text(`Fecha de nacimiento: ${new Date(guest.birthDate).toLocaleDateString()}`, 20, yPos);
        yPos += 10;
        doc.text(`Nacionalidad: ${guest.nationality}`, 20, yPos);
        yPos += 10;
        doc.text(`Dirección: ${guest.address || 'No especificada'}`, 20, yPos);
        yPos += 10;
        doc.text(`Parentesco: ${guest.relationship || 'No especificado'}`, 20, yPos);
        yPos += 10;
        doc.text(`Fecha de salida: ${guest.checkoutDate ? new Date(guest.checkoutDate).toLocaleDateString() : 'No especificada'}`, 20, yPos);
        yPos += 10;
        doc.text(`Tipo de documento: ${guest.documentType}`, 20, yPos);
        yPos += 10;
        doc.text(`Número de documento: ${guest.documentNumber}`, 20, yPos);
        
        yPos += 25;
    });
    
    // Guardar el PDF
    doc.save(`formulario_${formData.id}.pdf`);
}

/**
 * Función para guardar un nuevo envío de formulario
 * Esta función sería llamada desde form.js cuando se envía un formulario
 * @param {Object} formData - Datos del formulario
 */
function saveFormSubmission(formData) {
    // Generar un ID único para el formulario
    const formId = 'form_' + Date.now();
    
    // Añadir fecha de envío y ID
    const submission = {
        ...formData,
        id: formId,
        submissionDate: new Date().toISOString()
    };
    
    // Añadir a la lista de envíos
    formSubmissions.push(submission);
    
    // Ordenar por fecha (más reciente primero)
    formSubmissions.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
    
    // Los datos ya están guardados en Firestore
    
    // Si el panel de administración está abierto, actualizar la tabla
    if (!document.getElementById('admin-panel').classList.contains('hidden')) {
        applyFilters();
    }
    
    return formId;
}

// Exportar la función para uso en otros scripts
window.adminPanel = {
    // Credenciales de administrador (hash SHA-256)
    adminCredentials: {
        username: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // admin
        password: "9a4ec6f94a79d29a33ce56c0ad120ef0f00d83a0a7fc9a5b4a4fd12e97d4beeb"  // balcones22
    },
    
    // La función saveFormSubmission ya está definida globalmente
    saveFormSubmission: saveFormSubmission
}