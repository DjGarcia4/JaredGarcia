---
title: "De 695 KB a menos de 200: el presupuesto de rendimiento de este portafolio"
description: "Íconos que pesaban más de 500 KB, un footer que saltaba, three.js solo cuando se ve, prerender, fuentes propias y un blog que se comía el presupuesto: cada paso con sus números."
date: 2026-10-13
tags: [performance, vue, lighthouse]
kind: learning
keyword: "200 KB"
---

El rediseño de este portafolio empezó con una revisión del sitio hecha como la haría un hiring manager. Uno de los hallazgos fue incómodo: el archivo principal de JavaScript pesaba 1.927 KB minificado, 695 KB con gzip. Para un sitio que dice «diseño la experiencia y la construyo hasta producción», era un mal primer mensaje.

Quería sumarle 3D y algunos momentos llamativos, así que antes de agregar nada puse un presupuesto. Este post cuenta cómo lo cumplí, con los números de cada paso, y lo que pasó esta semana cuando el blog empezó a comérselo.

## El presupuesto

| Métrica | Límite |
| --- | --- |
| JavaScript inicial | &lt; 200 KB gzip |
| Chunk 3D | &lt; 250 KB gzip, con carga diferida |
| LCP en 4G | &lt; 2,5 s |
| Lighthouse | ≥ 90 en Performance y 100 en Accesibilidad |

<p class="tbl-note">El presupuesto, escrito antes de tocar el código.</p>

La regla detrás es simple: si el sitio es lento, lo llamativo se paga caro. Un efecto 3D que demora la primera pintura no suma, resta.

## 1. 695 KB por unos íconos

La causa principal del peso era una línea: `library.add(fas, fab)`. Registraba todos los íconos sólidos y de marcas de Font Awesome, unos dos mil, para usar unas pocas decenas. El arreglo fue importar solo los que se usan, uno por uno, en un archivo propio.

```js
// Antes: todos los íconos, se usen o no
library.add(fas, fab);

// Después (simplificado): solo los que usa el sitio
import { faArrowRight, faBolt, faBookOpen /* … */ } from "@fortawesome/free-solid-svg-icons";
library.add(faArrowRight, faBolt, faBookOpen /* … */);
```

Con ese cambio el bundle principal bajó de 695 a 174 KB gzip. Es el arreglo más rentable que hice en todo el rediseño, y el que más me enseñó: el peso casi nunca está donde uno lo busca. Hay que medir el build real, no adivinar.

## 2. Separar lo que cambia poco y diferir lo que no se usa al entrar

Después separé las dependencias en chunks propios: Vue y su router, GSAP y los íconos. Cambian poco, así que quedan en la caché del navegador aunque yo publique una versión nueva del sitio. Y dejé de cargar al entrar lo que no hace falta al entrar:

- El código QR y el modal de contacto se cargan cuando se abren.
- El servicio de envío del formulario se cargaba recién al enviar (hoy el formulario usa Netlify Forms y ni siquiera necesita una librería).
- Las imágenes que están debajo del primer pantallazo usan `loading="lazy"` y `decoding="async"`; la portada de cada caso, en cambio, lleva `fetchpriority="high"` porque es candidata a LCP.

Resultado: el JavaScript inicial pasó de un archivo de 695 KB a unos 159 KB repartidos en 4 chunks que se pueden cachear por separado.

## 3. El 3D, solo donde se ve

El plan original era usar TresJS para las escenas 3D. Lo cambié: el hero 3D está hecho con CSS 3D, que no pesa nada ni frena el LCP, y la demo de cartelería del caso de [Wink App](/project/wink-app) usa three.js directo. TresJS obligaba a tocar el compilador de Vue para una sola escena.

Y three.js no se descarga al entrar al caso: la demo es un componente asíncrono que, además, espera a que la escena esté a 200 px de aparecer en pantalla para importar la librería. Son 117 KB gzip que solo baja quien llega hasta ahí.

```js
// Simplificado: three.js se importa cuando la demo está por verse
const io = new IntersectionObserver(async ([entry]) => {
  if (!entry.isIntersecting) return;
  io.disconnect();
  const { createSignageScene } = await import("@/lib/signageScene");
  createSignageScene(canvas);
}, { rootMargin: "200px 0px" });
io.observe(container);
```

