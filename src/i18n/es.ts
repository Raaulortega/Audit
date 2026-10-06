import type { Messages } from './en';

const plural = (count: number, one: string, other: string) => (count === 1 ? one : other);

export const es: Messages = {
  meta: {
    title: 'LocalAudit',
    htmlLang: 'es',
    dateLocale: 'es-ES',
    ogLocale: 'es_ES',
  },
  seo: {
    pages: {
      '/': {
        title: 'LocalAudit — Herramientas de seguridad en tu navegador',
        description:
          'Analiza Dockerfile, .env, nginx y package.json, detecta claves de API filtradas, decodifica JWT y genera cabeceras de seguridad. Gratis, privado y 100% local.',
      },
      '/scanner': {
        title: 'Auditar Dockerfile, .env y nginx online | LocalAudit',
        description:
          'Audita Dockerfile, docker-compose, nginx.conf, .env, package.json y vercel.json con más de 75 reglas CWE/OWASP. Se ejecuta en tu navegador, sin subir nada.',
      },
      '/history': {
        title: 'Historial de escaneos | LocalAudit',
        description: 'Tus escaneos guardados en LocalAudit: sigue tu puntuación de seguridad y compara dos escaneos.',
      },
      '/secrets': {
        title: 'Detector de secretos y claves API filtradas | LocalAudit',
        description:
          'Encuentra claves de API, tokens y contraseñas en logs o código y copia una versión ocultada para compartir. Detecta AWS, GitHub, Stripe, OpenAI y más.',
      },
      '/jwt': {
        title: 'Decodificar JWT online y auditar su seguridad | LocalAudit',
        description:
          'Decodifica JSON Web Tokens y revisa alg none, caducidad y datos sensibles. Verifica secretos HS256 en local: tu token nunca sale del navegador.',
      },
      '/headers': {
        title: 'Generador de cabeceras de seguridad HTTP | LocalAudit',
        description:
          'Crea Content-Security-Policy, HSTS, Permissions-Policy y más, y exporta la configuración lista para Vercel, nginx, Netlify, Apache o Express.',
      },
      '/passwords': {
        title: 'Comprobar la seguridad de una contraseña | LocalAudit',
        description:
          'Calcula cuánto resiste una contraseña a un ataque offline y genera secretos y frases de contraseña criptográficamente seguros. No se envía nada.',
      },
      '/rules': {
        title: 'Catálogo de reglas de seguridad CWE y OWASP | LocalAudit',
        description:
          'Consulta todas las comprobaciones de LocalAudit: más de 75 reglas para Docker, nginx, .env, npm y Vercel, con su severidad y referencias CWE/OWASP.',
      },
    },
    notFound: {
      title: 'Página no encontrada | LocalAudit',
      description: 'Esta página no existe. Vuelve a las herramientas de seguridad de LocalAudit.',
    },
    appDescription:
      'Herramientas de seguridad gratuitas y privadas que se ejecutan en el navegador: escáner de configuración, detector de secretos, inspector JWT, generador de cabeceras y laboratorio de contraseñas.',
    features: [
      'Escáner de seguridad para Dockerfile, docker-compose, nginx, .env, .gitignore, package.json y vercel.json',
      'Detección de secretos y claves de API con ocultación de logs',
      'Decodificador y auditoría de JWT',
      'Generador de cabeceras de seguridad HTTP (CSP, HSTS, Permissions-Policy)',
      'Comprobador de contraseñas y generador de secretos seguros',
      'Exportación de informes en SARIF, JSON y Markdown',
    ],
    breadcrumbHome: 'Inicio',
  },
  faq: {
    title: 'Preguntas frecuentes',
    items: [
      {
        question: '¿LocalAudit es gratis?',
        answer: 'Sí. Todas las herramientas son gratuitas, sin cuenta, sin límites y sin anuncios.',
      },
      {
        question: '¿Se suben mis ficheros o secretos a algún sitio?',
        answer:
          'No. Todo el análisis se ejecuta en tu navegador con JavaScript; no hay backend. Los ficheros cargados se guardan en el almacenamiento de tu navegador para que no se pierdan al recargar, y "Borrar todo" los elimina. Una vez cargada la página, funciona incluso sin conexión.',
      },
      {
        question: '¿Qué ficheros puede analizar LocalAudit?',
        answer:
          'Dockerfile, docker-compose.yml, nginx.conf, .env, .gitignore, package.json y vercel.json tienen reglas específicas. Cualquier otro fichero de texto, de hasta 5 MB, se analiza en busca de secretos filtrados como claves de AWS, GitHub, Stripe u OpenAI.',
      },
      {
        question: '¿Cómo se calcula la puntuación de seguridad?',
        answer:
          'Cada escaneo empieza en 100. Cada hallazgo resta puntos según su severidad: 15 si es crítico, 8 si es medio y 3 si es bajo. Los hallazgos están mapeados a CWE y OWASP e incluyen una corrección lista para copiar.',
      },
      {
        question: '¿Puedo usar los resultados en CI o en GitHub?',
        answer:
          'Sí. Exporta el informe en Markdown para pull requests, en JSON para otras herramientas o en SARIF 2.1.0 para subirlo a GitHub code scanning.',
      },
    ],
  },
  notFound: {
    eyebrow: '404',
    title: 'Página no encontrada',
    body: 'La página que buscas no existe o se ha movido.',
    home: 'Volver al resumen',
  },
  language: {
    label: 'Idioma',
    en: 'English',
    es: 'Español',
  },
  brand: {
    tagline: 'Seguridad · 100% local',
    localTitle: '100% local',
    localBody: 'Tus ficheros y secretos nunca salen del navegador. Sin backend ni telemetría.',
  },
  layout: {
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    mainNav: 'Principal',
    loadingPage: 'Cargando página',
    tabs: { overview: 'Resumen', scanner: 'Escanear', tools: 'Herramientas', history: 'Historial', rules: 'Reglas' },
    toolsTitle: 'Herramientas',
  },
  nav: {
    groups: { Audit: 'Auditoría', Toolkit: 'Herramientas', Learn: 'Aprende' },
    items: {
      '/': { label: 'Resumen', description: 'Tu postura de seguridad de un vistazo.' },
      '/scanner': {
        label: 'Escáner de configuración',
        description: 'Audita Dockerfiles, compose, nginx, .env, package.json y más contra más de 75 reglas.',
      },
      '/history': {
        label: 'Historial de escaneos',
        description: 'Cada escaneo se guarda solo. Sigue tu puntuación en el tiempo y compara dos escaneos.',
      },
      '/secrets': {
        label: 'Escáner de secretos',
        description: 'Encuentra claves de API y tokens en cualquier texto y ocúltalos antes de compartir logs.',
      },
      '/jwt': {
        label: 'Inspector JWT',
        description: 'Decodifica tokens, detecta claims inseguros y pruébalos contra secretos de firma débiles.',
      },
      '/headers': {
        label: 'Generador de cabeceras',
        description: 'Diseña cabeceras HTTP de seguridad y expórtalas para Vercel, nginx, Netlify, Apache o Express.',
      },
      '/passwords': {
        label: 'Laboratorio de contraseñas',
        description: 'Estima tiempos de crackeo y genera secretos criptográficamente seguros.',
      },
      '/rules': {
        label: 'Catálogo de reglas',
        description: 'Consulta cada regla de detección con su severidad y su mapeo CWE/OWASP.',
      },
    },
  },
  common: {
    clear: 'Limpiar',
    clearAll: 'Borrar todo',
    close: 'Cerrar',
    loadSample: 'Cargar ejemplo',
    regenerate: 'Regenerar',
    copied: '¡Copiado!',
    copyPatch: 'Copiar parche',
    none: 'Ninguno',
    open: 'Abrir',
    severity: { critical: 'Crítico', medium: 'Medio', low: 'Bajo', varies: 'Variable' },
  },
  footer: {
    rights: 'Todo el análisis se ejecuta localmente en tu navegador.',
    legal: 'Aviso legal',
    privacy: 'Privacidad',
    cookies: 'Cookies',
  },
  cookieBanner: {
    text: 'Aquí no hay cookies de seguimiento: solo almacenamiento local para guardar tus escaneos y preferencias.',
    learnMore: 'Más información',
    accept: 'Aceptar',
  },
  legal: {
    legal: {
      title: 'Aviso legal',
      paragraphs: [
        'LocalAudit es una herramienta de seguridad creada con fines educativos y de portfolio. Realiza análisis estático de ficheros de configuración íntegramente dentro de tu navegador.',
        'Se ofrece "tal cual", sin garantía de ningún tipo. No se garantiza que los hallazgos sean completos o exactos, y no sustituye a una revisión de seguridad profesional.',
      ],
    },
    privacy: {
      title: 'Política de privacidad',
      paragraphs: [
        'Esta aplicación no recoge ni transmite datos personales. No hay backend: cada fichero que arrastras o pegas se analiza localmente en tu navegador y nunca sale de tu dispositivo.',
        'Para que no se pierdan al recargar la página, los ficheros cargados en el escáner, tu historial de escaneos y tus preferencias (idioma y aviso) se guardan en el almacenamiento local de tu navegador, solo en este dispositivo. Los ficheros pueden contener secretos, así que usa "Borrar todo" en el escáner y en el historial cuando termines, sobre todo en un ordenador compartido.',
      ],
    },
    cookies: {
      title: 'Política de cookies',
      paragraphs: [
        'Este sitio no usa cookies de seguimiento, cookies publicitarias ni analítica de terceros de ningún tipo.',
        'Usa el almacenamiento local del navegador (no cookies) con fines estrictamente técnicos: conservar tus ficheros cargados, tu historial de escaneos y tus preferencias. Puedes borrarlo en cualquier momento eliminando los datos del sitio en tu navegador.',
      ],
    },
    owner: 'Titular',
    contact: 'Contacto',
    source: 'Código fuente',
  },
  errorBoundary: {
    title: 'Algo ha fallado',
    body: 'La página no se ha podido cargar. Suele pasar justo después de publicar una versión nueva.',
    reload: 'Recargar página',
  },
  home: {
    badge: '100% en el navegador',
    title: 'Herramientas de seguridad para tus configuraciones, secretos y tokens',
    intro: (rules: number) =>
      `Analiza ficheros de despliegue contra más de ${rules} reglas, busca credenciales filtradas, inspecciona JWT, genera cabeceras HTTP seguras y crea secretos robustos, sin que nada salga de tu navegador.`,
    startScan: 'Empezar un escaneo',
    browseRules: 'Ver las reglas',
    stats: { lastScore: 'Última puntuación', critical: 'Críticos', files: 'Ficheros cargados', saved: 'Escaneos guardados' },
    whatYouCanDo: 'Qué puedes hacer',
    whyTitle: '¿Por qué en el navegador?',
    whyBody:
      'Una herramienta de seguridad que sube tus configuraciones y secretos a un servidor crea justo el riesgo que pretende reducir. Aquí todo se ejecuta en tu navegador con la Web Crypto API: sin backend, sin llamadas de red y sin telemetría. Puedes desconectarte de internet y sigue funcionando.',
  },
  scanner: {
    eyebrow: 'Auditoría',
    title: 'Escáner de configuración',
    description:
      'Arrastra ficheros de configuración para obtener una puntuación de seguridad de 0 a 100, hallazgos mapeados a CWE/OWASP y parches listos para copiar. Los ficheros se analizan en memoria y nunca se suben.',
    filesAnalyzed: (count: number) => `${count} ${plural(count, 'fichero analizado', 'ficheros analizados')}`,
    autoSaved: 'Guardado automático en el historial · se conserva al recargar',
    storageFull: 'Demasiado grande para guardarlo en este navegador: estos ficheros se perderán al recargar.',
    labelPlaceholder: 'Pon nombre a este escaneo, p. ej. “antes de endurecer”',
    labelAria: 'Nombre del escaneo',
    saveCheckpoint: 'Guardar punto de control',
    saved: 'Guardado',
    history: 'Historial',
  },
  dropzone: {
    dropHint: 'Arrastra vercel.json, package.json, Dockerfile, .gitignore, .env, docker-compose.yml o nginx.conf',
    otherFiles: 'Cualquier otro fichero de texto se analiza en busca de secretos filtrados. Nada sale de tu navegador.',
    browse: 'o selecciona ficheros',
    pasteTitle: 'O pega el contenido del fichero',
    pastePlaceholder: 'Pega aquí el contenido del fichero...',
    analyzePasted: 'Analizar contenido pegado',
    tooLarge: (name: string, maxMb: number) => `${name} supera los ${maxMb} MB y se ha omitido.`,
    unreadable: (name: string) => `No se ha podido leer ${name} como texto.`,
  },
  emptyState: {
    title: 'Todavía no has analizado ningún fichero',
    body: 'Arrastra un fichero arriba, pega su contenido o carga uno de los ejemplos de abajo para ver el motor de auditoría en acción.',
    tryExample: 'Prueba un ejemplo, sin subir nada',
    presets: {
      'this-site': { label: 'Esta web', description: 'Nuestro propio vercel.json' },
      vercel: { label: 'vercel.json', description: 'Faltan cabeceras de seguridad' },
      package: { label: 'package.json', description: 'Dependencia vulnerable' },
      dockerfile: { label: 'Dockerfile', description: 'Usuario root, tag sin fijar' },
      gitignore: { label: '.gitignore', description: 'Secretos sin excluir' },
      env: { label: '.env', description: 'Secretos filtrados y débiles' },
      compose: { label: 'docker-compose.yml', description: 'Privilegiado, BD expuesta' },
      nginx: { label: 'nginx.conf', description: 'TLS antiguo, alias traversal' },
      'full-project': { label: 'Proyecto completo', description: 'Los 7 ficheros a la vez' },
    },
  },
  fileCard: {
    genericType: 'Texto genérico · solo búsqueda de secretos',
    parseError: 'No se ha podido analizar el contenido del fichero.',
    findings: (count: number) => `${count} ${plural(count, 'hallazgo', 'hallazgos')}`,
    remove: (name: string) => `Quitar ${name}`,
  },
  score: {
    title: 'Puntuación de seguridad',
    strong: 'Postura sólida',
    attention: 'Necesita atención',
    critical: 'Exposición crítica',
  },
  exportReport: {
    title: 'Exportar informe',
    markdownHint: 'Para compartir en un PR o ticket',
    jsonHint: 'Para usar en otras herramientas',
    sarifHint: 'Para subir a GitHub code scanning',
  },
  findings: {
    empty: 'Todavía no hay hallazgos. Añade un fichero de configuración para empezar.',
    search: 'Buscar hallazgos',
    searchPlaceholder: 'Busca título, fichero, CWE…',
    noMatch: 'Ningún hallazgo coincide con los filtros o la búsqueda.',
  },
  history: {
    eyebrow: 'Auditoría',
    title: 'Historial de escaneos',
    emptyDescription: 'Cada escaneo que hagas aparece aquí automáticamente.',
    emptyBody:
      'Todavía no hay escaneos. Carga ficheros en el escáner: cada escaneo se guarda aquí automáticamente, también al recargar.',
    goToScanner: 'Ir al escáner →',
    description:
      'Cada escaneo se guarda automáticamente. Selecciona dos para ver qué hallazgos se han corregido y cuáles han aparecido. Se guarda solo en este navegador.',
    autoLabel: (files: string[]) =>
      files.length <= 2 ? `Escaneo de ${files.join(', ')}` : `Escaneo de ${files.length} ficheros`,
    files: (count: number) => `${count} ${plural(count, 'fichero', 'ficheros')}`,
    live: 'Actual',
    select: (label: string) => `Seleccionar ${label}`,
    delete: (label: string) => `Borrar ${label}`,
    comparison: 'Comparación',
    points: 'pts',
    fixed: 'Corregidos',
    introduced: 'Nuevos',
    stillOpen: 'Siguen abiertos',
  },
  secrets: {
    eyebrow: 'Herramientas',
    title: 'Escáner y ocultador de secretos',
    description:
      'Pega logs, trazas de error, salida de CI o código fuente. Las credenciales detectadas se resaltan y obtienes una copia ocultada que puedes pegar sin riesgo en un ticket, un chat o un asistente de IA.',
    loadSample: 'Cargar log de ejemplo',
    input: 'Entrada',
    inputHint: (lines: number) => `${lines} ${plural(lines, 'línea', 'líneas')} · analizado localmente`,
    placeholder: 'Pega cualquier texto…',
    inputAria: 'Texto en el que buscar secretos',
    detected: (count: number) =>
      `${count} ${plural(count, 'secreto detectado', 'secretos detectados')}. Rótalos: todo lo que ha llegado a un log debe darse por filtrado.`,
    none: 'No se han detectado patrones de secretos conocidos.',
    mask: 'Ocultar valores',
    reveal: 'Mostrar valores',
    highlighted: 'Entrada resaltada',
    detections: 'Detecciones',
    rotateHint: 'Rota cada credencial',
    line: (line: number) => `línea ${line}`,
    redacted: 'Salida ocultada',
    safeToShare: 'Segura para compartir',
    copyRedacted: 'Copiar ocultado',
  },
  jwt: {
    eyebrow: 'Herramientas',
    title: 'Inspector JWT',
    description:
      'Decodifica un JSON Web Token, revisa su cabecera y sus claims y audítalo en busca de configuraciones inseguras (alg none, sin caducidad, datos sensibles en el payload). Los tokens se decodifican solo en tu navegador.',
    token: 'Token',
    tokenHint: 'Pega un JWT; nunca pegues tokens de producción que no sean tuyos',
    tokenAria: 'JWT a inspeccionar',
    invalid: 'Token no válido.',
    header: 'Cabecera',
    headerHint: 'Algoritmo e id de clave',
    payload: 'Payload',
    payloadHint: 'Claims',
    timeClaims: { iat: 'Emitido', nbf: 'No antes de', exp: 'Caduca' },
    audit: 'Auditoría de seguridad',
    issues: (count: number) => `${count} ${plural(count, 'problema', 'problemas')}`,
    noIssues:
      'No se han encontrado problemas estáticos. Verifica siempre la firma en el servidor contra una clave fijada.',
    signingCheck: 'Comprobación del secreto de firma',
    nonHmacBefore: 'Esta comprobación de firma solo aplica a tokens HMAC (HS256/384/512). Este token usa',
    nonHmacAfter: '; para verificarlo hace falta la clave pública del emisor.',
    signingIntro:
      'Pega tu secreto de firma para confirmar que el token es válido y que el secreto no es uno conocido por defecto. Todo se ejecuta localmente.',
    secretPlaceholder: 'Secreto de firma HMAC',
    verify: 'Verificar firma',
    valid: 'La firma es válida con este secreto.',
    invalidSignature: 'La firma no coincide con este secreto.',
    weakSecret:
      'Es un secreto por defecto muy conocido. Sustitúyelo ya por 32 o más bytes aleatorios: un secreto predecible anula el sentido de firmar.',
  },
  headers: {
    eyebrow: 'Herramientas',
    title: 'Generador de cabeceras de seguridad',
    description:
      'Activa las cabeceras que necesites y copia un fragmento listo para desplegar en tu plataforma. Los valores por defecto siguen el proyecto Secure Headers de OWASP.',
    reset: 'Restablecer',
    transport: 'Transporte',
    maxAge: 'max-age (segundos)',
    enableCsp: 'Activar CSP',
    unset: '(sin definir)',
    framing: 'Marcos y tipos',
    permissionsHint: 'Bloquea funciones del navegador',
    enablePermissions: 'Activar Permissions-Policy',
    permissionsNote: 'Las funciones resaltadas quedan desactivadas para todo el origen.',
    crossOrigin: 'Aislamiento entre orígenes',
    output: 'Resultado',
    headerCount: (count: number) => `${count} ${plural(count, 'cabecera', 'cabeceras')}`,
    copyConfig: 'Copiar configuración',
    enableOne: 'Activa al menos una cabecera.',
  },
  passwords: {
    eyebrow: 'Herramientas',
    title: 'Laboratorio de contraseñas y secretos',
    description:
      'Estima cuánto resiste una contraseña a un ataque offline y genera secretos y frases de contraseña criptográficamente seguros. Todo el cálculo ocurre en tu navegador.',
    checker: 'Comprobador de fortaleza',
    checkerHint: 'Se ejecuta en local: no se envía nada',
    placeholder: 'Escribe o pega una contraseña para probarla',
    aria: 'Contraseña a probar',
    show: 'Mostrar contraseña',
    hide: 'Ocultar contraseña',
    bitsChars: (bits: number, chars: number) => `${bits} bits · ${chars} caracteres`,
    timeToGuess: 'Tiempo estimado para adivinarla (ataque offline)',
    labels: ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'],
    scenarios: {
      online: 'Login online con límite de intentos',
      bcrypt: 'Offline, bcrypt (coste 12)',
      sha256: 'Offline, SHA-256',
      md5: 'Offline, MD5 / NTLM',
    },
    warnings: {
      breached: 'Aparece en listas públicas de filtraciones: se crackea al instante.',
      repeated: 'Contiene caracteres repetidos (p. ej. "aaa").',
      sequence: 'Contiene una secuencia de teclado o del alfabeto (p. ej. "1234", "qwer").',
      year: 'Contiene un año, uno de los favoritos de los ataques basados en reglas.',
      short: 'Tiene menos de 12 caracteres.',
      singleClass: 'Usa un solo tipo de carácter.',
    },
    generator: 'Generador de secretos',
    entropy: (bits: number) => `${bits} bits de entropía`,
    generatorBefore: 'Usa el generador aleatorio criptográfico del navegador (',
    generatorAfter: '). Ideal para secretos JWT, claves de API y claves de sesión.',
    kinds: { base64url: 'Base64url', hex: 'Hex', alphanumeric: 'Alfanumérico', symbols: 'Con símbolos' },
    length: (length: number) => `Longitud: ${length}`,
    copySecret: 'Copiar secreto',
    passphrase: 'Generador de frases de contraseña',
    passphraseBits: (bits: number) => `~${bits} bits`,
    passphraseIntro:
      'Fácil de recordar y robusta: buena para cifrado de disco o la contraseña maestra de un gestor de contraseñas.',
    words: (count: number) => `Palabras: ${count}`,
    separator: (name: string) => `Separador ${name}`,
    space: 'espacio',
    copyPassphrase: 'Copiar frase',
    howTitle: 'Cómo funciona la estimación',
    how1: 'La entropía se estima a partir del conjunto de caracteres y la longitud, y se reduce por los patrones que un atacante prueba primero: palabras de diccionario, secuencias de teclado, repeticiones y años.',
    how2: 'Los tiempos suponen que el atacante ya tiene el hash de la contraseña y usa un equipo moderno con una GPU. Un hash lento como bcrypt da muchísimo tiempo; uno rápido como MD5 casi nada.',
    how3: 'Las cifras son orientativas (orden de magnitud), no una garantía. Ante la duda, añade longitud.',
  },
  rules: {
    eyebrow: 'Aprende',
    title: 'Catálogo de reglas',
    description: (count: number) =>
      `Todas las reglas de detección del escáner (${count} en total) con su severidad y su mapeo CWE/OWASP. Úsalo para entender qué significa cada hallazgo y como checklist.`,
    all: 'Todas',
    anyFile: 'Cualquier fichero',
    search: 'Buscar reglas',
    searchPlaceholder: 'Busca título, id, CWE…',
    noMatch: 'Ninguna regla coincide con los filtros.',
    englishNote:
      'Los títulos de las reglas y el detalle de los hallazgos están en inglés, el idioma de referencia de CWE y OWASP.',
  },
};
