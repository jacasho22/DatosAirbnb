/**
 * Script para la página del formulario de check-in
 * Maneja la generación dinámica de formularios para cada huésped y el proceso de envío
 */

// Variables globales
let checkInData = null;
let currentGuestIndex = 0;
let guestForms = [];
let signatures = [];

document.addEventListener('DOMContentLoaded', () => {
    // Cargar los datos de check-in desde localStorage
    loadCheckInData();
    
    // Si no hay datos, redirigir a la página de inicio
    if (!checkInData) {
        window.location.href = 'index.html';
        return;
    }
    
    // Mostrar información del apartamento y fecha
    displayApartmentInfo();
    
    // Generar los formularios para cada huésped
    generateGuestForms();
    
    // Configurar los botones de navegación
    setupNavigationButtons();
    
    // Configurar el formulario principal
    setupMainForm();
    
    // Configurar los modales
    setupModals();
    
    // Mostrar el primer formulario de huésped
    showGuestForm(0);
    updateProgressBar();
});

/**
 * Carga los datos de check-in desde localStorage
 */
function loadCheckInData() {
    const data = localStorage.getItem('checkInData');
    
    if (data) {
        checkInData = JSON.parse(data);
        
        // Establecer el idioma guardado
        if (checkInData.language) {
            window.i18n.setLanguage(checkInData.language);
            // Forzar la actualización de los textos después de establecer el idioma
            setTimeout(() => window.i18n.updateTexts(), 100);
        }
    }
}

/**
 * Muestra la información del apartamento y fecha de entrada
 */
function displayApartmentInfo() {
    const apartmentInfo = document.getElementById('apartment-info');
    
    if (apartmentInfo && checkInData) {
        const apartmentText = window.i18n.getText(
            checkInData.apartment === '1' ? 'apartment_1' : 'apartment_2'
        );
        
        // Formatear la fecha según el idioma actual
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Date(checkInData.checkInDate).toLocaleDateString(
            window.i18n.getCurrentLanguage() === 'es' ? 'es-ES' : 'en-US',
            dateOptions
        );
        
        apartmentInfo.textContent = `${apartmentText} - ${formattedDate}`;
    }
}

/**
 * Genera los formularios para cada huésped
 */
function generateGuestForms() {
    const guestFormsContainer = document.getElementById('guest-forms');
    const template = document.getElementById('guest-template');
    
    if (!guestFormsContainer || !template || !checkInData) {
        return;
    }
    
    // Limpiar el contenedor
    guestFormsContainer.innerHTML = '';
    
    // Crear un formulario para cada huésped
    for (let i = 0; i < checkInData.guestsCount; i++) {
        // Clonar la plantilla
        const guestForm = template.content.cloneNode(true);
        
        // Actualizar el título con el número de huésped
        const guestTitle = guestForm.querySelector('.guest-title');
        if (guestTitle) {
            guestTitle.textContent = `${window.i18n.getText('guest_info')} ${i + 1}`;
        }
        
        // Añadir un ID único al formulario
        const formDiv = guestForm.querySelector('.guest-form');
        if (formDiv) {
            formDiv.id = `guest-form-${i}`;
            formDiv.dataset.index = i;
            
            // Ocultar todos los formularios excepto el primero
            if (i > 0) {
                formDiv.classList.add('hidden');
            }
        }
        
        // Configurar el canvas para la firma
        const canvas = guestForm.querySelector('.signature-canvas');
        if (canvas) {
            canvas.id = `signature-canvas-${i}`;
        }
        
        // Configurar el botón para borrar la firma
        const clearButton = guestForm.querySelector('.clear-signature');
        if (clearButton) {
            clearButton.dataset.index = i;
            clearButton.addEventListener('click', function() {
                const index = parseInt(this.dataset.index, 10);
                clearSignature(index);
            });
        }
        
        // Añadir el formulario al contenedor
        guestFormsContainer.appendChild(guestForm);
    }
    
    // Guardar referencias a los formularios
    guestForms = Array.from(document.querySelectorAll('.guest-form'));
    
    // Inicializar los canvas de firma
    initializeSignatureCanvases();
}

/**
 * Inicializa los canvas para las firmas digitales
 */
