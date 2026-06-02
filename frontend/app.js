document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const btn = document.getElementById("btn");
  const messages = document.getElementById("messages");
  
  const btnTema = document.getElementById("btn-tema");
  
  // --- NUEVO: REFERENCIAS A LOS BOTONES DE IDIOMA ---
  const btnEs = document.getElementById("btn-es");
  const btnEn = document.getElementById("btn-en");
  const btnVa = document.getElementById("btn-va");

  const BASE_URL = (window.location.port && window.location.port !== "3000")
    ? "http://localhost:3000"
    : "";

  let sessionId = null;
  let intervalId = null;
  let mensajeCargaActual = null;
  
  // --- NUEVO: ESTADO DEL IDIOMA ---
  let idiomaActual = "es";

  // Diccionario para textos de la interfaz
const uiTexts = {
  es: { 
    cargando: ["Analizando tu respuesta...", "Procesando opciones...", "Conectando tu perfil...", "Casi lo tengo..."], 
    finalizado: "Orientación completada exitosamente.", 
    reiniciar: "Nueva recomendación",
    error: "⚠️ Error de conexión con el orientador.",
    cardTitle: "Informe Estratégico",
    estrategia: "Estrategia de Mercado",
    plan: "Plan de Acción Inmediato",
    target: "Dónde Operar (Target)",
    formacion: "Formación Sugerida",
    valores: "Valores Clave Detectados",
    footer: "Se requerirá disciplina semanal y foco práctico."
  },
  en: { 
    cargando: ["Analyzing your response...", "Processing options...", "Connecting your profile...", "Almost there..."], 
    finalizado: "Orientation successfully completed.", 
    reiniciar: "New recommendation",
    error: "⚠️ Connection error with the advisor.",
    cardTitle: "Strategic Report",
    estrategia: "Market Strategy",
    plan: "Immediate Action Plan",
    target: "Where to Operate (Target)",
    formacion: "Suggested Training",
    valores: "Key Values Detected",
    footer: "Discipline and practical focus are required."
  },
  va: { 
    cargando: ["Analitzant la teua resposta...", "Processant opcions...", "Connectant el teu perfil...", "Quasi ho tinc..."], 
    finalizado: "Orientació completada amb èxit.", 
    reiniciar: "Nova recomanació",
    error: "⚠️ Error de connexió amb l'orientador.",
    cardTitle: "Informe Estratègic",
    estrategia: "Estratègia de Mercat",
    plan: "Pla d'Acció Immediat",
    target: "On Operar (Target)",
    formacion: "Formació Suggerida",
    valores: "Valors Clau Detectats",
    footer: "Es requerirà disciplina setmanal i focus pràctic."
  }
};

  function escapeHtml(unsafe) {
    if (!unsafe && unsafe !== "") return "";
    return String(unsafe)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function mostrarMensajeUsuario(text) {
    messages.innerHTML += `<div class="user-message">${escapeHtml(text)}</div>`;
    messages.scrollTop = messages.scrollHeight;
  }

  function mostrarMensajeBotHtml(html) {
    messages.innerHTML += `<div class="bot-message">${html}</div>`;
    messages.scrollTop = messages.scrollHeight;
  }

  function setLoadingState(isLoading) {
    if (isLoading) {
      input.disabled = true;
      btn.disabled = true;
      if (btnTema) btnTema.disabled = true;

    } else {
      clearInterval(intervalId);
      if (mensajeCargaActual && mensajeCargaActual.parentNode) {
        mensajeCargaActual.parentNode.removeChild(mensajeCargaActual);
      }
      mensajeCargaActual = null;
    }
  }

  async function enviarAlServidor(textoInput) {
    setLoadingState(true);
    
    try {
      const res = await fetch(`${BASE_URL}/mensaje`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionId ? { "X-Session-Id": sessionId } : {})
        },
        // --- NUEVO: ENVIAMOS EL IDIOMA AL BACKEND ---
        body: JSON.stringify({ texto: textoInput, sessionId, idioma: idiomaActual })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.sessionId) sessionId = data.sessionId;
      renderizarRespuesta(data);
    } catch (err) {
      console.error("Error:", err);
      mostrarMensajeBotHtml(`<div style="color: #dc3545; font-weight: bold; font-size: 13px;">${uiTexts[idiomaActual].error}</div>`);
    } finally {
      setLoadingState(false);
      
      if (input.placeholder !== uiTexts[idiomaActual].finalizado && input.placeholder !== uiTexts["es"].finalizado) {
        input.disabled = false;
        btn.disabled = false;
        if (btnTema) btnTema.disabled = false;
        input.focus();
      } else {
        btn.disabled = false;
        if (btnTema) btnTema.disabled = false;
      }
    }
  }

  async function iniciarChat() {
    try {
      // --- NUEVO: ENVIAMOS EL IDIOMA AL REINICIAR ---
      const res = await fetch(`${BASE_URL}/reset?idioma=${idiomaActual}&sessionId=${sessionId || ''}`);
      const data = await res.json();
      sessionId = data.sessionId;
      if (data.bienvenida) {
        mostrarMensajeBotHtml(`<span>${escapeHtml(data.bienvenida)}</span>`);
      }
    } catch (e) {
      mostrarMensajeBotHtml(`<div style="color: #dc3545; font-weight: bold; font-size: 13px;">${uiTexts[idiomaActual].error}</div>`);
    }
  }

  // --- NUEVO: FUNCIÓN PARA CAMBIAR EL IDIOMA DESDE LA UI ---
