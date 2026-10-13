---
title: "Una app, once pantallas: diseñar de 60×30 a 4K"
description: "Cómo diseño las apps de Wink para que la misma app se vea bien en una pantalla completa, en una tira de 1920×360 y en un recuadro de 60×30."
date: 2026-10-12
tags: [diseño, css, wink]
projects: [wink-studio]
kind: learning
keyword: "11 tamaños"
---

Cuando una empresa agrega una app de [Wink](/project/wink-app) a su pantalla, no elige solo la app: elige dónde va. Puede ocupar toda la pantalla, una mitad, una tira abajo de un video o un recuadro chiquito en una esquina. Y la pantalla puede estar horizontal o vertical.

En el editor de layouts de [Wink](/project/wink-app) un elemento mide como mínimo 60×30 y no tiene máximo: los lienzos van de 1920×1080 por defecto hasta 7680 en los personalizados. La vertical es vertical de verdad (el player rota la salida, así que la app ve un viewport alto), y dentro de grupos o en videowalls el iframe se puede escalar de forma no uniforme. O sea: la app no sabe de antemano ni su tamaño ni su proporción.

Así que «la app» no es un diseño: son muchos. Para tener una referencia fija, la certificación de Wink Studio revisa cada app en once tamaños que salen de los presets del editor y de los elementos típicos que se arman en un layout:

| Tamaño | Nombre | Clase |
| --- | --- | --- |
| 60×30 | Mínimo del editor | mini |
| 240×120 | Chico | mini |
| 480×270 | Tarjeta | tarjeta |
| 600×600 | Cuadrado | tarjeta |
| 960×540 | Media pantalla | completa |
| 1920×1080 | Pantalla completa | completa |
| 1080×1920 | Vertical | completa |
| 3840×2160 | 4K | completa |
| 1920×360 | Tira | tira |
| 1000×180 | Tira baja | tira |
| 360×1920 | Tira vertical | tira |

<p class="tbl-note">Los 11 tamaños de la certificación y la clase que les toca.</p>

<figure>
  <img srcset="/img/projects/wink-studio/sizes-800.webp 800w, /img/projects/wink-studio/sizes-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/sizes-1600.webp" alt="Menú del día en 8 de los 11 tamaños, a escala real entre ellos." loading="lazy" decoding="async" />
  <figcaption>Menú del día en 8 de los 11 tamaños, a escala real entre ellos.</figcaption>
</figure>

## No diseñar 11 pantallas, sino 4 clases

Diseñar once layouts a mano no escala, y tampoco sirve diseñar uno y achicarlo: a 240×120 un menú entero achicado es ilegible. Lo que hice fue agrupar los tamaños en cuatro clases según su forma, no según sus píxeles:

- Tira: es más de tres veces más larga que alta (o más alta que larga, si es vertical) y su lado largo mide al menos 480. Entra una sola línea, o una sola columna.
- Mini: el lado corto mide menos de 240 y no es tira. Entra un solo dato.
- Completa: el lado corto mide al menos 540 y el largo al menos 960. Entra todo.
- Tarjeta: lo que queda en el medio, como un cuadrado de 600×600 o un 480×270. Entra lo principal.

El orden de las reglas importa. La de tira se revisa primero: una franja de 1000×180 tiene el lado corto debajo de 240, así que por la regla de mini sería mini, pero ahí entra perfecto una línea completa con todo lo importante. Por eso la tira gana. El piso de 480 en el lado largo existe por el caso contrario: un 400×100 también es más de tres veces más largo que alto, pero es tan chico que no le cabe una línea útil; ese queda como mini.

```ts
// Clase de tamaño (simplificado)
function sizeClass(w: number, h: number) {
  const corto = Math.min(w, h);
  const largo = Math.max(w, h);
  if (largo / corto > 3 && largo >= 480) return "tira";
  if (corto < 240) return "mini";
  if (corto >= 540 && largo >= 960) return "completa";
  return "tarjeta";
}
```

