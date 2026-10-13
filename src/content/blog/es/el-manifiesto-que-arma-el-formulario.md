---
title: "El manifiesto que arma el formulario"
description: "Cada app de Wink declara sus ajustes en un JSON y el formulario para editarlos se genera solo. Cómo funciona y por qué los ajustes viajan en el fragmento de la URL."
date: 2026-10-12
tags: [arquitectura, dx, wink]
projects: [wink-studio]
kind: learning
keyword: "manifiesto"
---

Cada app de [Wink](/project/wink-app) se puede ajustar: el Menú tiene sus platillos, el Turnero sus ventanillas y el Clima su ciudad. Si cada app trajera su propio formulario, el panel de Wink tendría diez formularios distintos que mantener, y cada uno se vería un poco diferente.

En vez de eso, la app declara qué ajustes tiene, y el formulario se arma solo a partir de esa declaración. Hoy lo arma el simulador de Wink Studio, con los componentes del panel portados; el panel va a hacer lo mismo cuando el backend lea el manifiesto al publicar, que es una de las piezas que todavía esperan al backend.

## El manifiesto

Cada app trae un `wink-app.json`. Es su ficha técnica y viaja dentro del paquete que se sube: el backend lo va a leer al publicar y el panel lo va a usar para precargar la ficha del catálogo y para pintar el formulario de ajustes de cada cliente. Estos son sus campos principales:

| Campo | Qué es |
| --- | --- |
| `id` | Minúsculas y guiones. No cambia nunca |
| `build` | La versión del código, en semver. La del catálogo (v1, v2…) la pone el backend al publicar |
| `sdk` | La versión del protocolo con el player (hoy, 1) |
| `category` | Una de las nueve categorías del catálogo del panel |
| `network` | `self` (sin internet), u `open` con la lista de hosts a los que pide; o los ajustes donde el cliente escribe la dirección de su API |
| `offline` | Si sigue andando sin red una vez cargada |
| `sizes` | El tamaño mínimo útil y las clases de tamaño que soporta |
| `settings` | Los ajustes que el cliente cambia en cada instancia, hasta 40 |
| `demo` | Valores de ejemplo para la vista previa del catálogo y las capturas |

Un ajuste dice su tipo, su etiqueta, su valor por defecto y sus límites. Un ejemplo simplificado, parecido al de Menú del día:

```json
{
  "settings": [
    { "id": "title", "type": "text", "label": "Título",
      "value": "Menú del día", "max": 40, "group": "Menú" },
    { "id": "accent", "type": "color", "label": "Acento",
      "value": "#f59e0b", "group": "Aspecto" },
    { "id": "items", "type": "list", "label": "Platillos", "max": 40,
      "itemTitle": "name", "itemSubtitle": "category",
      "addLabel": "Agregar platillo",
      "fields": [
        { "id": "name", "type": "text", "label": "Nombre", "max": 40, "required": true },
        { "id": "category", "type": "text", "label": "Categoría", "max": 30 }
      ] }
  ]
}
```

## Catorce tipos, catorce controles

Hay un tipo para cada cosa que una app necesitó. Algunos vinieron con el primer SDK y otros se sumaron cuando una app los pidió: la lista llegó justo antes de Menú del día, la fecha con Avisos y la hora con el Tablero de salidas.

| Tipo | Valor | Control |
| --- | --- | --- |
| `text`, `textarea` | Texto, con `max` obligatorio | Campo de texto |
| `number` | Número entre `min` y `max` | Campo numérico |
| `checkbox` | Sí o no | Interruptor |
| `select`, `segmented` | Una de las opciones | Lista o botones |
| `color` | `#rrggbb` | Selector con la paleta de [Wink](/project/wink-app) |
| `font` | Poppins, Titillium o Inter | Lista |
| `image` | El logo de [Wink](/project/wink-app) o ninguno (el del cliente, cuando el backend sirva imágenes) | Lista |
| `city` | Una de las ciudades del Clima | Lista de ciudades |
| `timezone` | Una zona IANA | Lista |
| `date` | `AAAA-MM-DD` en la fecha de la pantalla, o vacío | Se escribe o se elige en un calendario |
| `time` | `HH:MM` en 24 h, o vacío | Se escribe o se elige de una lista |
| `list` | Elementos con sus propios campos, hasta 60 | Editor de lista |

<figure>
  <img srcset="/img/projects/wink-studio/sim-one-800.webp 800w, /img/projects/wink-studio/sim-one-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/sim-one-1600.webp" alt="El formulario de la izquierda sale del manifiesto de Menú del día: título, subtítulo y la lista de platillos." loading="lazy" decoding="async" />
  <figcaption>El formulario de la izquierda sale del manifiesto de Menú del día: título, subtítulo y la lista de platillos.</figcaption>
</figure>

