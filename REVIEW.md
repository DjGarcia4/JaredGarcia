# Review del portafolio: la mirada de quien contrata UI/UX

> Revisado el 2026-10-09 sobre el código del repo (`main` @ `fe6ece3`) y sobre el sitio corriendo en `localhost:5173`.
>
> **Cómo se revisó:**
> 1. **Capturas con Chrome headless (Playwright)** contra tu servidor local, en **1440×900** y **375×812**, recorriendo cada página.
> 2. **Segunda pasada en tu Chrome real** (con la extensión conectada) para probar interacciones: lightbox con teclado, menú mobile, validación del formulario (sin enviarlo), navegación entre rutas y links con ancla.
> 3. **`vite build` en una carpeta temporal** (fuera del repo) para medir el bundle real y comparar el comportamiento de dev con el de producción.
> 4. **Chequeo con `curl` de los 27 links en vivo y de repos, más el CV:** todos responden 200.
>
> **Lo que NO pude verificar:** no lo probé en un dispositivo físico, no corrí Lighthouse, no envié el formulario de EmailJS y no lo probé con lector de pantalla (VoiceOver / NVDA). La accesibilidad la evalué por DOM y teclado.

---

## 1. Veredicto

**Para un puesto de UI/UX Designer, hoy no pasarías el filtro.** El sitio se lee como el portafolio de un **frontend developer semi-senior con buen ojo visual**, no como el de un diseñador: no hay ni un solo caso con problema, research, decisiones o iteraciones, y la palabra "Designer" aparece literalmente al 45 % de opacidad. Con lo que hay ahora te leerían para **Frontend / Design Engineer (mid)**, y para UI/UX como **junior**, a pesar de que tenés productos reales en producción. Ese es justamente el desperdicio: tenés material de sobra (RapiSites, Wink, HMC) para armar casos de nivel mid, pero lo estás contando como fichas técnicas.

---

## 2. Lo que funciona

1. **Sistema visual coherente y con oficio.** La paleta slate + verde, el par Space Grotesk / Inter / Space Mono, el grid de fondo y los eyebrows en mono se sostienen en todas las páginas. Se nota criterio, no una plantilla.
2. **Productos reales y vivos.** RapiSites (SaaS con IA en producción), Wink App / Wink Site (empresa real, rol de Head of Development) y SwiftFlow (PWA con tests y axe) valen más que cualquier concepto de Dribbble. Los links en vivo suman credibilidad.
3. **La plantilla del detalle de proyecto ya tiene buena estructura** (`src/views/ProjectDetailView.vue`): sidebar con meta, cover, galería con lightbox, vista móvil y prev/next. El contenedor está bien; lo que falla es el contenido.
4. **Respeta `prefers-reduced-motion`.** Lo verifiqué: con reduce el hero carga completo y estático. Hay muchos portafolios con GSAP que no lo hacen.
5. **Contacto con poca fricción:** email copiable, WhatsApp con mensaje precargado y QR, formulario con labels reales y toasts de feedback.

---

## 3. Puntos clave a mejorar

### 🔴 ALTO

#### A1. Ningún proyecto muestra proceso de diseño, aunque todos dicen "Caso completo"
- **Qué está mal:** todos los detalles tienen la misma estructura: resumen → cover → un párrafo largo "Sobre el proyecto" → stack técnico → funcionalidades → pantallas → tags. No hay problema, usuario, research, alternativas, wireframes, decisiones, iteraciones ni resultado. Lo que hay es una ficha de producto escrita por un dev (por ejemplo, la descripción de RapiSites habla de Caddy, pg-boss y Drizzle, pero no dice ni una palabra sobre por qué el wizard tiene 4 preguntas y no 10).
- **Dónde:** `src/views/ProjectDetailView.vue:173` (el eyebrow `· Caso completo` se aplica a todos, incluso a TaskSphere, que ni siquiera tiene imagen), `:292` y `:357`. El contenido está en `src/data/projects.js` (los campos `description` y `features`).
- **Por qué importa:** es **lo único** que un lead de diseño evalúa en serio. Sin proceso no puede juzgar cómo pensás, y "Caso completo" sobre una ficha técnica se percibe como un intento de inflar.
- **Fix:** convertí 3 proyectos (RapiSites, Wink App y HMC) en casos reales con esta estructura: **Contexto y rol → Problema (con evidencia) → Usuarios / research → Restricciones → Exploración (wireframes, 2-3 alternativas descartadas y por qué) → Solución (UI final anotada) → Resultado (métricas o feedback) → Qué haría distinto.** Extendé el schema de `projects.js` con `problem`, `research[]`, `decisions[]`, `iterations[]`, `outcome` y `learnings`, y renderizá esas secciones antes del stack. Llevá el stack técnico al final, en un bloque colapsable.

