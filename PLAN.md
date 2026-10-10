# Plan v2 del portafolio: Frontend Developer + UI/UX Designer

> **Objetivo:** que en 10 segundos se entienda "dev frontend senior que además diseña con proceso", que en 1 click se llegue a un caso y que el sitio en sí sea la prueba de las dos cosas: código impecable y criterio de diseño. Le sumamos 3D y algunos momentos "wow", pero con presupuesto de performance, para que lo llamativo no vuelva a jugar en contra.
>
> **Base:** `REVIEW.md`. Cada hallazgo (A1-A5, M1-M6, B1-B9) está asignado a una fase en la [tabla de trazabilidad](#trazabilidad-review--plan) del final, así no se escapa ninguno.

---

## Decisiones (las tomé yo; si alguna no te cierra, la cambiamos)

| Tema | Decisión | Por qué |
|---|---|---|
| **Posicionamiento** | **"Frontend Developer & UI/UX Designer"**, con las dos mitades al mismo peso visual. Tagline: *"Diseño la experiencia y la construyo hasta producción."* | Es lo que sos y es raro de encontrar. Que el dev vaya primero está bien siempre que el diseño se demuestre con casos, no solo con la etiqueta. |
| **3D: ¿sí o no?** | **Sí, pero con 2 piezas con sentido, no 3D decorativo en todos lados** (ver Fase 4). | El 3D que no cuenta nada es ruido y peso. El que muestra tu trabajo (tu producto real de digital signage, o una interfaz "explotada" en capas diseño → código) es memorable y relevante. |
| **Librería 3D** | **TresJS** (Three.js declarativo para Vue 3) + `@tresjs/cientos`, **cargado de forma diferida** (después del primer render, solo si el dispositivo lo aguanta). | Encaja con tu stack Vue, y que lo hayas hecho en Vue suma puntos como dev. Usarlo con carga diferida evita cargar ~150 KB gzip de Three en el primer paint. |
| **Presupuesto de performance** | JS inicial **< 200 KB gzip** (hoy: 695 KB), chunk 3D **< 250 KB gzip** con carga diferida, **LCP < 2.5 s** en 4G, Lighthouse **≥ 90** en Performance y **100** en Accesibilidad. | Si el sitio es lento, lo llamativo se paga caro. El número de Lighthouse va a ir en el caso de estudio del propio portafolio. |
| **Motion** | GSAP se queda, pero cada animación se ejecuta **una sola vez**. El motion fuerte va en el hero y en la transición card → caso. Se acaba el scroll-jacking. | M6 del review. |
| **Idioma** | **Español + inglés** (`vue-i18n`), con selector ES/EN en el header. | Te abre puertas a trabajo remoto en EE. UU. y Europa. Para un candidato de Honduras es probablemente lo de mayor retorno después de los casos. |
| **Proyectos** | **Destacados:** RapiSites, Wink App, **Wink Site**, SwiftFlow y HMC. **Archivo:** los 13 de práctica pasan a una lista compacta "Práctica y cursos". | A4 del review. Wink Site ya existe en los datos y lo vamos a subir a caso completo, con su sección 3D. |
| **Trabajo en git** | Rama `redesign/v2`, un commit por tarea y deploy preview de Netlify por rama. | Así `main` (el sitio publicado) no se rompe mientras tanto. |

---

## Fase 0: Arranque (medio día)

- [ ] Crear la rama `redesign/v2` y medir la **línea base** (Lighthouse mobile/desktop y peso del bundle) para el antes/después del caso.
- [ ] Borrar el código muerto: `NeoVimTest.js`, `Project.vue`, `ButtonMain.vue`, el import de `Reviews` y los placeholders de `reviews.js` (B3).
- [ ] Agregar ESLint + Prettier y un script `npm run lint`, para que el repo se vea profesional si alguien lo abre.

## Fase 1: Fundaciones técnicas (semana 1) · *no necesito nada de vos*

**Performance**
- [ ] Font Awesome: reemplazar `library.add(fas, fab)` por imports individuales, o migrar a `unplugin-icons` con Lucide (M5).
- [ ] Separar en chunks GSAP, carrusel y QR. Agregar `width`/`height` y `loading="lazy"` a todas las imágenes y precargar la fuente display.
- [ ] Splash: eliminarlo, o mostrarlo menos de 800 ms y solo en `/` (A3 del review: hoy aparece también en los deep links).

**Accesibilidad** (objetivo: 100 en Lighthouse y 0 errores en axe)
- [ ] Contraste: definir tokens `--text-muted` (≥ 4.5:1) y `--text-subtle` (solo decorativo) y reemplazar los ~90 usos de `text-white/20…45` (M4).
- [ ] Lightbox: figuras como `<button>`, foco al abrir, foco atrapado dentro, devolver el foco al cerrar y `aria-label` en el diálogo.
- [ ] La nav con `RouterLink` (un `<a href>` real), un skip link y un `focus-visible` con ring de 2 px.
- [ ] Carrusel de certificados sin clones en el árbol de accesibilidad (o con un scroll-snap nativo).
- [ ] Menú mobile: que el `aria-label` alterne entre "Abrir menú" y "Cerrar menú".
- [ ] Botón flotante "Contactame": que no tape el buscador ni los filtros (moverlo u ocultarlo en `/projects`).

**Formulario**
- [ ] Validación propia en español, mensajes inline con `aria-describedby`, `autocomplete`, y estados de carga, éxito y error diseñados.

**Bugs y SEO**
- [ ] Bug de la home en blanco al volver desde un proyecto (solo pasa en dev, B8).
- [ ] `<title>` y `meta description` por ruta, metas OG/Twitter, `sitemap.xml` y `robots.txt` (B1, B7).
- [ ] Unificar el año de inicio (`profile.careerStart`) y borrar el Instagram placeholder (M2).
- [ ] Capitalizar bien los nombres de tech ("TypeScript", no "Ts") (B5).

## Fase 2: Reposicionamiento y arquitectura (semana 1-2)

**Home nueva** (de unas 17 pantallas a unas 6)
1. **Hero de 1 pantalla:** nombre, tagline, chips de rol ("Frontend · UI/UX · Head of Dev @ Wink"), CTA **"Ver casos"** + CV, y la escena 3D a la derecha (Fase 4). El primer caso asoma por debajo del fold.
2. **Casos destacados:** 4 cards grandes con covers diseñadas (M1) y una línea de impacto en cada una.
3. **Cómo trabajo:** proceso en 4 pasos (Descubrir → Diseñar → Construir → Medir), cada uno con un artefacto real de tus proyectos.
4. **Sobre mí:** foto, historia corta, años reales y lo que buscás (A5). Reemplaza "Lo que me define".
5. **Stack en 3 columnas:** Diseño / Frontend / Infra & herramientas (A2). Chau grilla de 22 logos y chau Vite como #01.
6. **Contacto.**
- **Se mueven:** Servicios (pasa a 4 tabs sin pin, con UI/UX y Frontend arriba y sin "Móviles" hasta que tengas un proyecto móvil) y Certificados (a `/about` o a una línea "Formación" con los 2 de UX destacados).

**Página de proyectos**
- [ ] En mobile, filtros detrás de un botón "Filtrar" (bottom sheet) y las cards primero (A3).
- [ ] Categorías agrupadas en 5 (SaaS · Plataformas · Sitios · Herramientas · Práctica).
- [ ] Los 13 de práctica pasan a `status: "Práctica"`, en una lista compacta al final sin cards vacías (A4).

**Voz e i18n**
- [ ] Guía de voz corta: voseo, sin jerga de código en labels accionables (M3). Traducir `type_here`, `pieces`, `view_project`, etc.
- [ ] Montar `vue-i18n` (ES/EN), pasar todo el copy a archivos de locale y meter el contenido de `src/data` en los 2 idiomas.

**Hablar como dev sin perder el diseño**
- [ ] Sección o línea "Ingeniería" en cada caso: stack, arquitectura y decisiones técnicas, colapsable. Al dev que lo lee le interesa. Al diseñador no le estorba.

## Fase 3: Casos de estudio (semana 2-3) · *acá te necesito*

**Plantilla nueva** (`ProjectDetailView` + schema de `projects.js`)
- **TL;DR** arriba: rol, equipo, tiempo, problema en 1 línea y 3 resultados. Es para el reviewer que tiene 5 minutos.
- **Contexto → Problema → Usuarios / research → Restricciones → Exploración** (wireframes y alternativas descartadas) **→ Solución** (UI anotada) **→ Ingeniería** (colapsable) **→ Resultado → Aprendizajes.**
- **Componentes nuevos:** slider antes/después, imagen con anotaciones numeradas (hotspots), embed de prototipo de Figma, bloque de métrica grande y video corto (MP4/WebM con autoplay muted y poster).
- El eyebrow "Caso completo" solo aparece cuando el caso realmente lo es (A1).

**Los 4 casos**

| Caso | Ángulo | Lo cool |
|---|---|---|
| **Wink App** | UX B2B complejo: programación de playlists en una plataforma multi-agencia con RBAC/MFA. | **Escena 3D de digital signage** (Fase 4): una pantalla o totem 3D que reproduce la playlist que se ve en la UI. |
| **Wink Site** | Diseño orientado a conversión: 11 secciones, planes, tracking GA4 con eventos propios. | **Su sección 3D** embebida o grabada en el caso, más las métricas de GA4 (leads, CTR a demo). |
| **RapiSites** | De 4 preguntas a un sitio publicado: diseño del wizard, del editor visual y de las 33 secciones. | Demo en vivo: un mini-wizard embebido o un video del flujo completo en menos de 30 s. |
| **HMC** | Cotizador médico para usuarios con baja alfabetización digital. | Antes/después del flujo de cotización (si hacés el test de usabilidad de la idea 2 del review). |
| *(SwiftFlow)* | Se queda como destacado secundario: accesibilidad (axe, teclado 100 %) + PWA. | El heatmap de errores del teclado como visual. |

## Fase 4: Lo llamativo (semana 3-4)

### 4.1 3D #1: Hero "Interfaz explotada" ★
Una interfaz real tuya (por ejemplo, una pantalla de Wink App) mostrada en 3D como **capas separadas**: wireframe → UI diseñada → código → dispositivo. Con el mouse se inclina (parallax). Con el scroll, las capas se juntan en la pantalla final. **Cuenta literalmente lo que hacés:** diseño + frontend.
- TresJS con planos texturizados (las capas son imágenes, así que el modelado es casi nulo) y una sombra suave. Iluminación barata.
- **Fallback:** imagen estática de la escena (también la usamos como OG image) si hay `prefers-reduced-motion`, `saveData`, `deviceMemory < 4` o no hay WebGL.
- Carga diferida: se monta después de `requestIdleCallback` y solo cuando el hero está visible.

### 4.2 3D #2: Wink Signage en vivo (dentro del caso Wink App) ★
Un totem o pantalla de digital signage en 3D, en un espacio minimal, que **reproduce la playlist** que armás en la UI de al lado: la miniatura del contenido de la UI pasa a la pantalla 3D. Muestra el producto funcionando, que es exactamente lo que un screenshot no puede hacer.
- Modelo low-poly (`.glb` < 300 KB con Draco) o geometría procedural, y las texturas de los contenidos como video o imágenes.
- Lo mismo puede reutilizar o enlazar la sección 3D de winkdigital.io (ver pregunta abajo).

### 4.3 Otras cosas cool (sin 3D)
- **View Transitions API:** la card del proyecto "se transforma" en el hero del caso al hacer click. Vue Router lo soporta con poco código y no pesa nada.
- **Paleta de comandos ⌘K / Ctrl+K:** buscar y saltar a cualquier caso, copiar el email o descargar el CV. Es un guiño de dev y es UX real para el reclutador apurado.
- **Página `/design-system`:** tokens vivos (color, tipografía, espaciado, motion) y componentes con sus estados. Reemplaza el `MASTER.md` autogenerado (B4) y prueba que pensás en sistemas.
- **`/lab`:** 4-6 microinteracciones experimentales (un botón magnético, un toggle con física, una tarjeta con tilt). Es un recreo visual que demuestra oficio, sin meterlo en las páginas importantes.
- **Datos vivos:** contador real de sitios publicados en RapiSites (vía un endpoint público tuyo) y un heatmap de contribuciones de GitHub. Son métricas reales que además se mueven.
- **Toggle light/dark** (opcional, al final): demuestra los tokens funcionando.

## Fase 5: Pulido y lanzamiento (semana 4-5)

- [ ] QA en dispositivos reales (iPhone, un Android de gama media y desktop), con teclado, VoiceOver y NVDA.
- [ ] Lighthouse y axe en cada ruta. Documentar el antes/después.
- [ ] OG image por caso (generada a partir del render del hero 3D o de la cover).
- [ ] CV en PDF propio en `/public` (ES/EN), con orientación dev + diseño (B2).
- [ ] Dominio propio (`jaredgarcia.dev` o similar) y redirecciones desde Netlify.
- [ ] **Meta-caso "Este portafolio":** el proceso de rediseño con el review como research, las decisiones, el 3D con presupuesto de performance y el Lighthouse antes/después. Es un caso gratis y muy honesto.
- [ ] Testimonios reales (2-3) y reactivar `Reviews`.
- [ ] Merge a `main`, deploy, y actualizar LinkedIn con el mismo posicionamiento.

---

## Lo que necesito de vos (bloquea las fases 2-3)

1. **¿Dónde está la sección 3D de winkdigital.io?** En el build publicado no encontré Three.js, Spline ni modelos `.glb`, solo las animaciones `flip` de animate.css y un `hero.mp4`. ¿Está en otra ruta, en una versión todavía sin publicar o en otro repo? Si me pasás el repo o la ruta, la aprovecho en el caso.
2. **Foto** profesional (o una casual buena) y **3-4 líneas de tu historia**.
3. **Métricas reales**, aunque sean aproximadas y con fuente: leads o tráfico de Wink Site (GA4), pantallas o clientes activos en Wink, sitios publicados en RapiSites y usuarios de SwiftFlow. **No voy a inventar números.**
4. **Artefactos de proceso** que tengas: Figma, wireframes, bocetos, versiones viejas, capturas de "antes". Si no existen, armamos los que sean honestos de reconstruir y lo decimos así.
5. **Permiso o límites de confidencialidad** para mostrar Wink App en detalle (¿hay que anonimizar clientes?).
6. **2-3 testimonios** (de alguien de Wink, del cliente de HMC o de un usuario de RapiSites).
7. **El CV actualizado** (o los datos para armarlo).

---

## Cronograma

| Semana | Fases | Entregable visible |
|---|---|---|
| 1 | 0 + 1 + inicio de 2 | Sitio rápido, accesible y sin bugs. Hero nuevo y home recortada. |
| 2 | 2 + inicio de 3 | i18n, proyectos curados, plantilla de caso nueva y caso de Wink Site. |
| 3 | 3 + 4.1 | Casos de Wink App y RapiSites. Hero 3D. |
| 4 | 4.2 + 4.3 | Signage 3D, View Transitions, ⌘K y `/design-system`. |
| 5 | 5 | QA, meta-caso, CV, dominio y lanzamiento. |

---

## Trazabilidad review → plan

| Hallazgo | Fase |
|---|---|
| A1 Casos sin proceso | 3 |
| A2 Posicionamiento | Decisiones + 2 |
| A3 Tiempo hasta el primer proyecto (hero, splash, filtros en mobile, splash en deep links) | 1 + 2 |
| A4 Relleno / "Producción" inflado | 2 |
| A5 Sin persona ni métricas | 2 + 3 (necesita inputs) |
| M1 Covers recortadas | 2 + 3 |
| M2 Datos contradictorios / Instagram | 1 |
| M3 Microcopy y voz | 2 |
| M4 Accesibilidad (contraste, lightbox, nav, formulario, carrusel, botones flotantes) | 1 |
| M5 Bundle de 1.9 MB | 1 |
| M6 Exceso de motion | 1 + 2 |
| B1 OG tags | 1 + 5 |
| B2 CV en Drive | 5 |
| B3 Código muerto | 0 |
| B4 `MASTER.md` falso | 4.3 (`/design-system`) |
| B5 Nombres de tech | 1 |
| B6 Home de 15k px | 2 |
| B7 `<title>` por ruta | 1 |
| B8 Bug de pantalla en blanco (dev) | 1 |
| B9 Subdominios de Netlify | 2 (al archivar) |
| Ideas de proyectos nuevos (review §5) | Después del lanzamiento: el sitio nuevo está pensado para recibirlos con la plantilla de caso. |
