// Base de conocimiento del asistente de la página principal.
// Para agregar o cambiar respuestas, edita la lista ENTRIES más abajo.
// IMPORTANTE: aquí no hay precios ni datos inventados. Cuando tengas los datos reales
// (precios, horarios, formas de pago), agrégalos en la entrada correspondiente.

export interface BotAction {
  label: string
  href: string
}

export interface BotAnswer {
  text: string
  actions?: BotAction[]
  follow?: string[] // preguntas sugeridas después de esta respuesta
}

interface Entry {
  id: string
  strong: string[] // frases que identifican claramente el tema (3 puntos)
  weak?: string[] // palabras relacionadas (1 punto)
  answer: BotAnswer
}

// Si pones un enlace (WhatsApp, Telegram, correo con https://...), aparecerá el botón de contacto.
export const BOT_CONTACT = { label: 'Escribir al equipo', url: '' }

const REGISTER: BotAction = { label: 'Crear mi cuenta', href: '/register' }
const LOGIN: BotAction = { label: 'Iniciar sesión', href: '/login' }
const PLANS: BotAction = { label: 'Ver los planes', href: '#planes' }
const SUPPORT: BotAction = { label: 'Hablar con soporte', href: '#soporte' }

export const GREETING: BotAnswer = {
  text:
    '¡Hola! Soy el asistente de Invictus Campus. Puedo explicarte cómo funcionan el Club y la Mentoría, cómo acceder y qué vas a encontrar dentro de la plataforma. ¿Qué te gustaría saber?',
  follow: ['¿Cómo obtengo acceso?', '¿Club o Mentoría?', '¿Qué incluye la plataforma?', '¿Hay clases en vivo?', 'Precios'],
}

