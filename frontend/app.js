// Espera a que todo el contenido HTML esté cargado antes de ejecutar el código.
document.addEventListener("DOMContentLoaded", async () => {

  // Selecciona los elementos del DOM
  const input = document.getElementById("input");
  const btn = document.getElementById("btn");
  const messages = document.getElementById("messages");

  // -------------------------
  //  REINICIAR EL BACKEND ANTES DE EMPEZAR
  // -------------------------
  // Desactivamos el botón para evitar que el usuario envíe antes de tiempo
  btn.disabled = true;

  console.log("Reiniciando backend...");
  await fetch("http://localhost:3000/reset"); //  IMPORTANTE: esperar a que termine
  console.log("Backend reiniciado");

  // Activamos el botón cuando el backend ya está listo
  btn.disabled = false;

  // Mensaje inicial
  messages.innerHTML = `
    <p style="text-align:center; color:#888; margin-top:10px;">
      Tu futuro empieza con una conversación.
    </p>
  `;

  // -------------------------
  // EVENTO CLICK DEL BOTÓN
  // -------------------------
  btn.addEventListener("click", async () => {

    // Obtiene el texto que el usuario ha escrito en el input.
    const texto = input.value.trim();
    if (!texto) return;

    // Añade el mensaje del usuario al chat.
    messages.innerHTML += `
      <div class="user-message">${texto}</div>
    `;

    // Realiza una petición HTTP al backend usando fetch.
    const res = await fetch("http://localhost:3000/mensaje", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    });

    // Espera la respuesta del servidor
    const data = await res.json();

    // Añade el mensaje del bot al chat.
    messages.innerHTML += `
      <div class="bot-message">${data.respuesta}</div>
    `;

    // -------------------------
    //  DETECTAR FIN DE LA PRUEBA
    // -------------------------
    if (data.respuesta.includes("Fin de la prueba") ||
        data.respuesta.includes("Hemos llegado al final")) {

      input.disabled = true;
      btn.disabled = true;

      return;
    }

    // Limpia el campo de texto
    input.value = "";

    // Hace scroll automático hacia abajo
    messages.scrollTop = messages.scrollHeight;
  });
});
