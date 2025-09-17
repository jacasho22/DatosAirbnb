/**
 * Script para la página del formulario de check-in
 * Maneja la generación dinámica de formularios para cada huésped y el proceso de envío
 */

// Variables globales
let checkInData = null;
let currentGuestIndex = 0;
let guestForms = [];
let signatures = [];

// Helper: append debug messages to a visible debug box on the page
function debugLog(msg, level = 'info') {
    console[level](msg);
    try {
        let dbg = document.getElementById('form-debug-log');
        if (!dbg) {
            dbg = document.createElement('div');
            dbg.id = 'form-debug-log';
            dbg.style.position = 'fixed';
            dbg.style.right = '12px';
            dbg.style.bottom = '12px';
            dbg.style.maxWidth = '360px';
            dbg.style.maxHeight = '200px';
            dbg.style.overflow = 'auto';
            dbg.style.background = 'rgba(255,255,255,0.95)';
            dbg.style.border = '1px solid #ddd';
            dbg.style.padding = '8px';
            dbg.style.fontSize = '12px';
            dbg.style.zIndex = '9999';
            document.body.appendChild(dbg);
        }
        const p = document.createElement('div');
        p.textContent = `${new Date().toLocaleTimeString()} - ${msg}`;
        dbg.appendChild(p);
    } catch (e) {
        // ignore DOM errors
    }
}

// Importar las funciones necesarias de Firebase
// NOTE: don't import firebase-config at module top-level. It uses browser-only imports (https://) which
// cause Node's ESM loader to fail during unit tests. simulateFormSubmission dynamically imports
// './firebase-config.js' when needed so we avoid top-level import to keep this module testable.

// Exported initializer for the form page. Tests can import this without triggering auto-run effects.
export async function initFormPage() {
    try {
        debugLog('initFormPage');

        // Cargar los datos de check-in desde localStorage
        loadCheckInData();
        debugLog('Datos de check-in cargados: ' + JSON.stringify(checkInData));

        // Si no hay datos, redirigir a la página de inicio (solo si realmente no se inicializó)
        if (!checkInData) {
            debugLog('No hay datos de check-in, redirigiendo a index.html', 'warn');
            window.location.href = 'index.html';
            return;
        }

        // Mostrar información del apartamento y fecha (proteger si i18n no está disponible)
        try {
            displayApartmentInfo();
        } catch (err) {
            debugLog('displayApartmentInfo fallo, se continúa de todas formas: ' + err, 'warn');
        }

        // Inicializar los formularios de huéspedes
        try {
            initGuestForms();
        } catch (err) {
            debugLog('Error inicializando guest forms: ' + err, 'error');
        }

        // Configurar los botones de navegación
        setupNavigationButtons();

        // Configurar el formulario principal
        setupMainForm();

        // Configurar los modales
        setupModals();

        // Mostrar el primer formulario de huésped solo si existen formularios
        if (guestForms && guestForms.length > 0) {
            debugLog('Guest forms creados: ' + guestForms.length);
            showGuestForm(0);
            updateProgressBar();
        } else {
            debugLog('No se crearon formularios de huéspedes (guestForms vacío). Forzando generación mínima.', 'warn');
            // Intentar regenerar una vez más
            generateGuestForms();
            if (guestForms.length > 0) {
                showGuestForm(0);
                updateProgressBar();
            } else {
                // Fallback: crear un formulario mínimo para depuración
                debugLog('Fallback: creando formulario mínimo manualmente', 'warn');
                const guestFormsContainer = document.getElementById('guest-forms-container');
                if (guestFormsContainer) {
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'guest-form bg-white p-6 rounded-lg shadow-md';
                    fallbackDiv.innerHTML = '<p style="color:#333">Formulario de depuración: complete los datos aquí.</p>';
                    guestFormsContainer.appendChild(fallbackDiv);
                    guestForms = Array.from(document.querySelectorAll('.guest-form'));
                    showGuestForm(0);
                    updateProgressBar();
                }
            }
        }
    } catch (error) {
        console.error('Error en initFormPage:', error);
        throw error;
    }
}

