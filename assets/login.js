// login.js - script clásico para manejar login local sin depender de módulos
(function(){
    console.log('[login.js] cargado');

    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'balcones22';

    function showPanel() {
        const loginScreen = document.getElementById('login-screen');
        const adminPanel = document.getElementById('admin-panel');
        if (loginScreen) loginScreen.classList.add('hidden');
        if (adminPanel) adminPanel.classList.remove('hidden');
    }

    function showLogin() {
        const loginScreen = document.getElementById('login-screen');
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) adminPanel.classList.add('hidden');
        if (loginScreen) loginScreen.classList.remove('hidden');
    }

    function init() {
        console.log('[login.js] init');
        // Guardar errores globales
        window.addEventListener('error', (ev) => {
            console.error('[login.js] window error:', ev.message, 'at', ev.filename + ':' + ev.lineno);
        });

        // Estado de sesión
        if (sessionStorage.getItem('adminAuthenticated') === 'true') {
            console.log('[login.js] sesión encontrada');
            showPanel();
        }

        const form = document.getElementById('login-form');
        if (!form) {
            console.warn('[login.js] No se encuentra #login-form');
            return;
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = (document.getElementById('username') || {}).value || '';
            const password = (document.getElementById('password') || {}).value || '';
            console.log('[login.js] intento login', { username });
            const loginError = document.getElementById('login-error');

            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                sessionStorage.setItem('adminAuthenticated', 'true');
                console.log('[login.js] login OK');
                if (loginError) loginError.classList.add('hidden');
                showPanel();
            } else {
                console.log('[login.js] login fallido');
                if (loginError) loginError.classList.remove('hidden');
            }
        });

        // logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('adminAuthenticated');
                showLogin();
            });
        }

        console.log('[login.js] listo');
    }

    // Initialize on DOMContentLoaded so elements exist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();