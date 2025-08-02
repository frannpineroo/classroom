// Función para cargar los alumnos desde la API
async function cargarAlumnos() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const tabla = document.getElementById('tablaAlumnos');
    const emptyState = document.getElementById('empty-state');
    const listaAlumnos = document.getElementById('listaAlumnos');

    // Mostrar loading
    loading.style.display = 'block';
    error.style.display = 'none';
    tabla.style.display = 'none';
    emptyState.style.display = 'none';

    try {
        const response = await fetch('http://127.0.0.1:8000/alumnos/');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const alumnos = await response.json();
        
        // Ocultar loading
        loading.style.display = 'none';

        if (alumnos.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        // Mostrar tabla y llenar con datos
        tabla.style.display = 'table';
        listaAlumnos.innerHTML = '';

        alumnos.forEach(alumno => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${alumno.id}</td>
                <td>${alumno.documento} ${alumno.nro_doc}</td>
                <td>${alumno.nombre}</td>
                <td>${alumno.apellido}</td>
                <td>${alumno.mail}</td>
                <td>${alumno.telefono || '-'}</td>
                <td>
                    <span class="estado-badge ${alumno.estado?.toLowerCase() || 'activo'}">
                        ${alumno.estado || 'Activo'}
                    </span>
                </td>
                <td>
                    <span class="al-dia-badge ${alumno.al_dia ? 'si' : 'no'}">
                        ${alumno.al_dia ? 'Sí' : 'No'}
                    </span>
                </td>
            `;
            listaAlumnos.appendChild(row);
        });

    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = `Error al cargar los alumnos: ${err.message}`;
        console.error('Error:', err);
    }
}

// Cargar alumnos al cargar la página
document.addEventListener('DOMContentLoaded', cargarAlumnos);

// Event listener para el botón de cargar
document.getElementById('cargarAlumnos').addEventListener('click', cargarAlumnos); 