## 4. El inglés, aparte

El sitio está en español y en inglés. Los textos de la interfaz y todo el contenido en inglés viven en un chunk aparte que se descarga solo si el idioma activo es inglés. Quien visita en español no paga por el otro idioma.

## 5. El salto del footer: CLS de 0,75 a 0,001

En /projects y en los casos, Lighthouse marcaba un CLS de 0,75. La causa: mientras se cargaba el chunk de la ruta, `<main>` quedaba vacío, el footer se pintaba arriba de todo y después saltaba hacia abajo cuando llegaba el contenido.

El arreglo fue una línea de CSS: un `min-height` en `<main>`. El CLS bajó a 0,001. Lo conté en detalle, con el paso a paso, en [De 0.75 a 0.001 de CLS](/blog/cls-de-075-a-0001). Es un buen recordatorio de que el code splitting también tiene costo: cada ruta que carga aparte deja un momento en el que la página está a medio armar.

## 6. Imágenes del tamaño en que se ven

Las capturas de los proyectos se servían en su tamaño original en todos lados. Generé dos variantes en WebP, de 800 y de 1600 px de ancho, y las uso con `srcset` y `sizes`; el original queda solo para el visor a pantalla completa. El peso de la home bajó de 755 KB a 376 KB.

```html
<!-- Simplificado -->
<img
  src="/img/projects/rapisites/cover-1600.webp"
  srcset="/img/projects/rapisites/cover-800.webp 800w,
          /img/projects/rapisites/cover-1600.webp 1600w"
  sizes="(min-width: 1024px) 760px, 100vw"
  loading="lazy" decoding="async" alt="…" />
```

## 7. Animaciones que no frenan

Dos cambios más, menos visibles. El rol y el párrafo del hero dejaron de entrar con una animación de opacidad: eran candidatos a LCP en mobile, y un elemento que arranca invisible retrasa esa métrica. Y para que el scroll de la home se sintiera fluido, saqué el scroll snapping del hero y de las tarjetas (peleaba con GSAP), dejé de animar `filter: blur` al hacer scroll y quité el `backdrop-blur` de las superficies que estaban encima del fondo animado.

## Los números, antes y después

|  | Perf. mobile | Perf. desktop | Accesibilidad | SEO | LCP mobile | Peso |
| --- | --- | --- | --- | --- | --- | --- |
| Antes | 60 | 93 | 80 | 92 | 6,0 s | 1149 KB |
| Después (home) | 90 | 100 | 100 | 100 | 3,2 s | 376 KB |
| Después (/projects) | 88 | 99 | 100 | 100 | 3,5 s | 382 KB |
| Después (caso [Wink App](/project/wink-app)) | 85 | 99 | 100 | 100 | 3,8 s | 298 KB |

<p class="tbl-note">Lighthouse 12.2.1 sobre el build de producción. Mobile con el throttling por defecto (4G lento y CPU 4×).</p>

## 8. El blog se comía el presupuesto

Mi primera versión del blog guardaba cada post en un archivo de datos que el sitio importaba al arrancar, porque el título y el resumen hacen falta en el menú, en la paleta de comandos (⌘K), en el SEO y en el sitemap. El problema es que con el título venía todo el cuerpo.

Lo medí sumando el gzip de los scripts que carga `index.html` (el punto de entrada y sus precargas), con el mismo método en cada paso:

| Momento | JS inicial (gzip) |
| --- | --- |
| Antes del blog | 167,1 KB |
| Blog con 5 posts | 174,6 KB |
| Blog con 16 posts | 186,0 KB |
| Cuerpos separados | 171,1 KB |

<p class="tbl-note">Cada post nuevo, o cada post más largo, iba directo a la carga inicial de todas las páginas.</p>

Con 16 posts quedaban 14 KB de margen, y el plan era hacer los posts mucho más detallados. Si no cambiaba algo, el blog iba a romper el presupuesto de un sitio que la mayoría de la gente visita sin leer un solo post.

La solución fue partir los datos en dos: un índice liviano en el bundle principal, porque lo usan el menú, la paleta y el SEO, y el cuerpo de cada post en su propio archivo, que se descarga solo al abrirlo. El JavaScript inicial volvió a 171,1 KB: 4 KB más que antes de tener blog, en lugar de 19.