const ENTRIES: Entry[] = [
  {
    id: 'saludo',
    strong: ['hola', 'buenas', 'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'hey'],
    answer: GREETING,
  },
  {
    id: 'gracias',
    strong: ['gracias', 'muchas gracias', 'excelente', 'perfecto', 'genial', 'listo'],
    answer: { text: '¡Con gusto! Si tienes otra duda sobre el Club o la Mentoría, aquí estoy.', follow: ['¿Cómo obtengo acceso?', 'Precios'] },
  },
  {
    id: 'que-es',
    strong: ['que es invictus', 'que es el campus', 'que es invictus campus', 'de que trata', 'que ofrecen', 'de que se trata', 'quienes son'],
    weak: ['invictus', 'campus', 'academia', 'plataforma'],
    answer: {
      text:
        'Invictus Campus es la plataforma donde estudias, practicas y operas el Nasdaq con estructura. Reúne clases grabadas, sesiones en vivo, material educativo y el seguimiento de tu progreso en un solo lugar. El contenido se centra en el Micro Nasdaq (MNQ) con metodología ICT.',
      actions: [REGISTER],
      follow: ['¿Club o Mentoría?', '¿Cómo obtengo acceso?'],
    },
  },
  {
    id: 'acceso',
    strong: ['como obtengo acceso', 'como entro', 'como ingreso', 'como me registro', 'como me inscribo', 'como empiezo', 'crear cuenta', 'registrarme', 'registro', 'inscribirme', 'unirme', 'como accedo', 'quiero entrar', 'quiero unirme'],
    weak: ['acceso', 'cuenta', 'registrar', 'ingresar', 'entrar', 'empezar', 'unir', 'inscripcion'],
    answer: {
      text:
        'Es sencillo. 1) Crea tu cuenta con tu correo. 2) El equipo revisa tu solicitud y la aprueba manualmente. 3) Cuando te aprueban, inicias sesión y ves el contenido de tu nivel.',
      actions: [REGISTER, LOGIN],
      follow: ['¿Cuánto tarda la aprobación?', '¿Club o Mentoría?'],
    },
  },
  {
    id: 'aprobacion',
    strong: ['cuanto tarda', 'tiempo de aprobacion', 'aprobacion', 'me aprueban', 'aprobar mi cuenta', 'pendiente', 'cuenta pendiente', 'sigue pendiente', 'esperar aprobacion'],
    weak: ['aprobar', 'aprobado', 'aprobada', 'espera', 'revisan', 'solicitud'],
    answer: {
      text:
        'Cada solicitud la revisa y aprueba el equipo de Invictus de forma manual, para mantener un entorno cuidado. No tengo un plazo exacto publicado. En cuanto tu cuenta sea aprobada, podrás iniciar sesión.',
      actions: [LOGIN, SUPPORT],
      follow: ['No puedo iniciar sesión', '¿Club o Mentoría?'],
    },
  },
  {
    id: 'diferencia',
    strong: ['diferencia entre club y mentoria', 'club o mentoria', 'club vs mentoria', 'que diferencia hay', 'cual me conviene', 'cual elegir', 'cual es mejor', 'diferencias'],
    weak: ['diferencia', 'comparar', 'elegir', 'conviene', 'versus'],
    answer: {
      text:
        'El Club da acceso al contenido del club: clases y grabaciones, material educativo y sesiones en vivo. La Mentoría incluye todo lo del Club y suma las clases exclusivas del programa de mentoría, material avanzado y un seguimiento más cercano.',
      actions: [PLANS],
      follow: ['¿Qué incluye el Club?', '¿Qué incluye la Mentoría?', 'Precios'],
    },
  },
  {
    id: 'club',
    strong: ['que incluye el club', 'invictus club', 'plan club', 'que es el club', 'sobre el club', 'info del club'],
    weak: ['club', 'invictus club'],
    answer: {
      text:
        'Invictus Club es para quienes quieren aprender la metodología y operar con estructura. Incluye clases y grabaciones del club, material educativo y sesiones en vivo.',
      actions: [REGISTER, PLANS],
      follow: ['¿Qué incluye la Mentoría?', 'Precios'],
    },
  },
  {
    id: 'mentoria',
    strong: ['que incluye la mentoria', 'mentoria invictus', 'plan mentoria', 'que es la mentoria', 'sobre la mentoria', 'info de la mentoria', 'programa de mentoria'],
    weak: ['mentoria', 'mentor', 'acompanamiento', 'seguimiento'],
    answer: {
      text:
        'La Mentoría Invictus incluye todo lo del Club y suma clases exclusivas del programa de mentoría, material avanzado y un seguimiento más cercano. Es el nivel más completo.',
      actions: [REGISTER, PLANS],
      follow: ['¿Club o Mentoría?', 'Precios'],
    },
  },
  {
    id: 'precios',
    strong: ['cuanto cuesta', 'cuanto vale', 'cuanto sale', 'precio', 'precios', 'costo', 'costos', 'tarifa', 'cuanto es', 'valor del club', 'valor de la mentoria', 'cuanto hay que pagar'],
    weak: ['pagar', 'pago', 'cobran', 'mensual', 'mensualidad', 'suscripcion', 'barato', 'caro', 'metodos de pago', 'tarjeta', 'transferencia'],
    answer: {
      text:
        'Todavía no tengo precios publicados en este asistente. Los valores y las formas de pago los confirma directamente el equipo de Invictus.',
      actions: [PLANS, SUPPORT],
      follow: ['¿Club o Mentoría?', '¿Cómo obtengo acceso?'],
    },
  },
  {
    id: 'grabadas',
    strong: ['clases grabadas', 'quedan grabadas', 'grabaciones', 'ver las clases', 'puedo ver despues', 'repetir clases', 'biblioteca de clases', 'modulos', 'cuantas clases'],
    weak: ['grabada', 'grabadas', 'clases', 'clase', 'videos', 'video', 'lecciones', 'leccion', 'curso', 'cursos'],
    answer: {
      text:
        'Sí. Las clases y grabaciones están en la plataforma, organizadas por módulos, y puedes verlas cuando quieras. Tu progreso se guarda para que retomes justo donde lo dejaste.',
      actions: [REGISTER],
      follow: ['¿Hay clases en vivo?', '¿Qué incluye la plataforma?'],
    },
  },
  {
    id: 'vivo',
    strong: ['clases en vivo', 'sesiones en vivo', 'hay en vivo', 'trading en vivo', 'sesion de nueva york', 'sala en vivo', 'llamadas', 'zoom', 'videollamada', 'reuniones'],
    weak: ['vivo', 'directo', 'live', 'horario', 'horarios', 'nueva york', 'sesion', 'sesiones', 'llamada'],
    answer: {
      text:
        'Sí. Hay sesiones en vivo con una sala abierta para seguir la operativa de Nueva York en tiempo real. Dentro del campus, la sección Llamadas muestra los encuentros de Zoom que publica el equipo y habilita el enlace 30 minutos antes. Los horarios exactos los confirma el equipo.',
      actions: [REGISTER],
      follow: ['¿Qué incluye la plataforma?', '¿Club o Mentoría?'],
    },
  },
  {
    id: 'comunidad',
    strong: ['chat', 'comunidad', 'grupo de alumnos', 'hablar con otros', 'otros alumnos', 'foro', 'grupo de telegram', 'grupo de whatsapp'],
    weak: ['miembros', 'companeros', 'interactuar', 'preguntar', 'moderado'],
    answer: {
      text:
        'Dentro del campus hay un chat de la comunidad para los miembros aprobados, donde puedes conversar con otros alumnos y con el equipo. Está moderado para mantenerlo ordenado y seguro.',
      actions: [REGISTER],
      follow: ['¿Cómo obtengo acceso?', '¿Qué incluye la plataforma?'],
    },
  },
  {
    id: 'material',
    strong: ['material educativo', 'material de estudio', 'pdf', 'guias', 'recursos', 'descargar material'],
    weak: ['material', 'guia', 'documentos', 'apuntes', 'estudiar'],
    answer: {
      text: 'La plataforma incluye PDFs, guías y recursos para estudiar y repasar la metodología. El material avanzado forma parte de la Mentoría.',
      actions: [REGISTER],
      follow: ['¿Club o Mentoría?', '¿Qué incluye la plataforma?'],
    },
  },
  {
    id: 'plataforma',
    strong: ['que incluye la plataforma', 'que hay dentro', 'que voy a encontrar', 'que trae', 'que incluye', 'que ofrece la plataforma', 'como funciona la plataforma', 'que puedo hacer'],
    weak: ['incluye', 'incluido', 'dentro', 'funciones', 'beneficios', 'ofrece'],
    answer: {
      text:
        'Dentro del campus encuentras: biblioteca de clases por módulos con tu progreso, sesiones en vivo y llamadas de Zoom, material educativo, un chat de comunidad moderado y acceso por niveles (Club o Mentoría).',
      actions: [REGISTER],
      follow: ['¿Hay clases en vivo?', '¿Club o Mentoría?'],
    },
  },
  {
    id: 'metodo',
    strong: ['que ensenan', 'que aprendo', 'que se ensena', 'metodologia', 'metodo', 'order block', 'order blocks', 'fair value gap', 'liquidez', 'estructura de mercado', 'smart money', 'que estrategia'],
    weak: ['ict', 'inner circle', 'ensenan', 'estrategia', 'institucional', 'institucionales', 'aprender', 'temario', 'contenido', 'ejecucion'],
    answer: {
      text:
        'Se trabaja la metodología ICT: leer la estructura de mercado, identificar order blocks, fair value gaps y zonas de liquidez en temporalidades menores, y ejecutar con un plan definido y el riesgo establecido antes de entrar.',
      actions: [REGISTER],
      follow: ['¿Qué es el MNQ?', '¿Soy principiante, sirve?'],
    },
  },
  {
    id: 'mnq',
    strong: ['micro nasdaq', 'que es el mnq', 'que activo', 'en que opero', 'que mercado', 'nasdaq'],
    weak: ['mnq', 'activo', 'futuros', 'mercado', 'indice'],
    answer: {
      text: 'Todo el contenido se centra en el Micro Nasdaq (MNQ), operado con la metodología ICT y ejecución institucional.',
      follow: ['¿Qué se enseña?', '¿Soy principiante, sirve?'],
    },
  },
  {
    id: 'principiante',
    strong: ['soy principiante', 'sin experiencia', 'desde cero', 'estoy empezando', 'nunca he operado', 'nunca opere', 'soy nuevo', 'soy nueva', 'para principiantes', 'sirve para principiantes'],
    weak: ['principiante', 'novato', 'novata', 'empezando', 'nuevo', 'experiencia', 'basico'],
    answer: {
      text:
        'Si estás empezando, mira el video de la página principal, "Si estás empezando en el trading". Después puedes crear tu cuenta y avanzar por los módulos a tu ritmo. Recuerda que operar implica riesgo y el contenido es educativo.',
      actions: [REGISTER],
      follow: ['¿Qué se enseña?', '¿Club o Mentoría?'],
    },
  },
  {
    id: 'riesgo',
    strong: ['garantizan ganancias', 'se gana dinero', 'puedo ganar', 'es seguro', 'hay riesgo', 'cuanto se gana', 'resultados garantizados', 'es rentable', 'cuanto puedo ganar'],
    weak: ['ganar', 'ganancias', 'ganancia', 'riesgo', 'perder', 'perdida', 'rentable', 'garantia', 'garantizado', 'resultados', 'dinero'],
    answer: {
      text:
        'Operar en mercados financieros implica un riesgo significativo de pérdida. El contenido de Invictus Campus es exclusivamente educativo, no es asesoramiento financiero y los resultados pasados no garantizan resultados futuros. La constancia se construye definiendo tu riesgo antes de entrar.',
      follow: ['¿Qué se enseña?', '¿Cómo obtengo acceso?'],
    },
  },
  {
    id: 'dispositivos',
    strong: ['desde el celular', 'en el celular', 'desde el movil', 'en el telefono', 'en tablet', 'funciona en celular', 'app movil'],
    weak: ['celular', 'movil', 'telefono', 'tablet', 'computadora', 'pc', 'app', 'aplicacion', 'android', 'iphone'],
    answer: {
      text: 'La plataforma funciona en celular, tablet y computadora desde el navegador, sin instalar nada.',
      follow: ['¿Qué incluye la plataforma?'],
    },
  },
  {
    id: 'login',
    strong: ['no puedo iniciar sesion', 'no puedo entrar', 'olvide mi contrasena', 'olvide la contrasena', 'no me deja entrar', 'error al iniciar', 'mi cuenta fue rechazada', 'cuenta bloqueada', 'recuperar contrasena'],
    weak: ['contrasena', 'password', 'clave', 'iniciar sesion', 'login', 'rechazada', 'bloqueada', 'baneado', 'error'],
    answer: {
      text:
        'Para iniciar sesión tu cuenta debe estar aprobada por el equipo y sin bloqueos. Si ya te aprobaron y sigue sin funcionar, o si olvidaste tu contraseña, conviene que lo consultes directamente con el equipo.',
      actions: [LOGIN, SUPPORT],
      follow: ['¿Cuánto tarda la aprobación?'],
    },
  },
  {
    id: 'contacto',
    strong: ['hablar con una persona', 'hablar con alguien', 'contactar', 'contacto', 'soporte', 'ayuda humana', 'quiero hablar', 'escribirles', 'atencion al cliente', 'whatsapp', 'telegram'],
    weak: ['persona', 'humano', 'equipo', 'asesor', 'asistencia'],
    answer: {
      text: 'Con gusto. Para temas puntuales, como pagos, horarios exactos o problemas de tu cuenta, lo mejor es hablar directamente con el equipo de Invictus. Déjanos tu consulta y te responde una persona aquí mismo.',
      actions: [SUPPORT],
      follow: ['¿Cómo obtengo acceso?', 'Precios'],
    },
  },
  {
    id: 'despedida',
    strong: ['adios', 'chau', 'hasta luego', 'nos vemos', 'bye'],
    answer: { text: '¡Hasta pronto! Cuando quieras, crea tu cuenta y empieza en Invictus Campus.', actions: [REGISTER] },
  },
]

export const FALLBACK: BotAnswer = {
  text:
    'No tengo esa información todavía. Puedo ayudarte con cómo acceder, las diferencias entre Club y Mentoría, las clases y sesiones en vivo, la metodología o los planes. Si prefieres, te pongo en contacto con una persona del equipo.',
  actions: [SUPPORT],
  follow: ['¿Cómo obtengo acceso?', '¿Club o Mentoría?', '¿Qué incluye la plataforma?', 'Precios'],
}

// ---------- Motor de coincidencia ----------

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stem(w: string): string {
  return w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w
}

function tokens(s: string): string[] {
  const n = normalize(s)
  return n ? n.split(' ').map(stem) : []
}

function lev(a: string, b: string): number {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > 1) return 2
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[b.length]
}

