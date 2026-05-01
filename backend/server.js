const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // Importamos el driver de la base de datos
const app = express();

app.use(cors());
app.use(express.json());

// 1. CARGA DE ARCHIVOS JSON
const preguntas = require(path.join(__dirname, "../database/questions.json"));
const recomendaciones = require(path.join(__dirname, "../database/recommendations.json"));
const perfiles = require(path.join(__dirname, "../database/profiles.json"));

// 2. CONEXIÓN A LA BASE DE DATOS SQLITE
const dbPath = path.join(__dirname, "../database/db.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error al abrir la DB:", err.message);
    } else {
        console.log(">>> Conectado a la base de datos db.sqlite <<<");
    }
});

// Crear la tabla para guardar historiales si no existe ya
db.run(`CREATE TABLE IF NOT EXISTS historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    perfil TEXT,
    respuestas TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// 3. ESTADO DEL USUARIO
let estado = { 
    fase: 'intro', 
    paso: 0, 
    respuestas: [], 
    perfil: null, 
    transicionPendiente: false 
};

// 4. FUNCIÓN CALCULADORA DE PERFILES
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

// 5. RUTA PRINCIPAL DEL CHAT
app.post('/mensaje', (req, res) => {
    const { texto } = req.body;
    
    // Guardar respuesta del usuario
    if (texto !== "START_FLOW") {
        estado.respuestas.push(texto);
    }

    // Control de cambios de fase
    if (estado.fase === 'intro' && estado.paso >= preguntas.intro.length) {
        estado.fase = 'especificas';
        estado.perfil = calcularPerfil(estado.respuestas);
        estado.paso = 0;
        estado.transicionPendiente = true;
    }

    if (estado.fase === 'especificas' && estado.paso >= preguntas[estado.perfil].length) {
        estado.fase = 'final';
    }

    // Envío de preguntas según la fase
    if (estado.fase === 'intro') {
        const p = preguntas.intro[estado.paso];
        estado.paso++;
        return res.json({ respuesta: p.pregunta, opciones: p.opciones });
        
    } else if (estado.fase === 'especificas') {
        const p = preguntas[estado.perfil][estado.paso];
        estado.paso++;
        
        let mensajeExtra = null;
        if (estado.transicionPendiente) {
            mensajeExtra = preguntas.mensajes.transicion[0];
            estado.transicionPendiente = false;
        }

        return res.json({ 
            extra: mensajeExtra, 
            respuesta: p.pregunta, 
            opciones: p.opciones 
        });

    } else if (estado.fase === 'final') {
        // --- AQUÍ GUARDAMOS EN LA BASE DE DATOS ---
        const perfilFinal = estado.perfil;
        const todasLasRespuestas = JSON.stringify(estado.respuestas); // Convertimos el array a texto

        db.run(`INSERT INTO historial (perfil, respuestas) VALUES (?, ?)`, 
            [perfilFinal, todasLasRespuestas], 
            function(err) {
                if (err) {
                    console.error("Error al guardar en BD:", err.message);
                } else {
                    console.log(`>>> Nuevo test guardado. ID de registro: ${this.lastID}`);
                }
            }
        );

        // Devolvemos el resultado al frontend
        return res.json({
            respuesta: preguntas.mensajes.final,
            recomendaciones: recomendaciones[estado.perfil],
            perfil_detectado: estado.perfil,
            finalizado: true
        });
    }
});

// 6. RUTA DE REINICIO
app.get('/reset', (req, res) => {
    estado = { fase: 'intro', paso: 0, respuestas: [], perfil: null, transicionPendiente: false };
    res.json({ ok: true });
});

// 7. RUTA "SECRETA" PARA VER LOS DATOS GUARDADOS
app.get('/ver-datos', (req, res) => {
    db.all("SELECT * FROM historial ORDER BY fecha DESC", [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// ARRANQUE DEL SERVIDOR
app.listen(3000, () => console.log("Servidor EnxarxaTec Online en puerto 3000"));