function initializeSignatureCanvases() {
    signatures = [];
    
    for (let i = 0; i < checkInData.guestsCount; i++) {
        const canvas = document.getElementById(`signature-canvas-${i}`);
        
        if (canvas) {
            // Ajustar el tamaño del canvas
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            
            const ctx = canvas.getContext('2d');
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#000';
            
            let drawing = false;
            let lastX = 0;
            let lastY = 0;
            
            // Eventos para dibujar en el canvas
            canvas.addEventListener('mousedown', (e) => {
                drawing = true;
                const rect = canvas.getBoundingClientRect();
                lastX = e.clientX - rect.left;
                lastY = e.clientY - rect.top;
            });
            
            canvas.addEventListener('mousemove', (e) => {
                if (!drawing) return;
                
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
                
                lastX = x;
                lastY = y;
            });
            
            canvas.addEventListener('mouseup', () => {
                drawing = false;
            });
            
            canvas.addEventListener('mouseleave', () => {
                drawing = false;
            });
            
            // Eventos táctiles para dispositivos móviles
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const rect = canvas.getBoundingClientRect();
                const touch = e.touches[0];
                lastX = touch.clientX - rect.left;
                lastY = touch.clientY - rect.top;
                drawing = true;
            });
            
            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (!drawing) return;
                
                const rect = canvas.getBoundingClientRect();
                const touch = e.touches[0];
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
                
                lastX = x;
                lastY = y;
            });
            
            canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                drawing = false;
            });
            
            // Guardar referencia al contexto del canvas
            signatures.push({
                canvas,
                ctx,
                isEmpty: true
            });
        }
    }
}

/**
 * Limpia la firma en el canvas especificado
 * @param {number} index - El índice del canvas de firma
 */
function clearSignature(index) {
    if (signatures[index]) {
        const { canvas, ctx } = signatures[index];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        signatures[index].isEmpty = true;
    }
}

/**
 * Comprueba si un canvas de firma está vacío
 * @param {number} index - El índice del canvas de firma
 * @returns {boolean} - true si el canvas está vacío, false en caso contrario
 */
function isSignatureEmpty(index) {
    if (!signatures[index]) return true;
    
    const { canvas, ctx } = signatures[index];
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    // Comprobar si hay algún pixel no transparente
    for (let i = 3; i < pixelData.length; i += 4) {
        if (pixelData[i] > 0) {
            signatures[index].isEmpty = false;
            return false;
        }
    }
    
    signatures[index].isEmpty = true;
    return true;
}

/**
 * Configura los botones de navegación entre formularios
 */
function setupNavigationButtons() {
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
            // Validar el formulario actual antes de avanzar
            if (validateCurrentForm()) {
                if (currentGuestIndex < guestForms.length - 1) {
                    showGuestForm(currentGuestIndex + 1);
                }
            }
        });
    }
    
    if (submitBtn) {
        // Eliminar eventos anteriores para evitar duplicados
        submitBtn.replaceWith(submitBtn.cloneNode(true));
        const newSubmitBtn = document.getElementById('submit-btn');
        
        if (newSubmitBtn) {
            console.log('Configurando evento click para el botón de envío');
            newSubmitBtn.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('Botón de envío clickeado');
                
                // Validar el último formulario antes de enviar
                console.log('Validando formulario actual...');
                if (validateCurrentForm()) {
                    console.log('Formulario válido, mostrando modal de confirmación');
                    showConfirmationModal();
                } else {
                    console.warn('Formulario inválido, no se muestra el modal de confirmación');
                }
            });
        } else {
            console.error('No se pudo encontrar el botón de envío después de reemplazarlo');
        }
    } else {
        console.error('No se encontró el botón de envío');
    }
}

/**
 * Configura el formulario principal
 */
function setupMainForm() {
    const form = document.getElementById('checkin-form');
    
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            
            // La lógica de envío se maneja en el modal de confirmación
        });
    }
}

/**
 * Configura los modales de confirmación y éxito
 */
function setupModals() {
    const confirmationModal = document.getElementById('confirmation-modal');
    const successModal = document.getElementById('success-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const confirmBtn = document.getElementById('confirm-btn');
    const successBtn = document.getElementById('success-btn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (confirmationModal) {
                confirmationModal.classList.add('hidden');
            }
        });
    }
    
    if (confirmBtn) {
        // Eliminar eventos anteriores para evitar duplicados
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        const newConfirmBtn = document.getElementById('confirm-btn');
        
        if (newConfirmBtn) {
            console.log('Configurando evento click para el botón de confirmación');
            newConfirmBtn.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('Botón de confirmación clickeado');
                
                if (confirmationModal) {
                    confirmationModal.classList.add('hidden');
                    console.log('Modal de confirmación ocultado');
                }
                
                // Enviar el formulario
                console.log('Llamando a submitForm()');
                submitForm();
            });
        } else {
            console.error('No se pudo encontrar el botón de confirmación después de reemplazarlo');
        }
    } else {
        console.error('No se encontró el botón de confirmación');
    }
    
    if (successBtn) {
        successBtn.addEventListener('click', () => {
            // Redirigir a la página de inicio
            window.location.href = 'index.html';
        });
    }
}

