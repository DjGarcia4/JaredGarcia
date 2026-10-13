---
title: "57 componentes, ningún JavaScript: el rendimiento es SEO"
description: "Carruseles, acordeones y formularios sin una línea de JS en el sitio público. Lo que se gana, cómo se hace y el bug que desapareció al quitar el JavaScript."
date: 2026-10-12
tags: [performance, seo, rapisites]
projects: [rapisites]
cover: /img/projects/rapisites/02.webp
kind: learning
keyword: "0 KB de JS"
---

Los sitios que genera RapiSites no cargan JavaScript. Ninguno de los 57 componentes del catálogo lo necesita: el sitio público se sirve como HTML y CSS, nada más. Ni el carrusel, ni el acordeón de preguntas, ni el menú con desplegables, ni el formulario de contacto.

No empezó como una regla estética. Para un negocio chico, que lo encuentren en Google importa más que cualquier animación, y la velocidad es parte del SEO. Si el sistema promete SEO técnico correcto sin que el cliente haga nada, no puede mandarle al visitante kilos de JavaScript. Y lo curioso es que la especificación original ni siquiera pedía cero: decía «JavaScript solo en islas», dando por hecho que el carrusel y el acordeón iban a necesitar una. No la necesitaron.

## Qué son los 57

| Tipo | Variantes | Lo que podría haber pedido JavaScript |
| --- | --- | --- |
| Menú (`nav`) | 6 | Desplegables, selector de idioma |
| Hero | 8 | Dos variantes con formulario |
| Beneficios (`features`) | 8 | Pasos numerados |
| Cifras (`stats`) | 3 | — |
| Catálogo | 5 | Carrusel de productos |
| Galería | 3 | Carrusel, antes y después |
| Reseñas | 4 | Carrusel |
| Planes y precios | 2 | — |
| Preguntas frecuentes | 2 | Acordeón |
| Equipo | 2 | — |
| Nosotros | 3 | — |
| Contacto | 3 | Formulario, mapa |
| Llamado a la acción (`cta`) | 6 | Una variante con formulario |
| Pie de página | 2 | — |

<p class="tbl-note">14 tipos, 57 variantes. La columna de la derecha es la lista de tentaciones.</p>

## Lo que parecía necesitar JS y no

Cada componente que «obviamente» necesitaba JavaScript tuvo una respuesta en HTML o en CSS. Algunas son conocidas; lo que me costó fue ver los detalles que hacen que funcionen bien.

| Componente | Cómo se resolvió | El detalle que importa |
| --- | --- | --- |
| Carruseles (galería, catálogo, reseñas) | `scroll-snap` en CSS | Cada foto ocupa menos que el contenedor para que se asome la siguiente, y la barra de desplazamiento fina queda a la vista: es la única señal de que hay más. |
| Acordeón de preguntas | `<details>` y `<summary>` | Sin `name` compartido: abrir una no cierra la otra, así quien quiera comparar dos respuestas no tiene que ir y volver. |
| Menú con desplegables | `<details>` dentro del `nav` | El `<summary>` es lo único enfocable del disparador, así el teclado recorre todo sin trampas de foco. |
| Formulario de contacto | `<form method="post">` nativo | El servidor responde con un redirect 303 de vuelta a la misma página, y la validación de obligatorio y correo la hace el navegador. |
| Selector de idioma | Un `<a>` con `hreflang` | Cambiar de idioma es ir a otra URL. No hay estado que guardar. |
| Antes y después | Dos fotos lado a lado | No es un deslizador: un par visible no necesita arrastrar nada. |
| Pasos numerados | `counter` de CSS | El número no es un campo: si se borra un paso, los demás se renumeran solos. |

<p class="tbl-note">Ninguna sección necesitó una isla de hidratación.</p>

```css
/* Simplificado: un carrusel sin JavaScript. */
.track {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;          /* la barra se queda: es la pista */
}
.slide {
  flex: 0 0 auto;
  width: min(82%, 22rem);         /* siempre se asoma la siguiente */
  scroll-snap-align: start;
}
@media (prefers-reduced-motion: no-preference) {
  .track { scroll-behavior: smooth; }
}
```

El carrusel también tiene que poder usarse con teclado. La pista lleva `role="region"`, un `aria-label` y `tabindex="0"`. Sin ese `tabindex`, la pista no recibe foco y quien navega con teclado no puede moverla con las flechas: se queda viendo las dos primeras fotos y nada más. No tiene flechas ni puntos: se mueve con el dedo, la rueda, el trackpad o el teclado.

