document.addEventListener("DOMContentLoaded", async () => {
    // Seleccionamos los elementos del HTML
    const input = document.getElementById("input");
    const btn = document.getElementById("btn");
    const messages = document.getElementById("messages");

    // Función principal para enviar datos al servidor
    async function enviarAlServidor(textoInput) {
        try {
            const res = await fetch("http://localhost:3000/mensaje", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texto: textoInput })
            });
            const data = await res.json();
            renderizarRespuesta(data);
        } catch (error) {
            console.error("Error de conexión:", error);
            messages.innerHTML += `<div class="bot-message" style="color: red;">Error al conectar con el servidor.</div>`;
        }
    }

    // 1. Al cargar la página, reiniciamos el servidor e iniciamos el chat
    await fetch("http://localhost:3000/reset");
    enviarAlServidor("START_FLOW");

    // 2. Evento del botón de enviar (CON EL FRENO DE MANO)
    btn.onclick = (e) => {
        e.preventDefault(); // Evita que la página se recargue

        // Si el chat terminó, el botón sirve para recargar la página y empezar de 0
        if (btn.classList.contains("btn-reiniciar")) {
            location.reload(); 
        } else {
            // Si el chat sigue activo, enviamos el mensaje
            const val = input.value.trim();
            if (val) {
                // Dibujamos el mensaje del usuario en pantalla
                messages.innerHTML += `<div class="user-message">${val}</div>`;
                input.value = ""; // Vaciamos la caja de texto
                enviarAlServidor(val); // Lo mandamos al backend
            }
        }
    };

    // 3. Evento de la tecla Enter (CON EL FRENO DE MANO)
    input.onkeypress = (e) => { 
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita que el Enter recargue la página en algunos navegadores
            btn.click(); // Hace el equivalente a pulsar el botón
        }
    };

    // 4. Función para dibujar las respuestas del bot en el HTML
    function renderizarRespuesta(data) {
        
        // A. Mensaje de transición (ej: "¡Genial! Vamos a profundizar")
        if (data.extra) {
            messages.innerHTML += `<div class="bot-message" style="color: #666; font-style: italic;">${data.extra}</div>`;
        }
        
        // B. Pregunta principal del bot
        if (data.respuesta) {
            messages.innerHTML += `<div class="bot-message"><strong>${data.respuesta}</strong></div>`;
        }
        
        // C. Opciones sugeridas (como texto, sin botones)
        if (data.opciones && data.opciones.length > 0) {
            let htmlOpciones = `<div class="bot-message" style="background-color: transparent; border: 1px dashed #007bff; font-size: 0.9em; color: #007bff; margin-top: 5px;">`;
            htmlOpciones += `<span style="color:#555;">Sugerencias de respuesta (escribe una):</span><br>`;
            data.opciones.forEach(opt => {
                htmlOpciones += `• ${opt}<br>`;
            });
            htmlOpciones += `</div>`;
            messages.innerHTML += htmlOpciones;
        }

        // D. Cuadro Final (Se activa solo si el servidor envía "recomendaciones")
        if (data.recomendaciones) {
            const r = data.recomendaciones;
            const nombrePerfil = data.perfil_detectado.replace(/_/g, ' ').toUpperCase();

            messages.innerHTML += `
                <div class="final-card" style="background:#f0f7ff; border:2px solid #007bff; padding:15px; border-radius:10px; margin-top:15px;">
                    <h3 style="color:#007bff; margin-top:0;">${nombrePerfil}</h3>
                    <p><strong>🎯 Necesidades:</strong> ${r.necesidades.join(', ')}</p>
                    <p><strong>⭐ Valoras:</strong> ${r.lo_que_valora.join(', ')}</p>
                    <hr style="border: 0; border-top: 1px solid #cce5ff;">
                    <p><em>${r.mensaje_final}</em></p>
                </div>
            `;
            
            // TRANSFORMACIÓN DEL ENTORNO AL FINALIZAR
            input.disabled = true; // Bloqueamos el input
            input.placeholder = "Orientación finalizada."; // Cambiamos el texto fantasma
            
            // Cambiamos el botón azul de enviar por uno rojo de reiniciar
            btn.innerHTML = "🔄 Reiniciar Test";
            btn.classList.add("btn-reiniciar");
            btn.style.backgroundColor = "#dc3545"; // Color rojo tipo Bootstrap
            btn.style.borderColor = "#dc3545";
        }
        
        // Auto-scroll: Bajamos la barra para que el usuario siempre vea lo último
        messages.scrollTop = messages.scrollHeight;
    }
});