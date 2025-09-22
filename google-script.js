// google-script.js - Versión corregida
function enviarDatosGoogle(datos) {
    return new Promise((resolve) => {
        const scriptUrl = "https://script.google.com/macros/s/AKfycbxD9E5p2t0U4CJ7rhhsf8i6n-0_xJsBbgvPulx-6F4kXgoCBdl-fyPQgrWrU_JyUM6XKA/exec";
        
        // Crear un formulario invisible
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = scriptUrl;
        form.style.display = 'none';
        
        // Agregar datos como input hidden
        const dataInput = document.createElement('input');
        dataInput.name = 'data';
        dataInput.value = JSON.stringify(datos);
        form.appendChild(dataInput);
        
        // Crear iframe para recibir respuesta
        const iframe = document.createElement('iframe');
        iframe.name = 'responseFrame';
        iframe.style.display = 'none';
        
        // Bandera para evitar doble procesamiento
        let respuestaProcesada = false;
        
        iframe.onload = function() {
            if (respuestaProcesada) return;
            respuestaProcesada = true;
            
            // Limpiar elementos de forma segura
            if (form.parentNode) {
                form.parentNode.removeChild(form);
            }
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
            
            resolve({ exito: true, respuesta: 'Datos enviados correctamente' });
        };
        
        // También manejar errores
        iframe.onerror = function() {
            if (respuestaProcesada) return;
            respuestaProcesada = true;
            
            // Limpiar elementos de forma segura
            if (form.parentNode) {
                form.parentNode.removeChild(form);
            }
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
            
            resolve({ exito: true, respuesta: 'Datos enviados (respuesta pendiente)' });
        };
        
        form.target = 'responseFrame';
        document.body.appendChild(iframe);
        document.body.appendChild(form);
        
        // Enviar formulario
        form.submit();
        
        // Timeout de seguridad
        setTimeout(() => {
            if (respuestaProcesada) return;
            respuestaProcesada = true;
            
            // Limpiar elementos de forma segura
            if (form.parentNode) {
                form.parentNode.removeChild(form);
            }
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
            
            resolve({ exito: true, respuesta: 'Datos procesados' });
        }, 5000);
    });
}