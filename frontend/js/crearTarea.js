const form = document.getElementById('formTarea');
const btnCrear = document.getElementById('btnCrear');
const loading = document.getElementById('loading');
const successMessage = document.getElementById('success-message');

// Función para mostrar errores
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + '-error');
    
    field.classList.add('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Función para limpiar errores
function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + '-error');
    
    field.classList.remove('error');
    errorDiv.style.display = 'none';
}

// Función para validar fechas
function isValidDate(dateString) {
    if (!dateString) return true; // Las fechas opcionales son válidas si están vacías
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// Función para validar que la fecha de entrega sea posterior a la de publicación
function validateDateRange() {
    const fechaPublicacion = document.getElementById('fecha_publicacion').value;
    const fechaEntrega = document.getElementById('fecha_entrega').value;
    
    if (fechaPublicacion && fechaEntrega) {
        const fechaPub = new Date(fechaPublicacion);
        const fechaEnt = new Date(fechaEntrega);
        
        if (fechaEnt <= fechaPub) {
            showError('fecha_entrega', 'La fecha de entrega debe ser posterior a la fecha de publicación');
            return false;
        }
    }
    
    return true;
}

// Función para validar el formulario
function validateForm() {
    let isValid = true;
    
    const titulo = document.getElementById('titulo').value.trim();
    const fechaEntrega = document.getElementById('fecha_entrega').value.trim();
    const profesor_id = document.getElementById('profesor_id').value.trim();
    const materia_id = document.getElementById('materia_id').value.trim();
    const puntaje = document.getElementById('puntaje').value.trim();

    // Limpiar errores previos
    clearError('titulo');
    clearError('fecha_entrega');
    clearError('profesor_id');
    clearError('materia_id');
    clearError('puntaje');

    // Validar título
    if (!titulo) {
        showError('titulo', 'El título es obligatorio');
        isValid = false;
    } else if (titulo.length < 3) {
        showError('titulo', 'El título debe tener al menos 3 caracteres');
        isValid = false;
    }

    // Validar fecha de entrega
    if (!fechaEntrega) {
        showError('fecha_entrega', 'La fecha de entrega es obligatoria');
        isValid = false;
    } else if (!isValidDate(fechaEntrega)) {
        showError('fecha_entrega', 'Ingresa una fecha válida');
        isValid = false;
    }

    // Validar ID del profesor si se proporciona
    if (profesor_id && (isNaN(profesor_id) || parseInt(profesor_id) <= 0)) {
        showError('profesor_id', 'El ID del profesor debe ser un número positivo');
        isValid = false;
    }

    // Validar ID de la materia si se proporciona
    if (materia_id && (isNaN(materia_id) || parseInt(materia_id) <= 0)) {
        showError('materia_id', 'El ID de la materia debe ser un número positivo');
        isValid = false;
    }

    // Validar puntaje si se proporciona
    if (puntaje && (isNaN(puntaje) || parseInt(puntaje) < 0)) {
        showError('puntaje', 'El puntaje debe ser un número positivo');
        isValid = false;
    }

    // Validar rango de fechas
    if (!validateDateRange()) {
        isValid = false;
    }

    return isValid;
}

// Función para crear tarea
async function crearTarea(tareaData) {
    try {
        const response = await fetch('http://127.0.0.1:8000/tareas/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tareaData)
        });

        if (!response.ok) {
            // Intentar obtener el error como JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                console.error('Error data:', errorData);
                
                // Manejar diferentes formatos de error de FastAPI
                let errorMessage = '';
                if (errorData.detail) {
                    if (Array.isArray(errorData.detail)) {
                        // Errores de validación de Pydantic
                        errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
                    } else {
                        errorMessage = errorData.detail;
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else {
                    errorMessage = `Error HTTP: ${response.status}`;
                }
                
                throw new Error(errorMessage);
            } else {
                // Si no es JSON, obtener el texto del error
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Error del servidor (${response.status}): ${response.statusText}`);
            }
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// Event listener para el formulario
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const formData = {
        titulo: document.getElementById('titulo').value.trim(),
        descripcion: document.getElementById('descripcion').value.trim() || null,
        tipo: document.getElementById('tipo').value || null,
        fecha_publicacion: document.getElementById('fecha_publicacion').value || null,
        fecha_entrega: document.getElementById('fecha_entrega').value,
        estado: document.getElementById('estado').value || 'Activa'
    };

    // Solo agregar campos numéricos si tienen valor
    const profesorId = document.getElementById('profesor_id').value.trim();
    if (profesorId) {
        formData.profesor_id = parseInt(profesorId);
    }

    const materiaId = document.getElementById('materia_id').value.trim();
    if (materiaId) {
        formData.materia_id = parseInt(materiaId);
    }

    const puntaje = document.getElementById('puntaje').value.trim();
    if (puntaje) {
        formData.puntaje = parseInt(puntaje);
    }

    console.log('Datos a enviar:', formData);

    // Mostrar loading
    loading.style.display = 'block';
    btnCrear.disabled = true;

    try {
        const nuevaTarea = await crearTarea(formData);
        
        // Mostrar mensaje de éxito
        successMessage.style.display = 'block';
        loading.style.display = 'none';
        
        // Limpiar formulario
        form.reset();
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
            window.location.href = 'tareas.html';
        }, 2000);

    } catch (error) {
        loading.style.display = 'none';
        btnCrear.disabled = false;
        
        // Mostrar error general
        alert(`Error al crear la tarea: ${error.message}`);
        console.error('Error:', error);
    }
});

// Limpiar errores cuando el usuario empiece a escribir
document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', function() {
        clearError(this.id);
    });
    input.addEventListener('change', function() {
        clearError(this.id);
    });
});

// Establecer fechas por defecto
document.addEventListener('DOMContentLoaded', function() {
    const fechaPublicacion = document.getElementById('fecha_publicacion');
    const fechaEntrega = document.getElementById('fecha_entrega');
    
    // Establecer fecha de publicación como hoy
    if (!fechaPublicacion.value) {
        const today = new Date().toISOString().split('T')[0];
        fechaPublicacion.value = today;
    }
    
    // Establecer fecha de entrega como 7 días desde hoy
    if (!fechaEntrega.value) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        fechaEntrega.value = nextWeek.toISOString().split('T')[0];
    }
});

// Validación en tiempo real para fechas
document.getElementById('fecha_publicacion').addEventListener('change', function() {
    validateDateRange();
});

document.getElementById('fecha_entrega').addEventListener('change', function() {
    validateDateRange();
});

// Función para mostrar hint de puntaje
document.getElementById('puntaje').addEventListener('input', function() {
    const puntaje = this.value;
    
    // Remover hint anterior si existe
    const existingHint = this.parentNode.querySelector('.puntaje-hint');
    if (existingHint) {
        existingHint.remove();
    }
    
    if (puntaje && !isNaN(puntaje)) {
        const hint = document.createElement('div');
        hint.className = 'puntaje-hint';
        hint.textContent = `Puntaje: ${puntaje} puntos`;
        this.parentNode.appendChild(hint);
    }
});