// Export key functions for testing
export { generateGuestForms, showGuestForm, validateCurrentForm, simulateFormSubmission, initGuestForms, initializeSignatureCanvases };

/**
 * Carga los datos de check-in desde localStorage
 */
function loadCheckInData() {
    try {
        const data = localStorage.getItem('checkInData');
        console.log('Cargando datos de check-in desde localStorage');
        console.log('Datos en localStorage:', data);
        
        if (data) {
            checkInData = JSON.parse(data);
            console.log('Datos parseados:', checkInData);
            
            // Asegurarse de que guestsCount esté definido
            if (!checkInData.guestsCount && checkInData.numGuests) {
                checkInData.guestsCount = checkInData.numGuests;
            } else if (!checkInData.guestsCount) {
                checkInData.guestsCount = 2; // Valor por defecto
            }
            
            // Establecer el idioma guardado
            if (checkInData.language) {
                window.i18n.setLanguage(checkInData.language);
                // Forzar la actualización de los textos después de establecer el idioma
                setTimeout(() => window.i18n.updateTexts(), 100);
            }
        } else {
            console.error('No hay datos de check-in en localStorage');
            // Datos de prueba para desarrollo
            checkInData = {
                apartment: '1',
                checkInDate: '2023-06-15',
                guestsCount: 2,
                language: 'es'
            };
            console.log('Usando datos de prueba:', checkInData);
        }
    } catch (error) {
        console.error('Error al cargar datos desde localStorage:', error);
        // Datos de prueba en caso de error
        checkInData = {
            apartment: '1',
            checkInDate: '2023-06-15',
            guestsCount: 2,
            language: 'es'
        };
        console.log('Usando datos de prueba por error:', checkInData);
    }
}

/**
 * Muestra la información del apartamento y fecha en la página
 */
function displayApartmentInfo() {
    console.log('Mostrando información del apartamento');
    
    const apartmentInfo = document.getElementById('apartment-info');
    if (apartmentInfo && checkInData) {
        const apartmentText = checkInData.apartment === '1' ? 
            window.i18n.getText('apartment_1') : 
            window.i18n.getText('apartment_2');
        
        const checkInDate = new Date(checkInData.checkInDate).toLocaleDateString('es-ES');
        
        apartmentInfo.textContent = `${apartmentText} - ${checkInDate}`;
        console.log('Información del apartamento mostrada:', apartmentInfo.textContent);
    } else {
        console.error('No se pudo mostrar la información del apartamento:', {
            apartmentInfo: !!apartmentInfo,
            checkInData: checkInData
        });
    }
}

/**
 * Genera los formularios para cada huésped
 */
function generateGuestForms() {
    console.log('Iniciando generateGuestForms');
    
    const guestFormsContainer = document.getElementById('guest-forms-container');
    const template = document.getElementById('guest-template');
    
    console.log('Template encontrado:', template);
    console.log('Contenedor encontrado:', guestFormsContainer);
    
    if (!guestFormsContainer || !template || !checkInData) {
        console.error('Error al generar formularios:', {
            guestFormsContainer: !!guestFormsContainer,
            template: !!template,
            checkInData: checkInData
        });
        return;
    }
    
    const guestCount = checkInData.numGuests || checkInData.guestsCount;
    console.log('Generando formularios para', guestCount, 'huéspedes');
    
    // Asegurarse de que el contenedor sea visible
    guestFormsContainer.style.display = 'block';
    
    // Limpiar el contenedor
    guestFormsContainer.innerHTML = '';
    
    // Crear un formulario para cada huésped
    for (let i = 0; i < guestCount; i++) {
        console.log('Creando formulario para huésped', i + 1);
        
        try {
            // Crear un nuevo div para el formulario
            const formDiv = document.createElement('div');
            formDiv.className = 'guest-form bg-white p-6 rounded-lg shadow-md';
            formDiv.id = `guest-form-${i}`;
            formDiv.dataset.index = i;
            
            // Clonar el contenido del template
            const content = template.content.cloneNode(true);
            
            // Asignar ID único al canvas de firma
            const canvas = content.querySelector('.signature-canvas');
            if (canvas) {
                canvas.id = `signature-canvas-${i}`;
                console.log(`ID asignado al canvas: signature-canvas-${i}`);
            } else {
                console.error('No se encontró el canvas en el template');
            }
            
            // Asignar índice al botón de borrar firma
            const clearButton = content.querySelector('.clear-signature');
            if (clearButton) {
                clearButton.dataset.index = i;
                clearButton.addEventListener('click', function() { 
                    clearSignature(i); 
                });
            } else {
                console.error('No se encontró el botón de borrar firma en el template');
            }
            
            // Añadir el contenido clonado al div
            formDiv.appendChild(content);
            
            // Actualizar el título con el número de huésped
            const title = formDiv.querySelector('.guest-title');
            if (title) {
                title.textContent = `${window.i18n.getText('guest_info')} ${i + 1}`;
            }
            
            // Añadir el formulario al contenedor
            guestFormsContainer.appendChild(formDiv);
            
            // Ocultar todos los formularios excepto el primero
            if (i > 0) {
                formDiv.style.display = 'none';
            } else {
                formDiv.style.display = 'block';
            }
            
            console.log(`Formulario ${i + 1} creado correctamente`);
        } catch (error) {
            console.error(`Error al crear el formulario ${i + 1}:`, error);
        }
    }
    
    // Guardar referencias a los formularios
    guestForms = Array.from(document.querySelectorAll('.guest-form'));
    console.log('Formularios creados:', guestForms.length);
    
    // Configurar eventos para los formularios
    setupGuestFormEvents();
}

