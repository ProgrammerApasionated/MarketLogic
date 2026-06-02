const { pipeline, env } = require("@xenova/transformers");

// Evitar crashes de hilos en Windows
env.backends.onnx.wasm.numThreads = 1;

// ==========================================
// 1. DICCIONARIO MULTIIDIOMA Y PROFESIONES REALES
// ==========================================
const LOCALES = {
  es: {
    ramas: {
      tecnica: "la tecnología, la ingeniería y el análisis lógico",
      creatividad: "las artes visuales, la conceptualización y el diseño de experiencias",
      social: "el desarrollo humano, la salud y la transformación social",
      estabilidad: "la arquitectura de negocios, las finanzas y la gestión estratégica"
    },
    // 🔥 NUEVO: Títulos profesionales reales y de alto nivel
    profesiones: {
      tecnica: ["Ingeniero/a de Software", "Arquitecto/a de Datos", "Especialista en Inteligencia Artificial", "Ingeniero/a Cloud", "Desarrollador/a Full-Stack"],
      creatividad: ["Diseñador/a de Producto (UX/UI)", "Director/a Creativo/a", "Estratega de Marca", "Diseñador/a de Experiencias Digitales", "Productor/a Audiovisual"],
      social: ["People & Culture Manager", "Psicólogo/a Organizacional", "Especialista en Desarrollo de Talento", "Mediador/a Corporativo", "Director/a de Impacto Social"],
      estabilidad: ["Analista Financiero/a", "Project Manager (PMP)", "Director/a de Operaciones", "Consultor/a Estratégico", "Controller de Gestión"]
    },
    preguntasEtapa1: {
      tecnica: "Entendido perfectamente. Para profundizar: ¿Qué tipo de desafíos te despiertan mayor curiosidad intelectual: el diseño lógico y desarrollo de sistemas informáticos complejos desde cero, o la analítica profunda de datos para optimizar procesos avanzados?",
      creatividad: "Excelente diagnóstico. Cuéntame: ¿Qué te apasiona más en la práctica: la creación de la identidad estética, conceptual y visual de una marca, o la arquitectura de la experiencia de usuario (UX/UI) en interfaces digitales interactivas?",
      social: "Un perfil muy claro y valioso. Dime: ¿En qué entorno sientes que generarías mayor impacto: interviniendo en el bienestar de las personas de forma personalizada, o liderando procesos de docencia y formación?",
      estabilidad: "Magnífico, alineación natural. Vamos a acotar: ¿Qué área de gobernanza corporativa te atrae más: el control analítico y financiero, o la dirección operativa de proyectos complejos?"
    },
    preguntasEtapa2: {
      tecnica: "Perfecto. Para definir la finalidad de tu plan: ¿Prefieres la autonomía técnica de una startup/proyecto independiente (Flexible), o buscas el respaldo metodológico de una gran tecnológica con procesos estructurados (Estructurado)?",
      creatividad: "Brillante. Última cuestión clave: ¿Te inspira más operar con libertad absoluta como freelance gestionando tus propios clientes (Flexible), o buscas el dinamismo de una agencia corporativa con briefings estables (Estructurado)?",
      social: "Muy bien definido. Concluyamos: ¿Visualizas tu futuro ejerciendo de manera autónoma montando tu propia consulta o proyecto libre (Flexible), o buscas la seguridad contractual de instituciones consolidadas (Estructurado)?",
      estabilidad: "Entendido. Para finalizar tu diagnóstico: ¿Tu meta está vinculada a escalar peldaños jerárquicos dentro de una multinacional estable (Estructurado), o prefieres la flexibilidad de operar de forma externa optimizando empresas (Flexible)?"
    },
    cierre: "¡Perfecto! Hemos consolidado tu perfil de manera exitosa. Tu matriz estratégica de carrera ha sido fijada. A continuación se despliega tu plan de acción maestro y hoja de ruta de mercado:",
    reporte: {
      flexible: {
        valores: ["Autonomía Estratégica", "Gestión por Resultados", "Mitigación de Riesgos"],
        detalle: "Tu perfil requiere un modelo operativo dinámico. Trabajas mejor bajo metodologías asíncronas, priorizando el valor entregado por encima de las barreras jerárquicas.",
        empresas: ["Plataformas globales de consultoría premium (Toptal, Upwork)", "Startups tecnológicas con arquitecturas de trabajo 100% distribuidas", "Estudios boutique de innovación basados en proyectos líquidos"],
        estrategia: "Tu activo más valioso es tu portafolio analizable (Proof of Work). El mercado libre premium no compra títulos, compra soluciones directas sin coste de onboarding.",
        plan: ["Diseña y publica un caso de estudio real interactivo que exponga un problema complejo resuelto.", "Desarrolla una matriz de precios basada en valor en lugar de tarifas horarias."]
      },
      estructurado: {
        valores: ["Gobernanza Corporativa", "Seguridad Estructural", "Escalabilidad Organizacional"],
        detalle: "Maximizas tu potencial dentro de organizaciones estables con flujos jerárquicos claros, planes de carrera predecibles y políticas que mitigan el caos operativo.",
        empresas: ["Multinacionales Fortune 500 líderes del sector", "Firmas globales de consultoría estratégica (Big Four)", "Instituciones bancarias internacionales o departamentos consolidados"],
        estrategia: "Tu éxito dependerá de tu capacidad para navegar la política organizacional y el control de stakeholders. Alinea tus KPIs individuales con las metas macro de la dirección.",
        plan: ["Audita perfiles directivos en LinkedIn dentro de tu sector e identifica sus certificaciones comunes.", "Optimiza tu currículum adaptándolo específicamente para superar los sistemas de filtrado automáticos (ATS)."]
      },
      autodidacta: {
        valores: ["Proactividad Intelectual"],
        plan: ["Establece un entorno de pruebas semanal para testear herramientas beta.", "Involúcrate en proyectos abiertos para someter tus habilidades a la revisión de expertos."],
        formacion: "Ecosistemas de aprendizaje abierto, documentación oficial nativa de industria."
      },
      guiado: {
        valores: ["Aprendizaje Mentorizado"],
        plan: ["Busca activamente un mentor senior en tu sector que provea feedback crítico inmediato.", "Invierte en acreditaciones oficiales reconocidas para acelerar la validación en comités."],
        formacion: "Programas de postgrado acreditados, Bootcamps de alto rendimiento y certificaciones oficiales."
      }
    }
  },
  en: {
    ramas: {
      tecnica: "technology, engineering, and logical analysis",
      creatividad: "visual arts, conceptualization, and experience design",
      social: "human development, healthcare, and social transformation",
      estabilidad: "business architecture, finance, and strategic management"
    },
    profesiones: {
      tecnica: ["Software Engineer", "Data Architect", "AI Specialist", "Cloud Engineer", "Full-Stack Developer"],
      creatividad: ["Product Designer (UX/UI)", "Creative Director", "Brand Strategist", "Digital Experience Designer", "Audiovisual Producer"],
      social: ["People & Culture Manager", "Organizational Psychologist", "Talent Development Specialist", "Corporate Mediator", "Social Impact Director"],
      estabilidad: ["Financial Analyst", "Project Manager (PMP)", "Chief Operating Officer (COO)", "Strategic Consultant", "Business Controller"]
    },
    preguntasEtapa1: {
      tecnica: "Perfectly understood. To dive deeper: What kind of challenges spark your intellectual curiosity: engineering complex software systems from scratch, or deep data analytics to optimize operations?",
      creatividad: "Excellent. Tell me: What drives you more in practice: creating the aesthetic and conceptual identity of a brand, or designing user experiences (UX/UI) for interactive interfaces?",
      social: "A very clear and valuable profile. In which environment do you feel you would make a bigger impact: personalized one-on-one human care, or leading teaching and training processes?",
      estabilidad: "Splendid alignment. Let's narrow it down: Which area of corporate governance appeals to you more: financial control and auditing, or operational project management?"
    },
    preguntasEtapa2: {
      tecnica: "Great. To define your action plan: Do you prefer the technical autonomy of a startup or independent project (Flexible), or do you look for the structured processes of a tech giant (Structured)?",
      creatividad: "Brilliant. Last key question: Does working with absolute freedom as a freelance designer tracking your own clients inspire you (Flexible), or do you prefer corporate agencies with stable project briefings (Structured)?",
      social: "Well defined. Let's wrap up: Do you see your future running your own independent practice or consulting project (Flexible), or do you prefer the long-term job security of consolidated institutions (Structured)?",
      estabilidad: "Understood. To finalize your diagnostic: Is your career goal tied to climbing corporate ladders in a stable multinational (Structured), or do you prefer the flexibility of external corporate consulting (Flexible)?"
    },
    cierre: "Perfect! We have successfully consolidated your profile. Your career strategic matrix is set. Below is your master action plan and market roadmap:",
    reporte: {
      flexible: {
        valores: ["Strategic Autonomy", "Results-Oriented Management", "Risk Mitigation"],
        detalle: "Your profile thrives in dynamic environments. You perform best under asynchronous methodologies, prioritizing direct value delivery over hierarchical constraints.",
        empresas: ["Global premium freelance networks (Toptal, Upwork)", "Tech startups with 100% remote and distributed workforces", "Boutique innovation studios working on liquid short-term projects"],
        estrategia: "Your most valuable asset is your Proof of Work (PoW). The premium independent market does not buy degrees; it buys direct solution delivery without onboarding overhead.",
        plan: ["Design and publish an interactive case study showcasing a complex problem you solved.", "Develop a value-based pricing matrix instead of hourly rates to avoid income ceilings."]
      },
      estructurado: {
        valores: ["Corporate Governance", "Structural Security", "Organizational Scalability"],
        detalle: "You maximize your potential inside stable organizations with clear lines of authority, predictable career paths, and corporate frameworks that mitigate operational chaos.",
        empresas: ["Fortune 500 multinationals and industry leaders", "Global strategic consulting firms (Big Four)", "International banking institutions or well-funded corporate departments"],
        estrategia: "Your success depends on your ability to navigate organizational politics and manage stakeholders. Align your individual KPIs with the executive direction macro goals.",
        plan: ["Audit executive profiles on LinkedIn within your sector to identify their common certifications.", "Optimize your resume keywords specifically to pass Applicant Tracking Systems (ATS) filters."]
      },
      autodidacta: {
        valores: ["Intellectual Proactivity"],
        plan: ["Set up a weekly sandbox environment to test beta tools and emerging frameworks.", "Engage in open communities to submit your skills to global peer reviews."],
        formacion: "Open-source ecosystems, native official industry documentation."
      },
      guiado: {
        valores: ["Mentored Learning"],
        plan: ["Actively look for a senior mentor in your field to provide immediate critical feedback.", "Invest in recognized certifications to speed up validation in traditional hiring boards."],
        formacion: "Accredited postgraduate programs, high-intensity Bootcamps with synchronous mentoring."
      }
    }
  },
  va: {
    ramas: {
      tecnica: "la tecnologia, l'enginyeria i l'anàlisi lògica",
      creatividad: "les arts visuals, la conceptualització i el disseny d'experiències",
      social: "el desenvolupament humà, la salut i la transformació social",
      estabilidad: "l'arquitectura de negocis, les finances i la gestió estratègica"
    },
    profesiones: {
      tecnica: ["Enginyer/a de Programari", "Arquitecte/a de Dades", "Especialista en IA", "Enginyer/a Cloud", "Desenvolupador/a Full-Stack"],
      creatividad: ["Dissenyador/a de Producte (UX/UI)", "Director/a Creatiu/va", "Estratega de Marca", "Dissenyador/a d'Experiències Digitals", "Productor/a Audiovisual"],
      social: ["People & Culture Manager", "Psicòleg/òloga Organitzacional", "Especialista en Desenvolupament de Talent", "Mediador/a Corporatiu", "Director/a d'Impacte Social"],
      estabilidad: ["Analista Financer/a", "Project Manager (PMP)", "Director/a d'Operacions", "Consultor/a Estratègic", "Controller de Gestió"]
    },
    preguntasEtapa1: {
      tecnica: "Entès perfectament. Per a aprofundir: Quin tipus de desafiaments et desperten major curiositat intel·lectual: el disseny lògic i desenvolupament de sistemes informàtics des de zero, o l'analítica profunda de dades?",
      creatividad: "Excel·lent diagnòstic. Conta'm: Què t'apassiona més en la pràctica: la creació de la identitat estètica d'una marca, o l'arquitectura de l'experiència d'usuari (UX/UI)?",
      social: "Un perfil molt clar i valuós. Digues-me: En quin entorn sents que generaries major impacte: intervenint en el benestar de les persones de forma personalitzada, o liderant processos de docència?",
      estabilidad: "Magnífic. Anem a acotar: Quina àrea de governança corporativa t'atreu més: el control analític i financer, o la direcció operativa de projectes complexos?"
    },
    preguntasEtapa2: {
      tecnica: "Perfecte. Per a definir la finalitat del teu pla: Prefereixes l'autonomia tècnica d'una startup o projecte independent (Flexible), o busques el rodatge d'una gran tecnològica amb processos estructurats (Estructurat)?",
      creatividad: "Brillant. Última qüestió clau: T'inspira més operar amb llibertat absoluta com a freelance gestionant els teus propis clients (Flexible), o busques el dinamisme d'una agència amb briefings estables (Estructurat)?",
      social: "Molt bé definit. Concloem: Visualitzes el teu futur exercint de manera autònoma amb la teua pròpia consulta o projecte lliure (Flexible), o busques la seguretat contractual d'institucions consolidades (Estructurat)?",
      estabilidad: "Entès. Per a finalitzar el teu diagnòstic: La teua meta està vinculada a escalar esglaons jeràrquics dins d'una multinacional estable (Estructurat), o prefereixes la flexibilitat d'operar de forma externa (Flexible)?"
    },
    cierre: "Perfecte! Hem consolidat el teu perfil de manera exitosa. La teua matriu estratègica de carrera ha sigut fixada. A continuació es desplega el teu pla d'acció mestre i full de ruta de mercat:",
    reporte: {
      flexible: {
        valores: ["Autonomia Estratègica", "Gestió per Resultats", "Mitigació de Riscos"],
        detalle: "El teu perfil requereix un model operatiu dinàmic. Treballes millor sota metodologies asíncrones, prioritzant el valor lliurat per damunt de les barreres jeràrquiques.",
        empresas: ["Plataformes globals de consultoria premium (Toptal, Upwork)", "Startups tecnològiques amb arquitectures de treball 100% distribuïdes", "Estudis boutique d'innovació basats en projectes líquids"],
        estrategia: "El teu actiu més valuós és el teu portafoli analitzable (Proof of Work). El mercat lliure premium no compra títols, compra solucions directes sense cost d'onboarding.",
        plan: ["Dissenya i publica un cas d'estudi real interactiu que expose un problema complex resolt.", "Desenvolupa una matriu de preus basada en valor en lloc de tarifes horàries."]
      },
      estructurado: {
        valores: ["Governança Corporativa", "Seguretat Estructural", "Escalabilitat Organitzacional"],
        detalle: "Maximitzes el teu potencial dins d'organitzacions estables amb fluxos jeràrquics clars, plans de carrera predictibles i polítiques que mitiguen el caos operatiu.",
        empresas: ["Multinacionals Fortune 500 líders del sector", "Firmes globals de consultoria estratègica (Big Four)", "Institucions bancàries internacionals o departaments consolidats"],
        estrategia: "El teu èxit dependrà de la teua capacitat per a navegar la política organitzacional i el control de stakeholders. Alinea els teus KPIs individuals amb les metes macro de la direcció.",
        plan: ["Audita perfils directius en LinkedIn dins del teu sector i identifica les seues certificacions comunes.", "Optimitza el teu currículum adaptant-lo específicament per a superar els sistemes de filtrat automàtics (ATS)."]
      },
      autodidacta: {
        valores: ["Proactivitat Intel·lectual"],
        plan: ["Estableix un entorn de proves setmanal per a testejar eines beta.", "Involucra't en projectes oberts per a sotmetre les teues habilitats a la revisió d'experts."],
        formacion: "Ecosistemes d'aprenentatge obert, documentació oficial nativa d'indústria."
      },
      guiado: {
        valores: ["Aprenentatge Mentoritzat"],
        plan: ["Busca activament un mentor sènior en el teu sector que proveïsca feedback crític immediat.", "Inverteix en acreditacions oficials reconegudes per a accelerar la validació en comités."],
        formacion: "Programes de postgrau acreditats, Bootcamps d'alt rendiment i certificacions oficials."
      }
    }
  }
};