## Cada tipo, su control

El control depende del tipo, y cada uno resuelve un problema chico que en diez formularios hechos a mano se habría resuelto diez veces, de diez maneras:

- Color: abre un selector de verdad, con su barra de tono, y los doce colores de [Wink](/project/wink-app), con los de la marca primero. Acepta `#08b` o `008BBF` y los normaliza.
- Fecha: se puede escribir como la escribe la gente («1/10/2026», «01-10-26») o elegir en un calendario que empieza en lunes. Por dentro siempre es `AAAA-MM-DD` en hora local, nunca con `toISOString()`: en Honduras, que está en UTC−6, eso corre el día después de las 18:00.
- Hora: acepta «9» como 09:00, «930» como 09:30 y «21.15» como 21:15, o se elige de una lista.
- Lista: tiene su propio editor. Cada elemento muestra un título y un subtítulo tomados de sus campos (el nombre y la categoría del platillo), tiene botones para subirlo, bajarlo o quitarlo, y abajo dice «12 de 40». Al llegar al tope, el botón de agregar se apaga y explica por qué.

Como el control depende del tipo y no de la app, una mejora llega a todas a la vez. Cuando porté el selector de color del panel, el ajuste de color empezó a abrir un selector de verdad en todas las apps con el mismo cambio.

## Secciones y ajustes que aparecen

Treinta ajustes en una sola columna no se pueden usar. Por eso cada ajuste puede decir a qué grupo pertenece («Contenido», «Aspecto», «Pantalla»…) y el formulario los muestra en secciones plegables. Y un ajuste puede depender de otro con `showIf`: en el Turnero, «Un turno cada (segundos)» solo aparece si la fuente es la demostración, y la dirección de la API solo si la fuente es otro sistema con API. `equals` también puede ser una lista, para «si vale cualquiera de estos».

```json
{ "id": "demoEvery", "type": "number", "label": "Un turno cada (segundos)",
  "value": 10, "min": 5, "max": 60, "group": "Turnos",
  "showIf": { "field": "source", "equals": "demo" } }
```

Así quedaron las diez apps:

| App | Ajustes | Con showIf | Red |
| --- | --- | --- | --- |
| Turnero | 34 | 6 | API del cliente |
| Pedido listo | 30 | 6 | API del cliente |
| Cuenta regresiva | 28 | 13 | Sin internet |
| Tablero de salidas | 25 | 5 | API del cliente |
| Agenda del día | 22 | 6 | API del cliente |
| Cumpleaños | 22 | 4 | Sin internet |
| Reloj | 22 | 3 | Sin internet |
| Menú del día | 17 | 2 | Sin internet |
| Avisos | 10 | 0 | Sin internet |
| Clima | 10 | 1 | Sin internet (por ahora, datos de ejemplo) |

<p class="tbl-note">220 ajustes en total, todos con el mismo formulario.</p>

## El manifiesto se valida

Un formulario generado es tan bueno como la declaración que lo genera. Por eso el build valida el manifiesto y, si algo no sirve, falla con un mensaje que dice dónde y qué:

- Los ids de los ajustes van en camelCase y no se repiten.
- Las etiquetas tienen hasta 40 caracteres y las ayudas hasta 120, igual que en la ficha del panel.
- Un texto tiene que declarar su largo máximo (de 1 a 2000).
- Una lista de opciones tiene al menos dos, y el valor por defecto tiene que ser una de ellas.
- Una lista tiene un tope de 1 a 60 elementos y de 1 a 12 campos, y no puede tener otra lista adentro.
- El título y el subtítulo de cada elemento tienen que ser campos que existen, y un `showIf` tiene que apuntar a otro ajuste que existe.
- Con `network: self` la lista de hosts tiene que estar vacía; con `open`, tiene que declarar a quién le pide.

## Los ajustes viajan en el fragmento

Cada vez que una empresa pone una app en su pantalla se crea una instancia con sus ajustes. Esos ajustes viajan en la URL de la app, en el fragmento:

```text
https://<sitio>.rapisites.app/?v=3#wink=<ajustes en base64url>
```

