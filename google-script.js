// google-script.js - Reemplaza la comunicación con tu backend
async function enviarDatosGoogle(datos) {
  const scriptUrl = "https://script.google.com/macros/s/AKfycbxD9E5p2t0U4CJ7rhhsf8i6n-0_xJsBbgvPulx-6F4kXgoCBdl-fyPQgrWrU_JyUM6XKA/exec";
  
  try {
        const response = await fetch(scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors', // Asegurar modo CORS
            body: JSON.stringify(datos)
        });
        
        // Manejar respuesta JSON
        const resultado = await response.json();
        return { 
            exito: resultado.success, 
            respuesta: resultado.message || resultado.error 
        };
        
    } catch (error) {
        console.error('Error al enviar datos:', error);
        return { 
            exito: false, 
            error: error.message 
        };
    }
}