```html
<!-- Simplificado: preguntas frecuentes sin JavaScript -->
<details>
  <summary><h3>¿Hacen envíos a domicilio?</h3></summary>
  <p>Sí, en toda la ciudad. Pide por WhatsApp.</p>
</details>
```

Con `<details>`, el acordeón abre y cierra solo, responde a Enter y a Espacio, y un lector de pantalla anuncia si está abierto o cerrado sin que haya que escribir un solo `aria-expanded`. El título va dentro del `summary` para que la jerarquía de encabezados de la página siga siendo correcta.

## Lo que dejé fuera por la misma regla

La regla no solo resolvió componentes; también descartó algunos. El catálogo original tenía una variante de contacto con mapa. Un mapa embebido de Google es un `<iframe>` que trae varios cientos de kilobytes de JavaScript de un tercero, cookies de terceros y una petición en el camino crítico del primer pintado. Lo cambié por una variante que muestra la dirección como texto, con un enlace que abre la app de mapas del teléfono.

- Una imagen de mapa estática habría sido cero JavaScript, pero exige proveedor, clave de API, cuota y facturación por sitio publicado: una pieza nueva y un costo variable por cliente para algo que el enlace ya resuelve.
- Lo que se pierde es ver la ubicación de un vistazo sin salir del sitio. Para un negocio de barrio, cuya dirección el visitante conoce más o menos, es un costo bajo. Y en el móvil, donde se ve la mayoría de estos sitios, abrir la app de mapas es mejor experiencia que un mapa de 300 píxeles.
- El hero con video quedó como decisión abierta: no hay todavía un manejo de video, y embeber YouTube choca con la misma regla de no cargar JavaScript de terceros.

## Dónde sí hay JavaScript

Lo que sí necesita JavaScript es el editor, y ahí está. La vista previa del editor es un `<iframe>` que se sincroniza con el panel por `postMessage`: cuando cambias un texto, se ve al instante. Esa vista previa usa los mismos componentes que el sitio público, a propósito, para que lo que ves al editar sea exactamente lo que se publica. Lo único que cambia es la ruta: la del editor se sirve con JavaScript y la del sitio público, sin.

```ts
// Simplificado: el sitio público, sin scripts; la vista previa, con.
export default defineNuxtConfig({
  routeRules: {
    "/site-render/**": { noScripts: true },
    // "/preview/**" no entra: el editor necesita postMessage
  },
});
```

Un efecto lateral simpático: en la vista previa del editor el formulario de contacto se ve pero no envía. No tendría sentido que el dueño se mande mensajes a sí mismo mientras edita.

## El bug que se fue con el JavaScript

Para entender este bug hay que saber cómo se sirve un sitio. Una sola aplicación atiende el panel, la landing y todos los sitios de clientes. Cuando llega una visita a `{slug}.rapisites.com` o al dominio propio del cliente, un middleware mira el `Host`, resuelve qué sitio es y renderiza la página desde una ruta interna (`/site-render/{id}/…`). Después devuelve ese HTML en la URL que pidió el visitante.

Lo de la ruta interna tiene su propia historia: la técnica que suele recomendarse para esto es reescribir la URL de la petición en el mismo proceso, y con Nitro no funciona, porque captura la ruta una sola vez al principio y la vuelve a imponer en cada capa. Lo confirmé leyendo el código de `h3` y probando contra un servidor real. Así que el middleware hace un pedido HTTP interno de verdad.

Cuando el sitio público todavía hidrataba, eso tenía una consecuencia: el router del lado del cliente comparaba la ruta con la que se había renderizado la página (la interna) con la URL del navegador (la real), veía que no coincidían y «corregía» la barra de direcciones hacia `/site-render/{id}/…`. El visitante veía una dirección que no debía existir.

Lo interesante es cuándo apareció: la primera vez que el stack de producción se sirvió por HTTPS con un dominio de verdad y un navegador. Hasta ahí lo había probado con `curl`, y con `curl` todo se veía bien, porque `curl` no ejecuta JavaScript. En la misma prueba salió otro bug: el `canonical`, el `hreflang`, el sitemap y Open Graph salían con `http://`, porque el pedido interno viaja por HTTP y no se estaba reenviando el protocolo original.