async function cargarModelos() {
  console.log("Motor NLP preparado con arquitectura multiidioma y sistema de puntuación ✔️");
}

// ==========================================
// 2. DETECCIÓN AVANZADA: SISTEMA DE PUNTUACIÓN (NLP MEJORADO)
// ==========================================

function detectarCategoriaPorPuntuacion(texto) {
  const t = texto.toLowerCase();

  // --- 1. PRIORIDAD ABSOLUTA (Sin banderas 'g' y con patrones flexibles) ---
  // He eliminado las \b y los patrones demasiado específicos para evitar que fallen con palabras derivadas
  if (/software|program|código|desarroll|python|java|backend|frontend|ia|algoritmo|script|binario|devops/.test(t)) return "tecnica";
  if (/diseñ|arte|creativ|ux|ui|figma|branding|ilustr|visual|audiovisual|estétic|foto|edición/.test(t)) return "creatividad";
  if (/personas|ayudar|empat|enseñ|docencia|psicolog|salud|cuidado|rrhh|terapia|coaching|ong|comunidad/.test(t)) return "social";
  if (/financ|econom|inversión|banca|auditoría|ley|normativa|presupuesto|contabil/.test(t)) return "estabilidad";

  // --- 2. SISTEMA DE PESOS (Si no hay match directo) ---
  const scores = { tecnica: 0, creatividad: 0, social: 0, estabilidad: 0 };

  // Usamos .includes() que es mucho más seguro y rápido que Regex para puntuaciones
  const keywords = {
    tecnica: ["tecnolog", "sistem", "datos", "web", "cloud"],
    creatividad: ["concepto", "idea", "tendencia", "estilo"],
    social: ["equipo", "liderazg", "bienestar", "humano"],
    estabilidad: ["empresa", "gestion", "proyecto", "negocio", "oficina", "proceso"]
  };

  for (const [cat, words] of Object.entries(keywords)) {
    words.forEach(word => {
      if (t.includes(word)) scores[cat] += 1;
    });
  }

  // --- 3. DECISIÓN FINAL ---
  let bestCat = null;
  let maxScore = 0;
  
  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) { 
      maxScore = score; 
      bestCat = cat; 
    }
  }
  
  // Si no hay puntos en nada, devolvemos null, no forzamos 'estabilidad' aquí
  // Dejamos que la función principal maneje el fallback si es necesario
  return bestCat; 
}