window.cambiarIdioma = async function(nuevoIdioma) {
  if (idiomaActual === nuevoIdioma) return;
  idiomaActual = nuevoIdioma;
  
  // 1. PASO INSTANTÁNEO: Quitamos el recuadro azul a todos y se lo ponemos al clicado
  document.querySelectorAll('.btn-lang').forEach(btn => btn.classList.remove('activo'));
  
  const botonDestino = document.getElementById(`btn-${nuevoIdioma}`);
  if (botonDestino) {
    botonDestino.classList.add('activo');
  }

  // 2. PASO ASÍNCRONO: Limpiar pantalla y conectar con el backend
  messages.innerHTML = ""; 
  await iniciarChat(); 
};

  if (btnEs) btnEs.addEventListener("click", () => cambiarIdioma("es"));
  if (btnEn) btnEn.addEventListener("click", () => cambiarIdioma("en"));
  if (btnVa) btnVa.addEventListener("click", () => cambiarIdioma("va"));

function renderizarRespuesta(data) {
  if (!data) return;

  // Si hay mensaje extra (tipo nota de sistema)
  if (data.extra) {
    //mostrarMensajeBotHtml(`<div style="color: #888; font-size: 0.78em; letter-spacing: 0.5px; font-style: italic; margin-bottom: 2px;">⚡ ${escapeHtml(data.extra)}</div>`);
  }

  // Si es un mensaje normal
  if (data.respuesta && !data.finalizado) {
    mostrarMensajeBotHtml(`<span>${escapeHtml(data.respuesta)}</span>`);
  }

  // TARJETA DE RECOMENDACIÓN FINAL (CORREGIDA SIN VIÑETAS)
  if (data.finalizado && data.recomendaciones) {
    let perfil = (data.perfil_detectado || "").replace(/_/g, " ");
    perfil = perfil.replace(/\b\d+\b/g, "").trim().toUpperCase(); 
    
    if (!perfil || perfil === "DESCONOCIDO") {
      perfil = data.recomendaciones.mensaje_final.split(".")[0].toUpperCase();
    }

    const rec = data.recomendaciones;
    const txt = uiTexts[idiomaActual];

    const labelAnalisis = {
      es: "Análisis de Perfil",
      en: "Profile Analysis",
      va: "Anàlisi de Perfil"
    };

    let contenido = `
      <div class="final-card" style="border: 2px dashed var(--primary-blue); border-radius: 12px; padding: 20px; margin: 16px 0; background-color: var(--white); box-shadow: 0 4px 12px rgba(0,0,0,0.05); font-family: sans-serif; width: 100%;">
        <div style="border-bottom: 1px solid var(--border-gray); padding-bottom: 12px; margin-bottom: 16px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--primary-blue); letter-spacing: 1.5px; text-transform: uppercase;">${escapeHtml(txt.cardTitle)}</span>
          <h3 style="margin: 4px 0 0 0; font-size: 18px; color: var(--dark-gray); font-weight: 800;">${escapeHtml(perfil)}</h3>
        </div>
        
        <h4 style="font-size: 13px; color: var(--dark-gray); margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase;">${escapeHtml(labelAnalisis[idiomaActual])}</h4>
        <p style="color: var(--text-gray); font-size: 13.5px; margin-bottom: 18px; line-height: 1.6;">${escapeHtml(rec.entorno_detalle || rec.mensaje_final)}</p>
        
        <h4 style="font-size: 13px; color: var(--dark-gray); margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase;">${escapeHtml(txt.estrategia)}</h4>
        <p style="color: var(--text-gray); font-size: 13.5px; margin-bottom: 16px; line-height: 1.5;">${escapeHtml(rec.estrategia)}</p>

        <h4 style="font-size: 13px; color: var(--dark-gray); margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase;">${escapeHtml(txt.plan)}</h4>
        <div style="margin: 0 0 16px 0; color: var(--text-gray); font-size: 13.5px; line-height: 1.5;">
          ${(rec.plan_accion || []).map(p => `<div style="margin-bottom: 6px;">${escapeHtml(p)}</div>`).join('')}
        </div>
        
        <h4 style="font-size: 13px; color: var(--dark-gray); margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase;">${escapeHtml(txt.target)}</h4>
        <div style="margin: 0 0 16px 0; color: var(--text-gray); font-size: 13.5px; line-height: 1.5;">
          ${(rec.empresas_sector || []).map(e => `<div style="margin-bottom: 6px;">${escapeHtml(e)}</div>`).join('')}
        </div>

        <h4 style="font-size: 13px; color: var(--dark-gray); margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase;">${escapeHtml(txt.formacion)}</h4>
        <p style="color: var(--text-gray); font-size: 13.5px; margin-bottom: 16px; line-height: 1.5;">
          ${Array.isArray(rec.formacion_sugerida) ? rec.formacion_sugerida.map(escapeHtml).join(', ') : escapeHtml(rec.formacion_sugerida)}
        </p>

        <div style="background-color: var(--bg-color); padding: 10px; border-radius: 6px; margin-bottom: 16px;">
          <h4 style="font-size: 12px; color: var(--dark-gray); margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase;">${escapeHtml(txt.valores)}</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${(rec.lo_que_valora || []).map(v => `<span style="background: var(--primary-blue); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">${escapeHtml(v)}</span>`).join('')}
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid var(--border-gray); margin: 20px 0 12px 0;">
        <p style="font-size: 12.5px; color: var(--text-gray); font-style: italic; margin: 0; line-height: 1.4;">${escapeHtml(txt.footer)}</p>
      </div>
    `;

    mostrarMensajeBotHtml(contenido);

    input.disabled = true;
    input.placeholder = txt.finalizado;
    
    btn.innerText = txt.reiniciar; 
    btn.classList.add("btn-reiniciar");
    btn.style.backgroundColor = "#dc3545"; 
    btn.style.borderColor = "#dc3545";
  }
}
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (btn.classList.contains("btn-reiniciar")) {
      location.reload();
      return;
    }
    const val = input.value.trim();
    if (!val) return;
    mostrarMensajeUsuario(val);
    input.value = "";
    enviarAlServidor(val);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!btn.disabled) {
        btn.click();
      }
    }
  });

  if (btnTema) {
    btnTema.addEventListener("click", () => {
      document.body.classList.toggle('tema-oscuro');
      if (document.body.classList.contains('tema-oscuro')) {
        btnTema.textContent = 'Modo Claro';
      } else {
        btnTema.textContent = 'Modo Oscuro';
      }
    });
  }

  iniciarChat();
});