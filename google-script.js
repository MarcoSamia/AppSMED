// google-script.js - Versión final y robusta
function enviarDatosGoogle(datos) {
    return new Promise((resolve, reject) => {
        const scriptUrl = "https://script.google.com/macros/s/AKfycbxnAgTnYdqYkpn2AxhxPFKz3BNaVh_ud7HSJtB-h4cgT5t5kez_jvL2Bbs8f7cASBcg/exec";

        fetch(scriptUrl, {
            method: 'POST',
            // Quita el 'mode: no-cors' para poder leer la respuesta del servidor.
            // CORS ya está solucionado en tu script con doOptions.
            
            headers: {
                // Especifica que estás enviando JSON.
                'Content-Type': 'application/json' 
            },
            // Convierte el objeto de datos a un string JSON y lo pones directamente en el cuerpo.
            body: JSON.stringify(datos)
        })
        .then(res => res.json()) // Parsea la respuesta del script como JSON
        .then(respuestaDelServidor => {
            console.log("Respuesta del servidor:", respuestaDelServidor);
            if (respuestaDelServidor.success) {
                resolve({ exito: true, respuesta: respuestaDelServidor.message });
            } else {
                // Si el script reporta un error, lo rechazamos para que se muestre en el .catch
                reject({ exito: false, respuesta: respuestaDelServidor.error });
            }
        })
        .catch(error => {
            console.error('Error con fetch:', error);
            // Esto ahora atrapará tanto errores de red como los errores que reporte el script.
            reject({ exito: false, respuesta: 'Error al contactar el servidor. ' + error });
        });
    });
}
