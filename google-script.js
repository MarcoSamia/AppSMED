// google-script.js - Reemplaza la comunicación con tu backend
async function enviarDatosGoogle(datos) {
  const scriptUrl = "https://script.google.com/macros/s/AKfycbxRcxGCsNDlDHnWi_LsCMPOzpjwFl1NFhwjjazAU_3OVn6-jWb7pT23qKPSbYIa_sI/exec";
  
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