/**
 * Configura los eventos para los formularios de huéspedes
 */
function setupGuestFormEvents() {
    console.log('Configurando eventos para formularios de huéspedes');
    
    guestForms.forEach((form, index) => {
        // Configurar el campo de fecha de nacimiento para mostrar/ocultar el campo de parentesco
        const birthDateInput = form.querySelector('input[name="birth-date"]');
        const relationshipField = form.querySelector('.relationship-field');
        
        if (birthDateInput && relationshipField) {
            birthDateInput.addEventListener('change', function() {
                const birthDate = new Date(this.value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                
                // Mostrar campo de parentesco solo si es menor de 18 años
                if (age < 18) {
                    relationshipField.style.display = 'block';
                } else {
                    relationshipField.style.display = 'none';
                }
            });
        }
    });
}

/**
 * Inicializa los formularios de huéspedes
 */
function initGuestForms() {
    console.log('Inicializando formularios de huéspedes');
    
    // Generar los formularios
    generateGuestForms();
    
    // Configurar eventos
    setupGuestFormEvents();
    
    // Inicializar los canvas de firma
    setTimeout(() => {
        initializeSignatureCanvases();
    }, 100);
}

/**
 * Inicializa los canvas de firma para todos los formularios
 */
function initializeSignatureCanvases() {
    console.log('Inicializando canvas de firma');
    
    signatures = []; // Reiniciar el array de firmas
    
    guestForms.forEach((form, index) => {
        const canvas = form.querySelector(`#signature-canvas-${index}`);
        if (canvas) {
            console.log(`Inicializando canvas ${index}`);
            
            // Configurar el tamaño del canvas
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            
            let isDrawing = false;
            let lastX = 0;
            let lastY = 0;
            
            // Eventos para mouse
            canvas.addEventListener('mousedown', (e) => {
                isDrawing = true;
                const rect = canvas.getBoundingClientRect();
                lastX = e.clientX - rect.left;
                lastY = e.clientY - rect.top;
            });
            
            canvas.addEventListener('mousemove', (e) => {
                if (!isDrawing) return;
                
                const rect = canvas.getBoundingClientRect();
                const currentX = e.clientX - rect.left;
                const currentY = e.clientY - rect.top;
                
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(currentX, currentY);
                ctx.stroke();
                
                lastX = currentX;
                lastY = currentY;
            });
            
            canvas.addEventListener('mouseup', () => {
                isDrawing = false;
            });
            
            canvas.addEventListener('mouseout', () => {
                isDrawing = false;
            });
            
            // Eventos para touch (dispositivos móviles)
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                isDrawing = true;
                const rect = canvas.getBoundingClientRect();
                const touch = e.touches[0];
                lastX = touch.clientX - rect.left;
                lastY = touch.clientY - rect.top;
            });
            
            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (!isDrawing) return;
                
                const rect = canvas.getBoundingClientRect();
                const touch = e.touches[0];
                const currentX = touch.clientX - rect.left;
                const currentY = touch.clientY - rect.top;
                
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(currentX, currentY);
                ctx.stroke();
                
                lastX = currentX;
                lastY = currentY;
            });
            
            canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                isDrawing = false;
            });
            
            // Guardar referencia al canvas
            signatures[index] = canvas;
            
            console.log(`Canvas ${index} inicializado correctamente`);
        } else {
            console.error(`No se encontró el canvas para el formulario ${index}`);
        }
    });
}

