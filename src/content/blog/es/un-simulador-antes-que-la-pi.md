---
title: "Un simulador antes que la Raspberry Pi"
description: "Por qué construí un simulador del player antes de hacer las apps: once tamaños a la vez, otro origen, cortes de red y cambios de escena."
date: 2026-10-12
tags: [herramientas, dx, wink]
projects: [wink-studio]
kind: learning
keyword: "simulador"
---

La forma obvia de probar una app de [Wink](/project/wink-app) es subirla, ponerla en un layout y mirarla en una pantalla con una Raspberry Pi. Funciona, pero es lento: cada cambio es un build, una subida y un viaje hasta la pantalla. Y una pantalla solo muestra un tamaño a la vez.

El panel de [Wink](/project/wink-app) tampoco alcanzaba para desarrollar. Su vista previa de una app es una tele de proporción fija, de unos 430×270, así que la app se ve siempre en su versión tarjeta. Y el editor de layouts sí muestra la app en vivo al tamaño del elemento, pero no acepta `localhost`: para ver un cambio, primero hay que publicarlo.

Así que antes de hacer las apps, armé el simulador. En el plan del repo fue la fase 3: primero el repo con sus reglas, después el SDK y el tema, después el simulador, después la certificación, y recién ahí la primera app, el Clima.

<figure>
  <img srcset="/img/projects/wink-studio/sim-all-800.webp 800w, /img/projects/wink-studio/sim-all-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/sim-all-1600.webp" alt="El simulador con Menú del día: los ajustes a la izquierda y la app en varios tamaños a la vez." loading="lazy" decoding="async" />
  <figcaption>El simulador con Menú del día: los ajustes a la izquierda y la app en varios tamaños a la vez.</figcaption>
</figure>

## Cómo arranca

`npm run dev <app>` levanta Vite como siempre, con un plugin que solo existe en desarrollo. La app se sirve en `http://127.0.0.1:5180/` y el simulador en `http://localhost:5180/__wink/`. El simulador lee el `wink-app.json` de la app y con eso arma todo lo demás: la lista de ajustes, los valores por defecto y el formulario. Si no puede leer el manifiesto, lo dice en pantalla en vez de quedarse en blanco.

## Todos los tamaños a la vez

La vista principal carga la app en once iframes, cada uno al tamaño real de su elemento: pantalla completa, vertical, tira, tira baja, media pantalla, cuadrado, tarjeta, chico, el mínimo del editor (60×30), tira vertical y 4K. Son los mismos once tamaños que usa la certificación.

Un iframe de 3840×2160 no entra en una laptop, así que cada uno se escala con `transform` para caber en su recuadro. La escala nunca agranda: un 240×120 se ve a su tamaño real, no estirado.

```ts
// Escala para que un iframe de w×h entre en su recuadro (simplificado)
function fitScale(w: number, h: number, boxW: number, boxH: number) {
  return Math.min(1, boxW / w, boxH / h);
}

iframe.style.width = `${w}px`;   // la app ve su tamaño real
iframe.style.height = `${h}px`;
iframe.style.transform = `scale(${fitScale(w, h, 380, 260)})`;
```

Esto importa: la app no ve un iframe chiquito, ve 3840×2160. Su clase de tamaño, sus medidas y su CSS son los de la pantalla real. Encima de cada recuadro, el simulador escribe el tamaño, la clase que le toca y la escala («1920×360 · tira · al 20 %»), y abajo, el estado de esa copia.

Así un cambio de CSS se ve en todos los tamaños al mismo tiempo. Si arreglar la tira rompe la vertical, me entero en el momento y no en la certificación. También se puede ver uno solo, en grande, o uno a medida, desde 60×30 hasta 7680 de lado.

## Desde otro origen, como el player

En producción la app corre en un iframe de otro sitio: la app vive en el hosting y el player en su propio origen. Si en desarrollo la cargo desde el mismo origen, hay cosas que funcionan y después fallan: acceder a la ventana de arriba, compartir almacenamiento, ciertos mensajes.