- El fragmento (#…) no viaja al servidor: la app es un sitio estático en [RapiSites](/project/rapisites) y no necesita backend para leer sus ajustes.
- Cambiar el fragmento no recarga la página: la app escucha `hashchange` y se actualiza en vivo.
- `?v=` es la versión del catálogo: cuando cambia, el player recarga el iframe y la app nueva entra sola.

La decisión quedó anotada con su porqué: funciona con todos los players ya instalados, que todavía no saben mandarle mensajes a la app; no pasa por el servidor, y no rompe la caché. Cuando el player tenga su puente de mensajes, los ajustes también van a poder llegar por ahí, y van a mandar sobre los del fragmento.

## Capas, y nada que rompa la app

El SDK junta los ajustes en capas: primero los valores por defecto del manifiesto, encima lo que trae el fragmento y encima lo que mande el player. Cada valor se valida contra su ajuste antes de usarse; si no sirve, se ignora y queda el de la capa anterior. La app recibe valores que siempre tienen sentido:

```ts
// Limpiar un valor contra su ajuste (simplificado)
function limpiar(def, valor) {
  switch (def.type) {
    case "text":  return typeof valor === "string" ? valor.slice(0, def.max) : undefined;
    case "number": return Number.isFinite(valor) ? Math.min(def.max, Math.max(def.min, valor)) : undefined;
    case "color": return /^#[0-9a-f]{6}$/i.test(valor) ? valor.toLowerCase() : undefined;
    case "date":  return valor === "" || esFechaQueExiste(valor) ? valor : undefined;
    // …un caso por tipo
  }
}
```

- Un texto más largo que su máximo se corta al máximo.
- Un número fuera de rango se lleva al límite más cercano.
- Una fecha tiene que existir: el 31 de febrero no pasa.
- Un elemento de lista al que le falta un campo obligatorio se descarta, y la lista se corta en su tope.
- Un id que no está en el manifiesto se ignora.
- Un `#wink=` roto, que no se puede decodificar, se ignora entero y quedan los valores por defecto.

La certificación lo prueba: textos al máximo con acentos y emoji, colores sin contraste, HTML en los textos (que no se ejecuta, porque todo se pinta con `textContent`) y un `#wink=` roto a propósito.

## Cuando los ajustes no caben

El fragmento tiene un límite práctico. La URL de una instancia se copia en cada elemento de cada layout donde está la app, y un menú de 40 platillos con descripciones no es algo que quieras reescribir en todos esos lugares cada vez que alguien cambia un precio. Así que la regla, acordada con el backend, es esta:

- Si los ajustes caben en 1 KB codificados, viajan enteros en el fragmento.
- Si no, el fragmento lleva solo el id de la instancia y una revisión, que sube cada vez que se guardan los ajustes.
- La app pide los ajustes a la API de [Wink](/project/wink-app) con esa revisión, y los guarda en el equipo por revisión: sin red, usa la última que llegó.
- Si el pedido falla, reintenta a los 2, 4 y 8 segundos.
- Las apps esperan a que los ajustes estén listos antes de pintar, para que no se vea un instante con los valores de ejemplo. Si los ajustes vienen en el fragmento, eso es inmediato.

## Lo que no puede ir ahí

Que los ajustes vayan en la URL tiene una consecuencia: cualquiera que vea la URL los ve. Por eso la llave de la API de un cliente nunca va en los ajustes, y en los ajustes no hay ningún tipo para llaves. Las apps que necesitan la API de un cliente con llave, o datos de un proveedor que cobra, esperan a que el backend de [Wink](/project/wink-app) haga de puente. Las que leen una API del cliente sin llave sí funcionan ya: el cliente escribe la dirección en un ajuste de texto declarado en el manifiesto, solo se aceptan direcciones `https` y se piden sin cookies ni encabezados.

Hay un cuidado más. El fragmento puede traer el origen de la API de [Wink](/project/wink-app), pero el SDK solo lo acepta si es un servidor de Wink o un host que la app declaró en su manifiesto. Si alguien cambia ese valor a mano, la app no le manda nada a un servidor cualquiera.

Esa línea, entre lo que se puede hacer ya y lo que necesita backend, la tengo documentada app por app.

## Lo que falta

- Que el backend lea el manifiesto al publicar y el panel arme el formulario con él. Hasta entonces, el formulario generado vive en el simulador.
- Las imágenes del cliente: hoy un ajuste `image` solo puede ser el logo de [Wink](/project/wink-app) o ninguno. Las fotos de los platillos, de los avisos o de las personas en Cumpleaños esperan a que el backend las guarde y las sirva.
- Cargar listas largas de otra forma: escribir 60 cumpleaños a mano es mucho, y la idea es poder pegarlos o subirlos desde una hoja de cálculo.

## Lo que le diría a alguien que está por hacer algo parecido

- Si vas a tener muchos formularios parecidos, describe los datos y genera el formulario. Diseñar los controles una vez sale más barato que mantenerlos diez veces.
- Agrega tipos cuando una app de verdad los necesite, no antes.
- Valida la declaración en el build. Un error en el manifiesto tiene que fallar en tu máquina, no en el panel de un cliente.
- Valida los valores otra vez al leerlos. Lo que viene en una URL puede venir de cualquier lado.
- Decide desde el principio qué nunca puede viajar con los ajustes, y no dejes un tipo que lo permita.

> Lo que me llevo: hacer que la app describa sus ajustes, en vez de dibujarlos, hizo que diez apps se sientan como un solo producto.
