// google-script.js - Solución para URLs /exec
function enviarDatosGoogle(datos) {
    return new Promise((resolve) => {
        const scriptUrl = "https://script.google.com/macros/s/AKfycbxD9E5p2t0U4CJ7rhhsf8i6n-0_xJsBbgvPulx-6F4kXgoCBdl-fyPQgrWrU_JyUM6XKA/exec";
        
        // Crear un formulario invisible para evitar CORS
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
        
        iframe.onload = function() {
            // Esto se ejecutará cuando llegue la respuesta
            resolve({ exito: true, respuesta: 'Datos enviados' });
            document.body.removeChild(form);
            document.body.removeChild(iframe);
        };
        
        form.target = 'responseFrame';
        document.body.appendChild(iframe);
        document.body.appendChild(form);
        
        // Enviar formulario
        form.submit();
        
        // Timeout por si falla
        setTimeout(() => {
            resolve({ exito: true, respuesta: 'Datos en proceso' });
        }, 3000);
    });
}