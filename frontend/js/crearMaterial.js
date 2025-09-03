const form = document.getElementById('formMaterial');
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

// Función para validar URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Función para validar el formulario
function validateForm() {
    let isValid = true;
    
    const titulo = document.getElementById('titulo').value.trim();
    const archivo = document.getElementById('archivo').value.trim();
    const profesor_id = document.getElementById('profesor_id').value.trim();
    const materia_id = document.getElementById('materia_id').value.trim();
    const tamanio = document.getElementById('tamanio').value.trim();

    // Limpiar errores previos
    clearError('titulo');
    clearError('archivo');
    clearError('profesor_id');
    clearError('materia_id');
    clearError('tamanio');

    // Validar título
    if (!titulo) {
        showError('titulo', 'El título es obligatorio');
        isValid = false;
    } else if (titulo.length < 3) {
        showError('titulo', 'El título debe tener al menos 3 caracteres');
        isValid = false;
    }

    // Validar URL del archivo si se proporciona
    if (archivo && !isValidUrl(archivo)) {
        showError('archivo', 'Ingresa una URL válida');
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

    // Validar tamaño del archivo si se proporciona
    if (tamanio && (isNaN(tamanio) || parseInt(tamanio) < 0)) {
        showError('tamanio', 'El tamaño debe ser un número positivo');
        isValid = false;
    }

    return isValid;
}

// Función para crear material
async function crearMaterial(materialData) {
    try {
        const response = await fetch('http://127.0.0.1:8000/materiales/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(materialData)
        });

        if (!response.ok) {
            // Intentar obtener el error como JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
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
        archivo: document.getElementById('archivo').value.trim() || null,
        fecha_subida: document.getElementById('fecha_subida').value || null,
        profesor_id: document.getElementById('profesor_id').value ? parseInt(document.getElementById('profesor_id').value) : null,
        materia_id: document.getElementById('materia_id').value ? parseInt(document.getElementById('materia_id').value) : null,
        tamanio: document.getElementById('tamanio').value ? parseInt(document.getElementById('tamanio').value) : null,
        estado: document.getElementById('estado').value || 'Activo'
    };

    // Mostrar loading
    loading.style.display = 'block';
    btnCrear.disabled = true;

    try {
        const nuevoMaterial = await crearMaterial(formData);
        
        // Mostrar mensaje de éxito
        successMessage.style.display = 'block';
        loading.style.display = 'none';
        
        // Limpiar formulario
        form.reset();
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
            window.location.href = 'materiales.html';
        }, 2000);

    } catch (error) {
        loading.style.display = 'none';
        btnCrear.disabled = false;
        
        // Mostrar error general
        alert(`Error al crear el material: ${error.message}`);
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

// Establecer fecha actual por defecto
document.addEventListener('DOMContentLoaded', function() {
    const fechaSubida = document.getElementById('fecha_subida');
    if (!fechaSubida.value) {
        const today = new Date().toISOString().split('T')[0];
        fechaSubida.value = today;
    }
});

// Función para formatear el tamaño del archivo en tiempo real
document.getElementById('tamanio').addEventListener('input', function() {
    const tamanio = this.value;
    if (tamanio && !isNaN(tamanio)) {
        const bytes = parseInt(tamanio);
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        
        // Mostrar el tamaño formateado como hint
        if (!this.nextElementSibling.classList.contains('error-message')) {
            const hint = document.createElement('div');
            hint.className = 'size-hint';
            hint.style.color = '#888';
            hint.style.fontSize = '0.9rem';
            hint.style.marginTop = '5px';
            hint.textContent = `Tamaño: ${formattedSize}`;
            
            // Remover hint anterior si existe
            const existingHint = this.parentNode.querySelector('.size-hint');
            if (existingHint) {
                existingHint.remove();
            }
            
            this.parentNode.appendChild(hint);
        }
    } else {
        // Remover hint si no hay valor válido
        const existingHint = this.parentNode.querySelector('.size-hint');
        if (existingHint) {
            existingHint.remove();
        }
    }
});