/**
 * Borra la firma del canvas especificado
 * @param {number} index - Índice del canvas a borrar
 */
function clearSignature(index) {
    console.log(`Borrando firma del canvas ${index}`);
    
    const canvas = signatures[index];
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log(`Firma ${index} borrada`);
    } else {
        console.error(`No se encontró el canvas ${index} para borrar`);
    }
}

/**
 * Verifica si la firma está vacía
 * @param {number} index - Índice del canvas a verificar
 * @returns {boolean} - True si está vacía, false si tiene contenido
 */
function isSignatureEmpty(index) {
    const canvas = signatures[index];
    if (!canvas) return true;
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Verificar si hay píxeles no transparentes
    for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] !== 0) {
            return false; // Hay contenido
        }
    }
    
    return true; // Está vacía
}

/**
 * Configura los botones de navegación
 */
function setupNavigationButtons() {
    console.log('Configurando botones de navegación');
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentGuestIndex > 0) {
                showGuestForm(currentGuestIndex - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // Validar el formulario actual antes de continuar
            if (validateCurrentForm()) {
                if (currentGuestIndex < guestForms.length - 1) {
                    showGuestForm(currentGuestIndex + 1);
                } else {
                    // Es el último formulario, mostrar modal de confirmación
                    showConfirmationModal();
                }
            }
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Validar todos los formularios
            let allValid = true;
            for (let i = 0; i < guestForms.length; i++) {
                currentGuestIndex = i;
                if (!validateCurrentForm()) {
                    allValid = false;
                    showGuestForm(i); // Mostrar el formulario con errores
                    break;
                }
            }
            
            if (allValid) {
                showConfirmationModal();
            }
        });
    }
}

/**
 * Configura el formulario principal
 */
function setupMainForm() {
    console.log('Configurando formulario principal');
    
    const form = document.getElementById('checkin-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Envío del formulario interceptado');
        });
    }
}

/**
 * Configura los modales
 */
function setupModals() {
    console.log('Configurando modales');
    
    // Modal de confirmación
    const confirmModal = document.getElementById('confirmation-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const confirmBtn = document.getElementById('confirm-btn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (confirmModal) {
                confirmModal.style.display = 'none';
            }
        });
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            if (confirmModal) {
                confirmModal.style.display = 'none';
            }
            try {
                await submitForm();
            } catch (e) {
                console.error('Error en submitForm desde confirmBtn:', e);
            }
        });
    }
    
    // Modal de éxito
    const successModal = document.getElementById('success-modal');
    const successBtn = document.getElementById('success-btn');
    
    if (successBtn) {
        successBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            confirmModal.style.display = 'none';
        }
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
}

/**
 * Muestra el formulario del huésped especificado
 * @param {number} index - Índice del formulario a mostrar
 */
