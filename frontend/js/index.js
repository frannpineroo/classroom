// Configuración de la API
const API_BASE_URL = 'http://localhost:8000';

// Elementos del DOM
const totalMateriasElement = document.getElementById('total-materias');
const totalAlumnosElement = document.getElementById('total-alumnos');
const totalProfesoresElement = document.getElementById('total-profesores');
const totalTareasElement = document.getElementById('total-tareas');
const materiasGridElement = document.getElementById('materias-grid');

// Función para hacer peticiones a la API
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Función para cargar estadísticas
async function cargarEstadisticas() {
    try {
        // Cargar datos en paralelo
        const [materias, alumnos, profesores, tareas] = await Promise.all([
            fetchAPI('/materias/'),
            fetchAPI('/alumnos/'),
            fetchAPI('/profesores/'),
            fetchAPI('/tareas/')
        ]);

        // Actualizar contadores
        if (materias) {
            totalMateriasElement.textContent = materias.length;
        }
        if (alumnos) {
            totalAlumnosElement.textContent = alumnos.length;
        }
        if (profesores) {
            totalProfesoresElement.textContent = profesores.length;
        }
        if (tareas) {
            totalTareasElement.textContent = tareas.length;
        }

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Función para crear una tarjeta de materia
function crearMateriaCard(materia) {
    return `
        <div class="materia-card">
            <div class="materia-header">
                <h3>${materia.nombre}</h3>
                <div class="codigo">Código: ${materia.codigo}</div>
            </div>
            <div class="materia-content">
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
                <div class="materia-actions">
                    <button class="btn btn-primary btn-sm" onclick="verMateria(${materia.id})">
                        Ver Detalles
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="editarMateria(${materia.id})">
                        Editar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Función para cargar materias
async function cargarMaterias() {
    try {
        const materias = await fetchAPI('/materias/');
        
        if (materias && materias.length > 0) {
            // Crear tarjetas de materias
            const materiasHTML = materias.map(materia => crearMateriaCard(materia)).join('');
            materiasGridElement.innerHTML = materiasHTML;

            // Cargar estadísticas específicas de cada materia
            materias.forEach(materia => {
                cargarEstadisticasMateria(materia.id);
            });
        } else {
            materiasGridElement.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                    <p style="color: var(--text-secondary);">No hay materias registradas</p>
                    <button class="btn btn-primary" onclick="window.location.href='/materias-page'">
                        Crear primera materia
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando materias:', error);
        materiasGridElement.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <p style="color: var(--danger-color);">Error al cargar las materias</p>
            </div>
        `;
    }
}

// Función para cargar estadísticas específicas de una materia
async function cargarEstadisticasMateria(materiaId) {
    try {
        // Cargar tareas de la materia
        const tareas = await fetchAPI(`/tareas/materia/${materiaId}`);
        const tareasElement = document.getElementById(`tareas-${materiaId}`);
        if (tareasElement && tareas) {
            tareasElement.textContent = tareas.length;
        }

        // Por ahora, el número de alumnos se puede obtener de la relación muchos a muchos
        // Esto requeriría un endpoint específico o modificar el modelo
        const alumnosElement = document.getElementById(`alumnos-${materiaId}`);
        if (alumnosElement) {
            alumnosElement.textContent = '0'; // Placeholder por ahora
        }
    } catch (error) {
        console.error(`Error cargando estadísticas de materia ${materiaId}:`, error);
    }
}

// Funciones para acciones de materias
function verMateria(materiaId) {
    // Por ahora redirigir a la página de materias
    window.location.href = `/materias-page?id=${materiaId}`;
}

function editarMateria(materiaId) {
    // Por ahora redirigir a la página de materias
    window.location.href = `/materias-page?edit=${materiaId}`;
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    
    // Estilos básicos
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
    
    // Colores según tipo
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
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

// Función para verificar el estado de la API
async function verificarEstadoAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (response.ok) {
            console.log('API conectada correctamente');
        } else {
            console.error('Error en la API');
            mostrarNotificacion('Error de conexión con la API', 'error');
        }
    } catch (error) {
        console.error('No se puede conectar con la API:', error);
        mostrarNotificacion('No se puede conectar con la API', 'error');
    }
}

// Función de inicialización
async function inicializar() {
    console.log('Inicializando dashboard...');
    
    // Verificar estado de la API
    await verificarEstadoAPI();
    
    // Cargar datos
    await Promise.all([
        cargarEstadisticas(),
        cargarMaterias()
    ]);
    
    console.log('Dashboard inicializado');
}

// Agregar estilos CSS para animaciones de notificaciones
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializar);

// Exportar funciones para uso global
window.verMateria = verMateria;
window.editarMateria = editarMateria;
window.mostrarNotificacion = mostrarNotificacion; 