/**
 * Muestra el formulario del huésped especificado
 * @param {number} index - El índice del formulario a mostrar
 */
function showGuestForm(index) {
    if (index < 0 || index >= guestForms.length) {
        return;
    }
    
    // Ocultar todos los formularios
    guestForms.forEach(form => {
        form.classList.add('hidden');
    });
    
    // Mostrar el formulario seleccionado
    guestForms[index].classList.remove('hidden');
    
    // Actualizar el índice actual
    currentGuestIndex = index;
    
    // Actualizar la barra de progreso
    updateProgressBar();
    
    // Actualizar la visibilidad de los botones de navegación
    updateNavigationButtons();
}

/**
 * Actualiza la barra de progreso
 */
function updateProgressBar() {
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar && progressText && checkInData) {
        // Calcular el porcentaje de progreso
        const progress = ((currentGuestIndex + 1) / checkInData.guestsCount) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Actualizar el texto de progreso
        progressText.textContent = window.i18n.getText('progress', {
            current: currentGuestIndex + 1,
            total: checkInData.guestsCount
        });
    }
}

/**
 * Actualiza la visibilidad de los botones de navegación
 */
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    if (prevBtn && nextBtn && submitBtn) {
        // Mostrar/ocultar el botón anterior
        if (currentGuestIndex > 0) {
            prevBtn.classList.remove('hidden');
        } else {
            prevBtn.classList.add('hidden');
        }
        
        // Mostrar/ocultar los botones siguiente y enviar
        if (currentGuestIndex < guestForms.length - 1) {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        } else {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        }
    }
}

/**
 * Valida el formulario actual
 * @returns {boolean} - true si el formulario es válido, false en caso contrario
 */
function validateCurrentForm() {
    console.log(`Validando formulario para huésped ${currentGuestIndex + 1}`);
    
    const currentForm = guestForms[currentGuestIndex];
    
    if (!currentForm) {
        console.error(`No se encontró el formulario para el huésped ${currentGuestIndex + 1}`);
        return false;
    }
    
    // Obtener todos los campos obligatorios
    const requiredInputs = currentForm.querySelectorAll('[required]');
    console.log(`Encontrados ${requiredInputs.length} campos requeridos`);
    let isValid = true;
    
    // Validar cada campo
    requiredInputs.forEach((input, index) => {
        console.log(`Validando campo ${index + 1}: ${input.name || 'sin nombre'} - Valor: ${input.value ? 'tiene valor' : 'vacío'}`);
        
        if (!input.value) {
            isValid = false;
            input.classList.add('border-red-500');
            console.log(`Campo ${index + 1} inválido: marcado con borde rojo`);
            
            // Añadir evento para quitar el estilo de error cuando se modifique el campo
            input.addEventListener('input', function() {
                this.classList.remove('border-red-500');
                console.log(`Estilo de error removido del campo ${index + 1}`);
            }, { once: true });
        } else {
            input.classList.remove('border-red-500');
            console.log(`Campo ${index + 1} válido`);
        }
    });
    
    // Validar la firma
    try {
        console.log('Validando firma...');
        if (isSignatureEmpty(currentGuestIndex)) {
            isValid = false;
            console.log('Firma vacía detectada');
            const signaturePad = currentForm.querySelector('.signature-pad');
            if (signaturePad) {
                signaturePad.classList.add('border-red-500');
                console.log('Contenedor de firma marcado con borde rojo');
                
                // Añadir evento para quitar el estilo de error cuando se dibuje en el canvas
                try {
                    const canvas = signatures[currentGuestIndex].canvas;
                    canvas.addEventListener('mousedown', function() {
                        signaturePad.classList.remove('border-red-500');
                        console.log('Estilo de error removido del contenedor de firma (mousedown)');
                    }, { once: true });
                    
                    canvas.addEventListener('touchstart', function() {
                        signaturePad.classList.remove('border-red-500');
                        console.log('Estilo de error removido del contenedor de firma (touchstart)');
                    }, { once: true });
                } catch (canvasError) {
                    console.error('Error al configurar eventos del canvas:', canvasError);
                }
            } else {
                console.error('No se encontró el contenedor de firma (.signature-pad)');
            }
        } else {
            console.log('Firma válida');
        }
    } catch (signatureError) {
        console.error('Error al validar la firma:', signatureError);
        isValid = false;
    }
    
    if (!isValid) {
        console.log('Formulario inválido, mostrando alerta');
        try {
            alert(window.i18n.getText('required_field'));
        } catch (alertError) {
            console.error('Error al mostrar alerta:', alertError);
            alert('Por favor, complete todos los campos requeridos');
        }
    } else {
        console.log('Formulario válido completamente');
    }
    
    return isValid;
}