#### A2. El posicionamiento dice "UX/UI Designer", pero todo el sitio grita "developer"
- **Qué está mal:**
  - En el hero, "& UX/UI Designer" va en `text-white/45`, como si fuera algo secundario (`src/components/common/Hero.vue:75`).
  - La sección "Tecnologías que domino" pone **Vite** como #01, con Vue y JS después. Figma aparece perdido entre 22 íconos, al lado de Axios y Balena.
  - En "Lo que ofrezco", **UI/UX es el servicio 5 de 6** (`src/components/Services/Services.vue:249`), después de "Aplicaciones Móviles" con React Native (`:210`), y no hay ni un solo proyecto móvil que lo respalde.
  - Los certificados son 7 de Udemy (5 de desarrollo) más uno de Anthropic.
  - El "número" del hero es "20+ tecnologías · vite · vue principales".
- **Por qué importa:** en 10 segundos quien contrata decide en qué pila te pone. Hoy te pone en la de devs, y la etiqueta UX/UI parece un agregado oportunista.
- **Fix:** elegí **una** narrativa y comprometete con ella. La que mejor te calza: **"Product Designer que también construye"** o **"Design Engineer"**. Esa doble habilidad es escasa en Honduras y en Latam, y es un diferencial, no un problema. Reescribí el hero en función de eso (ver Quick wins), sacá "Aplicaciones Móviles" de servicios hasta tener un proyecto móvil, poné UI/UX como servicio #1 y reemplazá la grilla de 22 logos por 3 columnas: **Diseño** (Figma, prototipado, research, design systems), **Frontend** y **Herramientas**.

#### A3. Un reclutador tarda casi 4 pantallas en llegar a un proyecto
- **Qué está mal:** en la primera visita hay un splash de unos 2.5 s. Después, el hero tiene **3 "actos" de `min-h-[92vh]` cada uno** (nombre, manifesto y números). Medido en el DOM, el primer link a un proyecto está en **y ≈ 3426 px en desktop** (unas 3.8 pantallas) y en **y ≈ 3257 px en mobile** (unas 4 pantallas). En `/projects` en mobile, el buscador y los **30 filtros** (15 categorías + 15 techs) se apilan **antes** de las cards, así que el primer proyecto aparece recién en y ≈ 2064 px.
- **El splash también aparece en los deep links.** Lo verifiqué en Chrome abriendo `/project/rapisites` en una pestaña nueva: el splash tapa el caso. O sea, el reclutador que hace click en el link de un caso desde tu CV o tu LinkedIn también tiene que esperar la intro.
- **Dónde:** `src/components/common/Hero.vue` (los tres bloques `act1Ref`, `act2Ref` y `act3Ref`), `src/views/Splash.vue` (y `App.vue`, donde `showSplash` solo mira `sessionStorage` y no la ruta) y `src/components/Projects.vue:4-129` (el `<aside>` de filtros).
- **Por qué importa:** con 5 minutos por candidato, cada scroll sin trabajo es un punto en contra. Además, el manifesto ("interfaces que cuentan una historia") es una frase que podría estar en cualquier portafolio.
- **Fix:** comprimí el hero a **una sola pantalla** (nombre, propuesta de valor concreta y CTA "Ver casos") y mostrá el primer caso destacado asomando por debajo del fold. Eliminá el splash o dejalo en menos de 800 ms. En mobile, colapsá los filtros de `/projects` detrás de un botón "Filtrar" (un bottom sheet) y mostrá las cards primero.