function showGuestForm(index) {
    console.log(`Mostrando formulario del huésped ${index + 1}`);
    
    if (index < 0 || index >= guestForms.length) {
        console.error('Índice de formulario inválido:', index);
        return;
    }
    
    // Ocultar todos los formularios
    guestForms.forEach(form => {
        form.style.display = 'none';
    });
    
    // Mostrar el formulario actual
    guestForms[index].style.display = 'block';
    currentGuestIndex = index;

    // Visual debug: destacar el formulario mostrado para asegurar que sea visible
    try {
        const el = guestForms[index];
        // Añadir un borde temporal y sombra para hacerlo evidente
        el.style.border = '2px dashed #ff0000';
        el.style.boxShadow = '0 6px 18px rgba(255,0,0,0.15)';
        el.style.padding = el.style.padding || '16px';

        // Forzar foco y scroll al formulario
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
        setTimeout(() => {
            try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { /* ignore */ }
        }, 50);

        // Registrar estilos computados para depuración
        const cs = window.getComputedStyle(el);
        debugLog(`showGuestForm: computed display=${cs.display}, visibility=${cs.visibility}, opacity=${cs.opacity}`);

        // Registrar estado de los ancestros principales
        let p = el.parentElement;
        let depth = 0;
        while (p && depth < 6) {
            const pcs = window.getComputedStyle(p);
            debugLog(`ancestor ${p.tagName}.${p.className || ''}: display=${pcs.display}, visibility=${pcs.visibility}, opacity=${pcs.opacity}`);
            p = p.parentElement;
            depth++;
        }
    } catch (err) {
        console.error('Error aplicando visual debug al formulario:', err);
    }
    
    // Actualizar la barra de progreso y botones
    updateProgressBar();
    updateNavigationButtons();
    
    console.log(`Formulario ${index + 1} mostrado`);
}

/**
 * Actualiza la barra de progreso
 */
function updateProgressBar() {
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar && guestForms.length > 0) {
        const progress = ((currentGuestIndex + 1) / guestForms.length) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    if (progressText && guestForms.length > 0) {
        const text = window.i18n.getText('progress')
            .replace('{current}', currentGuestIndex + 1)
            .replace('{total}', guestForms.length);
        progressText.textContent = text;
    }
}

/**
 * Actualiza el estado de los botones de navegación
 */
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    if (prevBtn) {
        if (currentGuestIndex === 0) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'inline-block';
        }
    }
    
    if (nextBtn && submitBtn) {
        if (currentGuestIndex === guestForms.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            submitBtn.style.display = 'none';
        }
    }
}

/**
 * Valida el formulario actual
 * @returns {boolean} - True si es válido, false si hay errores
 */
function validateCurrentForm() {
    console.log(`Validando formulario ${currentGuestIndex + 1}`);
    
    const currentForm = guestForms[currentGuestIndex];
    if (!currentForm) {
        console.error('No se encontró el formulario actual');
        return false;
    }
    
    let isValid = true;
    const errors = [];
    
    // Validar campos obligatorios
    const requiredFields = [
        'full-name', 'gender', 'birth-date', 'nationality', 
        'address', 'municipality', 'postal-code', 'province', 
        'country', 'phone', 'email', 'document-type', 'document-number'
    ];
    
    requiredFields.forEach(fieldName => {
        const field = currentForm.querySelector(`[name="${fieldName}"]`);
        if (field && !field.value.trim()) {
            isValid = false;
            errors.push(`${fieldName}: ${window.i18n.getText('required_field')}`);
            field.classList.add('border-red-500');
        } else if (field) {
            field.classList.remove('border-red-500');
        }
    });
    
    // Validar fecha de nacimiento
    const birthDateField = currentForm.querySelector('[name="birth-date"]');
    if (birthDateField && birthDateField.value) {
        const birthDate = new Date(birthDateField.value);
        const today = new Date();
        
        if (birthDate > today) {
            isValid = false;
            errors.push(`birth-date: ${window.i18n.getText('invalid_date')}`);
            birthDateField.classList.add('border-red-500');
        } else {
            birthDateField.classList.remove('border-red-500');
        }
    }
    
    // Validar foto del documento
    // Note: document photo field removed from the form; skip validation here
    
    // Validar firma
    if (isSignatureEmpty(currentGuestIndex)) {
        isValid = false;
        errors.push(`signature: ${window.i18n.getText('signature_required')}`);
        const canvas = signatures[currentGuestIndex];
        if (canvas) {
            canvas.classList.add('border-red-500');
        }
    } else {
        const canvas = signatures[currentGuestIndex];
        if (canvas) {
            canvas.classList.remove('border-red-500');
        }
    }
    
    if (!isValid) {
        console.error('Errores de validación:', errors);
        alert('Por favor, completa todos los campos obligatorios.');
    } else {
        console.log(`Formulario ${currentGuestIndex + 1} válido`);
    }
    
    return isValid;
}

