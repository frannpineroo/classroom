const API_BASE_URL = 'http://localhost:8000';

// Elementos del DOM
const formMateria = document.getElementById('formMateria');
const btnCrear = document.getElementById('btnCrear');
const successMessage = document.getElementById('success-message');
const loading = document.getElementById('loading');

// Función para hacer llamadas a la API
async function fetchAPI(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en fetchAPI:', error);
        throw error;
    }
}

// Función para mostrar mensaje de éxito
function mostrarExito() {
    successMessage.style.display = 'block';
    setTimeout(() => {
        window.location.href = '/materias-page';
    }, 2000);
}

// Función para mostrar loading
function mostrarLoading() {
    loading.style.display = 'block';
    btnCrear.disabled = true;
    btnCrear.textContent = 'Creando...';
}

// Función para ocultar loading
function ocultarLoading() {
    loading.style.display = 'none';
    btnCrear.disabled = false;
    btnCrear.textContent = '💾 Crear Materia';
}

// Función para mostrar error
function mostrarError(mensaje) {
    alert(`Error: ${mensaje}`);
}

// Función para limpiar errores
function limpiarErrores() {
    const errorMessages = document.querySelectorAll('.error-message');
    const inputs = document.querySelectorAll('input');
    
    errorMessages.forEach(error => {
        error.style.display = 'none';
    });
    
    inputs.forEach(input => {
        input.classList.remove('error');
    });
}

// Función para validar el formulario
function validarFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const codigo = document.getElementById('codigo').value.trim();
    
    let esValido = true;
    
    // Validar nombre
    if (!nombre) {
        mostrarErrorCampo('nombre', 'El nombre de la materia es requerido');
        esValido = false;
    } else if (nombre.length < 3) {
        mostrarErrorCampo('nombre', 'El nombre debe tener al menos 3 caracteres');
        esValido = false;
    }
    
    // Validar código
    if (!codigo) {
        mostrarErrorCampo('codigo', 'El código es requerido');
        esValido = false;
    } else if (codigo.length < 2) {
        mostrarErrorCampo('codigo', 'El código debe tener al menos 2 caracteres');
        esValido = false;
    }
    
    return esValido;
}

// Función para mostrar error en un campo específico
function mostrarErrorCampo(campoId, mensaje) {
    const input = document.getElementById(campoId);
    const errorDiv = document.getElementById(`${campoId}-error`);
    
    input.classList.add('error');
    errorDiv.textContent = mensaje;
    errorDiv.style.display = 'block';
}

// Función para crear materia
async function crearMateria(datos) {
    try {
        const response = await fetchAPI(`${API_BASE_URL}/materias/`, {
            method: 'POST',
            body: JSON.stringify(datos)
        });
        
        return response;
    } catch (error) {
        throw error;
    }
}

// Manejador del envío del formulario
async function manejarSubmit(event) {
    event.preventDefault();
    
    // Limpiar errores previos
    limpiarErrores();
    
    // Validar formulario
    if (!validarFormulario()) {
        return;
    }
    
    // Obtener datos del formulario
    const formData = new FormData(formMateria);
    const datos = {
        nombre: formData.get('nombre').trim(),
        codigo: formData.get('codigo').trim()
    };
    
    try {
        mostrarLoading();
        
        // Crear materia
        const materiaCreada = await crearMateria(datos);
        
        console.log('Materia creada:', materiaCreada);
        
        // Mostrar éxito y redirigir
        ocultarLoading();
        mostrarExito();
        
    } catch (error) {
        ocultarLoading();
        
        // Manejar errores específicos
        if (error.message.includes('código ya existe')) {
            mostrarErrorCampo('codigo', 'Este código ya está en uso');
        } else if (error.message.includes('nombre ya existe')) {
            mostrarErrorCampo('nombre', 'Este nombre ya está en uso');
        } else {
            mostrarError(error.message);
        }
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Enviar formulario
    formMateria.addEventListener('submit', manejarSubmit);
    
    // Limpiar errores al escribir en los campos
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const campoId = this.id;
            const errorDiv = document.getElementById(`${campoId}-error`);
            
            this.classList.remove('error');
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        });
    });
}); 