#### A4. Hay mucho relleno inflado: 13 de 18 proyectos son ejercicios sin imagen, y todos dicen "Producción"
- **Qué está mal:** TaskSphere, Patient Management, GuitarLA, Calorie Tracker, Tips Calculator, Weather, Cocktail, Crypto, etc. tienen `images: { cover: "" }`, así que en el catálogo se ven como cards con el título cortado sobre un fondo vacío ("TIENT MANAGEME…") y en el detalle muestran un placeholder "Visual preview" (`ProjectDetailView.vue:274`). Los 18 llevan `status: "Producción"`, y el hero presume "18 proyectos · 18 en producción". Varios coinciden con los proyectos de los cursos de Udemy que vos mismo listás en certificados (por ejemplo, el "cotizador de criptomonedas"), y un reviewer que hizo esos cursos los reconoce al instante. Además, "15 categorías" para 18 proyectos convierte el filtro de categoría en una lista de 1 ítem por opción.
- **Dónde:** `src/data/projects.js` (de `tasksphere` en adelante), las stats de `src/components/common/Hero.vue` y `src/views/ProjectsView.vue`.
- **Por qué importa:** la calidad de un portafolio se juzga por su **peor** pieza visible. Además, mostrar ejercicios de curso como proyectos en producción le resta credibilidad a los productos que sí son reales.
- **Fix:** dejá **5-6 proyectos** (los 5 con imágenes más uno nuevo de diseño). Mové el resto a un link "Archivo / práctica" en GitHub o a una lista de texto plano al pie de `/projects`, sin cards. Cambiá el status de esos proyectos a "Práctica" o "Archivado". Reemplazá las stats del hero por algo que importe: "3 productos en producción · X usuarios · Head of Development en Wink".

#### A5. No hay una persona detrás: sin bio, sin foto y sin métricas
- **Qué está mal:** `profile.bio` está definida en `src/data/profile.js` pero **no se usa en ningún lado**. "Sobre mí" (`src/components/AboutValues.vue:57`) son 4 valores genéricos ("Trabajo en equipo", "Ganas de crecer", "Compromiso con la calidad") que podrían ser de cualquiera. No hay foto, formación, años reales de experiencia ni cómo trabajás. Y no hay **ni una métrica** de impacto en todo el sitio: ni conversiones de Wink Site (y tenés GA4 configurado según tu propia descripción), ni sitios publicados en RapiSites, ni usuarios de SwiftFlow.
- **Por qué importa:** quien contrata quiere saber con quién va a trabajar y qué movió en un negocio. "Ganas de crecer" es una señal de junior.
- **Fix:** armá una sección "Sobre mí" de verdad, con foto, 3-4 líneas de historia (ingeniero en CC → dev → Head of Dev → diseño de producto), **tu proceso en 4 pasos** con un artefacto real en cada uno y 2-3 números verificables. Sacá los 4 valores genéricos.

### 🟠 MEDIO

#### M1. Las covers de los destacados en la home están recortadas y lavadas
- Las cards apiladas del home (`src/components/StackedProjects.vue`) recortan el screenshot y le aplican un degradado, así que en desktop se leen fragmentos como "io web, / cado en / tos." sobre blanco quemado. En mobile, la imagen queda abajo, cortada por la card siguiente.
- **Fix:** usá covers diseñadas para la card (un mockup en dispositivo o una composición con 1-2 pantallas a escala legible sobre un fondo del color de marca de cada proyecto), en lugar de screenshots crudos con fade.

#### M2. Hay datos contradictorios y un placeholder publicado
- El hero dice "Honduras · **since 2021**" (`Hero.vue:84`), las stats calculan "3+ años · **desde 2023**" (porque toman el año mínimo de los proyectos) y `/projects` muestra "**2021 → 2026**" (`ProjectsView.vue:88`, hardcodeado). Un reviewer atento lo nota y se pregunta qué otros datos están mal.
- El ícono de Instagram en Contacto apunta a `https://instagram.com/tu_usuario` (`src/data/profile.js:25`, renderizado en `src/components/FormContact.vue:69`).
- "HONDURAS" aparece dos veces en el mismo hero (en la edition strip y en la línea de ubicación).
- **Fix:** definí una sola fuente (`profile.careerStart`), borrá o completá Instagram y quitá la ubicación duplicada.

