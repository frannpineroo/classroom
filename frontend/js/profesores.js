// Configuración de la API
const API_BASE_URL = 'http://localhost:8000';

// Variables globales
let profesores = [];
let profesorEditando = null;
let profesorEliminar = null;

// Elementos del DOM
const profesoresContainer = document.getElementById('profesores-container');
const searchInput = document.getElementById('search-input');
const profesorModal = document.getElementById('profesor-modal');
const confirmModal = document.getElementById('confirm-modal');
const profesorForm = document.getElementById('profesor-form');
const modalTitle = document.getElementById('modal-title');

// Función para hacer peticiones a la API
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    switch (tipo) {
        case 'success':
            notificacion.style.backgroundColor = 'var(--success-color)';
            break;
        case 'error':
            notificacion.style.backgroundColor = 'var(--danger-color)';
            break;
        case 'warning':
            notificacion.style.backgroundColor = 'var(--warning-color)';
            break;
        default:
            notificacion.style.backgroundColor = 'var(--primary-color)';
    }
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

// Función para cargar profesores
async function cargarProfesores() {
    try {
        mostrarLoading();
        profesores = await fetchAPI('/profesores/');
        renderizarProfesores(profesores);
    } catch (error) {
        mostrarError('Error al cargar los profesores');
        console.error('Error cargando profesores:', error);
    }
}

// Función para mostrar estado de carga
function mostrarLoading() {
    profesoresContainer.innerHTML = '<div class="loading">Cargando profesores...</div>';
}

// Función para mostrar error
function mostrarError(mensaje) {
    profesoresContainer.innerHTML = `
        <div class="empty-state">
            <h3>Error</h3>
            <p>${mensaje}</p>
            <button class="btn btn-primary" onclick="cargarProfesores()">Reintentar</button>
        </div>
    `;
}

// Función para renderizar profesores
function renderizarProfesores(profesoresFiltrados) {
    if (profesoresFiltrados.length === 0) {
        profesoresContainer.innerHTML = `
            <div class="empty-state">
                <h3>No hay profesores</h3>
                <p>No se encontraron profesores que coincidan con tu búsqueda.</p>
                <button class="btn btn-primary" onclick="mostrarModalCrear()">Crear primer profesor</button>
            </div>
        `;
        return;
    }

    const profesoresHTML = profesoresFiltrados.map(profesor => crearProfesorHTML(profesor)).join('');
    profesoresContainer.innerHTML = profesoresHTML;
}

// Función para crear HTML de un profesor
function crearProfesorHTML(profesor) {
    return `
        <div class="profesor-item">
            <div class="profesor-header">
                <div class="profesor-info">
                    <h3>${profesor.nombre} ${profesor.apellido}</h3>
                    <div class="legajo">Legajo: ${profesor.legajo}</div>
                </div>
                <div class="profesor-actions">
                    <button class="btn btn-primary btn-sm" onclick="editarProfesor(${profesor.id})">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="confirmarEliminarProfesor(${profesor.id}, '${profesor.nombre} ${profesor.apellido}')">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Función para filtrar profesores
function filtrarProfesores(termino) {
    const profesoresFiltrados = profesores.filter(profesor =>
        profesor.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        profesor.apellido.toLowerCase().includes(termino.toLowerCase()) ||
        profesor.legajo.toString().includes(termino)
    );
    renderizarProfesores(profesoresFiltrados);
}

// Funciones del modal
function mostrarModalCrear() {
    profesorEditando = null;
    modalTitle.textContent = 'Nuevo Profesor';
    profesorForm.reset();
    profesorModal.classList.add('show');
}

function mostrarModalEditar(profesor) {
    profesorEditando = profesor;
    modalTitle.textContent = 'Editar Profesor';
    document.getElementById('nombre').value = profesor.nombre;
    document.getElementById('apellido').value = profesor.apellido;
    document.getElementById('legajo').value = profesor.legajo;
    profesorModal.classList.add('show');
}

function cerrarModal() {
    profesorModal.classList.remove('show');
    profesorEditando = null;
    profesorForm.reset();
}

// Funciones de confirmación
function confirmarEliminarProfesor(id, nombre) {
    profesorEliminar = { id, nombre };
    document.getElementById('profesor-eliminar-nombre').textContent = nombre;
    confirmModal.classList.add('show');
}

function cerrarConfirmModal() {
    confirmModal.classList.remove('show');
    profesorEliminar = null;
}

async function confirmarEliminar() {
    if (!profesorEliminar) return;
    
    try {
        await fetchAPI(`/profesores/${profesorEliminar.id}`, { method: 'DELETE' });
        mostrarNotificacion('Profesor eliminado correctamente', 'success');
        cerrarConfirmModal();
        cargarProfesores();
    } catch (error) {
        mostrarNotificacion('Error al eliminar el profesor', 'error');
        console.error('Error eliminando profesor:', error);
    }
}

// Función para editar profesor
function editarProfesor(id) {
    const profesor = profesores.find(p => p.id === id);
    if (profesor) {
        mostrarModalEditar(profesor);
    }
}

// Función para manejar el envío del formulario
async function manejarSubmitForm(event) {
    event.preventDefault();
    
    const formData = new FormData(profesorForm);
    const profesorData = {
        nombre: formData.get('nombre'),
        apellido: formData.get('apellido'),
        legajo: parseInt(formData.get('legajo'))
    };
    
    try {
        if (profesorEditando) {
            // Actualizar profesor existente
            await fetchAPI(`/profesores/${profesorEditando.id}`, {
                method: 'PUT',
                body: JSON.stringify(profesorData)
            });
            mostrarNotificacion('Profesor actualizado correctamente', 'success');
        } else {
            // Crear nuevo profesor
            await fetchAPI('/profesores/', {
                method: 'POST',
                body: JSON.stringify(profesorData)
            });
            mostrarNotificacion('Profesor creado correctamente', 'success');
        }
        
        cerrarModal();
        cargarProfesores();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
        console.error('Error guardando profesor:', error);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    cargarProfesores();
    
    // Event listener para el formulario
    profesorForm.addEventListener('submit', manejarSubmitForm);
    
    // Event listener para la búsqueda
    searchInput.addEventListener('input', function(e) {
        filtrarProfesores(e.target.value);
    });
    
    // Event listeners para cerrar modales
    profesorModal.addEventListener('click', function(e) {
        if (e.target === profesorModal) {
            cerrarModal();
        }
    });
    
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            cerrarConfirmModal();
        }
    });
    
    // Event listener para tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarModal();
            cerrarConfirmModal();
        }
    });
});

// Agregar estilos CSS para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Exportar funciones para uso global
window.mostrarModalCrear = mostrarModalCrear;
window.cerrarModal = cerrarModal;
window.editarProfesor = editarProfesor;
window.confirmarEliminarProfesor = confirmarEliminarProfesor;
window.cerrarConfirmModal = cerrarConfirmModal;
window.confirmarEliminar = confirmarEliminar; 