/**
 * Muestra el modal de confirmación
 */
function showConfirmationModal() {
    console.log('Mostrando modal de confirmación');
    
    const confirmModal = document.getElementById('confirmation-modal');
    if (confirmModal) {
        confirmModal.style.display = 'flex';
    } else {
        console.error('No se encontró el modal de confirmación');
    }
}

/**
 * Envía el formulario
 */
async function submitForm() {
    console.log('Enviando formulario');

    try {
        // Recopilar todos los datos del formulario
        const formData = new FormData();

        // Añadir datos básicos
        formData.append('apartment', checkInData.apartment);
        formData.append('checkInDate', checkInData.checkInDate);
        formData.append('guestsCount', guestForms.length);

        // Recoger promesas para las conversiones asíncronas (canvas.toBlob)
        const blobPromises = [];

        // Añadir datos de cada huésped
        guestForms.forEach((form, index) => {
            console.log(`Recopilando datos del huésped ${index + 1}`);

            // Campos de texto
            const textFields = [
                'full-name', 'gender', 'birth-date', 'nationality',
                'address', 'municipality', 'postal-code', 'province',
                'country', 'phone', 'email', 'relationship',
                'document-type', 'document-number'
            ];

            textFields.forEach(fieldName => {
                const field = form.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    formData.append(`guest_${index}_${fieldName}`, field.value || '');
                }
            });

            // Foto del documento
            // Document photo field removed: skipping

            // Firma: convertir el canvas a Blob y añadir la promesa para esperar su finalización
            const canvas = signatures[index];
            if (canvas) {
                const p = new Promise((resolve) => {
                    try {
                        canvas.toBlob((blob) => {
                            if (blob) {
                                // Añadir Blob al FormData con un nombre de archivo
                                formData.append(`guest_${index}_signature`, blob, `signature_${index}.png`);
                            } else {
                                console.error(`toBlob devolvió null para el canvas ${index}`);
                            }
                            resolve();
                        }, 'image/png');
                    } catch (e) {
                        console.error(`Error al convertir el canvas ${index} a Blob:`, e);
                        resolve();
                    }
                });
                blobPromises.push(p);
            }
        });

        // Esperar a que todas las operaciones asíncronas (toBlob) terminen
        await Promise.all(blobPromises);

        // Enviar los datos (simulateFormSubmission manejará Blobs adecuadamente)
        await simulateFormSubmission(formData);

    } catch (error) {
        console.error('Error al enviar el formulario:', error);
        alert('Hubo un error al enviar el formulario. Por favor, inténtelo de nuevo.');
        throw error;
    }
}

/**
 * Convierte las fotos de documentos a base64
 * @param {FormData} formData - Los datos del formulario
 * @returns {Promise} - Promesa que se resuelve cuando todas las imágenes están convertidas
 */
function convertDocumentPhotosToBase64(formData) {
    return new Promise((resolve, reject) => {
        const promises = [];
        
        for (let i = 0; i < guestForms.length; i++) {
            const file = formData.get(`guest_${i}_documentPhoto`);
            
            if (file && file instanceof File) {
                const promise = new Promise((resolveFile, rejectFile) => {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        formData.set(`guest_${i}_documentPhoto`, e.target.result);
                        console.log(`Imagen del documento convertida a base64 para huésped ${i+1}`);
                        resolveFile();
                    };
                    
                    reader.onerror = function(error) {
                        console.error(`Error al convertir imagen del documento para huésped ${i+1}:`, error);
                        formData.set(`guest_${i}_documentPhoto`, 'error-photo');
                        resolveFile(); // Resolver aunque haya error para continuar
                    };
                    
                    reader.readAsDataURL(file);
                });
                
                promises.push(promise);
            }
        }
        
        if (promises.length === 0) {
            resolve(); // No hay imágenes que convertir
        } else {
            Promise.all(promises).then(resolve).catch(reject);
        }
    });
}