#### M3. El microcopy mezcla registros y no tiene una voz definida
- La UI está en español, pero los labels del catálogo están en pseudo-código inglés: `type_here...` (`Projects.vue:21`), `pieces` / `matches` (`:141`, `:339`), `★ flagship` (`:162`), `view_project` (`:320`), `reset_filters`, `/ TECH_STACK`, `edition_01`, `since 2021`.
- Mezclás voseo y tuteo: el sitio usa "Filtrá", "Tenés", "Contame", pero el resumen de RapiSites dice "**respondes** 4 preguntas".
- Los botones dicen "Contactame", "Hablemos" y "Hablemos sobre esto" según la pantalla.
- **Por qué importa:** el UX writing es parte del trabajo de un diseñador de UI/UX, y la inconsistencia de voz se lee como falta de criterio de contenido.
- **Fix:** escribí una mini guía de voz (voseo, español, sin jerga de código en la UI) y pasá todo el copy por ella. El estilo "terminal" puede quedar en lo decorativo (los eyebrows), pero no en labels accionables.

#### M4. Accesibilidad: el contraste bajo es sistémico y hay interacciones solo con mouse
- **Contraste:** hay unos 90 usos de `text-white/20…/45` sobre `#0F172A`, casi siempre en labels de 10-11 px en mono y mayúsculas. Calculado: `/45` da 4.48:1 (justo por debajo de AA), `/40` da 3.8:1, `/35` da 3.2:1 y `/30` da 2.7:1. Para texto de ese tamaño, AA pide 4.5:1.
- **Galería solo con mouse:** las pantallas del detalle son `<figure @click>` con `tabIndex = -1` y sin `role` (`ProjectDetailView.vue:413-416`). No se puede abrir el lightbox con el teclado.
- **Lightbox sin manejo de foco** (probado en Chrome): al abrirlo, el foco se queda en `<body>`. Con Tab, el foco se va **detrás** del overlay (después de 6 Tabs estaba en el link de LinkedIn de la página), y el `role="dialog"` no tiene `aria-label` ni `aria-labelledby`. Escape sí lo cierra.
- **La nav del header son `<button>`, no links** (`Header.vue:35-39`, vía `Link.vue`). No tienen `href`, así que no se puede hacer Cmd/Ctrl+click para abrir "Proyectos" en otra pestaña, que es justo lo que hace un reclutador que revisa varios candidatos a la vez. Además, un lector de pantalla los anuncia como botones.
- **Formulario solo con la validación nativa del navegador:** al enviarlo vacío aparece la burbuja de Chrome **en inglés** ("Please fill out this field") sobre un sitio en español, sin estado de error diseñado. Los inputs no tienen `autocomplete` (`name`, `email`). Para un candidato a UI/UX, los estados de error de su propio formulario son algo que un lead de diseño revisa.
- **Carrusel de certificados duplicado:** el carrusel clona los slides, así que el árbol de headings tiene **cada certificado 3 veces** (lo vi en el outline de H3). Un lector de pantalla lee 21 headings en lugar de 7.
- **Falta skip link,** y el foco en la nav es el outline por defecto de 1 px (se ve, pero apenas).
- **Botones flotantes que tapan contenido:** el botón flotante "Contactame" (`App.vue:62`, `fixed bottom-6 left-6`) **tapa la lista de categorías** de `/projects` en desktop y, en mobile, **tapa el campo de búsqueda** apenas cargás la página (lo confirmé en Chrome). El botón de "volver arriba" pisa contenido en mobile.
- **Menú mobile:** funciona bien (abre, Escape lo cierra y `aria-expanded` se actualiza), pero el `aria-label` sigue diciendo "Abrir menú" cuando ya está abierto.
- **Por qué importa:** para un candidato a UI/UX, la accesibilidad es un filtro técnico explícito en muchos procesos. Si un reviewer encuentra fallas de contraste en tu propio sitio, es difícil defender que diseñás accesible.
- **Fix:**
  - Subí el mínimo a `/55` para texto informativo (6:1).
  - Cambiá las figuras por `<button>` con `aria-label`. En el lightbox, mové el foco al botón de cerrar al abrir, encerralo dentro del diálogo y devolvelo a la miniatura al cerrar. Agregale un `aria-label` al diálogo.
  - Usá `RouterLink` (que renderiza un `<a href>`) en la nav.
  - Agregá validación propia en español con mensajes inline (`aria-describedby`) y `autocomplete="name"` / `autocomplete="email"` en los inputs.
  - Configurá el carrusel para que no clone en el árbol de accesibilidad (o usá un scroll-snap nativo).
  - Agregá un skip link y un `focus-visible` con ring verde de 2 px.
  - Ocultá el botón flotante en `/projects` o movelo a la derecha.

