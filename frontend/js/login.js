// Configuración de la API
const API_BASE_URL = 'http://localhost:8000';

// Elementos del DOM
let authElements = {};

// Función para hacer peticiones a la API
async function fetchAPI(endpoint, options = {}) {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Si hay un token almacenado, incluirlo en las peticiones
        const token = getAuthToken();
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || data.message || `HTTP error! status: ${response.status}`);
        }

        return {
            success: true,
            data: data,
            status: response.status
        };
    } catch (error) {
        console.error('Error en fetchAPI:', error);
        return {
            success: false,
            error: error.message,
            status: error.status || 500
        };
    }
}

// Funciones de gestión de tokens
function getAuthToken() {
    // En este caso usamos sessionStorage ya que no podemos usar localStorage
    return sessionStorage.getItem('auth_token');
}

function setAuthToken(token) {
    sessionStorage.setItem('auth_token', token);
}

function removeAuthToken() {
    sessionStorage.removeItem('auth_token');
}

function getUserData() {
    const userData = sessionStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
}

function setUserData(userData) {
    sessionStorage.setItem('user_data', JSON.stringify(userData));
}

function removeUserData() {
    sessionStorage.removeItem('user_data');
}

// Funciones para cambiar entre formularios
function switchToSignup() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('signup-form').classList.add('active');
    document.getElementById('auth-title').textContent = 'Crear Cuenta';
    document.getElementById('auth-subtitle').textContent = 'Únete a nuestra aula virtual';
    clearMessages();
}

function switchToLogin() {
    document.getElementById('signup-form').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
    document.getElementById('auth-title').textContent = 'Iniciar Sesión';
    document.getElementById('auth-subtitle').textContent = 'Accede a tu aula virtual';
    clearMessages();
}

function clearMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    const successMessages = document.querySelectorAll('.success-message');
    
    errorMessages.forEach(msg => {
        msg.style.display = 'none';
        msg.textContent = '';
    });
    
    successMessages.forEach(msg => {
        msg.style.display = 'none';
        msg.textContent = '';
    });
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function setLoading(formId, loading) {
    const form = document.getElementById(formId);
    const button = form.querySelector('.btn');
    
    if (loading) {
        form.classList.add('loading');
        button.disabled = true;
        button.classList.add('btn-loading');
        button.textContent = '';
    } else {
        form.classList.remove('loading');
        button.disabled = false;
        button.classList.remove('btn-loading');
        // Restaurar texto del botón
        if (formId === 'loginForm') {
            button.textContent = 'Iniciar Sesión';
        } else {
            button.textContent = 'Crear Cuenta';
        }
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Remover notificaciones existentes
    const notificacionesExistentes = document.querySelectorAll('.notificacion');
    notificacionesExistentes.forEach(notif => {
        if (notif.parentNode) {
            notif.parentNode.removeChild(notif);
        }
    });

    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notificacion.classList.add('slide-out');
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 4000);
}

// Validación de formularios
function validateSignupForm(formData) {
    clearMessages();
    let isValid = true;

    // Validar nombre de usuario
    if (formData.username.length < 3) {
        showError('signup-username-error', 'El nombre de usuario debe tener al menos 3 caracteres');
        isValid = false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showError('signup-email-error', 'Por favor ingresa un email válido');
        isValid = false;
    }

    // Validar contraseña
    if (formData.password.length < 6) {
        showError('signup-password-error', 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirm_password) {
        showError('signup-confirm-password-error', 'Las contraseñas no coinciden');
        isValid = false;
    }

    return isValid;
}

function validateLoginForm(formData) {
    clearMessages();
    let isValid = true;

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showError('login-email-error', 'Por favor ingresa un email válido');
        isValid = false;
    }

    // Validar contraseña
    if (!formData.password || formData.password.length < 1) {
        showError('login-password-error', 'La contraseña es requerida');
        isValid = false;
    }

    return isValid;
}

// Función para login
async function handleLogin(email, password) {
    try {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch('http://localhost:8000/auth/token', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            
            // Crear el objeto result que tu código espera
            const result = {
                success: true,
                data: {
                    access_token: data.access_token,
                    token_type: data.token_type,
                    user: null 
                }
            };

            if (result.success) {
                if (result.data.access_token) {
                    setAuthToken(result.data.access_token);
                }
                
                if (result.data.user) {
                    setUserData(result.data.user);
                }
                
                return result;
            }
        } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Credenciales inválidas');
        }
    } catch (error) {
        console.error('Error en login:', error);
        
        // Crear result para el caso de error
        const result = {
            success: false,
            error: error.message
        };
        
        return result;
    }
}

