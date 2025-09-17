/**
 * Script para el panel de administración
 * Maneja la autenticación, visualización y exportación de formularios
 */

import { db } from './firebase-config.js';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Credenciales de administrador
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'balcones22';

// Variables globales
let formSubmissions = [];
let filteredSubmissions = [];

// Defensive guard: only initialize admin behaviors when the admin UI is present.
// This prevents admin code from running on the public pages (e.g. index.html)
// which previously caused "Error al cargar los formularios..." alerts.
try {
    const adminPanelExists = typeof document !== 'undefined' && document.getElementById && document.getElementById('admin-panel');
    if (adminPanelExists) {
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                console.log('Iniciando carga de datos...');
                // Configurar el formulario de login
                setupLoginForm();
                
                // Configurar los botones y eventos del panel de administración
                setupAdminPanel();
                
                // Configurar el modal de detalles
                setupDetailsModal();
                
                // Cargar los datos de formularios enviados desde Firestore
                await loadFormSubmissions();
                console.log('Datos cargados exitosamente');
            } catch (error) {
                console.error('Error al cargar los datos:', error);
            }
        });
    } else {
        console.log('admin.js: admin panel not present — initialization skipped');
    }
} catch (e) {
    // If document isn't available (server-side), skip initialization silently
    console.log('admin.js: initialization guard failed, skipping admin init');
}

/**
 * Carga los formularios desde Firestore
 */
