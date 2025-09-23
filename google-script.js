// google-script.js - VERSIÓN FINAL COMPLETA
function enviarDatosGoogle(datos) {
    return new Promise((resolve, reject) => {
        const scriptUrl = "https://script.google.com/macros/s/AKfycbxjUs5VVUGPjKFf19UhTNPqWfFjDKerPmJpF3FIwPPzM8aPbkehBhKKMOacu_pPolgYfg/exec";

        fetch(scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(res => {
            if (!res.ok) { // Si la respuesta no es 2xx, lanza un error
                throw new Error(`Error en el servidor: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(respuestaDelServidor => {
            console.log("Respuesta del servidor:", respuestaDelServidor);
            if (respuestaDelServidor.success) {
                resolve({ exito: true, respuesta: respuestaDelServidor.message });
            } else {
                reject({ exito: false, respuesta: "Error reportado por el script: " + respuestaDelServidor.error });
            }
        })
        .catch(error => {
            console.error('Error con fetch:', error);
            reject({ exito: false, respuesta: 'Error al contactar el servidor. ' + error.message });
        });
    });
}