#### M5. Performance: el bundle principal pesa 1.93 MB por Font Awesome
- El build de producción da `index-*.js` = **1,927 KB minificado / 695 KB gzip**. La causa principal es `library.add(fas, fab)` en `src/main.js:20`, que importa **todos** los íconos sólidos y de marcas (unos 1.5 MB de fuente en dev). Las imágenes están bien (WebP de 460 KB como máximo).
- **Por qué importa:** en una conexión 3G/4G de Honduras eso son varios segundos de JS antes de que el sitio sea interactivo, y un reviewer técnico que abra DevTools lo ve en un instante.
- **Fix:** importá solo los íconos que usás (`import { faArrowRight, … } from "@fortawesome/free-solid-svg-icons"`). Con eso el bundle debería bajar a una fracción. Agregá `loading="lazy"` y `width`/`height` a las covers para evitar CLS.

#### M6. El motion compite con el contenido
- Cada sección tiene una entrada con GSAP que **se repite cada vez que volvés a entrar al viewport** (`replayOnEnter`), los títulos arrancan al 20 % de opacidad y se "encienden" con el scroll (`TitleSection.vue`), los contadores vuelven a 0 y recuentan, y el hero se desvanece al salir. "Lo que ofrezco" fija la sección y secuestra el scroll a lo largo de 6 tabs ("Scroll para avanzar").
- **Por qué importa:** es una demostración de habilidad técnica, pero para alguien que escanea es fricción. Leer "UX" en el hero y después que el sitio te haga esperar a que el contenido aparezca es una contradicción.
- **Fix:** que las animaciones se ejecuten **una sola vez** (`once: true`), sacá el scrub de opacidad de los títulos y convertí Servicios en tabs normales sin pin. Guardá el motion fuerte para un solo momento memorable (el hero).

### 🟡 BAJO

- **B1. Sin Open Graph / Twitter cards** (`index.html` no tiene ninguna meta `og:`). Cuando pegues el link en LinkedIn o WhatsApp, que es justo como te van a compartir, sale sin imagen ni descripción.
- **B2. El CV abre el visor de Google Drive** (`profile.js` → `cvUrl`). Hosteá un PDF en `/public` y asegurate de que el CV también tenga orientación de diseño, no solo de dev.
- **B3. Código muerto visible para un reviewer técnico:** `src/components/NeoVimTest.js` (un `console.log("Desde NeoVim")`), `Project.vue` y `ButtonMain.vue` (no se importan en ningún lado), `Reviews` importado pero comentado en `HomeView.vue` y `reviews.js` lleno de placeholders.
- **B4. `design-system/jared-garcia-portfolio/MASTER.md` contradice el sitio:** dice Space Mono para headings y body, con un mood "brutalist, raw" y "Category: Developer Tool / IDE", y parece autogenerado. Para un candidato a diseño, un documento de design system que el propio sitio no sigue es peor que no tener ninguno. Reescribilo con los tokens reales (Space Grotesk / Inter, la escala de `ink`, los radios y el motion) y convertilo en una pieza del portafolio.
- **B5. Nombres de tech mal capitalizados** en el detalle: se ven "Ts", "Js" y "Mongo" porque se aplica `capitalize` al nombre del archivo (`ProjectDetailView.vue`, el bloque del stack). Usá el `name` de `skills.js`.
- **B6. Home de unos 15,000 px de alto en desktop** (unas 17 pantallas). Con A3, A4 y M6 resueltos debería bajar a la mitad.
- **B7. El `<title>` no cambia por ruta.** En `/project/rapisites` la pestaña sigue diciendo "Jared Garcia — Frontend Developer & UX/UI Designer". Si un reclutador tiene 10 pestañas abiertas, todas se llaman igual, y además se pierde SEO por caso. Fix: un `router.afterEach` que setee `document.title = \`${project.title} · Jared Garcia\``.
- **B8. Bug solo en dev: la home queda en blanco al volver desde un proyecto.** En `npm run dev` lo reproduje 3 veces: desde `/project/*`, tanto "Inicio" como "Hablemos sobre esto" llevan a `/` con `<main>` vacío y sin errores en consola. En el **build de producción no se reproduce** (ahí la navegación y el scroll a `#contact` funcionan bien), así que no afecta a quien visita el sitio publicado. Aun así, vale la pena revisarlo (probablemente sea la `<Transition mode="out-in">` de `App.vue` con el `:key` + `Teleport` del detalle) para que no te sorprenda en una demo en vivo con el dev server.
- **B9. Los proyectos de práctica viven en subdominios aleatorios de Netlify** (`ephemeral-empanada-cfb2ce.netlify.app`, etc.). Todos responden 200, pero si alguno queda en el portafolio después de A4, conviene ponerle un nombre legible.

