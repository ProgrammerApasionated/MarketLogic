// Espera a que todo el contenido HTML esté cargado antes de ejecutar el código.
// Esto garantiza que los elementos del DOM existen cuando intentamos seleccionarlos.
document.addEventListener("DOMContentLoaded", () => {

  // Selecciona el campo de texto donde el usuario escribe su mensaje.
  const input = document.getElementById("input");

  // Selecciona el botón que el usuario pulsará para enviar el mensaje.
  const btn = document.getElementById("btn");

  // Selecciona el párrafo donde mostraremos la respuesta del backend.
  const respuesta = document.getElementById("respuesta");

  // Añade un "listener" al botón: cuando el usuario haga clic, se ejecutará esta función.
  // La función es async porque dentro usaremos 'await' para esperar la respuesta del servidor.
  btn.addEventListener("click", async () => {

    // Obtiene el texto que el usuario ha escrito en el input.
    const texto = input.value;

    // Realiza una petición HTTP al backend usando fetch.
    // Enviamos una petición POST a la ruta /mensaje del servidor.
    const res = await fetch("http://localhost:3000/mensaje", {
      method: "POST", // Tipo de petición: POST (envía datos)
      headers: { "Content-Type": "application/json" }, // Indicamos que enviamos JSON
      body: JSON.stringify({ texto }) // Convertimos el objeto JS a JSON: { "texto": "lo que escribió el usuario" }
    });

    // Espera a que el servidor responda y convierte la respuesta JSON en un objeto JS.
    const data = await res.json();

    // Actualiza el contenido del párrafo con la respuesta del backend.
    respuesta.textContent = data.respuesta;
  });
});
