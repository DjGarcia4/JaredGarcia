// Casos de estudio, por id de proyecto (ver projects.js).
//
// ⚠️ BORRADOR (draft: true): el qué está tomado de los productos y de las
// descripciones de projects.js; el por qué de cada decisión está redactado
// a partir de lo que se ve en el producto y hay que validarlo. No hay
// métricas inventadas: `outcome` solo usa datos verificables, con su fuente.
//
// Schema:
//   draft        boolean — pendiente de revisión del autor
//   tldr         { problem, role, outcome } — 3 líneas para quien tiene 5 min
//   context      párrafo: dónde y para quién
//   problem      párrafo: qué había que resolver
//   decisions[]  { title, body, media? } — media: { type: "video"|"image"|
//                "orbs"|"signage", src?, poster?, caption, href? }
//   outcome[]    { value, label, source? } — solo datos verificables
//   learnings    párrafo opcional

export const cases = {
  rapisites: {
    draft: true,
    tldr: {
      problem: "Tener un sitio decente sigue siendo caro o técnico para un negocio chico.",
      role: "Producto, diseño, frontend, backend e infraestructura. Solo.",
      outcome: "En producción en rapisites.com, con publicación en dominio propio y HTTPS automático.",
    },
    context:
      "RapiSites es mi proyecto principal: un constructor de sitios multi-tenant pensado para negocios que no tienen tiempo ni presupuesto para una agencia, y que tampoco quieren pelearse con un editor lleno de opciones.",
    problem:
      "Los constructores conocidos ponen al usuario frente a una plantilla en blanco y cientos de decisiones. El reto era invertir eso: que la persona aporte lo único que solo ella sabe (qué hace su negocio y cómo contactarla) y que todo lo demás —estructura, textos, SEO— venga resuelto, sin quitarle el control después.",
    decisions: [
      {
        title: "Cuatro preguntas, no un formulario",
        body: "El onboarding se redujo a nombre, a qué se dedica, cómo contactar y un estilo visual. Todo lo que se puede inferir de esas respuestas lo genera la IA (API de Claude): páginas, textos, paleta y metadatos SEO, en menos de treinta segundos.",
        media: { type: "orbs", caption: "Demo ilustrativa de los estados de generación (componente thinking-orbs)." },
      },
      {
        title: "Generar no es publicar",
        body: "Lo generado nunca sale directo a internet. La publicación es atómica: pasa por una auditoría SEO, se congela un snapshot y queda en un historial con rollback en un click. Así la persona puede experimentar sin miedo a romper su sitio en vivo.",
      },
      {
        title: "Editar sin aprender una herramienta",
        body: "El editor visual trabaja sobre secciones, no sobre píxeles: se reordenan con drag & drop, todo se guarda solo y hay undo/redo. Menos libertad que un lienzo en blanco, pero imposible de dejar ‘roto’.",
      },
      {
        title: "El rendimiento también es SEO",
        body: "Las 33 secciones del catálogo se renderizan sin JavaScript en el sitio público (Nuxt con SSR). Para un negocio chico, cargar rápido en un celular con mala señal es parte de la experiencia, no un detalle técnico.",
      },
    ],
    outcome: [
      { value: "33", label: "secciones sin JS en el sitio público" },
      { value: "< 30 s", label: "para generar un sitio completo" },
      { value: "ES · EN", label: "sitios bilingües" },
    ],
    learnings:
      "Diseñar el flujo antes que la interfaz me obligó a decidir qué no preguntar. Cada pregunta que saqué del onboarding se convirtió en una decisión que el sistema toma bien por defecto y que el usuario puede cambiar después.",
  },

  "wink-app": {
    draft: true,
    tldr: {
      problem: "Agencias que manejan pantallas de muchos clientes necesitan control total sin mezclar datos.",
      role: "Head of Development: arquitectura, frontend y seguridad.",
      outcome: "Panel en producción de una plataforma con más de 500 implementaciones en 3 países.",
    },
    context:
      "Wink es una plataforma de digital signage: pantallas en bancos, farmacias, restaurantes y centros comerciales que muestran contenido programado. Wink App es el panel desde donde se administra todo, y lo usan tanto el equipo de Wink como las agencias que revenden el servicio.",
    problem:
      "El mismo panel tiene que servir a perfiles muy distintos —quien sube una imagen, quien arma la programación de una cadena entera, quien administra clientes— y cada agencia tiene que ver solo lo suyo. Además, una pantalla mal programada se nota en público: el margen de error es chico.",
    decisions: [
      {
        title: "Tres verbos en la portada",
        body: "La pantalla de inicio reduce el producto a lo que se hace todos los días: registrar una pantalla, cargar archivos, crear playlists y calendarizarlas. Lo avanzado está a un paso, no en la cara.",
        media: { type: "image", src: "/img/projects/wink-app/cover.webp", caption: "Inicio de Wink App." },
      },
      {
        title: "Programar por pantalla, zona y grupo",
        body: "Las playlists se asignan a una pantalla, a una zona o a un grupo, con horarios. Así una cadena cambia el contenido de todas sus sucursales de una vez, sin perder la posibilidad de excepciones por local.",
        media: {
          type: "signage",
          caption: "Demo interactiva: elegí un contenido o dejá correr la playlist. Contenidos y marcas ficticios; escena en three.js.",
        },
      },
      {
        title: "Aislamiento y permisos como parte del diseño",
        body: "Cada agencia ve solo sus datos, con roles (RBAC) y autenticación multifactor (TOTP). No es solo un requisito técnico: define qué menús existen para cada persona y evita errores caros.",
      },
    ],
    outcome: [
      { value: "+500", label: "implementaciones de Wink en 3 países", source: { label: "winkdigital.io", href: "https://winkdigital.io" } },
      { value: "MFA + RBAC", label: "en un panel multi-agencia" },
      { value: "Tiempo real", label: "sincronización con Firebase" },
    ],
  },

  "wink-site": {
    draft: true,
    tldr: {
      problem: "Explicar un producto técnico (pantallas + software + hardware) a quien solo quiere vender más.",
      role: "Diseño y desarrollo completo del sitio, analítica y despliegue.",
      outcome: "Sitio comercial en producción en winkdigital.io, con el embudo medido en GA4.",
    },
    context:
      "winkdigital.io es la puerta comercial de Wink. Lo visitan dueños de negocios, gerentes de marketing y equipos de TI de empresas como bancos y cadenas de farmacias, cada uno con una pregunta distinta.",
    problem:
      "El digital signage es difícil de imaginar: involucra una pantalla, un dispositivo, una app y un servicio. Había que hacerlo tangible en segundos, responder ‘¿cuánto cuesta?’ sin esconderlo, y saber qué partes del sitio realmente llevaban a pedir una demo.",
    decisions: [
      {
        title: "Mostrar el producto funcionando, no describirlo",
        body: "La página ‘Cómo funciona’ cuenta la vida de una pantalla Wink de principio a fin con un scrollytelling en CSS 3D: se enciende, se diagnostica, se vincula con un código y queda lista para manejarse desde el panel.",
        media: {
          type: "video",
          src: "/media/wink-como-funciona",
          poster: "/media/wink-como-funciona-poster.webp",
          caption: "Recorrido de winkdigital.io/como-funciona (grabación).",
          href: "https://winkdigital.io/como-funciona",
        },
      },
      {
        title: "Precios a la vista",
        body: "Tres planes con precio publicado (desde US$12 al mes) y Enterprise a medida, con tabla comparativa. Mostrar el precio filtra mejor que un ‘contáctanos’ y deja las demos para quien ya está interesado.",
      },
      {
        title: "Medir cada paso del embudo",
        body: "Un plan de tracking propio con GA4 + Google Tag Manager registra envíos de formulario, clics en ‘Agenda una demo’, expansión de planes y propiedades para distinguir prospectos B2B de individuales.",
      },
    ],
    outcome: [
      { value: "11", label: "secciones orientadas a conversión" },
      { value: "4 planes", label: "con tabla comparativa y precios públicos", source: { label: "winkdigital.io/pricing", href: "https://winkdigital.io/pricing" } },
      { value: "GA4", label: "con eventos propios en todo el embudo" },
    ],
  },

  swiftflow: {
    draft: true,
    tldr: {
      problem: "Los test de mecanografía te dan un número, pero no te dicen qué mejorar.",
      role: "Proyecto personal: diseño, desarrollo y tests.",
      outcome: "PWA en producción, usable 100 % con teclado y chequeada con axe.",
    },
    context:
      "SwiftFlow es mi proyecto hobby: un test de mecanografía en español e inglés que sigo mejorando.",
    problem:
      "Saber que escribís a 58 palabras por minuto no te ayuda a escribir a 70. Lo útil es saber qué teclas, dedos y combinaciones te frenan, y practicar justo eso.",
    decisions: [
      {
        title: "Del número al diagnóstico",
        body: "Cada pulsación se analiza para armar un mapa de errores por tecla, dedo y combinación, con consejos concretos y práctica generada alrededor de los puntos débiles.",
      },
      {
        title: "Teclado primero",
        body: "Una herramienta para escribir tiene que poder usarse sin mouse: toda la interfaz se maneja con teclado, y la accesibilidad se verifica con axe en los tests end-to-end.",
      },
      {
        title: "Sin cuenta, sin servidor",
        body: "Los datos viven en el navegador y la app se instala como PWA offline. Cero fricción para empezar y cero datos personales en un servidor.",
      },
    ],
    outcome: [
      { value: "13", label: "modos de práctica" },
      { value: "24", label: "lecciones para escribir sin mirar" },
      { value: "100 %", label: "usable con teclado" },
    ],
  },
};
