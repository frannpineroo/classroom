const form = document.getElementById('formAlumno');
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

// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para validar el formulario
function validateForm() {
    let isValid = true;
    
    const documento = document.getElementById('documento').value.trim();
    const nro_doc = document.getElementById('nro_doc').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const mail = document.getElementById('mail').value.trim();

    // Limpiar errores previos
    clearError('documento');
    clearError('nro_doc');
    clearError('nombre');
    clearError('apellido');
    clearError('mail');

    // Validar tipo de documento
    if (!documento) {
        showError('documento', 'El tipo de documento es obligatorio');
        isValid = false;
    }

    // Validar número de documento
    if (!nro_doc) {
        showError('nro_doc', 'El número de documento es obligatorio');
        isValid = false;
    }

    // Validar nombre
    if (!nombre) {
        showError('nombre', 'El nombre es obligatorio');
        isValid = false;
    } else if (nombre.length < 2) {
        showError('nombre', 'El nombre debe tener al menos 2 caracteres');
        isValid = false;
    }

    // Validar apellido
    if (!apellido) {
        showError('apellido', 'El apellido es obligatorio');
        isValid = false;
    } else if (apellido.length < 2) {
        showError('apellido', 'El apellido debe tener al menos 2 caracteres');
        isValid = false;
    }

    // Validar email
    if (!mail) {
        showError('mail', 'El email es obligatorio');
        isValid = false;
    } else if (!isValidEmail(mail)) {
        showError('mail', 'Ingresa un email válido');
        isValid = false;
    }

    return isValid;
}

// Función para crear alumno
async function crearAlumno(alumnoData) {
    try {
        const response = await fetch('http://127.0.0.1:8000/alumnos/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(alumnoData)
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
        documento: document.getElementById('documento').value.trim(),
        nro_doc: document.getElementById('nro_doc').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        nacimiento: document.getElementById('nacimiento').value || null,
        mail: document.getElementById('mail').value.trim(),
        telefono: document.getElementById('telefono').value || null,
        direccion: document.getElementById('direccion').value || null,
        cohorte: document.getElementById('cohorte').value || null,
        estado: document.getElementById('estado').value || 'Activo',
        al_dia: document.getElementById('al_dia').checked,
        carrera_id: document.getElementById('carrera_id').value ? parseInt(document.getElementById('carrera_id').value) : null
    };

    // Mostrar loading
    loading.style.display = 'block';
    btnCrear.disabled = true;

    try {
        const nuevoAlumno = await crearAlumno(formData);
        
        // Mostrar mensaje de éxito
        successMessage.style.display = 'block';
        loading.style.display = 'none';
        
        // Limpiar formulario
        form.reset();
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
            window.location.href = '/alumnos-page';
        }, 2000);

    } catch (error) {
        loading.style.display = 'none';
        btnCrear.disabled = false;
        
        // Mostrar error general
        alert(`Error al crear el alumno: ${error.message}`);
        console.error('Error:', error);
    }
});

// Limpiar errores cuando el usuario empiece a escribir
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', function() {
        clearError(this.id);
    });
    input.addEventListener('change', function() {
        clearError(this.id);
    });
});

// Limpiar errores para checkboxes
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        clearError(this.id);
    });
}); 