---

## 4. Quick wins (menos de 1 hora cada uno)

1. **Reescribir el hero** (`Hero.vue:70-85`): "Diseño y construyo productos digitales, del research al deploy." + subtítulo "Product Designer & Frontend · Head of Development en Wink · Honduras". Sacar el `text-white/45` de "UX/UI Designer".
2. **Borrar el link de Instagram placeholder** (`profile.js:25`, `FormContact.vue:68-76`).
3. **Unificar el año de inicio:** usar `profile.careerStart` en `Hero.vue:84`, en las stats y en `ProjectsView.vue:88`.
4. **Pasar los 13 proyectos sin imagen a `status: "Práctica"`** y sacarlos del conteo "en producción".
5. **Cambiar el eyebrow `· Caso completo`** (`ProjectDetailView.vue:173`) por la categoría sola hasta que el caso realmente lo sea.
6. **Reemplazar `library.add(fas, fab)`** por imports individuales (`main.js:20`).
7. **Traducir el microcopy del catálogo:** `type_here...` → "Buscar proyecto", `pieces` → "proyectos", `view_project` → "Ver caso", `reset_filters` → "Limpiar filtros". Corregir "respondes" → "respondés".
8. **Subir los grises de texto informativo** de `/30–/45` a `/55` (buscar y reemplazar en los labels mono).
9. **Agregar las metas OG** (`og:title`, `og:description`, `og:image` de 1200×630) en `index.html`.
10. **Ocultar el botón "Contactame" en `/projects`** o moverlo a la derecha (`App.vue:57-63`).
11. **Borrar el código muerto:** `NeoVimTest.js`, `Project.vue`, `ButtonMain.vue` y el import de `Reviews`.
12. **Poner UI/UX como servicio #1** y comentar "Aplicaciones Móviles" (`Services.vue`).
13. **No mostrar el splash si se entra por una ruta distinta de `/`** (`App.vue`, condición de `showSplash`).
14. **Agregar `autocomplete="name"` y `autocomplete="email"`** en `FormContact.vue`, y un `aria-label` al diálogo del lightbox.
15. **Título de pestaña por ruta** con `router.afterEach` (B7).

---

## 5. Ideas de proyectos nuevos

Están elegidas para tapar los huecos: **research, proceso, métricas, B2B complejo, accesibilidad, contenido y conversacional, design systems**. Las primeras tres reutilizan productos que ya tenés, y eso es una ventaja enorme frente a un candidato con solo conceptos.