La solución fue barata: el simulador vive en `localhost` y la app en `127.0.0.1`. Para el navegador son orígenes distintos, así que lo que no funcionaría en el player tampoco funciona acá. Y el iframe se crea con los mismos atributos que usa el player: los mismos permisos (`autoplay`, `encrypted-media`, `picture-in-picture`), `scrolling="no"` y sin `sandbox`.

## Hablar como el player

El player y la app se comunican con `postMessage`. El simulador manda y escucha los mismos mensajes del protocolo:

| Mensaje | Dirección | Qué hace el simulador |
| --- | --- | --- |
| `wink:context` | Player → app | Lo manda al cargar cada iframe: tamaño del elemento, zona horaria, idioma, red y versión. Se puede apagar para probar la app sin player |
| `wink:online` | Player → app | Lo manda al apagar «Con red» |
| `wink:ready` | App → player | Mide cuánto tardó la app en pintar desde que se creó el iframe. Más de 1 s, se marca como lenta |
| `wink:error` | App → player | Muestra el código: `data_unavailable`, `render_failed` o `settings_invalid` |
| `wink:heartbeat` | App → player | Cuenta los latidos de cada copia (la app manda uno por minuto) |

Si a los tres segundos no llegó `wink:ready`, el simulador marca esa copia como «No avisó que cargó», que es como lo tomaría el player. Cada estado se ve con un color: verde si está lista a tiempo, amarillo si fue lenta, rojo si no avisó o mandó un error. Todo queda además en un registro abajo, con la hora, el tamaño y el tiempo de cada uno, hasta las últimas 200 líneas.

Los mensajes solo se aceptan si vienen del origen de la app y de uno de los iframes que el simulador creó. Es lo mismo que hace el SDK del otro lado: la app solo acepta mensajes de su ventana padre y de orígenes de confianza, y responde a ese origen, nunca a `*`.

## Lo que pasa en una pantalla de verdad

Una app en un layout no carga una vez y ya. El simulador tiene botones para lo que le pasa en el día:

- Cambio de escena: destruye cada iframe y lo vuelve a crear 300 ms después, en frío, como cuando el layout rota.
- Transición fade: crea una segunda copia encima, la hace aparecer con un fundido de 700 ms y recién entonces quita la primera. Durante ese tiempo hay dos copias vivas, como en el player.
- Recargar: vuelve a armar todos los recuadros.
- Abrir la app sola: la abre fuera del simulador, sin player.

Y en la barra lateral, un grupo «Player» con lo que el player controla:

- Simular el player: apagado, no se manda `wink:context` y la app arranca sola, como con un player viejo.
- Con red: apagado, manda `wink:online` en falso.
- Zona horaria de la pantalla: 14 para elegir, de Tegucigalpa a Madrid y UTC, porque el equipo real no tiene una configurada.
- Idioma: 10, del español de varios países al inglés.
- Versión del catálogo (`?v=`): al cambiarla, el iframe se recarga, como cuando se publica una versión nueva.

Los ajustes de la app, en cambio, se editan en vivo: cambiar un texto o un color solo cambia el fragmento `#wink=` de la URL, y la app se actualiza sin recargar. Todo lo que elijo se guarda por app en el navegador. Si lo guardado ya no vale (una ciudad u opción que dejó de existir), se descarta al abrir.

<figure>
  <img srcset="/img/projects/wink-studio/sim-one-800.webp 800w, /img/projects/wink-studio/sim-one-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/sim-one-1600.webp" alt="Un solo tamaño, en grande, con el formulario de ajustes al lado." loading="lazy" decoding="async" />
  <figcaption>Un solo tamaño, en grande, con el formulario de ajustes al lado.</figcaption>
</figure>

## Ajustes grandes, como los arma el servidor

Los ajustes viajan en la URL, pero solo si caben en 1 KB codificados. Si no (un menú de 40 platillos no cabe), la URL lleva solo el id de la instancia y una revisión, y la app los pide a la API de [Wink](/project/wink-app). El simulador imita eso: cada cambio sube la revisión, guarda los ajustes en una API falsa propia y, si pasan de 1 KB, la app los pide ahí. Así la ruta de los ajustes grandes se prueba todos los días, no solo cuando un cliente escribe mucho.

