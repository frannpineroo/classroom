// Función para cargar los materiales desde la API
async function cargarMateriales() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const tabla = document.getElementById('tablaMateriales');
    const emptyState = document.getElementById('empty-state');
    const listaMateriales = document.getElementById('listaMateriales');

    // Mostrar loading
    loading.style.display = 'block';
    error.style.display = 'none';
    tabla.style.display = 'none';
    emptyState.style.display = 'none';

    try {
        const response = await fetch('http://127.0.0.1:8000/materiales/');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const materiales = await response.json();
        
        // Ocultar loading
        loading.style.display = 'none';

        if (materiales.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        // Mostrar tabla y llenar con datos
        tabla.style.display = 'table';
        listaMateriales.innerHTML = '';

        materiales.forEach(material => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${material.id}</td>
                <td>${material.titulo}</td>
                <td>${material.descripcion || '-'}</td>
                <td>
                    <span class="tipo-badge ${material.tipo?.toLowerCase() || 'otro'}">
                        ${material.tipo || 'Otro'}
                    </span>
                </td>
                <td>
                    ${material.archivo ? 
                        `<a href="${material.archivo}" class="archivo-link" target="_blank">Ver archivo</a>` : 
                        '-'
                    }
                </td>
                <td>${material.fecha_subida || '-'}</td>
                <td>${material.profesor ? `${material.profesor.nombre} ${material.profesor.apellido}` : '-'}</td>
                <td>${material.materia ? material.materia.nombre : '-'}</td>
                <td>
                    ${material.tamanio ? 
                        `<span class="tamanio-text">${formatearTamanio(material.tamanio)}</span>` : 
                        '-'
                    }
                </td>
                <td>
                    <span class="estado-badge ${material.estado?.toLowerCase() || 'activo'}">
                        ${material.estado || 'Activo'}
                    </span>
                </td>
            `;
            listaMateriales.appendChild(row);
        });

    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = `Error al cargar los materiales: ${err.message}`;
        console.error('Error:', err);
    }
}

// Función para formatear el tamaño del archivo
function formatearTamanio(bytes) {
    if (!bytes) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Cargar materiales al cargar la página
document.addEventListener('DOMContentLoaded', cargarMateriales);

// Event listener para el botón de cargar
document.getElementById('cargarMateriales').addEventListener('click', cargarMateriales);
