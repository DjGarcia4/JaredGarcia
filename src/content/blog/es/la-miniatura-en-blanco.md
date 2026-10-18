---
title: "La miniatura en blanco: sandbox, origen nulo y crossorigin"
description: "Rehíce la lista de sitios de RapiSites con una miniatura en vivo de cada uno. Los sitios hechos con Vite salían en blanco o sin estilos. La causa era un atributo de seguridad y otro que Vite pone solo."
date: 2026-10-18
tags: [rapisites, seguridad, ux]
projects: [rapisites]
kind: learning
keyword: "sandbox"
---

La lista de sitios del panel de [RapiSites](/project/rapisites) era una tabla: nombre, dirección, estado, visitas. Funcional, pero para reconocer un sitio había que leer, y los botones de cada fila estaban desparramados. La rehice como una cuadrícula de tarjetas con una miniatura del sitio arriba.

Este post es sobre esa miniatura, y sobre por qué dos de mis propios sitios salían rotos en ella.

## Miniatura en vivo, no capturas

La forma clásica es sacar capturas: un navegador sin pantalla que abre cada sitio al publicar, saca una imagen y la guarda. Funciona, pero trae una pieza nueva que mantener (un Chromium corriendo en el servidor), almacenamiento, y miniaturas viejas cada vez que algo falla.

Elegí la otra: la miniatura **es** el sitio publicado, achicado. Un `<iframe>` de 1280×800 escalado al ancho de la tarjeta:

```vue
<!-- Simplificado -->
<iframe
  :src="src"
  loading="lazy"
  tabindex="-1"
  aria-hidden="true"
  class="pointer-events-none absolute top-0 left-0 origin-top-left"
  :style="{ width: '1280px', height: '800px', transform: `scale(${scale})` }"
/>
```

```js
// La escala sigue al ancho de la tarjeta.
new ResizeObserver(([entry]) => {
  scale.value = entry.contentRect.width / 1280;
}).observe(box.value);
```

- `loading="lazy"`: solo carga las miniaturas que están por aparecer en pantalla.
- `pointer-events: none`, `tabindex="-1"` y `aria-hidden`: no se puede tocar, enfocar ni leer. La tarjeta entera es el enlace.
- Un sitio en borrador, bloqueado o en modo pantalla (que no se deja ver suelto) muestra una portada con su inicial en lugar del iframe.

Hay dos tipos de sitio. Los que genera RapiSites se cargan desde una ruta interna del mismo panel, y no traen JavaScript, así que son livianos. Los que el cliente sube con sus propios archivos traen **su** JavaScript, del que no sé nada. A esos los cargué con su dirección pública y un `sandbox`:

```html
<iframe src="https://su-sitio.rapisites.app/" sandbox="allow-scripts">
```

`allow-scripts` deja correr su JS. Todo lo demás queda bloqueado: abrir ventanas, cambiar la página del panel, enviar formularios. Y sin `allow-same-origin`, me dije, el sitio queda más aislado todavía.

## El síntoma

En mi máquina, la miniatura de los sitios subidos salía en blanco. Lo atribuí a que en local no corre el almacenamiento de archivos, y en parte era cierto. Lo anoté como aviso y seguí.

En producción, con los sitios reales:

| Sitio | Cómo carga su CSS y su JS | Miniatura |
| --- | --- | --- |
| Ebanistería | HTML sin `crossorigin` | Bien |
| Wink Digital | HTML sin `crossorigin` | Bien |
| Este portafolio | Vite, con `crossorigin` | Sin estilos: un SVG gigante y el enlace «Saltar al contenido» en azul |
| [SwiftFlow](/project/swiftflow-typing-test) | Vite, con `crossorigin` | En blanco |

<p class="tbl-note">El patrón estaba en la segunda columna.</p>

Abiertos directo en el navegador, los cuatro funcionaban. Solo se rompían dentro de la tarjeta.

## La causa: un origen nulo y un atributo que Vite pone solo

Un iframe con `sandbox` y **sin** `allow-same-origin` no tiene el origen de su dirección. Tiene un origen opaco, que el navegador escribe como `null`. Para el sitio de adentro, todo pedido a su propio servidor pasa a ser un pedido de otro origen.

Eso a un HTML simple no le importa: un `<link rel="stylesheet">` o un `<script>` clásico se cargan aunque vengan de otro origen. Pero Vite genera esto:

