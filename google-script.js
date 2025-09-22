// google-script.js - Reemplaza la comunicación con tu backend
async function enviarDatosGoogle(datos) {
  const scriptUrl = "https://script.google.com/macros/s/AKfycbx294wXXMXd17iBaS42s01v3EDh3LdLORoQRgyh7mZEX32nNOtn1CbpwKA-OLEh7vV6ow/exec";
  
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