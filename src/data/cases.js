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
    // Validado con el autor (2026-10-09).
    draft: false,
    tldr: {
      problem: "Tener un sitio decente y poder mantenerlo sigue siendo caro o técnico para un negocio chico.",
      role: "Producto, diseño, frontend, backend e infraestructura. Solo.",
      outcome: "Más de 80 sitios generados, y una API que Wink ya usa para hospedar los sitios de sus clientes.",
    },
    context:
      "Hace años que construyo sitios para clientes, y siempre empezaba igual. RapiSites nació como un generador para mí; después lo convertí en producto para que cualquier negocio pudiera armar su sitio sin mucho rollo y mantenerlo cómodo, sin depender de alguien técnico.",
    problem:
      "Los constructores conocidos ponen al usuario frente a una plantilla en blanco y cientos de decisiones. El reto era invertir eso: que la persona aporte lo único que solo ella sabe y que todo lo demás —estructura, textos, SEO— venga resuelto, sin quitarle el control después.",
    decisions: [
      {
        title: "Las cuatro preguntas que siempre hacía",
        body: "En cada proyecto con clientes arrancaba con lo mismo: cómo se llama el negocio, a qué se dedica, cómo contactarlo y qué estilo le gusta. Esas cuatro preguntas son todo el onboarding. Lo demás lo genera la IA (API de Claude): páginas, textos, paleta y metadatos SEO, en menos de treinta segundos.",
        media: { type: "orbs", caption: "Demo ilustrativa de los estados de generación (componente thinking-orbs)." },
      },
      {
        title: "Menos efecto, más mensaje",
        body: "Las primeras versiones tenían mucho diseño y mucha animación. Se veían bien, pero no era la base: un sitio tiene que transmitir la idea con solo verlo, sin explicar mucho. Recorté hasta que cada sección se entendiera de un vistazo, y eso también hizo los sitios más livianos.",
      },
      {
        title: "Generar no es publicar",
        body: "Lo generado nunca sale directo a internet. La publicación es atómica: pasa por una auditoría SEO, se congela un snapshot y queda en un historial con rollback en un click. Así la persona puede experimentar sin miedo a romper su sitio en vivo.",
      },
      {
        title: "Editar sin aprender una herramienta",
        body: "El editor visual trabaja sobre secciones, no sobre píxeles: se reordenan con drag & drop, todo se guarda solo y hay undo/redo. Menos libertad que un lienzo en blanco, pero imposible de dejar ‘roto’: mantener el sitio tiene que ser cómodo.",
      },
      {
        title: "Una API para que otras plataformas construyan encima",
        body: "RapiSites expone una API para que otras plataformas generen y publiquen sitios desde su propio producto. Wink ya la usa: sus clientes suben su sitio para mostrarlo en pantalla, y antes de desplegarlo Wink lo envía a RapiSites para que lo hospede.",
      },
    ],
    outcome: [
      { value: "+80", label: "sitios generados en RapiSites" },
      { value: "API", label: "en uso por Wink para hospedar los sitios de sus clientes" },
      { value: "< 30 s", label: "para generar un sitio completo, con 33 secciones sin JS" },
    ],
    learnings:
      "Diseñar el flujo antes que la interfaz me obligó a decidir qué no preguntar, y qué no animar. Cada pregunta que saqué del onboarding se convirtió en una decisión que el sistema toma bien por defecto y que el usuario puede cambiar después.",
  },

  "wink-app": {
    // Validado con el autor (2026-10-09).
    draft: false,
    tldr: {
      problem: "Subir contenido, saber qué se está mostrando y si cada pantalla funciona, en cientos de pantallas a la vez.",
      role: "Head of Development: UX del panel, arquitectura, frontend y seguridad.",
      outcome: "+500 implementaciones, más de 20 clientes y el 99 % de las pantallas en línea.",
    },
    context:
      "Wink es una plataforma de digital signage: pantallas en bancos, farmacias, restaurantes y centros comerciales que muestran contenido programado. Wink App es el panel desde donde se administra todo, y lo usamos todos: el equipo de Wink, las agencias y los propios clientes.",
    problem:
      "Los dolores eran siempre los mismos: subir y actualizar contenido, saber qué se estaba desplegando en cada pantalla y saber si las pantallas estaban funcionando. Con perfiles tan distintos usando el mismo panel —y cada agencia viendo solo lo suyo— no alcanzaba con que funcionara: tenía que ser fácil.",
    decisions: [
      {
        title: "Un panel que crece desde los puntos de dolor",
        body: "No partí de una lista de funciones: el panel se fue armando a medida que reconocía los dolores de quienes lo usan. Para cada pantalla pensé dos veces: como usuario, que tiene que ser fácil, y como técnico, qué información necesito administrar. El inicio resume el día a día en tres acciones: cargar archivos, crear playlists y calendarizarlas.",
        media: { type: "image", src: "/img/projects/wink-app/cover.webp", caption: "Inicio de Wink App." },
      },
      {
        title: "Monitorear una pantalla: el flujo que más cambió",
        body: "Es la parte que rediseñé más veces, y cada versión respondió a una pregunta nueva que traían los usuarios. Ya no alcanza con saber si una pantalla está prendida: hoy el panel permite diagnosticar un problema sin ir al local.",
        media: {
          type: "steps",
          caption: "Cómo evolucionó el monitoreo de pantallas en Wink App.",
          steps: [
            { title: "¿Está en línea?", body: "Al principio solo veíamos si la pantalla estaba conectada." },
            { title: "¿Qué está mostrando?", body: "Después, ver en tiempo real lo que la pantalla estaba reproduciendo." },
            { title: "¿El equipo está sano?", body: "Luego, ver por dentro si el dispositivo funcionaba como debía." },
            { title: "¿La red la deja hablar?", body: "Y ahora, detectar si la red bloquea algún puerto que el dispositivo necesita para comunicarse con los servidores de Wink." },
          ],
        },
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
      { value: "+500", label: "implementaciones en 3 países", source: { label: "winkdigital.io", href: "https://winkdigital.io" } },
      { value: "99 %", label: "de las pantallas en línea" },
      { value: "+20", label: "clientes usando la plataforma" },
    ],
    learnings:
      "Un panel interno también es un producto. Escuchar los dolores de quienes lo usan todos los días —incluido yo— me enseñó más que cualquier lista de requisitos, y el monitoreo es la prueba: cada versión existió porque alguien necesitaba responder una pregunta nueva.",
  },

  "wink-site": {
    // Validado con el autor (2026-10-09).
    draft: false,
    tldr: {
      problem: "Explicar un producto técnico (pantallas + software + hardware) a quien solo quiere vender más.",
      role: "Diseño y desarrollo completo del sitio, analítica y despliegue.",
      outcome: "El scrollytelling se volvió herramienta de ventas: en las demos reemplaza a las diapositivas.",
    },
    context:
      "winkdigital.io es la puerta comercial de Wink. Lo visitan dueños de negocios, gerentes de marketing y equipos de TI de empresas como bancos y cadenas de farmacias, cada uno con una pregunta distinta.",
    problem:
      "El digital signage es difícil de imaginar: involucra una pantalla, un dispositivo, una app y un servicio. Había que hacerlo tangible en segundos, responder ‘¿cuánto cuesta?’ sin esconderlo, y saber qué partes del sitio realmente llevaban a pedir una demo.",
    decisions: [
      {
        title: "De animar todo a contar una historia",
        body: "La primera versión tenía animación en cada componente: muy bonita, pero poco informativa. La rehice alrededor de una sola idea: un scrollytelling en CSS 3D que acompaña al usuario mientras baja y le muestra, paso a paso, cómo funciona Wink. La pantalla se enciende, se diagnostica, se vincula con un código y queda lista para manejarse desde el panel. Es la decisión de diseño de la que más orgulloso estoy.",
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
        body: "Desde el primer día los precios están publicados: tres planes con precio (desde US$12 al mes) y Enterprise a medida, con tabla comparativa. Mostrar el precio filtra mejor que un ‘contáctanos’ y deja las demos para quien ya está interesado.",
        media: { type: "image", src: "/img/projects/wink-site/02.webp", caption: "Planes y precios publicados en winkdigital.io/pricing." },
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
    learnings:
      "Después del lanzamiento cambió cómo nos perciben: el recorrido deja claro que no es ‘cualquier producto’. Y en las demos es más fácil mostrar el scrollytelling que una diapositiva; los clientes quedan impresionados. Animar menos cosas, pero con un propósito, comunicó mucho más.",
  },

  swiftflow: {
    // Validado con el autor (2026-10-09).
    draft: false,
    tldr: {
      problem: "El test de mecanografía que usaba se llenó de anuncios, y además solo medía: no decía qué mejorar.",
      role: "Proyecto personal: diseño, desarrollo y tests.",
      outcome: "Más de 50 personas lo usan: PWA sin anuncios, sin cuenta y 100 % usable con teclado.",
    },
    context:
      "Usaba una plataforma de mecanografía que me gustaba: no tenía muchas cosas, pero medía bien. Cuando empezó a mostrar anuncios dejó de gustarme, así que hice la mía, libre de anuncios. Hoy es mi proyecto hobby y lo sigo mejorando.",
    problem:
      "Saber que escribís a 58 palabras por minuto no te ayuda a escribir a 70. Lo útil es saber qué teclas, dedos y combinaciones te frenan y, sobre todo, cómo practicar justo eso.",
    decisions: [
      {
        title: "Del error a cómo corregirlo",
        body: "Lo que más tuve que rehacer fue cómo mostrar los errores. Señalar en qué fallaste no alcanza: cada pulsación se analiza para armar un mapa por tecla, dedo y combinación, y el resultado viene con consejos y práctica generada alrededor de esos puntos débiles.",
      },
      {
        title: "Nada de mouse",
        body: "Si para empezar otra prueba tenés que agarrar el mouse, tus dedos salen de su lugar y perdés el ritmo. Por eso toda la interfaz se maneja con teclado, y la accesibilidad se verifica con axe en los tests end-to-end.",
      },
      {
        title: "Sin anuncios, sin cuenta, sin servidor",
        body: "Lo que me hizo dejar la otra plataforma fueron los anuncios. SwiftFlow no tiene, no pide cuenta y los datos viven en el navegador; se instala como PWA y funciona offline. Cero fricción para empezar y cero datos personales en un servidor.",
      },
    ],
    outcome: [
      { value: "+50", label: "personas lo usan" },
      { value: "13", label: "modos de práctica y 24 lecciones" },
      { value: "100 %", label: "usable con teclado, sin anuncios" },
    ],
    learnings:
      "Diseñar para mí mismo fue la mejor investigación: cada decisión salió de algo que me molestaba como usuario, desde los anuncios hasta tener que soltar el teclado.",
  },
};