async function analizarRespuesta(texto, historial, etapaActual) {
  const t = (texto || "").toLowerCase().trim();

  // Si son botones, saltamos el NLP
  if ((etapaActual === 1 || etapaActual === 2) && ["tecnica", "creatividad", "social", "estabilidad"].includes(t)) {
    historial.categoriaPrincipal = t;
    historial.respuestasVocacionales.push(texto);
    return { categoria: t };
  }

  // Etapa 1 o 2 (NLP)
  if (etapaActual === 1 || etapaActual === 2) {
    historial.respuestasVocacionales.push(texto);
    
    let cat = detectarCategoriaPorPuntuacion(t);
    
    // FALLBACK: Si no detectamos nada, mantenemos la anterior o por defecto estabilidad
    if (!cat) {
        cat = historial.categoriaPrincipal || "estabilidad";
    }
    
    historial.categoriaPrincipal = cat;
    
    // Asignación de aprendizaje automático
    const perfilAprendizaje = { tecnica: "autodidacta", creatividad: "autodidacta", social: "guiado", estabilidad: "guiado" };
    historial.modificadorAprendizaje = perfilAprendizaje[cat] || "guiado";
    
    return { categoria: cat };
  }

  // Etapa 3 (Entorno) - Igual que antes
  if (etapaActual === 3) {
    historial.respuestasModificadores.push(texto);
    const isFlexible = /flexib|libre|libertad|independiente|freelance|remoto|propia|autonom|startup/.test(t);
    historial.modificadorEntorno = isFlexible ? "flexible" : "estructurado";
    return { categoria: historial.categoriaPrincipal };
  }

  return { categoria: historial.categoriaPrincipal || "estabilidad" };
}