### 1. RapiSites: optimización del wizard de onboarding con datos reales
- **Concepto:** instrumentar el funnel del wizard de 4 preguntas (inicio → pregunta 1-4 → sitio generado → publicado), encontrar dónde abandona la gente, entrevistar a 5 usuarios y rediseñar el paso con más caída. Medir antes y después.
- **Habilidad:** product design guiado por datos, research cualitativo y cuantitativo, iteración, métricas de impacto.
- **Alcance:** 1 mes (incluye tiempo para juntar datos).
- **Entregables:** funnel con métricas, guion y síntesis de entrevistas (affinity map), 2-3 alternativas en wireframe, prototipo en Figma, test de usabilidad, UI final y caso de estudio con el número de antes y después.
- **Por qué suma:** convierte tu proyecto más fuerte en el caso estrella, y es el único que te puede dar una **métrica real**, que hoy no tenés en ningún lado.

### 2. Honduras Medical Center: rediseño del flujo de cotización de exámenes
- **Concepto:** test de usabilidad del cotizador actual con 5 pacientes reales (o familiares que cotizan por adultos mayores), detección de fricciones (terminología médica, totales, qué hago después de cotizar) y rediseño con foco en claridad y en el paso a WhatsApp o la cita.
- **Habilidad:** usabilidad, content design para salud, diseño para usuarios con baja alfabetización digital.
- **Alcance:** 1-2 semanas.
- **Entregables:** plan de test, hallazgos priorizados (severidad), journey map, wireframes, UI y prototipo, caso de estudio antes/después.
- **Por qué suma:** demuestra que sabés **evaluar** tu propio trabajo y mejorarlo, que es la señal más clara de madurez en diseño. Y es un contexto local real.

### 3. Wink App: rediseño de la programación de playlists (UX B2B complejo)
- **Concepto:** la programación de contenido por pantalla, zona y horario es el típico flujo B2B denso. Análisis de tareas con operadores de agencias, mapa de arquitectura de información, rediseño del scheduler (vista calendario vs. timeline vs. reglas) y manejo de conflictos y estados vacíos.
- **Habilidad:** diseño de herramientas complejas, arquitectura de información, diseño de estados (error, vacío, conflicto), trabajo con stakeholders.
- **Alcance:** 1-2 semanas (si hay temas de confidencialidad, anonimizá los datos).
- **Entregables:** task analysis, mapa de IA, flujos, 3 exploraciones del scheduler con pros y contras, UI de alta fidelidad con todos los estados, prototipo y caso.
- **Por qué suma:** el SaaS B2B es donde está gran parte del trabajo remoto para Latam, y tu rol de Head of Dev te da acceso a usuarios reales.

### 4. Remesas y pagos de servicios para adultos mayores en Honduras
- **Concepto:** muchos hogares reciben remesas y pagan luz (ENEE), agua y teléfono en agentes o ventanillas. Diseñar una experiencia (app ligera o flujo en WhatsApp) para que una persona mayor, guiada por un familiar en EE.UU., consulte su remesa y pague un servicio sin miedo a equivocarse.
- **Habilidad:** research con usuarios vulnerables, accesibilidad (tipografía grande, contraste, lenguaje simple), diseño de confianza y prevención de errores, diseño para dos actores (receptor y familiar remitente).
- **Alcance:** 1 mes.
- **Entregables:** 6-8 entrevistas (receptores y remitentes), personas basadas en evidencia, journey map, flows, wireframes, UI accesible (con un checklist WCAG documentado), prototipo testeado y caso de estudio.
- **Por qué suma:** es un problema real de Honduras, con mucho peso emocional y económico, y muestra accesibilidad de verdad, no solo contraste.

### 5. Turnos en clínicas públicas por WhatsApp (diseño conversacional)
- **Concepto:** las filas de madrugada para sacar ficha en centros de salud o en el IHSS son un dolor conocido. Diseñar un flujo conversacional por WhatsApp para pedir turno, recibir recordatorios, avisar si se atrasa y reprogramar.
- **Habilidad:** conversational UX, UX writing, manejo de errores y casos borde, diseño de servicio (back office del centro de salud incluido).
- **Alcance:** 1-2 semanas.
- **Entregables:** service blueprint, árbol conversacional, scripts con variantes de error, prototipo de chat (Figma o una herramienta de bots), test con 5 personas y caso.
- **Por qué suma:** no tenés nada de contenido ni conversacional, y WhatsApp es el canal principal en Honduras. Se diferencia muchísimo de otra app más.

