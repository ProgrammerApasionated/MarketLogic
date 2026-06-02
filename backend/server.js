const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const Database = require("better-sqlite3");
const { v4: uuidv4 } = require("uuid");

const nlp = require("./nlp");

const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(express.static(FRONTEND_DIR));

let db;

// ---------------------------
// INICIALIZACIÓN DE BASE DE DATOS
// ---------------------------
function initDb() {
  const dbPath = path.join(__dirname, "db.sqlite");
  fse.ensureFileSync(dbPath);

  db = new Database(dbPath);

  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");

  db.prepare(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      state TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      texto TEXT,
      created_at INTEGER
    );
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS profiles_detected (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      perfil_id TEXT,
      score REAL,
      created_at INTEGER
    );
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      payload TEXT,
      created_at INTEGER
    );
  `).run();

  console.log("Base de datos conectada y blindada ✔️");
}

async function initAll() {
  initDb();
  await nlp.cargarModelos();
  console.log("Inicialización completa ✔️ El servidor está listo en el puerto", PORT);
}
initAll();

// ---------------------------
// CREAR SESIÓN
// ---------------------------
function createSession() {
  const id = uuidv4();
  const initialState = JSON.stringify({
    respuestasVocacionales: [],
    respuestasModificadores: [],
    idioma: "es"
  });

  db.prepare(`
    INSERT INTO sessions (id, state, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(id, initialState, Date.now(), Date.now());

  return id;
}

// ---------------------------
// ENDPOINT PRINCIPAL DEL CHAT
// ---------------------------
app.post("/mensaje", async (req, res) => {
  try {
    const texto = req.body?.texto?.trim() || "";
    const idiomaSolicitado = req.body.idioma || "es";

    if (!texto) return res.status(400).json({ error: "El texto es requerido" });

    let sessionId = req.get("X-Session-Id") || req.body.sessionId;
    let historialObj = { respuestasVocacionales: [], respuestasModificadores: [], idioma: idiomaSolicitado };

    if (!sessionId) {
      sessionId = createSession();
    } else {
      const row = db.prepare("SELECT state FROM sessions WHERE id = ?").get(sessionId);
      if (!row) {
        sessionId = createSession();
      } else if (row.state) {
        try { historialObj = JSON.parse(row.state); }
        catch { historialObj = { respuestasVocacionales: [], respuestasModificadores: [] }; }
      }
    }

    historialObj.idioma = idiomaSolicitado;

    db.prepare(`
      INSERT INTO responses (session_id, texto, created_at)
      VALUES (?, ?, ?)
    `).run(sessionId, texto, Date.now());

    const respRow = db.prepare(`
      SELECT COUNT(*) as count FROM responses WHERE session_id = ?
    `).get(sessionId);

    const respuestasCount = respRow.count;
    const FINAL_THRESHOLD = 4;

    const anal = await nlp.analizarRespuesta(texto, historialObj, respuestasCount);

    db.prepare(`
      UPDATE sessions SET state = ?, updated_at = ? WHERE id = ?
    `).run(JSON.stringify(historialObj), Date.now(), sessionId);

    if (respuestasCount >= FINAL_THRESHOLD) {
      const perfilRes = await nlp.elegirPerfilPorNLP(historialObj);
      const perfilFinalObj = perfilRes.perfilModificado || {};
      const perfilFinalId = perfilRes.perfilId || "desconocido";

      const recomendaciones = {
        mensaje_final: perfilFinalObj.description || "Tu perfil muestra fuertes competencias profesionales.",
        entorno_detalle: perfilFinalObj.entornoRecomendadoDetalle || "",
        estrategia: perfilFinalObj.estrategiaMercado || "",
        plan_accion: perfilFinalObj.planAccionInmediato || [],
        lo_que_valora: perfilFinalObj.valoresClave || [],
        empresas_sector: perfilFinalObj.empresas || [],
        formacion_sugerida: perfilFinalObj.formacionRecomendada || perfilFinalObj.formacion || [],
        proyeccion_futuro: perfilFinalObj.proyeccion || "Alta empleabilidad."
      };

      db.prepare(`
        INSERT INTO profiles_detected (session_id, perfil_id, score, created_at)
        VALUES (?, ?, ?, ?)
      `).run(sessionId, perfilFinalId, 1.0, Date.now());

      db.prepare(`
        INSERT INTO recommendations (session_id, payload, created_at)
        VALUES (?, ?, ?)
      `).run(sessionId, JSON.stringify(recomendaciones), Date.now());

      const nombreParaMostrar = perfilFinalObj.name?.toUpperCase() || "PROFESIÓN POR DEFINIR";

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
      extra: `Etapa ${respuestasCount}/4. Categoría trackeada: ${historialObj.categoriaPrincipal || "analizando..."}`,
      finalizado: false,
      recomendaciones: null
    });

  } catch (e) {
    console.error("Error CRÍTICO en POST /mensaje:", e);
    res.status(500).json({ error: "Error procesando el flujo de NLP" });
  }
});

// ---------------------------
// ENDPOINT DE RESET
// ---------------------------
app.get("/reset", (req, res) => {
  try {
    let sessionId = req.get("X-Session-Id") || req.query.sessionId;
    let idioma = req.query.idioma || "es";

    if (!sessionId) sessionId = createSession();

    const blankState = JSON.stringify({
      respuestasVocacionales: [],
      respuestasModificadores: [],
      idioma
    });

    db.prepare("UPDATE sessions SET state = ?, updated_at = ? WHERE id = ?")
      .run(blankState, Date.now(), sessionId);

    db.prepare("DELETE FROM responses WHERE session_id = ?").run(sessionId);
    db.prepare("DELETE FROM profiles_detected WHERE session_id = ?").run(sessionId);
    db.prepare("DELETE FROM recommendations WHERE session_id = ?").run(sessionId);

    const welcomes = {
      es: "¡Hola! Cuéntame con total libertad: ¿Qué áreas profesionales o actividades te atraen más ahora mismo?",
      en: "Hello! Feel free to tell me: What professional areas or activities attract you the most right now?",
      va: "Hola! Conta'm amb total llibertat: Quines àrees professionals o activitats t'atrauen més ara mateix?"
    };

    res.json({ sessionId, ok: true, bienvenida: welcomes[idioma] || welcomes["es"] });

  } catch (e) {
    res.status(500).json({ error: "Error al reiniciar la sesión" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor Express encendido en el puerto ${PORT}`);
});
