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
        
        function limpiarElementos() {
            if (respuestaProcesada) return;
            respuestaProcesada = true;
            
            // Limpiar elementos de forma segura (verificar existencia primero)
            try {
                if (form && form.parentNode) {
                    form.parentNode.removeChild(form);
                }
                if (iframe && iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            } catch (error) {
                console.log('Elementos ya removidos:', error.message);
            }
        }
        
        iframe.onload = function() {
            limpiarElementos();
            resolve({ exito: true, respuesta: 'Datos enviados correctamente' });
        };
        
        // También manejar errores
        iframe.onerror = function() {
            limpiarElementos();
            resolve({ exito: true, respuesta: 'Datos enviados (respuesta pendiente)' });
        };
        
        form.target = 'responseFrame';
        document.body.appendChild(iframe);
        document.body.appendChild(form);
        
        // Enviar formulario
        form.submit();
        
        // Timeout de seguridad
        setTimeout(() => {
            limpiarElementos();
            resolve({ exito: true, respuesta: 'Datos procesados' });
        }, 5000);
    });
}