async function loadFormSubmissions() {
    try {
        console.log('Obteniendo datos de Firestore...');
        const formSubmissionsRef = collection(db, 'formSubmissions');
        const q = query(
            formSubmissionsRef,
            where('status', '==', 'active'),
            orderBy('submissionDate', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.log('No hay datos en la colección formSubmissions');
            formSubmissions = [];
            filteredSubmissions = [];
            updateSubmissionsTable();
            return;
        }
        
        formSubmissions = [];
        querySnapshot.forEach(doc => {
            try {
                const data = doc.data();
                console.log('Procesando documento:', { id: doc.id });
                
                // Validar datos requeridos
                if (!data.apartment || !data.checkInDate || !data.guests) {
                    console.warn('Documento incompleto:', doc.id);
                    return;
                }
                
                // Formatear fechas
                const formattedData = {
                    ...data,
                    id: doc.id,
                    submissionDate: data.submissionDate ? new Date(data.submissionDate) : new Date(),
                    checkInDate: data.checkInDate ? new Date(data.checkInDate) : new Date()
                };
                
                formSubmissions.push(formattedData);
                console.log('Documento procesado correctamente:', { id: doc.id });
            } catch (docError) {
                console.error('Error al procesar documento:', { id: doc.id, error: docError });
            }
        });
        
        console.log('Total de documentos válidos cargados:', formSubmissions.length);
        
        // Ordenar por fecha de envío más reciente
        formSubmissions.sort((a, b) => b.submissionDate - a.submissionDate);
        
        // Actualizar la lista filtrada
        filteredSubmissions = [...formSubmissions];
        
        // Actualizar la interfaz
        updateSubmissionsTable();
        applyFilters();
    } catch (error) {
        console.error('Error al cargar los formularios:', error);
        // Replace blocking alert with a non-blocking banner inside the admin UI (if present)
        try {
            const adminPanel = document.getElementById('admin-panel');
            if (adminPanel) {
                const bannerId = 'admin-error-banner';
                let banner = document.getElementById(bannerId);
                const message = 'Error al cargar los formularios. Por favor, recarga la página o comprueba la configuración de Firebase.';
                if (!banner) {
                    banner = document.createElement('div');
                    banner.id = bannerId;
                    banner.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
                    banner.style.marginBottom = '1rem';
                    banner.textContent = message;
                    // Insert banner at top of admin panel
                    adminPanel.insertBefore(banner, adminPanel.firstChild);
                } else {
                    banner.textContent = message;
                    banner.style.display = 'block';
                }
            } else {
                // If adminPanel isn't present, just log the message to console (no alert)
                console.warn('Admin panel not present to show error banner');
            }
        } catch (uiErr) {
            console.error('Error mostrando banner de error en admin UI:', uiErr);
        }
        // Do not rethrow to avoid an alert or unhandled rejection bubbling up
        return;
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
            
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                // Guardar en sessionStorage
                sessionStorage.setItem('adminAuthenticated', 'true');
                
                // Ocultar la pantalla de login y mostrar el panel de administración
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('admin-panel').classList.remove('hidden');
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
// La función verifyCredentials ya no es necesaria ya que usamos Firebase Auth

/**
 * Configura los eventos y botones del panel de administración
 */
function setupAdminPanel() {
    // Configurar el botón de cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        // Listener único y claro para cerrar sesión
        logoutBtn.addEventListener('click', () => {
            // Limpiar sessionStorage
            sessionStorage.removeItem('adminAuthenticated');

            // Ocultar el panel de administración y mostrar la pantalla de login
            const adminPanel = document.getElementById('admin-panel');
            const loginScreen = document.getElementById('login-screen');
            if (adminPanel) adminPanel.classList.add('hidden');
            if (loginScreen) loginScreen.classList.remove('hidden');

            // Limpiar los campos del formulario de login y ocultar errores
            const usernameEl = document.getElementById('username');
            const passwordEl = document.getElementById('password');
            const loginError = document.getElementById('login-error');
            if (usernameEl) usernameEl.value = '';
            if (passwordEl) passwordEl.value = '';
            if (loginError) loginError.classList.add('hidden');
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
        emptyRow.id = 'no-data-message';
        emptyRow.className = 'submissions-empty-row';
        emptyRow.innerHTML = `
            <td colspan="4" class="py-4 text-center text-gray-500">No hay formularios enviados todavía</td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Eliminar mensaje de no hay datos si existe
    const noDataMessage = document.getElementById('no-data-message');
    if (noDataMessage) {
        noDataMessage.remove();
    }
    
    // Añadir filas para cada formulario
    filteredSubmissions.forEach(form => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        // Formatear la fecha
        let formattedDate = 'Fecha no disponible';
        try {
            if (form.submissionDate) {
                formattedDate = new Date(form.submissionDate).toLocaleDateString();
            }
            console.log('Fecha formateada:', formattedDate);
        } catch (error) {
            console.error('Error al formatear la fecha:', error);
        }
        
        row.innerHTML = `
            <td class="py-2 px-4 border-b">${formattedDate}</td>
            <td class="py-2 px-4 border-b">${form.apartment === '1' ? 'Residencial Camposol' : 'Piso Ramón Gallud'}</td>
            <td class="py-2 px-4 border-b">${form.guests ? form.guests.length : form.guestsCount || 0}</td>
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
async function deleteForm(formId) {
    if (!formId) return;
    
    // Confirmar antes de eliminar
    if (confirm('¿Estás seguro de que deseas eliminar este formulario? Esta acción no se puede deshacer.')) {
            try {
                // Eliminar el documento de Firestore (API modular)
                const docRef = doc(db, 'formSubmissions', formId);
                await deleteDoc(docRef);

                // Actualizar la variable global
                formSubmissions = formSubmissions.filter(form => form.id !== formId);

                // Aplicar filtros y actualizar la tabla
                applyFilters();

                // Mostrar mensaje de éxito
                alert('Formulario eliminado correctamente');
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
    let submissionDate = 'Fecha no disponible';
    let checkInDate = 'Fecha no disponible';
    
    try {
        if (form.submissionDate) {
            submissionDate = new Date(form.submissionDate).toLocaleDateString();
        }
        if (form.checkInDate) {
            checkInDate = new Date(form.checkInDate).toLocaleDateString();
        }
        console.log('Fechas formateadas:', { submissionDate, checkInDate });
    } catch (error) {
        console.error('Error al formatear las fechas:', error);
    }
    
    // Construir el contenido del modal
    let html = `
        <div class="bg-gray-100 p-4 rounded-md mb-4">
            <h3 class="font-semibold">Información general</h3>
            <div class="flex items-center mb-2">
                <label class="inline-block w-40 font-medium">Número de Referencia:</label>
                <input type="text" id="reference-number" class="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value="${form.referenceNumber || ''}">
                <button id="save-reference-btn" data-form-id="${formId}" class="ml-2 bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 transition duration-300">Guardar</button>
            </div>
            <p><strong>Fecha de envío:</strong> ${submissionDate}</p>
            <p><strong>Apartamento:</strong> ${form.apartment === '1' ? 'Residencial Camposol' : 'Piso Ramón Gallud'}</p>
            <p><strong>Fecha de entrada:</strong> ${checkInDate}</p>
            <p><strong>Número de huéspedes:</strong> ${form.guestsCount}</p>
        </div>
    `;
    
    // Añadir información de cada huésped
    if (form.guests && Array.isArray(form.guests)) {
        for (let i = 0; i < form.guests.length; i++) {
            const guest = form.guests[i];
            let birthDate = 'Fecha no disponible';
            let checkoutDate = 'No especificada';
            
            try {
                if (guest.birthDate) {
                    birthDate = new Date(guest.birthDate).toLocaleDateString();
                }
                if (guest.checkoutDate) {
                    checkoutDate = new Date(guest.checkoutDate).toLocaleDateString();
                }
            } catch (error) {
                console.error(`Error al formatear las fechas del huésped ${i + 1}:`, error);
            }
        
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
                    <div class="mt-2 border p-2 rounded bg-gray-50 text-center">
                        ${guest.documentPhoto ? `<img src="${guest.documentPhoto}" alt="Documento" class="max-h-40 mx-auto">` : `<p class="text-sm text-gray-500">No hay foto del documento</p>`}
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
    
    // Configurar el botón para guardar el número de referencia
    const saveReferenceBtn = document.getElementById('save-reference-btn');
    if (saveReferenceBtn) {
        saveReferenceBtn.addEventListener('click', async () => {
            const formId = saveReferenceBtn.dataset.formId;
            const referenceNumber = document.getElementById('reference-number').value;

            // Actualizar en Firestore (API modular)
            try {
                const docRef = doc(db, 'formSubmissions', formId);
                await updateDoc(docRef, { referenceNumber });

                // Actualizar en la variable local
                const formIndex = formSubmissions.findIndex(f => f.id === formId);
                if (formIndex !== -1) {
                    formSubmissions[formIndex].referenceNumber = referenceNumber;
                }

                // Mostrar mensaje de éxito
                alert('Número de referencia guardado correctamente');
            } catch (error) {
                console.error('Error al guardar el número de referencia:', error);
                alert('Ocurrió un error al guardar el número de referencia');
            }
        });
    }
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
    // Incluir el número de referencia si existe
    let yPos = 45;
    if (formData.referenceNumber) {
        doc.text(`Número de Referencia: ${formData.referenceNumber}`, 20, yPos);
        yPos += 10;
    }
    doc.text(`Fecha de envío: ${new Date(formData.submissionDate).toLocaleDateString()}`, 20, yPos);
    yPos += 10;
    doc.text(`Apartamento: ${formData.apartment === '1' ? 'Residencial Camposol' : 'Piso Ramón Gallud'}`, 20, yPos);
    yPos += 10;
    doc.text(`Fecha de entrada: ${new Date(formData.checkInDate).toLocaleDateString()}`, 20, yPos);
    yPos += 10;
    doc.text(`Número de huéspedes: ${formData.guestsCount}`, 20, yPos);
    yPos += 20;
    
    // Información de cada huésped
    yPos = 95;
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
}