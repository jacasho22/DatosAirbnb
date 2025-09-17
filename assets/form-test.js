// Test simple para verificar si el problema está en el código
console.log('Test script cargado correctamente');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado en test script');
    
    // Verificar si el contenedor existe
    const container = document.getElementById('guest-forms-container');
    console.log('Contenedor encontrado:', container);
    
    if (container) {
        container.innerHTML = '<p>Formulario de prueba funcionando</p>';
    }
});