El SDK mide la caja de la app, decide la clase y la escribe en el `<html>` como `data-wk-size`, junto con `data-wk-orientation` (`portrait` si es más alta que ancha). Las apps no calculan su tamaño por su cuenta: el CSS se acomoda a la clase, y todas lo deciden con la misma regla. Si la caja cambia de tamaño, el SDK solo reescribe los atributos cuando cambia la clase o la orientación, para no provocar trabajo de más.

Lo que cambia entre clases es qué se muestra, no solo el tamaño. En el Clima, por ejemplo, la guía de diseño lo deja escrito así:

| Clase | Qué muestra el Clima |
| --- | --- |
| Completa | Ciudad, fecha y hora; temperatura grande con el ícono; el detalle; las próximas horas y los próximos días |
| Tarjeta | Temperatura y estado (o el aviso corto), más los días si hay lugar |
| Tira | Alterna cada 12 s entre «ahora» y el pronóstico, en una línea |
| Mini | Temperatura e ícono, alternando con el pronóstico |

## Medir con la caja, no con la pantalla

La app vive en un iframe que casi nunca ocupa toda la pantalla, así que `vw` y `vh` mienten: miden algo que no es la app. Por eso la regla es que el contenedor raíz lleva `container-type: size` y todo se mide en unidades de contenedor (`cqmin`, `cqw`, `cqh`). Nada de píxeles fijos para medidas de diseño. La certificación busca `vw`/`vh` en el CSS y los marca para revisar.

Cuál unidad usar depende de la clase. En completa y tarjeta, `cqmin` (el lado más corto) da proporciones que funcionan tanto en horizontal como en vertical. En una tira horizontal lo que manda es la altura, así que la letra va en `cqh`; en una tira vertical manda el ancho, y va en `cqw`. La plantilla de las apps ya trae ese patrón:

```css
/* Simplificado */
.app { container-type: size; padding: 6cqmin; }
.titulo { font-size: 12cqmin; }

html[data-wk-size="mini"] .app { padding: 4cqmin; }
html[data-wk-size="mini"] .titulo { font-size: 28cqmin; }
html[data-wk-size="mini"] .meta { display: none; }

html[data-wk-size="tira"] .titulo { font-size: 45cqh; }
html[data-wk-size="tira"][data-wk-orientation="portrait"] .titulo {
  font-size: 22cqw;
}
```

Con eso la misma tipografía se ve proporcionada a 960×540 y a 4K, sin breakpoints de por medio. Los márgenes siguen la misma lógica: 6 `cqmin` por dentro, 4 en mini, y los espacios entre bloques también en `cqmin`. Los breakpoints quedan para lo que de verdad cambia: qué se muestra.

## Qué se queda en cada clase

Esta es la parte de diseño, y no la resuelve ninguna regla de CSS: hay que decidir, app por app, qué es lo esencial. Así quedó en cuatro de las apps:

| App | Completa | Tarjeta | Tira | Mini |
| --- | --- | --- | --- | --- |
| Menú del día | Tablero por categorías y panel de destacados | El tablero con letra más grande, sin destacados | Un platillo a la vez, cada 6 s | Nombre y precio |
| Turnero | El llamado y los anteriores | El llamado y uno o dos anteriores | El llamado en línea y los anteriores como fichas | Solo el llamado |
| Pedido listo | En preparación y listos, en dos columnas | Igual, más compacto | Solo los listos, en fila | El último listo |
| Avisos | Encabezado, el aviso con su ícono y el pie | El aviso y el pie | El aviso en una franja | Ícono y título |

La pregunta que me hago en cada una es: si alguien mira esta caja medio segundo al pasar, ¿qué tiene que llevarse? En el Clima es la temperatura, en el Turnero el turno llamado y en el Menú el precio. Lo que no pasa esa prueba se va primero cuando la caja se achica.

La orientación también cambia el acomodo, no solo el tamaño. En Menú del día el panel de destacados va a la derecha en horizontal y arriba en vertical. En Pedido listo, cuando la caja es vertical o casi cuadrada, las columnas se apilan con los listos arriba, porque eso es lo que la gente busca.

## Cuando la caja es más chica que la app