/**
 * Muestra el modal de confirmación
 */
function showConfirmationModal() {
    console.log('Intentando mostrar el modal de confirmación');
    const confirmationModal = document.getElementById('confirmation-modal');
    
    if (confirmationModal) {
        confirmationModal.classList.remove('hidden');
        console.log('Modal de confirmación mostrado correctamente');
    } else {
        console.error('No se encontró el modal de confirmación');
    }
}

/**
 * Envía el formulario
 */
function submitForm() {
    console.log('Función submitForm iniciada');
    
    // Recopilar los datos de todos los formularios
    const formData = new FormData();
    
    // Añadir los datos del check-in
    try {
        formData.append('apartment', checkInData?.apartment || '');
        formData.append('checkInDate', checkInData?.checkInDate || '');
        formData.append('guestsCount', checkInData?.guestsCount || '1');
        
        console.log('Datos de check-in añadidos:', {
            apartment: checkInData?.apartment || '',
            checkInDate: checkInData?.checkInDate || '',
            guestsCount: checkInData?.guestsCount || '1'
        });
    } catch (error) {
        console.error('Error al añadir datos de check-in:', error);
        formData.append('apartment', '');
        formData.append('checkInDate', '');
        formData.append('guestsCount', '1');
    }
    
    // Añadir los datos de cada huésped
    for (let i = 0; i < guestForms.length; i++) {
        console.log(`Procesando datos del huésped ${i+1}`);
        const form = guestForms[i];
        
        try {
            // Obtener los campos del formulario
            const fullName = form.querySelector('[name="full-name"]')?.value || '';
            const birthDate = form.querySelector('[name="birth-date"]')?.value || '';
            const nationality = form.querySelector('[name="nationality"]')?.value || '';
            const address = form.querySelector('[name="address"]')?.value || '';
            const relationship = form.querySelector('[name="relationship"]')?.value || '';
            const checkoutDate = form.querySelector('[name="checkout-date"]')?.value || '';
            const documentType = form.querySelector('[name="document-type"]')?.value || '';
            const documentNumber = form.querySelector('[name="document-number"]')?.value || '';
            let documentPhoto = null;
            
            try {
                const photoInput = form.querySelector('[name="document-photo"]');
                if (photoInput && photoInput.files && photoInput.files.length > 0) {
                    documentPhoto = photoInput.files[0];
                    console.log(`Foto del documento obtenida para huésped ${i+1}:`, documentPhoto.name);
                } else {
                    console.warn(`No se encontró foto del documento para huésped ${i+1}`);
                }
            } catch (photoError) {
                console.error(`Error al obtener la foto del documento para huésped ${i+1}:`, photoError);
            }
            
            // Añadir los datos al FormData
            formData.append(`guest_${i}_fullName`, fullName);
            formData.append(`guest_${i}_birthDate`, birthDate);
            formData.append(`guest_${i}_nationality`, nationality);
            formData.append(`guest_${i}_address`, address);
            formData.append(`guest_${i}_relationship`, relationship);
            formData.append(`guest_${i}_checkoutDate`, checkoutDate);
            formData.append(`guest_${i}_documentType`, documentType);
            formData.append(`guest_${i}_documentNumber`, documentNumber);
            
            if (documentPhoto) {
                formData.append(`guest_${i}_documentPhoto`, documentPhoto);
            } else {
                formData.append(`guest_${i}_documentPhoto`, 'no-photo');
            }
            
            // La conversión de la imagen del documento se manejará de forma síncrona más adelante
            
            // Convertir la firma a imagen y añadirla al FormData
            try {
                if (signatures && signatures[i] && signatures[i].canvas) {
                    try {
                        const signatureDataUrl = signatures[i].canvas.toDataURL('image/png');
                        formData.append(`guest_${i}_signature`, signatureDataUrl);
                        console.log(`Firma obtenida para huésped ${i+1}`);
                    } catch (canvasError) {
                        console.error(`Error al convertir firma a imagen para huésped ${i+1}:`, canvasError);
                        formData.append(`guest_${i}_signature`, 'error-signature');
                    }
                } else {
                    console.warn(`No se pudo obtener la firma para huésped ${i+1}`);
                    formData.append(`guest_${i}_signature`, 'no-signature');
                }
            } catch (signatureError) {
                console.error(`Error al obtener la firma para huésped ${i+1}:`, signatureError);
                formData.append(`guest_${i}_signature`, 'error-signature');
            }
            
            console.log(`Datos del huésped ${i+1} añadidos correctamente`);
        } catch (error) {
            console.error(`Error al procesar datos del huésped ${i+1}:`, error);
        }
    }
    
    // Convertir las imágenes de documentos a base64 antes del envío
    convertDocumentPhotosToBase64(formData).then(() => {
        // Simular el envío del formulario
        simulateFormSubmission(formData);
    }).catch(error => {
        console.error('Error al convertir imágenes de documentos:', error);
        // Continuar con el envío aunque haya errores en las imágenes
        simulateFormSubmission(formData);
    });
}

