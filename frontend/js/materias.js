// Configuración de la API
const API_BASE_URL = 'http://localhost:8000';

// Variables globales
let materias = [];
let materiaEditando = null;
let materiaEliminar = null;

// Elementos del DOM
const materiasContainer = document.getElementById('materias-container');
const searchInput = document.getElementById('search-input');
const materiaModal = document.getElementById('materia-modal');
const confirmModal = document.getElementById('confirm-modal');
const materiaForm = document.getElementById('materia-form');
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

// Función para cargar materias
async function cargarMaterias() {
    try {
        mostrarLoading();
        materias = await fetchAPI('/materias/');
        renderizarMaterias(materias);
    } catch (error) {
        mostrarError('Error al cargar las materias');
        console.error('Error cargando materias:', error);
    }
}

// Función para mostrar estado de carga
function mostrarLoading() {
    materiasContainer.innerHTML = '<div class="loading">Cargando materias...</div>';
}

// Función para mostrar error
function mostrarError(mensaje) {
    materiasContainer.innerHTML = `
        <div class="empty-state">
            <h3>Error</h3>
            <p>${mensaje}</p>
            <button class="btn btn-primary" onclick="cargarMaterias()">Reintentar</button>
        </div>
    `;
}

// Función para renderizar materias
function renderizarMaterias(materiasFiltradas) {
    if (materiasFiltradas.length === 0) {
        materiasContainer.innerHTML = `
            <div class="empty-state">
                <h3>No hay materias</h3>
                <p>No se encontraron materias que coincidan con tu búsqueda.</p>
                <button class="btn btn-primary" onclick="mostrarModalCrear()">Crear primera materia</button>
            </div>
        `;
        return;
    }

    const materiasHTML = materiasFiltradas.map(materia => crearMateriaHTML(materia)).join('');
    materiasContainer.innerHTML = materiasHTML;
}

// Función para crear HTML de una materia
function crearMateriaHTML(materia) {
    return `
        <div class="materia-item">
            <div class="materia-header">
                <div class="materia-info">
                    <h3>${materia.nombre}</h3>
                    <div class="codigo">Código: ${materia.codigo}</div>
                </div>
                <div class="materia-actions">
                    <button class="btn btn-primary btn-sm" onclick="editarMateria(${materia.id})">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="confirmarEliminarMateria(${materia.id}, '${materia.nombre}')">
                        Eliminar
                    </button>
                </div>
            </div>
            <div class="materia-stats">
                <div class="materia-stat">
                    <div class="number" id="alumnos-${materia.id}">0</div>
                    <div class="label">Alumnos</div>
                </div>
                <div class="materia-stat">
                    <div class="number" id="tareas-${materia.id}">0</div>
                    <div class="label">Tareas</div>
                </div>
            </div>
        </div>
    `;
}

// Función para filtrar materias
function filtrarMaterias(termino) {
    const materiasFiltradas = materias.filter(materia =>
        materia.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        materia.codigo.toLowerCase().includes(termino.toLowerCase())
    );
    renderizarMaterias(materiasFiltradas);
}

// Funciones del modal
function mostrarModalCrear() {
    materiaEditando = null;
    modalTitle.textContent = 'Nueva Materia';
    materiaForm.reset();
    materiaModal.classList.add('show');
}

function mostrarModalEditar(materia) {
    materiaEditando = materia;
    modalTitle.textContent = 'Editar Materia';
    document.getElementById('nombre').value = materia.nombre;
    document.getElementById('codigo').value = materia.codigo;
    materiaModal.classList.add('show');
}

function cerrarModal() {
    materiaModal.classList.remove('show');
    materiaEditando = null;
    materiaForm.reset();
}

// Funciones de confirmación
function confirmarEliminarMateria(id, nombre) {
    materiaEliminar = { id, nombre };
    document.getElementById('materia-eliminar-nombre').textContent = nombre;
    confirmModal.classList.add('show');
}

function cerrarConfirmModal() {
    confirmModal.classList.remove('show');
    materiaEliminar = null;
}

async function confirmarEliminar() {
    if (!materiaEliminar) return;
    
    try {
        await fetchAPI(`/materias/${materiaEliminar.id}`, { method: 'DELETE' });
        mostrarNotificacion('Materia eliminada correctamente', 'success');
        cerrarConfirmModal();
        cargarMaterias();
    } catch (error) {
        mostrarNotificacion('Error al eliminar la materia', 'error');
        console.error('Error eliminando materia:', error);
    }
}

// Función para editar materia
function editarMateria(id) {
    const materia = materias.find(m => m.id === id);
    if (materia) {
        mostrarModalEditar(materia);
    }
}

// Función para manejar el envío del formulario
async function manejarSubmitForm(event) {
    event.preventDefault();
    
    const formData = new FormData(materiaForm);
    const materiaData = {
        nombre: formData.get('nombre'),
        codigo: formData.get('codigo')
    };
    
    try {
        if (materiaEditando) {
            // Actualizar materia existente
            await fetchAPI(`/materias/${materiaEditando.id}`, {
                method: 'PUT',
                body: JSON.stringify(materiaData)
            });
            mostrarNotificacion('Materia actualizada correctamente', 'success');
        } else {
            // Crear nueva materia
            await fetchAPI('/materias/', {
                method: 'POST',
                body: JSON.stringify(materiaData)
            });
            mostrarNotificacion('Materia creada correctamente', 'success');
        }
        
        cerrarModal();
        cargarMaterias();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
        console.error('Error guardando materia:', error);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    cargarMaterias();
    
    // Event listener para el formulario
    materiaForm.addEventListener('submit', manejarSubmitForm);
    
    // Event listener para la búsqueda
    searchInput.addEventListener('input', function(e) {
        filtrarMaterias(e.target.value);
    });
    
    // Event listeners para cerrar modales
    materiaModal.addEventListener('click', function(e) {
        if (e.target === materiaModal) {
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
window.editarMateria = editarMateria;
window.confirmarEliminarMateria = confirmarEliminarMateria;
window.cerrarConfirmModal = cerrarConfirmModal;
window.confirmarEliminar = confirmarEliminar; 