Cada app declara en su manifiesto su tamaño mínimo útil. Menú del día dice 200×80: debajo de eso no hay forma honesta de mostrar un platillo. Pero el editor permite 60×30, así que alguien lo va a poner ahí. La regla es que debajo del mínimo la app no se rompe: muestra el logo o nada, pero sin desbordes ni scroll. La certificación lo trata distinto: en un tamaño debajo del mínimo no exige que se vea algo, pero sí que nada se salga.

## Medir de verdad

Las clases resuelven la forma, pero no el contenido. Un menú de 6 platillos y uno de 40 no pueden usar la misma letra. Varias apps miden el texto antes de decidir: Menú del día reparte los platillos en columnas y páginas con un medidor, de modo que un menú corto agranda la letra hasta llenar la pantalla y uno largo rota por páginas, sin partir nunca una palabra. Avisos elige el tamaño de letra más grande con el que el aviso sigue entrando, con una búsqueda binaria:

```ts
// La escala más grande que todavía entra (simplificado)
function largestFit(entra: (s: number) => boolean, min: number, max: number) {
  if (entra(max)) return max;
  if (!entra(min)) return min;
  let lo = min, hi = max;
  for (let i = 0; i < 6; i++) {
    const mid = (lo + hi) / 2;
    if (entra(mid)) lo = mid; else hi = mid;
  }
  return lo;
}
```

Para nombres de una sola línea hay otra herramienta: achicar la letra lo justo para que entre, con un piso de 60 % del tamaño original. Así el Clima muestra «Santa Rosa de Copán» completo en vez de cortarlo. Y para grillas de tarjetas (el Turnero, Pedido listo) hay una función que prueba cada número de columnas y se queda con el que deja las tarjetas más grandes, premiando mostrar más.

Medir tiene una trampa que me encontré en el CI: si mides el texto antes de que llegue la fuente, mides con la fuente de respaldo. Cuando llega la real, el texto crece y se pasa del lugar hasta la siguiente medición. En el CI de Linux, el menú se encimaba con el pie en 4K por eso. La solución fue cargar la fuente elegida antes de medir, con un tope de 600 ms para no atrasar el primer pintado.

## El texto que no entra

Los textos los escribe el cliente, así que siempre va a haber uno más largo de lo que pensé. La regla es simple: si un texto no entra, se achica o se corta con «…» (`text-overflow` o `line-clamp`). Lo que nunca puede pasar es que quede mocho a la mitad de una letra, encimado con otro o asomándose fuera de la caja.

A veces la solución es escribir otro texto. En el Clima, el aviso de lluvia completo no cabía en la tarjeta sin montarse sobre los días; ahora en tira y tarjeta hay una versión corta del aviso («Lleva paraguas») que ocupa el lugar del estado.

Y eso no lo reviso a ojo: la certificación llena los ajustes al máximo, con acentos y emoji, en cuatro tamaños (480×270, 1920×360, 1080×1920 y 240×120), y en los once tamaños marca cualquier texto cortado sin «…» y cualquier par de elementos que se tapen en más del 20 %. De eso va el siguiente post.

## Lo que le diría a alguien que diseña para muchos tamaños

- Clasifica por forma, no por píxeles. Cuatro clases con reglas claras se razonan; once tamaños sueltos no.
- Que una sola pieza decida la clase. Si cada componente calcula su tamaño por su cuenta, tarde o temprano dos partes de la misma app no van a estar de acuerdo.
- Mide con el contenedor. En cualquier cosa que viva en un iframe, `vw` y `vh` son de otro.
- Decide qué se va primero. El diseño en tamaños chicos es una lista de prioridades, no una versión achicada.
- Prueba con texto feo: largo, con acentos, con emoji, escrito por alguien que no eres tú.
- Ten a la vista todos los tamaños a la vez mientras trabajas. Arreglar la tira y romper la vertical es lo más fácil del mundo si solo miras una.

> Lo que me llevo: diseñar para muchos tamaños no es hacer una pantalla elástica. Es decidir qué importa en cada forma y hacer que el sistema elija la forma solo.
