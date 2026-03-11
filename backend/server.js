console.log(">>> ESTE ES EL SERVER CORRECTO <<<");
const express = require("express");
// Importa el framework Express, que facilita la creación de servidores HTTP en Node.js.

const app = express();
// Crea una instancia de la aplicación Express. 'app' será nuestro servidor.

const cors = require("cors");
// Importa el middleware CORS, que permite que el frontend (otro origen/puerto) pueda hacer peticiones al backend.

app.use(cors());
// Activa CORS para todas las rutas. Permite que el navegador acepte peticiones desde otros orígenes (como el frontend).

app.use(express.json());
// Middleware que convierte automáticamente el cuerpo de las peticiones JSON en un objeto accesible desde req.body.

// -------------------------
// RUTA GET
// -------------------------
app.get("/mensaje", (req, res) => {
  res.json({ respuesta: "Hola, soy el chatbot" });
  // Envía un objeto JSON como respuesta: { "respuesta": "Hola, soy el chatbot" }
});
// Define una ruta HTTP de tipo GET en /mensaje.
// req = datos de la petición del cliente.
// res = objeto para enviar la respuesta al cliente.

// -------------------------
// RUTA POST
// -------------------------
app.post("/mensaje", (req, res) => {
  const texto = req.body.texto;
  // Extrae el campo 'texto' del cuerpo JSON enviado por el cliente.

  res.json({ respuesta: "Has dicho: " + texto });
  // Devuelve un JSON con la respuesta generada usando el texto recibido.
});
// Define una ruta HTTP de tipo POST en /mensaje.
// Se usa para recibir datos enviados por el cliente (por ejemplo, texto del usuario).

// -------------------------
// INICIO DEL SERVIDOR
// -------------------------
app.listen(3000, () => {
  console.log("Servidor funcionando en http://localhost:3000");
});
// Inicia el servidor en el puerto 3000.
// La función callback se ejecuta cuando el servidor está listo.
// A partir de aquí, el backend escucha peticiones en http://localhost:3000