```html
<script type="module" crossorigin src="/assets/index-CeZpE2nE.js"></script>
<link rel="modulepreload" crossorigin href="/assets/vendor-vue-CJobXzRY.js">
<link rel="stylesheet" crossorigin href="/assets/index-Bg4-nhXA.css">
```

`crossorigin` (y `type="module"`, que siempre se pide así) le dice al navegador que cargue el archivo en modo CORS. El pedido sale con `Origin: null`, y el navegador solo usa la respuesta si el servidor contesta con un `Access-Control-Allow-Origin` que la permita. El servidor de los sitios subidos no manda cabeceras CORS. Lo confirmé con `curl`:

```bash
curl -sI -H "Origin: null" https://jared-garcia.com/ | grep -i access-control
# (nada)
```

Resultado:

- **SwiftFlow** es una app de una sola página: sin su JS no hay nada que pintar. En blanco.
- **Este portafolio** se prerenderiza, así que el HTML trae el contenido. Pero el CSS no cargó: de ahí el SVG gigante sin tamaño y el enlace para saltar al contenido, que normalmente está oculto.
- **Los otros dos** no usan `crossorigin`, así que cargaron sin problema.

Lo reproduje con Playwright: una página con los dos sitios en iframes, una fila con `sandbox="allow-scripts"` y otra con `sandbox="allow-scripts allow-same-origin"`. La primera fila salió idéntica a la captura de producción. La segunda, perfecta.

## El arreglo, y por qué es seguro

El arreglo es una palabra: `allow-same-origin`. El iframe vuelve a tener el origen de su dirección, y sus pedidos a su propio servidor son del mismo origen.

Lo que había que pensar es si eso abría un agujero. La advertencia conocida sobre `sandbox` es que `allow-scripts` junto con `allow-same-origin` lo anula. Pero eso pasa solo cuando el documento de adentro es **del mismo origen que la página que lo contiene**: entonces su JS puede meterse en la página de afuera y quitarse el `sandbox` a sí mismo.

Acá no es el caso. El panel vive en `app.rapisites.com`. Un sitio subido vive en `rapisites.app` (otro dominio registrado, justamente para esto) o en el dominio propio del cliente. Con `allow-same-origin` el sitio tiene **su** origen, no el del panel, y la política del mismo origen sigue impidiendo que toque el panel. El `sandbox` sigue bloqueando ventanas emergentes, navegar la pestaña y enviar formularios.

| Alternativa | Por qué no |
| --- | --- |
| Mandar `Access-Control-Allow-Origin` en los sitios subidos | Cambia cómo se sirven todos los sitios de todos los clientes para arreglar una miniatura del panel. |
| Quitar el `sandbox` | Pierdo el bloqueo de ventanas y de navegación, que es lo que importa de un JS que no controlo. |
| Volver a las capturas | Una pieza entera de infraestructura para algo que se arregla con un atributo. |

<p class="tbl-note">Todas resolvían el síntoma; ninguna era mejor que la palabra que faltaba.</p>

## Un detalle que ya estaba bien

Cada miniatura es una carga real del sitio. Con la analítica de visitas recién estrenada, me preocupó que cada vez que alguien abre su panel se contaran visitas falsas. No pasa: la visita solo se cuenta cuando el navegador pide la página como documento principal, y el pedido de un iframe llega con `Sec-Fetch-Dest: iframe`. Esa regla estaba pensada para otra cosa (las apps en pantallas que se recargan solas) y cubrió esta sin tocarla.

## Lo que le diría a alguien que se topa con esto

- Prueba con sitios hechos con las herramientas más comunes, no solo con HTML simple. Mis datos de prueba no tenían `crossorigin`; cualquier sitio de Vite sí.
- Cuando atribuyes un síntoma al entorno («en local no hay almacenamiento»), anota qué esperarías ver si fuera otra cosa. Yo lo dejé como aviso y el bug real llegó a producción.
- `sandbox` sin `allow-same-origin` no es «más seguro» gratis: le da al documento un origen nulo, y eso rompe todo lo que carga con CORS.
- La regla de `allow-scripts` + `allow-same-origin` depende del origen. Contra otro dominio, la política del mismo origen sigue haciendo su trabajo.
- Reproduce lado a lado. Una página con las dos variantes en dos filas convirtió una teoría en una certeza en un minuto.

> Lo que me llevo: un atributo de seguridad que agregas «por las dudas» también tiene efectos. Entiende qué hace antes de sumarlo, no después de que algo se rompa.
