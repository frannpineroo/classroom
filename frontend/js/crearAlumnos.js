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
    
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const legajo = document.getElementById('legajo').value.trim();
    const mail = document.getElementById('mail').value.trim();

    // Limpiar errores previos
    clearError('nombre');
    clearError('apellido');
    clearError('legajo');
    clearError('mail');

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

    // Validar legajo
    if (!legajo) {
        showError('legajo', 'El legajo es obligatorio');
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
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        legajo: parseInt(document.getElementById('legajo').value.trim()),
        mail: document.getElementById('mail').value.trim()
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
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() {
        clearError(this.id);
    });
}); 