// Función para cargar las tareas desde la API
async function cargarTareas() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const tabla = document.getElementById('tablaTareas');
    const emptyState = document.getElementById('empty-state');
    const listaTareas = document.getElementById('listaTareas');

    // Mostrar loading
    loading.style.display = 'block';
    error.style.display = 'none';
    tabla.style.display = 'none';
    emptyState.style.display = 'none';

    try {
        const response = await fetch('http://127.0.0.1:8000/tareas/');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const tareas = await response.json();
        
        // Ocultar loading
        loading.style.display = 'none';

        if (tareas.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        // Mostrar tabla y llenar con datos
        tabla.style.display = 'table';
        listaTareas.innerHTML = '';

        tareas.forEach(tarea => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tarea.id}</td>
                <td>${tarea.titulo}</td>
                <td>${tarea.descripcion || '-'}</td>
                <td>
                    <span class="tipo-badge ${tarea.tipo?.toLowerCase() || 'otro'}">
                        ${tarea.tipo || 'Otro'}
                    </span>
                </td>
                <td>
                    <span class="fecha-text">
                        ${tarea.fecha_publicacion ? formatearFecha(tarea.fecha_publicacion) : '-'}
                    </span>
                </td>
                <td>
                    <span class="fecha-text ${esFechaVencida(tarea.fecha_entrega) ? 'fecha-vencida' : esFechaProxima(tarea.fecha_entrega) ? 'fecha-proxima' : ''}">
                        ${tarea.fecha_entrega ? formatearFecha(tarea.fecha_entrega) : '-'}
                    </span>
                </td>
                <td>${tarea.profesor ? `${tarea.profesor.nombre} ${tarea.profesor.apellido}` : '-'}</td>
                <td>${tarea.materia ? tarea.materia.nombre : '-'}</td>
                <td>
                    <span class="puntaje-text ${tarea.puntaje ? '' : 'sin-puntaje'}">
                        ${tarea.puntaje ? `${tarea.puntaje} pts` : 'Sin puntaje'}
                    </span>
                </td>
                <td>
                    <span class="estado-badge ${tarea.estado?.toLowerCase() || 'activa'}">
                        ${tarea.estado || 'Activa'}
                    </span>
                </td>
            `;
            listaTareas.appendChild(row);
        });

    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = `Error al cargar las tareas: ${err.message}`;
        console.error('Error:', err);
    }
}

// Función para formatear fechas
function formatearFecha(fecha) {
    if (!fecha) return '-';
    
    try {
        const fechaObj = new Date(fecha);
        return fechaObj.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        return fecha; // Retorna la fecha original si no se puede formatear
    }
}

// Función para verificar si una fecha está vencida
function esFechaVencida(fecha) {
    if (!fecha) return false;
    
    try {
        const fechaObj = new Date(fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Establecer a medianoche para comparar solo fechas
        return fechaObj < hoy;
    } catch (error) {
        return false;
    }
}

// Función para verificar si una fecha está próxima (dentro de 3 días)
function esFechaProxima(fecha) {
    if (!fecha) return false;
    
    try {
        const fechaObj = new Date(fecha);
        const hoy = new Date();
        const tresDias = new Date(hoy.getTime() + (3 * 24 * 60 * 60 * 1000));
        
        hoy.setHours(0, 0, 0, 0);
        fechaObj.setHours(0, 0, 0, 0);
        tresDias.setHours(0, 0, 0, 0);
        
        return fechaObj >= hoy && fechaObj <= tresDias;
    } catch (error) {
        return false;
    }
}

// Cargar tareas al cargar la página
document.addEventListener('DOMContentLoaded', cargarTareas);

// Event listener para el botón de cargar
document.getElementById('cargarTareas').addEventListener('click', cargarTareas);