/**
 * Convierte las imágenes de documentos a base64
 * @param {FormData} formData - Los datos del formulario
 * @returns {Promise} - Promesa que se resuelve cuando todas las imágenes están convertidas
 */
function convertDocumentPhotosToBase64(formData) {
    return new Promise((resolve, reject) => {
        const promises = [];
        const guestForms = document.querySelectorAll('.guest-form');
        
        for (let i = 0; i < guestForms.length; i++) {
            const photoInput = guestForms[i].querySelector('[name="document-photo"]');
            
            if (photoInput && photoInput.files && photoInput.files.length > 0) {
                const file = photoInput.files[0];
                
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
import { saveFormToFirestore } from './firebase-config.js';

async function simulateFormSubmission(formData) {
    console.log('Iniciando simulateFormSubmission');
    
    // Crear un objeto con los datos del formulario
    const submissionData = {
        apartment: formData.get('apartment') || '',
        checkInDate: formData.get('checkInDate') || '',
        guestsCount: parseInt(formData.get('guestsCount'), 10) || 0,
        guests: []
    };
    
    console.log('Datos básicos del formulario:', submissionData);
    
    // Añadir los datos de cada huésped
    for (let i = 0; i < guestForms.length; i++) {
        console.log(`Procesando datos del huésped ${i+1} en simulateFormSubmission`);
        
        // Obtener los datos del FormData
        const guestData = {
            fullName: formData.get(`guest_${i}_fullName`) || '',
            birthDate: formData.get(`guest_${i}_birthDate`) || '',
            nationality: formData.get(`guest_${i}_nationality`) || '',
            address: formData.get(`guest_${i}_address`) || '',
            relationship: formData.get(`guest_${i}_relationship`) || '',
            checkoutDate: formData.get(`guest_${i}_checkoutDate`) || '',
            documentType: formData.get(`guest_${i}_documentType`) || '',
            documentNumber: formData.get(`guest_${i}_documentNumber`) || '',
            documentPhoto: formData.get(`guest_${i}_documentPhoto`) || 'No disponible',
            signature: formData.get(`guest_${i}_signature`) || 'No disponible'
        };
        
        console.log(`Datos del huésped ${i+1} obtenidos:`, {
            fullName: guestData.fullName,
            documentNumber: guestData.documentNumber,
            signatureObtained: guestData.signature !== 'no-signature' && guestData.signature !== 'error-signature',
            photoObtained: guestData.documentPhoto !== 'no-photo'
        });
        
        submissionData.guests.push(guestData);
    }
    
    // Añadir fecha y hora de envío e ID único
    submissionData.id = 'form_' + Date.now();
    submissionData.submissionDate = new Date().toISOString();
    
    console.log('Objeto de envío completo:', {
        id: submissionData.id,
        apartment: submissionData.apartment,
        checkInDate: submissionData.checkInDate,
        guestsCount: submissionData.guestsCount,
        guestCount: submissionData.guests.length
    });
    
    try {
        // Guardar en Firestore
        const saved = await saveFormToFirestore(submissionData);
        if (saved) {
            console.log('Datos guardados exitosamente en Firestore');
            
            // Limpiar los datos de localStorage
            localStorage.removeItem('checkInData');
            
            // Mostrar el modal de éxito
            setTimeout(() => {
                const successModal = document.getElementById('success-modal');
                if (successModal) {
                    successModal.classList.remove('hidden');
                    console.log('Modal de éxito mostrado');
                } else {
                    console.error('No se encontró el modal de éxito');
                }
            }, 1500);
        } else {
            throw new Error('No se pudo guardar en Firestore');
        }
    } catch (error) {
        console.error('Error al guardar el formulario:', error);
        alert('Hubo un error al guardar los datos. Por favor, inténtelo de nuevo.');
    }
}

// Manejar el cambio de tamaño de la ventana para ajustar los canvas
window.addEventListener('resize', () => {
    // Reinicializar los canvas de firma
    initializeSignatureCanvases();
});