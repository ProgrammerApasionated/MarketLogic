const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); 

const app = express();
// Render asigna un puerto automáticamente, por eso usamos process.env.PORT
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. SERVIR EL FRONTEND (SOLUCIÓN AL 404)
// ==========================================
// Le decimos que los archivos están en la carpeta "frontend" (un nivel arriba de backend)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Ruta principal para cargar la web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ==========================================
// 2. CARGA DE ARCHIVOS JSON
// ==========================================
const preguntas = require(path.join(__dirname, "../database/questions.json"));
const recomendaciones = require(path.join(__dirname, "../database/recommendations.json"));
const perfiles = require(path.join(__dirname, "../database/profiles.json"));

// ==========================================
// 3. CONEXIÓN A LA BASE DE DATOS SQLITE
// ==========================================
const dbPath = path.join(__dirname, "../database/db.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error al abrir la DB:", err.message);
    } else {
        console.log(">>> Conectado a la base de datos db.sqlite <<<");
    }
});

// Crear la tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    perfil TEXT,
    respuestas TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// ==========================================
// 4. LÓGICA DEL CHATBOT
// ==========================================
let estado = { 
    fase: 'intro', 
    paso: 0, 
    respuestas: [], 
    perfil: null, 
    transicionPendiente: false 
};

function calcularPerfil(respuestas) {
    const texto = respuestas.join(" ").toLowerCase();
    let ganador = "joven_desorientado";
    let max = -1;
    
    Object.keys(perfiles).forEach(id => {
        let puntos = 0;
        perfiles[id].keywords.forEach(k => {
            if (texto.includes(k.toLowerCase())) puntos++;
        });
        if (puntos > max) { 
            max = puntos; 
            ganador = id; 
        }
    });
    return ganador;
}

// ==========================================
// 5. RUTAS DEL API
// ==========================================

app.post('/mensaje', (req, res) => {
    const { texto } = req.body;
    
    if (texto !== "START_FLOW") {
        estado.respuestas.push(texto);
    }

    // --- MÁQUINA DE ESTADOS ---
    // 1. Pasa de intro a especificas
    if (estado.fase === 'intro' && estado.paso >= preguntas.intro.length) {
        estado.fase = 'especificas';
        estado.perfil = calcularPerfil(estado.respuestas);
        estado.paso = 0;
        estado.transicionPendiente = true;
    }

    // 2. Pasa de especificas a cierre (NUEVA FASE DE LA TAREA 12)
    if (estado.fase === 'especificas' && estado.paso >= preguntas[estado.perfil].length) {
        estado.fase = 'cierre';
        estado.paso = 0;
        estado.transicionPendiente = true;
    }

    // 3. Pasa de cierre al final
    if (estado.fase === 'cierre' && estado.paso >= preguntas.cierre.length) {
        estado.fase = 'final';
    }

    // --- ENVÍO DE RESPUESTAS ---
    let mensajeExtra = null;

    // Lógica para mensajes Transitorios y Motivacionales
    if (estado.transicionPendiente) {
        // Coge un mensaje transitorio aleatorio
        const randomTrans = Math.floor(Math.random() * preguntas.mensajes.transitorios.length);
        mensajeExtra = preguntas.mensajes.transitorios[randomTrans];
        estado.transicionPendiente = false;
    } else if (texto !== "START_FLOW" && estado.respuestas.length % 3 === 0 && estado.fase !== 'final') {
        // Cada 3 respuestas, mandamos un mensaje motivacional aleatorio
        const randomMotiv = Math.floor(Math.random() * preguntas.mensajes.motivacionales.length);
        mensajeExtra = preguntas.mensajes.motivacionales[randomMotiv];
    }

    // Entregar la pregunta según la fase
    if (estado.fase === 'intro') {
        const p = preguntas.intro[estado.paso];
        estado.paso++;
        return res.json({ extra: mensajeExtra, respuesta: p.pregunta, opciones: p.opciones });
        
    } else if (estado.fase === 'especificas') {
        const p = preguntas[estado.perfil][estado.paso];
        estado.paso++;
        return res.json({ extra: mensajeExtra, respuesta: p.pregunta, opciones: p.opciones });

    } else if (estado.fase === 'cierre') {
        const p = preguntas.cierre[estado.paso];
        estado.paso++;
        return res.json({ extra: mensajeExtra, respuesta: p.pregunta, opciones: p.opciones });

    } else if (estado.fase === 'final') {
        const perfilFinal = estado.perfil;
        const todasLasRespuestas = JSON.stringify(estado.respuestas);

        db.run(`INSERT INTO historial (perfil, respuestas) VALUES (?, ?)`, 
            [perfilFinal, todasLasRespuestas], 
            function(err) {
                if (err) console.error("Error al guardar en BD:", err.message);
            }
        );

        return res.json({
            respuesta: preguntas.mensajes.final,
            recomendaciones: recomendaciones[estado.perfil],
            perfil_detectado: estado.perfil,
            finalizado: true
        });
    }
});

// ==========================================
// 6. RUTAS EXTRA (REINICIO Y VER DATOS)
// ==========================================

// Ruta para que el frontend reinicie el chat al cargar la página
app.get('/reset', (req, res) => {
    estado = { fase: 'intro', paso: 0, respuestas: [], perfil: null, transicionPendiente: false };
    res.json({ ok: true });
});

// Ruta para ver los datos guardados en SQLite
app.get('/ver-datos', (req, res) => {
    db.all("SELECT * FROM historial ORDER BY fecha DESC", [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// ==========================================
// 7. ARRANQUE DEL SERVIDOR (¡LO QUE FALTABA!)
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor Online y escuchando en puerto ${PORT}`);
});