/**
 * Simula el envío del formulario
 * @param {FormData} formData - Los datos del formulario
 */
async function simulateFormSubmission(formData) {
    console.log('Iniciando simulateFormSubmission');
    
    try {
        // Importar Firebase y guardar en Firestore
        const { saveFormToFirestore } = await import('./firebase-config.js');
        
        // Crear un objeto con los datos del formulario
        const submissionData = {
            apartment: formData.get('apartment'),
            checkInDate: formData.get('checkInDate'),
            guestsCount: parseInt(formData.get('guestsCount'), 10),
            guests: []
        };
        
        // Validar datos básicos
        if (!submissionData.apartment || !submissionData.checkInDate || !submissionData.guestsCount) {
            throw new Error('Faltan datos básicos del formulario');
        }
        
        console.log('Datos básicos del formulario validados:', submissionData);
        
        // Añadir los datos de cada huésped
        for (let i = 0; i < guestForms.length; i++) {
            console.log(`Procesando datos del huésped ${i+1}`);
            
            // Obtener y validar los datos requeridos del huésped
            const requiredFields = ['full-name', 'birth-date', 'nationality', 'document-type', 'document-number'];
            const guestData = {};
            
            for (const field of requiredFields) {
                const value = formData.get(`guest_${i}_${field}`);
                if (!value) {
                    throw new Error(`Falta el campo requerido ${field} para el huésped ${i+1}`);
                }
                guestData[field.replace('-', '')] = value;
            }
            
            // Añadir campos opcionales
            const optionalFields = [
                'gender', 'address', 'municipality', 'postal-code', 'province',
                'country', 'phone', 'email', 'relationship'
            ];
            
            for (const field of optionalFields) {
                const value = formData.get(`guest_${i}_${field}`);
                if (value) {
                    guestData[field.replace('-', '')] = value;
                }
            }
            
            // Validar firma (document photo is optional)
            const signature = formData.get(`guest_${i}_signature`);
            if (!signature) {
                throw new Error(`Falta la firma para el huésped ${i+1}`);
            }
            guestData.signature = signature;

            // Document photo is optional. If provided, include it; otherwise skip.
            const docPhoto = formData.get(`guest_${i}_documentPhoto`);
            if (docPhoto) {
                guestData.documentPhoto = docPhoto;
            }
            
            submissionData.guests.push(guestData);
            console.log(`Datos del huésped ${i+1} validados y añadidos`);
        }
        
        // Validar que haya al menos un huésped
        if (submissionData.guests.length === 0) {
            throw new Error('No hay datos de huéspedes para guardar');
        }
        
        // Intentar guardar en Firestore
        console.log('Intentando guardar en Firestore...');
        let success = false;
        // During tests we may want to skip actual Firestore writes
        if (typeof window !== 'undefined' && window.__TEST_MODE) {
            console.log('TEST MODE: Skipping Firestore write');
            success = true;
        } else {
            const save = await saveFormToFirestore(submissionData);
            success = save;
        }
        
        if (success) {
            console.log('Datos guardados exitosamente en Firestore');
            
            // Limpiar los datos de localStorage
            localStorage.removeItem('checkInData');
            
            // Mostrar modal de éxito
            const successModal = document.getElementById('success-modal');
            if (successModal) {
                successModal.style.display = 'flex';
                console.log('Modal de éxito mostrado');
            } else {
                console.error('No se encontró el modal de éxito');
                alert('Formulario enviado con éxito');
            }
        } else {
            throw new Error('No se pudo guardar el formulario en Firestore');
        }
    } catch (error) {
        console.error('Error al procesar o guardar el formulario:', error);
        
        // Mostrar mensaje de error específico al usuario
        let errorMessage = 'Hubo un error al guardar los datos. ';
        if (error.message.includes('Falta')) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Por favor, verifique los datos e inténtelo de nuevo.';
        }
        
        alert(errorMessage);
        throw error; // Propagar el error para manejo adicional si es necesario
    }
}

// Manejar el cambio de tamaño de la ventana para ajustar los canvas
window.addEventListener('resize', () => {
    // Reinicializar los canvas de firma
    initializeSignatureCanvases();
});