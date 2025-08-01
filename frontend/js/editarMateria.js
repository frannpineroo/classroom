const API_BASE_URL = 'http://localhost:8000';

// Elementos del DOM
const formMateria = document.getElementById('formMateria');
const btnActualizar = document.getElementById('btnActualizar');
const successMessage = document.getElementById('success-message');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const nombreInput = document.getElementById('nombre');
const codigoInput = document.getElementById('codigo');

let materiaId = null;

// Función para obtener parámetros de la URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

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
    btnActualizar.disabled = true;
}

// Función para ocultar loading
function ocultarLoading() {
    loading.style.display = 'none';
    btnActualizar.disabled = false;
}

// Función para mostrar error
function mostrarError(mensaje) {
    error.textContent = mensaje;
    error.style.display = 'block';
    setTimeout(() => {
        error.style.display = 'none';
    }, 5000);
}

// Función para limpiar errores
function limpiarErrores() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.style.display = 'none';
    });
    
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('error');
    });
}

// Función para validar el formulario
function validarFormulario() {
    let esValido = true;
    
    // Validar nombre
    if (!nombreInput.value.trim()) {
        mostrarErrorCampo('nombre', 'El nombre es requerido');
        esValido = false;
    }
    
    // Validar código
    if (!codigoInput.value.trim()) {
        mostrarErrorCampo('codigo', 'El código es requerido');
        esValido = false;
    }
    
    return esValido;
}

// Función para mostrar error en un campo específico
function mostrarErrorCampo(campoId, mensaje) {
    const input = document.getElementById(campoId);
    const errorElement = document.getElementById(`${campoId}-error`);
    
    input.classList.add('error');
    errorElement.textContent = mensaje;
    errorElement.style.display = 'block';
}

// Función para cargar materia
async function cargarMateria(id) {
    try {
        mostrarLoading();
        const materia = await fetchAPI(`${API_BASE_URL}/materias/${id}`);
        
        // Llenar el formulario con los datos
        nombreInput.value = materia.nombre;
        codigoInput.value = materia.codigo;
        
        ocultarLoading();
    } catch (error) {
        ocultarLoading();
        mostrarError('Error al cargar la materia: ' + error.message);
    }
}

// Función para actualizar materia
async function actualizarMateria(datos) {
    try {
        const response = await fetchAPI(`${API_BASE_URL}/materias/${materiaId}`, {
            method: 'PUT',
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
    
    // Preparar datos
    const datos = {
        nombre: nombreInput.value.trim(),
        codigo: codigoInput.value.trim()
    };
    
    try {
        mostrarLoading();
        
        // Actualizar materia
        await actualizarMateria(datos);
        
        ocultarLoading();
        mostrarExito();
        
    } catch (error) {
        ocultarLoading();
        
        if (error.message.includes('código')) {
            mostrarErrorCampo('codigo', 'Este código ya está en uso');
        } else {
            mostrarError('Error al actualizar la materia: ' + error.message);
        }
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Obtener ID de la materia de la URL
    materiaId = getUrlParameter('id');
    
    if (!materiaId) {
        mostrarError('No se especificó el ID de la materia');
        return;
    }
    
    // Cargar datos de la materia
    cargarMateria(materiaId);
    
    // Event listener para el formulario
    formMateria.addEventListener('submit', manejarSubmit);
    
    // Event listeners para limpiar errores al escribir
    nombreInput.addEventListener('input', function() {
        this.classList.remove('error');
        document.getElementById('nombre-error').style.display = 'none';
    });
    
    codigoInput.addEventListener('input', function() {
        this.classList.remove('error');
        document.getElementById('codigo-error').style.display = 'none';
    });
}); 