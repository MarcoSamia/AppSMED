// google-script.js - Reemplaza la comunicación con tu backend
async function enviarDatosGoogle(datos) {
  const scriptUrl = "https://script.google.com/macros/s/AKfycbxRcxGCsNDlDHnWi_LsCMPOzpjwFl1NFhwjjazAU_3OVn6-jWb7pT23qKPSbYIa_sI/exec";
  
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos)
    });
    
    const resultado = await response.text();
    return { exito: true, respuesta: resultado };
  } catch (error) {
    console.error('Error al enviar datos:', error);
    return { exito: false, error: error.message };
  }
}