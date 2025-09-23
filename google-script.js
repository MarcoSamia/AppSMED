// google-script.js - Versión Final y Correcta
function enviarDatosGoogle(datos) {
    return new Promise((resolve, reject) => {
        const scriptUrl = "https://script.google.com/macros/s/AKfycbxnAgTnYdqYkpn2AxhxPFKz3BNaVh_ud7HSJtB-h4cgT5t5kez_jvL2Bbs8f7cASBcg/exec";

        fetch(scriptUrl, {
            method: 'POST',
            // NO debe tener 'mode: no-cors'
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(res => res.json()) // Parsea la respuesta del script como JSON
        .then(respuestaDelServidor => {
            // AHORA VERÁS ESTE MENSAJE EN LA CONSOLA
            console.log("Respuesta del servidor:", respuestaDelServidor); 
            if (respuestaDelServidor.success) {
                resolve({ exito: true, respuesta: respuestaDelServidor.message });
            } else {
                reject({ exito: false, respuesta: respuestaDelServidor.error });
            }
        })
        .catch(error => {
            console.error('Error con fetch:', error);
            reject({ exito: false, respuesta: 'Error al contactar el servidor. ' + error });
        });
    });
}
