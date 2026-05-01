const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. SERVIR EL FRONTEND - La carpeta 'frontend' está al mismo nivel que 'backend'
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Carga de archivos JSON
const preguntas = require(path.join(__dirname, "../database/questions.json"));
const recomendaciones = require(path.join(__dirname, "../database/recommendations.json"));
const perfiles = require(path.join(__dirname, "../database/profiles.json"));

// Conexión DB
const db = new sqlite3.Database(path.join(__dirname, "../database/db.sqlite"));

// Estado global (Para prototipo)
let estado = { fase: 'intro', paso: 0, respuestas: [], perfil: "joven_desorientado", transicionPendiente: false };

// --- RUTAS ---

app.get('/reset', (req, res) => {
    estado = { fase: 'intro', paso: 0, respuestas: [], perfil: "joven_desorientado", transicionPendiente: false };
    res.json({ ok: true });
});

app.post('/mensaje', (req, res) => {
    try {
        const { texto } = req.body;
        if (texto !== "START_FLOW") estado.respuestas.push(texto);

        // Lógica de cambio de fase
        if (estado.fase === 'intro' && estado.paso >= preguntas.intro.length) {
            estado.fase = 'especificas';
            estado.paso = 0;
            let idCalculado = calcularPerfil(estado.respuestas);
            // SEGURIDAD: Si el perfil no existe en questions.json, usamos joven_desorientado
            estado.perfil = preguntas[idCalculado] ? idCalculado : "joven_desorientado";
            estado.transicionPendiente = true;
        } 
        else if (estado.fase === 'especificas' && estado.paso >= preguntas[estado.perfil].length) {
            estado.fase = 'cierre';
            estado.paso = 0;
            estado.transicionPendiente = true;
        } 
        else if (estado.fase === 'cierre' && estado.paso >= preguntas.cierre.length) {
            estado.fase = 'final';
        }

        // Mensaje extra (transiciones)
        let mensajeExtra = null;
        if (estado.transicionPendiente && preguntas.mensajes.transitorios) {
            mensajeExtra = preguntas.mensajes.transitorios[Math.floor(Math.random() * preguntas.mensajes.transitorios.length)];
            estado.transicionPendiente = false;
        }

        // Respuesta final
        if (estado.fase === 'final') {
            return res.json({
                respuesta: preguntas.mensajes.final,
                recomendaciones: recomendaciones[estado.perfil],
                perfil_detectado: estado.perfil,
                finalizado: true
            });
        }

        // Obtener la pregunta actual según la fase
        const listaPreguntas = (estado.fase === 'especificas') ? preguntas[estado.perfil] : preguntas[estado.fase];
        const p = listaPreguntas[estado.paso];
        estado.paso++;

        res.json({ extra: mensajeExtra, respuesta: p.pregunta, opciones: p.opciones });

    } catch (err) {
        console.error("Error en /mensaje:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

function calcularPerfil(respuestas) {
    const texto = respuestas.join(" ").toLowerCase();
    let ganador = "joven_desorientado";
    let max = -1;
    Object.keys(perfiles).forEach(id => {
        let puntos = 0;
        perfiles[id].keywords.forEach(k => { if (texto.includes(k.toLowerCase())) puntos++; });
        if (puntos > max) { max = puntos; ganador = id; }
    });
    return ganador;
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')));

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));