```ts
// La URL de la instancia (simplificado)
const completo = encodeWinkHash({ s: ajustes, i: instancia, r: revision });
const cabe = completo.length - "#wink=".length <= 1024;
const url = `${origen}/?v=${version}${cabe ? completo : encodeWinkHash({ i: instancia, r: revision })}`;
```

## Datos de mentira que se portan como los de verdad

Algunas apps leen la API del propio cliente (el Tablero de salidas, la Agenda, el Turnero, Pedido listo). Para desarrollarlas sin esa API, el simulador sirve tres cosas, todas desde el mismo servidor pero con CORS, como si fueran de otro sitio:

- Una API de ejemplo: los JSON de `test/fixtures/` de la app, en `/__wink/ejemplo/<archivo>.json`. Pueden traer marcas como `{{hora+20}}`, que se reemplazan por la hora de 20 minutos después de arrancar, así el Tablero tiene salidas de hoy y los estados cambian solos con el reloj.
- Un buzón: un `POST` a `/__wink/buzon/<nombre>` guarda un JSON y un `GET` devuelve el último (o 204 si no hay). Con eso pruebo los turnos «enviados» al Turnero con un `curl`.
- «Probar conexión»: un botón debajo del ajuste de la dirección de la API que dice si responde, en cuánto, si es JSON y qué campos trae, con mensajes para quien configura la pantalla, no para un programador. Si la dirección es `http`, explica que desde la pantalla solo se puede pedir a `https`.

## Cómo la va a ver el cliente

La tercera vista, «En el panel», muestra la app como la va a ver un cliente en el catálogo: la tarjeta con el logo, la descripción corta, el sello de [Wink](/project/wink-app) y el aviso de «Necesita internet» si corresponde; la ficha con la vista previa, «Qué incluye», «Ideal para» y las novedades de las últimas tres versiones; y el formulario para agregarla, con el nombre, los ajustes y una vista previa que cambia de tamaño. Está armada con los componentes del panel, portados para el simulador, así que lo que veo se parece a lo que va a ver el cliente.

Las novedades salen del `CHANGELOG.md` de la app: cada versión lleva una línea `> …` con la nota para los clientes, de hasta 500 caracteres. Si falta, la ficha del simulador lo marca.

## Lo que el simulador no es

El simulador no reemplaza a la Pi ni a la certificación:

- Cortar la red ahí solo le avisa a la app. El corte de verdad se prueba en la certificación y en el equipo.
- Los tiempos en desarrollo son más altos que en el build, porque Vite sirve los módulos sueltos. Un «lenta» en el simulador no siempre es lenta.
- Corre en el navegador de la computadora, no en el Chromium 134 de la Pi, y con la CPU de una computadora.

Es una herramienta para iterar rápido, no para dar el visto bueno. El visto bueno lo da la certificación, y antes de publicar, una hora en una Pi de verdad.

## Lo que le diría a alguien que está por hacer lo mismo

- Si tu producto corre dentro de otro (un iframe, un webview, un player), simula el anfitrión antes de escribir el producto. Cada regla del anfitrión que no simulas es una sorpresa en producción.
- Usa los tamaños reales y escala la vista, no al revés. Si la app ve un iframe chico, estás probando otra app.
- Separa los orígenes en desarrollo. `localhost` contra `127.0.0.1` cuesta una línea.
- Haz que el simulador hable el mismo protocolo, con los mismos tiempos límite. Si el player espera 3 s, el simulador también.
- Pon botones para lo raro: destruir, duplicar, cortar la red, cambiar la hora. Lo raro en desarrollo es lo normal en una pantalla 24/7.
- Ten claro qué no prueba tu simulador, y escríbelo.

> Lo que me llevo: construir la herramienta antes que el producto se siente lento la primera semana. Después, cada app salió más rápido y con menos sorpresas en la pantalla real.