- El protocolo se arregló reenviando `x-forwarded-proto` junto con el host.
- La URL se arregló de raíz sirviendo el sitio público sin scripts: sin hidratación no hay router que corrija nada. El sitio de todas formas no tenía ninguna interacción de cliente, así que no se perdió nada, y de paso es más rápido.
- El middleware también avisa a la página que está en su dominio real, para que los enlaces del menú salgan como rutas limpias (`/servicios`) y no con el prefijo interno.
- Y quedó una prueba end-to-end que recorre ese camino en un navegador real, que era justo el hueco por donde se habían colado los dos.

No fue el único bug de esa familia. Como el sitio público no carga el CSS del panel, tampoco recibe el reset de estilos que este trae. Sin él, un contenedor con ancho del 100 % más relleno medía más que la pantalla y el móvil se desplazaba hacia los lados. En desarrollo no se veía, porque el entorno de desarrollo inyecta ese reset igual. En la vista previa del editor tampoco, porque hereda el CSS del panel. Solo aparecía en el sitio real, servido en un build de producción. La lección es la misma: el camino real es el único que cuenta.

## El resto del rendimiento

Sin JavaScript es la parte más visible, pero no la única. Todo esto viene horneado, el cliente no configura nada:

| Pieza | Cómo está hecha |
| --- | --- |
| HTML | Renderizado en el servidor y guardado en caché por dominio y ruta. La caché se invalida al publicar, así que el visitante recibe, en la práctica, HTML estático. |
| CSS | El de cada sección va en línea en el HTML. El CSS del panel (Tailwind completo, 43 KB) se cargaba como `<link>` bloqueante en el sitio público sin usar una sola clase; ahora solo lo importan las pantallas del panel. |
| Fuentes | Propias, sin servicios externos. Se precarga solo la familia que usa ese sitio: un archivo si el título y el texto comparten familia, dos si no. |
| Imágenes | En AVIF, WebP y JPEG, en anchos de 400, 800, 1200 y 1920 px, con `srcset` y dimensiones explícitas. Carga diferida en todas salvo la del hero, que además se pide con prioridad alta. |
| Movimiento | Las transiciones solo animan transformaciones, opacidad o color, ninguna dura más de 300 ms y todas respetan `prefers-reduced-motion`. |
| Terceros | Ninguna librería ni script de terceros en el sitio público. |

<p class="tbl-note">Las reglas de CSS se comprueban con un test que lee el código fuente de cada sección.</p>

Hay dos tests que corren sobre el catálogo entero. Uno renderiza cada sección a HTML y verifica que haya contenido visible, `alt` y dimensiones en cada imagen y un solo `h1` cuando corresponde. El otro lee el CSS de cada sección y verifica que no haya colores literales, márgenes verticales propios ni animaciones de más. Con 57 componentes, revisar a ojo no alcanza.

<figure>
  <img srcset="/img/projects/rapisites/03-800.webp 800w, /img/projects/rapisites/03-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/03-1600.webp" alt="Un sitio generado para un estudio de fotografía, «Estudio Cauce». Galerías, secciones y formulario, sin un solo script." loading="lazy" decoding="async" />
  <figcaption>Un sitio generado para un estudio de fotografía, «Estudio Cauce». Galerías, secciones y formulario, sin un solo script.</figcaption>
</figure>

## Lo que le diría a alguien que quiere hacer lo mismo

- Antes de instalar una librería para un componente, busca la versión nativa: `scroll-snap`, `<details>`, un `<form>` de verdad, un enlace. Casi siempre existe y casi siempre es más accesible de fábrica.
- Cuando la versión nativa no alcanza, pregúntate si el componente hace falta. A veces la respuesta correcta es un enlace a otra app, como el mapa.
- Separa dónde necesitas JavaScript (el editor) de dónde no (el sitio público), aunque compartan componentes.
- Prueba el camino real: dominio real, HTTPS, navegador real, build de producción. `curl` y el entorno de desarrollo esconden justo los bugs que importan.
- Convierte las reglas en tests que recorran todo el catálogo. Una regla que se revisa a mano se rompe en la sección 40.

> Lo que me llevo: una restricción fuerte simplifica más de lo que limita. Cada componente nuevo tiene que resolverse con HTML y CSS, y casi siempre se puede. Y cuando no se puede, la restricción te obliga a preguntarte si el componente hacía falta.