async function analizarRespuesta(texto, historial, etapaActual) {
  const t = (texto || "").toLowerCase().trim();

  // Inicialización segura del historial
  if (!historial.idioma) historial.idioma = "es"; 
  if (!historial.respuestasVocacionales) historial.respuestasVocacionales = [];
  if (!historial.respuestasModificadores) historial.respuestasModificadores = [];

  // --- DETECCIÓN DIRECTA POR BOTONES ---
  if (etapaActual === 1 || etapaActual === 2) {
    if (["tecnica", "creatividad", "social", "estabilidad"].includes(t)) {
      historial.categoriaPrincipal = t;
      historial.respuestasVocacionales.push(texto);
      return { categoria: t };
    }
  }
  if (etapaActual === 3) {
    if (["flexible", "estructurado"].includes(t)) {
      historial.modificadorEntorno = t;
      historial.respuestasModificadores.push(texto);
      return { categoria: historial.categoriaPrincipal };
    }
  }

  // --- ANÁLISIS DE TEXTO LIBRE ---
  if (etapaActual === 1) {
    historial.respuestasVocacionales.push(texto);
    const categoriaDetectada = detectarCategoriaPorPuntuacion(t);
    historial.categoriaPrincipal = categoriaDetectada || "estabilidad"; // Estabilidad como fallback general
    return { categoria: historial.categoriaPrincipal };
  }

  if (etapaActual === 2) {
    historial.respuestasVocacionales.push(texto);
    
    // Si en la segunda respuesta hay un cambio de intención drástico, lo capturamos
    const categoriaDetectada = detectarCategoriaPorPuntuacion(t);
    const intencionCambio = /\b(quiero cambiar|prefiero|mejor quiero|en realidad|pensándolo bien)\b/gi;
    
    if (categoriaDetectada && intencionCambio.test(t)) {
      historial.categoriaPrincipal = categoriaDetectada;
    }

    // Definición del modificador de aprendizaje
    const perfilAprendizaje = { tecnica: "autodidacta", creatividad: "autodidacta", social: "guiado", estabilidad: "guiado" };
    historial.modificadorAprendizaje = perfilAprendizaje[historial.categoriaPrincipal] || "guiado";
    return { categoria: historial.categoriaPrincipal };
  }

  if (etapaActual === 3) {
    historial.respuestasModificadores.push(texto);
    if (/\b(flexib|libre|libertad|independiente|freelance|remoto|propia|autonom|startup)\b/gi.test(t)) {
      historial.modificadorEntorno = "flexible";
    } else {
      historial.modificadorEntorno = "estructurado";
    }
    return { categoria: historial.categoriaPrincipal };
  }

  return { categoria: historial.categoriaPrincipal };
}

