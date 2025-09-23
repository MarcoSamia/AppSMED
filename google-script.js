// google-script.js - Versión simplificada y robusta
function enviarDatosGoogle(datos) {
    return new Promise((resolve) => {
        const scriptUrl = "https://script.google.com/macros/s/AKfycbyWRw76UlwEB6vtf3bVNsZw9-4tYEBlBRd07DvKsDaaAuJ9EB5lTAoHeVKOVzb1hwEELw/exec";
        
        // Usar fetch API en lugar de formulario (más moderno y confiable)
        fetch(scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'data=' + encodeURIComponent(JSON.stringify(datos))
        })
        .then(response => response.text())
        .then(resultado => {
            resolve({ exito: true, respuesta: 'Datos enviados correctamente' });
        })
        .catch(error => {
            console.warn('Error con fetch, intentando método alternativo...', error);
            // Fallback al método original pero sin manipulación compleja del DOM
            enviarDatosGoogleFallback(datos, resolve);
        });
    });
}

// Método fallback simplificado
function enviarDatosGoogleFallback(datos, resolve) {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbxD9E5p2t0U4CJ7rhhsf8i6n-0_xJsBbgvPulx-6F4kXgoCBdl-fyPQgrWrU_JyUM6XKA/exec";
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = scriptUrl;
    form.style.display = 'none';
    
    const dataInput = document.createElement('input');
    dataInput.name = 'data';
    dataInput.value = JSON.stringify(datos);
    form.appendChild(dataInput);
    
    document.body.appendChild(form);
    
    // Simplemente enviar y resolver después de un tiempo
    form.submit();
    
    setTimeout(() => {
        try {
            if (form.parentNode) {
                form.parentNode.removeChild(form);
            }
        } catch (e) {
            // Ignorar errores de limpieza
        }
        resolve({ exito: true, respuesta: 'Datos enviados' });
    }, 3000);

}