### 6. Auditoría heurística + rediseño de un trámite en línea (concepto no oficial)
- **Concepto:** tomar un trámite digital hondureño real (por ejemplo, obtener o consultar el RTN en el portal del SAR, o una cita de pasaporte), hacer una evaluación heurística (Nielsen + WCAG) y rediseñar las 3 pantallas más problemáticas. Marcarlo claramente como **concepto personal, no afiliado**.
- **Habilidad:** evaluación experta, priorización por severidad, rediseño acotado, comunicación de hallazgos.
- **Alcance:** un fin de semana.
- **Entregables:** informe heurístico con severidades, capturas anotadas, rediseño antes/después y un caso corto.
- **Por qué suma:** es rápido, muestra criterio analítico y le da al portafolio una pieza "de lectura rápida" para los reviewers apurados.

### 7. Design system documentado (empezando por este portafolio o por RapiSites)
- **Concepto:** reemplazar el `MASTER.md` autogenerado por un sistema real: tokens (color, tipografía, espaciado, motion), componentes con estados y variantes, reglas de accesibilidad y guía de voz. En Figma (con variables) y en código (tokens de Tailwind + una página `/design-system` en el sitio).
- **Habilidad:** pensamiento sistémico, documentación, puente diseño ↔ código.
- **Alcance:** 1-2 semanas.
- **Entregables:** librería en Figma, documentación de tokens, componentes con estados, página viva en el sitio y caso de estudio que explique las decisiones (por qué verde, por qué Space Grotesk, cómo resolviste el contraste).
- **Por qué suma:** es tu diferencial de Design Engineer hecho visible, y de paso arregla M3, M4 y B4.

---

## 6. Plan de acción: las próximas 4 semanas

### Semana 1: limpiar y reposicionar (que deje de jugar en contra)
- Todos los **Quick wins** (sección 4).
- **A4:** reducir a 5-6 proyectos y archivar el resto.
- **A3:** hero de una sola pantalla, splash fuera, filtros colapsados en mobile.
- **A5:** la sección "Sobre mí" real, con foto, historia corta y proceso.
- **Resultado:** el sitio deja de restar puntos. Ya podrías mandarlo para puestos de Design Engineer.

### Semana 2: el primer caso de verdad
- **A1** aplicado a **HMC (idea 2)**: correr el test de usabilidad, sintetizar, rediseñar y escribir el caso con la estructura nueva.
- Extender el schema de `projects.js` y la plantilla del detalle con las secciones de proceso.
- **M1:** covers nuevas para los destacados.
- En paralelo: **instrumentar el funnel de RapiSites (idea 1)** para que los datos se vayan juntando.

### Semana 3: el caso B2B y la calidad técnica
- **Wink App (idea 3)** como segundo caso completo.
- **M4** (accesibilidad completa), **M5** (bundle) y **M6** (bajar el motion). Correr Lighthouse y axe y documentar los resultados (sirve como evidencia en el caso del design system).
- Hacer la **auditoría heurística (idea 6)** un fin de semana, como pieza rápida.

### Semana 4: la métrica y el cierre
- **RapiSites (idea 1):** con 2-3 semanas de datos, entrevistas, rediseño del paso con más abandono y caso de estudio (con métrica o con el plan de medición si todavía no hay resultado final).
- Reescribir `MASTER.md` como el inicio del **design system (idea 7)**.
- Pedir **2-3 testimonios reales** (cliente de HMC, alguien de Wink, un usuario de RapiSites) y reactivar `Reviews`.
- Actualizar el CV (PDF propio, con orientación a diseño de producto) y el LinkedIn con el mismo posicionamiento.
- **Resultado esperado:** 3 casos con proceso (uno con métrica), un sitio rápido y accesible y un posicionamiento claro. Con eso te leerían como **UI/UX o Product Designer mid** y como un **Design Engineer** muy competitivo.

Las ideas 4 (remesas) y 5 (turnos por WhatsApp) quedan para el mes 2: son las que más te diferencian en Latam, pero necesitan tiempo de research que no conviene apurar.
