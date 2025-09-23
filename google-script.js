function enviarDatosGoogle(datos) {
    return new Promise((resolve) => {
        const scriptUrl = "https://script.google.com/macros/s/AKfycbxnAgTnYdqYkpn2AxhxPFKz3BNaXaVh_ud7HSJtB-h4cgT5t5kez_jvL2Bbs8f7cASBcg/exec";
        
        fetch(scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',   // 👈 importante
            },
            body: JSON.stringify(datos)              // 👈 enviamos JSON puro
        })
        .then(response => response.json())
        .then(resultado => {
            console.log("Respuesta Apps Script:", resultado);
            resolve({ exito: true, respuesta: resultado });
        })
        .catch(error => {
            console.error('Error con fetch:', error);
            resolve({ exito: false, respuesta: error.toString() });
        });
    });
}
