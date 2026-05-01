document.addEventListener("DOMContentLoaded", async () => {
    // Seleccionamos los elementos del HTML
    const input = document.getElementById("input");
    const btn = document.getElementById("btn");
    const messages = document.getElementById("messages");

    // Función principal para enviar datos al servidor
    async function enviarAlServidor(textoInput) {
        try {
            // CAMBIO AQUÍ: Usamos ruta relativa "/mensaje"
            const res = await fetch("/mensaje", {
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
    // CAMBIO AQUÍ: Usamos ruta relativa "/reset"
    try {
        await fetch("/reset");
        enviarAlServidor("START_FLOW");
    } catch (e) {
        console.error("Error al iniciar el chat:", e);
    }

    // 2. Evento del botón de enviar
    btn.onclick = (e) => {
        e.preventDefault(); 

        if (btn.classList.contains("btn-reiniciar")) {
            location.reload(); 
        } else {
            const val = input.value.trim();
            if (val) {
                messages.innerHTML += `<div class="user-message">${val}</div>`;
                input.value = ""; 
                enviarAlServidor(val); 
            }
        }
    };

    // 3. Evento de la tecla Enter
    input.onkeypress = (e) => { 
        if (e.key === 'Enter') {
            e.preventDefault(); 
            btn.click(); 
        }
    };

    // 4. Función para dibujar las respuestas del bot en el HTML
    function renderizarRespuesta(data) {
        if (data.extra) {
            messages.innerHTML += `<div class="bot-message" style="color: #666; font-style: italic;">${data.extra}</div>`;
        }
        
        if (data.respuesta) {
            messages.innerHTML += `<div class="bot-message"><strong>${data.respuesta}</strong></div>`;
        }
        
        if (data.opciones && data.opciones.length > 0) {
            let htmlOpciones = `<div class="bot-message" style="background-color: transparent; border: 1px dashed #007bff; font-size: 0.9em; color: #007bff; margin-top: 5px;">`;
            htmlOpciones += `<span style="color:#555;">Sugerencias de respuesta (escribe una):</span><br>`;
            data.opciones.forEach(opt => {
                htmlOpciones += `• ${opt}<br>`;
            });
            htmlOpciones += `</div>`;
            messages.innerHTML += htmlOpciones;
        }

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
            
            input.disabled = true; 
            input.placeholder = "Orientación finalizada."; 
            
            btn.innerHTML = "🔄 Reiniciar Test";
            btn.classList.add("btn-reiniciar");
            btn.style.backgroundColor = "#dc3545"; 
            btn.style.borderColor = "#dc3545";
        }
        
        messages.scrollTop = messages.scrollHeight;
    }
});