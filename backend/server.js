const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const { v4: uuidv4 } = require("uuid");

const nlp = require("./nlp");

const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(express.static(FRONTEND_DIR));

let db;

async function initDb() {
  const dbPath = path.join(__dirname, "db.sqlite");
  await fse.ensureFile(dbPath);
  db = await open({ filename: dbPath, driver: sqlite3.Database });
  
  await db.exec(`PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;`);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      state TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );
  `);

  try { await db.exec(`ALTER TABLE sessions ADD COLUMN state TEXT;`); } catch (e) {}

  await db.exec(`CREATE TABLE IF NOT EXISTS responses (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, texto TEXT, created_at INTEGER);`);
  await db.exec(`CREATE TABLE IF NOT EXISTS profiles_detected (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, perfil_id TEXT, score REAL, created_at INTEGER);`);
  await db.exec(`CREATE TABLE IF NOT EXISTS recommendations (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, payload TEXT, created_at INTEGER);`);
  
  console.log("Base de datos conectada y blindada ✔️");
}

async function initAll() {
  await initDb();
  await nlp.cargarModelos();
  console.log("Inicialización completa ✔️ El servidor está listo en el puerto", PORT);
}
initAll();

async function createSession() {
  const id = uuidv4();
  const initialState = JSON.stringify({ respuestasVocacionales: [], respuestasModificadores: [], idioma: "es" });
  await db.run("INSERT INTO sessions (id, state, created_at, updated_at) VALUES (?, ?, ?, ?)", [id, initialState, Date.now(), Date.now()]);
  return id;
}

// ---------------------------
// ENDPOINT PRINCIPAL DEL CHAT
// ---------------------------
app.post("/mensaje", async (req, res) => {
  try {
    const texto = (req.body && req.body.texto) ? String(req.body.texto).trim() : "";
    
    const idiomaSolicitado = req.body.idioma || "es"; 

    if (!texto) return res.status(400).json({ error: "El texto es requerido" });

    let sessionId = req.get("X-Session-Id") || req.body.sessionId;
    let historialObj = { respuestasVocacionales: [], respuestasModificadores: [], idioma: idiomaSolicitado };

    if (!sessionId) {
      sessionId = await createSession();
    } else {
      const row = await db.get("SELECT state FROM sessions WHERE id = ?", [sessionId]);
      if (!row) {
        sessionId = await createSession();
      } else if (row.state) {
        try { historialObj = JSON.parse(row.state); } catch (e) { historialObj = { respuestasVocacionales: [], respuestasModificadores: [] }; }
      }
    }

    historialObj.idioma = idiomaSolicitado;

    await db.run("INSERT INTO responses (session_id, texto, created_at) VALUES (?, ?, ?)", [sessionId, texto, Date.now()]);
    
    const respRow = await db.get("SELECT COUNT(*) as count FROM responses WHERE session_id = ?", [sessionId]);
    const respuestasCount = respRow.count;
    
    const FINAL_THRESHOLD = 4;

    const anal = await nlp.analizarRespuesta(texto, historialObj, respuestasCount);

    await db.run("UPDATE sessions SET state = ?, updated_at = ? WHERE id = ?", [JSON.stringify(historialObj), Date.now(), sessionId]);

    if (respuestasCount >= FINAL_THRESHOLD) {
      const perfilRes = await nlp.elegirPerfilPorNLP(historialObj);
      const perfilFinalObj = perfilRes.perfilModificado || {};
      const perfilFinalId = perfilRes.perfilId || "desconocido";

      let recomendaciones = {
        mensaje_final: perfilFinalObj.description || "Tu perfil muestra fuertes competencias profesionales.",
        entorno_detalle: perfilFinalObj.entornoRecomendadoDetalle || "",
        estrategia: perfilFinalObj.estrategiaMercado || "",
        plan_accion: perfilFinalObj.planAccionInmediato || [],
        lo_que_valora: perfilFinalObj.valoresClave || [],
        empresas_sector: perfilFinalObj.empresas || [],
        formacion_sugerida: perfilFinalObj.formacionRecomendada || perfilFinalObj.formacion || [],
        proyeccion_futuro: perfilFinalObj.proyeccion || "Alta empleabilidad."
      };

      await db.run("INSERT INTO profiles_detected (session_id, perfil_id, score, created_at) VALUES (?, ?, ?, ?)", [sessionId, perfilFinalId, 1.0, Date.now()]);
      await db.run("INSERT INTO recommendations (session_id, payload, created_at) VALUES (?, ?, ?)", [sessionId, JSON.stringify(recomendaciones), Date.now()]);

      const nombreParaMostrar = perfilFinalObj.name ? perfilFinalObj.name.toUpperCase() : "PROFESIÓN POR DEFINIR";

      const msgCierre = {
          es: "He evaluado tus respuestas con detalle y he generado tu informe de futuro.",
          en: "I have evaluated your answers in detail and generated your future report.",
          va: "He avaluat les teues respostes amb detall i he generat el teu informe de futur."
      };

      return res.json({
        sessionId,
        respuesta: msgCierre[idiomaSolicitado] || msgCierre["es"],
        extra: `Perfil asignado: ${nombreParaMostrar}`,
        finalizado: true,
        recomendaciones,
        perfil_detectado: nombreParaMostrar
      });
    }

    const siguientePregunta = nlp.generarRespuestaDinamica(anal, respuestasCount, historialObj);

    return res.json({
      sessionId,
      respuesta: siguientePregunta,
      extra: `Etapa ${respuestasCount}/4. Categoría trackeada: ${historialObj.categoriaPrincipal || 'analizando...'}`,
      finalizado: false,
      recomendaciones: null
    });

  } catch (e) {
    console.error("Error CRÍTICO en POST /mensaje:", e);
    res.status(500).json({ error: "Error procesando el flujo de NLP" });
  }
});

// ---------------------------
// ENDPOINT DE RESET DE SESIÓN
// ---------------------------
app.get("/reset", async (req, res) => {
  try {
    let sessionId = req.get("X-Session-Id") || req.query.sessionId;
    let idioma = req.query.idioma || "es";

    if (!sessionId) sessionId = await createSession();
    const blankState = JSON.stringify({ respuestasVocacionales: [], respuestasModificadores: [], idioma: idioma });
    
    await db.run("UPDATE sessions SET state = ?, updated_at = ? WHERE id = ?", [blankState, Date.now(), sessionId]);
    await db.run("DELETE FROM responses WHERE session_id = ?", [sessionId]);
    await db.run("DELETE FROM profiles_detected WHERE session_id = ?", [sessionId]);
    await db.run("DELETE FROM recommendations WHERE session_id = ?", [sessionId]);

    const welcomes = {
        es: "¡Hola! Cuéntame con total libertad: ¿Qué áreas profesionales o actividades te atraen más ahora mismo?",
        en: "Hello! Feel free to tell me: What professional areas or activities attract you the most right now?",
        va: "Hola! Conta'm amb total llibertat: Quines àrees professionals o activitats t'atrauen més ara mateix?"
    };

    res.json({ sessionId, ok: true, bienvenida: welcomes[idioma] || welcomes["es"] });
  } catch (e) { res.status(500).json({ error: "Error al reiniciar la sesión" }); }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor Express encendido en el puerto ${PORT}`);
});
