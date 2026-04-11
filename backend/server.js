console.log(">>> ESTE ES EL SERVER CORRECTO <<<");
const express = require("express");
// Importa el framework Express, que facilita la creación de servidores HTTP en Node.js.

const preguntas = require("../database/questions.json");
const perfiles = require("../database/profiles.json");
const recomendaciones = require("../database/recommendations.json");
// Cargar la base de datos JSON

let paso = 0;
// Estado temporal para la prueba (se reiniciará con /reset)

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

// -------------------------
// RUTA POST (flujo de preguntas)
// -------------------------
app.post("/mensaje", (req, res) => {
  const texto = req.body.texto;

  // Si aún quedan preguntas introductorias
  if (paso < preguntas.intro.length) {
    const preguntaActual = preguntas.intro[paso].pregunta;
    paso++; // Avanza al siguiente paso
    return res.json({ respuesta: preguntaActual });
  }

  // Si ya no quedan preguntas
  res.json({ respuesta: preguntas.mensajes.final });
});

// -------------------------
// ⭐ RUTA PARA REINICIAR EL PASO
// -------------------------
app.get("/reset", (req, res) => {
  paso = 0; // Reinicia el contador de preguntas
  res.json({ ok: true });
});

// -------------------------
// INICIO DEL SERVIDOR
// -------------------------
app.listen(3000, () => {
  console.log("Servidor funcionando en http://localhost:3000");
});
// Inicia el servidor en el puerto 3000.
// A partir de aquí, el backend escucha peticiones en http://localhost:3000