// Función para registro
async function handleSignup(formData) {
    console.log('Intentando registro con:', { 
        username: formData.username, 
        email: formData.email 
    });

    const result = await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
        })
    });

    if (result.success) {
        showSuccess('signup-success', '¡Cuenta creada exitosamente! Puedes iniciar sesión.');
        mostrarNotificacion('¡Cuenta creada exitosamente!', 'success');
        
        // Cambiar al formulario de login después de 2 segundos
        setTimeout(() => {
            switchToLogin();
            // Pre-llenar el email
            document.getElementById('login-email').value = formData.email;
        }, 2000);

        return true;
    } else {
        // Manejar errores específicos
        if (result.error.includes('email') || result.error.includes('Email')) {
            showError('signup-email-error', 'Este email ya está registrado');
        } else if (result.error.includes('username') || result.error.includes('Usuario')) {
            showError('signup-username-error', 'Este nombre de usuario ya está en uso');
        } else if (result.status === 422) {
            showError('signup-general-error', 'Datos de registro inválidos');
        } else {
            showError('signup-general-error', result.error || 'Error al crear la cuenta');
        }
        
        mostrarNotificacion('Error al crear la cuenta', 'error');
        return false;
    }
}

// Función para verificar si el usuario ya está logueado
function checkAuthStatus() {
    const token = getAuthToken();
    const userData = getUserData();
    
    if (token && userData) {
        // El usuario ya está logueado, redirigir al dashboard
        console.log('Usuario ya autenticado:', userData);
        window.location.href = '/dashboard.html';
        return true;
    }
    return false;
}

// Función para verificar el estado de la API
async function verificarEstadoAPI() {
    try {
        const result = await fetchAPI('/health');
        if (result.success) {
            console.log('API conectada correctamente');
            return true;
        } else {
            console.error('Error en la API:', result.error);
            mostrarNotificacion('Error de conexión con la API', 'error');
            return false;
        }
    } catch (error) {
        console.error('No se puede conectar con la API:', error);
        mostrarNotificacion('No se puede conectar con la API. Verifica que el servidor esté ejecutándose.', 'error');
        return false;
    }
}

// Event listeners para los formularios
// Event listeners para los formularios
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            };

            if (!validateLoginForm(formData)) {
                return;
            }

            setLoading('loginForm', true);
            
            try {
                console.log('Intentando login con:', { email: formData.email });
                
                // CAMBIO: Pasar email y password por separado
                const result = await handleLogin(formData.email, formData.password);
                
                // CAMBIO: Manejar el resultado correctamente
                if (result.success) {
                    mostrarNotificacion('¡Login exitoso!', 'success');
                    console.log('Login exitoso, redirigiendo...');
                    
                    // Redirigir a la página principal después de un breve delay
                    setTimeout(() => {
                        window.location.href = 'http://127.0.0.1:5500/frontend/principal.html';
                    }, 1000);
                } else {
                    // Mostrar error específico
                    showError('login-general-error', result.error || 'Error de autenticación');
                    mostrarNotificacion(result.error || 'Error de autenticación', 'error');
                }
            } catch (error) {
                console.error('Error inesperado en login:', error);
                showError('login-general-error', 'Error inesperado. Intenta nuevamente.');
                mostrarNotificacion('Error inesperado', 'error');
            } finally {
                setLoading('loginForm', false);
            }
        });
    }
}

    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                username: document.getElementById('signup-username').value,
                email: document.getElementById('signup-email').value,
                password: document.getElementById('signup-password').value,
                confirm_password: document.getElementById('signup-confirm-password').value
            };

            if (!validateSignupForm(formData)) {
                return;
            }

            setLoading('signupForm', true);
            
            try {
                await handleSignup(formData);
            } finally {
                setLoading('signupForm', false);
            }
        });
    }

    // Limpiar mensajes cuando el usuario empiece a escribir
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            const errorElement = document.getElementById(this.name + '-error') || 
                               document.getElementById(this.id + '-error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
    });

// Función de logout (para usar en otras páginas)
function logout() {
    removeAuthToken();
    removeUserData();
    mostrarNotificacion('Sesión cerrada exitosamente', 'info');
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 1000);
}

// Función de inicialización
async function inicializar() {
    console.log('Inicializando sistema de autenticación...');
    
    // Verificar si ya está logueado
    if (checkAuthStatus()) {
        return;
    }
    
    // Verificar estado de la API
    const apiConnected = await verificarEstadoAPI();
    
    if (!apiConnected) {
        // Mostrar mensaje de error pero permitir continuar
        console.warn('API no disponible, algunas funciones pueden no funcionar');
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    console.log('Sistema de autenticación inicializado');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializar);

// Exportar funciones para uso global
window.switchToSignup = switchToSignup;
window.switchToLogin = switchToLogin;
window.logout = logout;
window.mostrarNotificacion = mostrarNotificacion;