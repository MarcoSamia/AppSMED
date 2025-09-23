// google-script.js - Versión mejorada
function enviarDatosGoogle(datos) {
    return new Promise((resolve, reject) => {
        const scriptUrl = "https://script.google.com/macros/s/AKfycbxnAgTnYdqYkpn2AxhxPFKz3BNaVh_ud7HSJtB-h4cgT5t5kez_jvL2Bbs8f7cASBcg/exec";

        fetch(scriptUrl, {
            method: 'POST',
            body: JSON.stringify(datos), // Envía el JSON directamente
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'no-cors' // Cambiamos el modo para evitar problemas con la redirección
        })
        .then(res => {
            // Con no-cors no podemos leer la respuesta, pero confiamos en que se envió
            console.log("Solicitud enviada en modo no-cors. Revisa Google Sheets para confirmar.");
            resolve({ exito: true, respuesta: 'Datos enviados. Revisa la hoja de cálculo para confirmar.' });
        })
        .catch(error => {
            console.error('Error con fetch:', error);
            reject({ exito: false, respuesta: 'Error al enviar los datos.' });
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