La versión que quedó publicada usa la misma idea, mejor resuelta. Cada artículo es un archivo Markdown que un plugin de Vite convierte a HTML en el build, con el código ya resaltado. El índice (título, resumen, fecha, temas) sale de un módulo virtual, y el cuerpo de cada artículo es su propio chunk.

```js
// Simplificado: el índice viene de un módulo virtual y cada cuerpo es un chunk
import { posts } from "virtual:blog";

const bodies = import.meta.glob("/src/content/blog/*/*.md", { import: "default" });

export const loadBody = (post) =>
  bodies[`/src/content/blog/${post.lang}/${post.slug}.md`]();
```

El índice tampoco es gratis. Con 36 artículos entre los dos idiomas, sus metadatos son lo que más creció en la carga inicial esta semana. Si el blog sigue creciendo, ese es el próximo lugar donde mirar.

## 9. Prerender y fuentes propias

Hasta acá, el LCP en mobile seguía entre 3,2 y 3,8 s, por encima de los 2,5 s del presupuesto. Lo frenaban dos cosas: las fuentes de Google Fonts, cuyo CSS bloquea el render, y que el sitio era una SPA: el HTML llegaba vacío y el contenido se pintaba recién cuando corría el JavaScript.

Los dos arreglos:

- Cada ruta se prerenderiza a HTML en el build, con Vue SSR, y el navegador la hidrata en vez de construirla desde cero. El HTML ya trae el contenido, el título, la descripción, Open Graph y los datos estructurados.
- Las fuentes se sirven desde el propio sitio, solo el subconjunto latino y los pesos que se usan, con `preload` de las dos que aparecen en el primer pantallazo. Google Fonts desapareció.

Para medir esto cambié la forma de correr Lighthouse: throttling aplicado de verdad (`--throttling-method=devtools`) en lugar de simulado, y la mediana de tres corridas. La simulación estima el primer paint sumando todo lo que se descarga antes, incluido JavaScript que no bloquea el render, así que con contenido prerenderizado daba números engañosos. Por eso la columna «antes» es el sitio medido de la misma forma, no la tabla anterior.

| Página | Perf. antes | Perf. después | LCP antes | LCP después |
| --- | --- | --- | --- | --- |
| Home | 61 | 71 | 4,2 s | 2,1 s |
| /projects | 59 | 73 | 5,0 s | 2,8 s |
| Artículo del blog | 80 | 80 | 4,0 s | 2,0 s |

<p class="tbl-note">Lighthouse 12.2.1, mobile, throttling devtools (4G lento y CPU 4×), navegador en español. El CLS quedó en 0 en todas.</p>

Hay un efecto que conviene entender: el TBT de la home subió de unos 530 ms a 1,4 s. No es que el sitio haga más trabajo (el tiempo total del hilo principal bajó de 4,3 a 3,8 s), sino que ahora hay contenido pintado antes de que corra el JavaScript, y el TBT solo cuenta lo que bloquea después del primer paint.

Y una consecuencia para mi forma de medir: con el prerender, el `index.html` también precarga los chunks de la home. Medido igual que antes, el JavaScript inicial de la home queda en 193,0 KB gzip. Sigue dentro del presupuesto, pero más cerca del límite.

## Lo que falta

- La hidratación de la home es una sola tarea de unos 1,4 s con la CPU cuatro veces más lenta. Con Vue 3.5 se puede hidratar de forma diferida lo que está debajo del primer pantallazo.
- El inglés no aprovecha el prerender: el HTML prerenderizado está en español, así que en inglés el contenido espera a que la app monte. Hace falta tener URLs propias en inglés, prerenderizadas en inglés.
- /projects queda en 2,8 s de LCP, todavía arriba de los 2,5 s.

Prefiero decirlo a esconderlo: un presupuesto sirve justamente para saber dónde no llegas todavía.

> Lo que me llevo: un presupuesto de rendimiento no se cumple una vez y ya. Cada funcionalidad nueva lo pone a prueba, y la única forma de enterarse a tiempo es medir el build real en cada paso.