function sameWord(a: string, b: string): boolean {
  if (a === b) return true
  return a.length >= 5 && b.length >= 5 && lev(a, b) <= 1
}

function hasPhrase(msg: string[], phrase: string[]): boolean {
  if (!phrase.length) return false
  for (let i = 0; i + phrase.length <= msg.length; i++) {
    let ok = true
    for (let j = 0; j < phrase.length; j++) {
      if (!sameWord(msg[i + j], phrase[j])) {
        ok = false
        break
      }
    }
    if (ok) return true
  }
  return false
}

export function answerFor(question: string): BotAnswer {
  const msg = tokens(question)
  if (!msg.length) return FALLBACK

  let best: Entry | null = null
  let bestScore = 0
  for (const e of ENTRIES) {
    let score = 0
    for (const p of e.strong) if (hasPhrase(msg, tokens(p))) score += 3 + (tokens(p).length > 1 ? 1 : 0)
    for (const w of e.weak || []) if (hasPhrase(msg, tokens(w))) score += 1
    if (score > bestScore) {
      best = e
      bestScore = score
    }
  }
  // Un saludo no debe ganarle a una pregunta real.
  if (best && best.id === 'saludo' && msg.length > 4) return answerFor(msg.filter((w) => !['hola', 'buena', 'buenas', 'hey'].includes(w)).join(' '))
  return best && (bestScore >= 2 || (bestScore >= 1 && msg.length <= 2)) ? best.answer : FALLBACK
}