// ==========================================
// 3. INFORME TRADUCIDO DINÁMICAMENTE (SIN VIÑETAS)
// ==========================================
async function elegirPerfilPorNLP(historial) {
  const lang = historial.idioma || "es";
  const TEXTS = LOCALES[lang] || LOCALES["es"];

  const categoriaFiltro = historial.categoriaPrincipal || "estabilidad";
  
  const profesionesDisponibles = TEXTS.profesiones[categoriaFiltro];
  const textoTotalLength = (historial.respuestasVocacionales || []).join("").length;
  const index = textoTotalLength % profesionesDisponibles.length;
  const nombreProfesionReal = profesionesDisponibles[index];

  let perfilFinal = {};
  perfilFinal.name = nombreProfesionReal;
  
  const entorno = historial.modificadorEntorno || "estructurado";
  const aprendizaje = historial.modificadorAprendizaje || "guiado";

  // ⚡ CAMBIO AQUÍ: Convertimos los arrays en texto plano usando .join()
  // Esto hará que el frontend ya no pueda renderizarlos como listas de viñetas.
  
  // valoresClave ahora es una cadena separada por comas
  perfilFinal.valoresClave = [...TEXTS.reporte[entorno].valores, ...TEXTS.reporte[aprendizaje].valores].join(", ");
  
  // detalle se mantiene como string
  perfilFinal.entornoRecomendadoDetalle = TEXTS.reporte[entorno].detalle;
  
  // empresas ahora es una cadena separada por barras verticales
  perfilFinal.empresas = TEXTS.reporte[entorno].empresas.join(" | ");
  
  // estrategia se mantiene como string
  perfilFinal.estrategiaMercado = TEXTS.reporte[entorno].estrategia;
  
  // planAccionInmediato ahora es una cadena separada por puntos y coma
  perfilFinal.planAccionInmediato = [...TEXTS.reporte[entorno].plan, ...TEXTS.reporte[aprendizaje].plan].join("; ");
  
  // formacion se mantiene como string
  perfilFinal.formacionRecomendada = TEXTS.reporte[aprendizaje].formacion;

  return { perfilId: "prof_detectada", perfilModificado: perfilFinal };
}

// ==========================================
// 4. PREGUNTAS DINÁMICAS
// ==========================================
function generarRespuestaDinamica(analisis, etapaActual, historial) {
  const lang = historial.idioma || "es";
  const TEXTS = LOCALES[lang] || LOCALES["es"];
  const cat = historial.categoriaPrincipal || "estabilidad";

  if (etapaActual === 1) return TEXTS.preguntasEtapa1[cat];
  if (etapaActual === 2) return TEXTS.preguntasEtapa2[cat];
  if (etapaActual === 3) return TEXTS.cierre;
  
  return "";
}

module.exports = { cargarModelos, analizarRespuesta, elegirPerfilPorNLP, generarRespuestaDinamica };