---
title: "Traducir una app que también es contenido: SwiftFlow en inglés"
description: "La base de i18n, el idioma de la app separado del de los textos, gramática que no se traduce palabra por palabra, ¿¡ solo en español, voces de dictado, récords por idioma y enlaces en inglés para compartir."
date: 2026-10-13
tags: [swiftflow, i18n, vue, producto]
projects: [swiftflow-typing-test]
kind: learning
keyword: "i18n"
cover: /img/projects/swiftflow/i18n-en.webp
---

[SwiftFlow](/project/swiftflow-typing-test) nació como «un test de mecanografía en español». Todo estaba escrito para el español: la interfaz, los consejos, los logros y, sobre todo, los textos que se escriben. Agregar el inglés parecía un trabajo de traducción, pero en un test de mecanografía el texto no es solo la interfaz: también es lo que practicas.

Este es el recorrido de esa i18n, hecha en una serie de commits del 25 de septiembre de 2026: qué separé, qué no se podía traducir palabra por palabra y qué tuve que decidir para que los datos de antes siguieran valiendo.

## Dos idiomas que no son lo mismo

La primera decisión fue separar dos ajustes que parecen uno: el idioma de la app y el idioma de los textos para practicar. Puedes tener la interfaz en español y practicar inglés, o al revés. El español sigue siendo el idioma principal.

<figure>
  <img srcset="/img/projects/swiftflow/i18n-idioma-800.webp 800w, /img/projects/swiftflow/i18n-idioma-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/i18n-idioma-1600.webp" alt="El menú «Sonido e idioma» de SwiftFlow abierto, con «Idioma» y «Textos para practicar» como dos selectores separados entre Español y English." loading="lazy" decoding="async" />
  <figcaption>El menú «Sonido e idioma»: «Idioma» cambia la app y «Textos para practicar», lo que escribes.</figcaption>
</figure>

| Es interfaz (se traduce) | Es contenido (cambia de banco) | Es igual en los dos |
| --- | --- | --- |
| Botones, menús, resultados | Palabras, citas, párrafos | Código |
| Consejos de «Qué mejorar» | Clásicos | Números |
| 94 logros, retos, rangos | Dictado y su voz | Mi texto |
| Historial, curso, resumen, landing | El curso y el reto semanal | |
| Títulos de pestaña y de enlaces | | |

<p class="tbl-note">Qué depende de cada ajuste. Los modos con idioma están listados en <code>LANGUAGE_MODES</code>.</p>

El idioma de los textos arranca vacío (`null`), y eso significa «el de la interfaz». Si nunca lo tocas, practicas en el idioma en que lees la app.

## La base: `t()` y un `messages.js` por feature

No usé una librería. La base es un archivo de unas 80 líneas: cada feature tiene su `messages.js` con `es` y `en` lado a lado, y se lee con `t("namespace.ruta")`. La regla del repositorio es que ningún texto de la interfaz va escrito en un componente.

```js
// Simplificado: un mensaje puede ser un texto o una función.
registerMessages("typing", {
  es: { errors: (n) => `${n} ${n === 1 ? "error" : "errores"}` },
  en: { errors: (n) => `${n} ${n === 1 ? "mistake" : "mistakes"}` },
});

export const t = (path, ...args) => {
  const entry = lookup(catalogs[locale.value], path) ?? lookup(catalogs.es, path);
  if (entry === undefined) return path;
  return typeof entry === "function" ? entry(...args) : entry;
};
```

Tres reglas sostienen esto:

- Si falta algo en inglés, se usa el español, que siempre está completo.
- Un test compara la forma de los dos catálogos: mismas claves y, donde una es función, la otra también. No puede quedar un texto sin traducir sin que falle la suite.
- `t()` lee `locale.value`, que es reactivo. Cualquier `computed` o plantilla que lo use cambia de idioma solo, sin recargar.

El idioma inicial sale del navegador: si el primero de `navigator.languages` empieza con `en`, inglés; cualquier otro, español. Un navegador en `es-AR` con inglés de segundo idioma se queda en español. Una vez elegido en el menú, se guarda y también se aplica a `<html lang>`.

## Traducir no es reemplazar palabras

Los consejos de «Qué mejorar» son los textos con más gramática de la app, y ahí traducir palabra por palabra no funcionaba. En español, las teclas llevan artículo y el verbo concuerda con cuántas son. En inglés, la tecla va sola.

| Caso | Español | Inglés |
| --- | --- | --- |
| Una tecla lenta | «Te frena la R» | «R slows you down» |
| Dos teclas lentas | «Te frenan la R y la T» | «R and T slow you down» |
| Coach en vivo | «Se te escapan la A y la S» | «A and S keep slipping» |
| Confusión | «Confundís la E con la R» | «You mix up E and R» |

<p class="tbl-note">Por eso esos mensajes son funciones que reciben la lista de teclas, y cada idioma la arma a su manera.</p>

Ese artículo ya había dado un problema antes del inglés: un consejo que nombraba dos teclas lentas decía «Te frenan la Ñ y Q», como si la segunda fuera un agregado, hasta que un commit del 17 de septiembre hizo que repitiera el artículo: «la Ñ y la Q». Pasar la lista entera a una función por idioma resolvió eso para siempre.

Con los consejos tuve un cuidado especial: la salida en español no podía cambiar ni una coma. Los tests que ya existían comprueban esos consejos palabra por palabra, así que traducir el historial no podía romper el español sin que lo supiera. Los números y las fechas también se formatean según el idioma (`es` o `en-US`): «septiembre de 2026» y «September 2026».

## El contenido: un banco por idioma

El contenido no se traduce: se reemplaza por otro banco escrito para ese idioma. Cada banco elige con una sola función:

```js
// Simplificado: el banco del idioma que se practica.
export const practiceLanguage = ref("es");
export const inPracticeLanguage = (banks) =>
  banks[practiceLanguage.value] ?? banks.es;

export const practiceWords = () =>
  inPracticeLanguage({ es: spanishWords, en: englishWords });
```

Lo que llegó en inglés, contado en el código de hoy:

| Banco | Inglés |
| --- | --- |
| Palabras | 822, más 28 préstamos con tilde |
| Citas | 75 |
| Párrafos | 20 |
| Clásicos | 13 pasajes de 11 autores en dominio público: Austen, Dickens, Melville, Carroll, Charlotte Brontë, Lincoln, Shakespeare, Poe, Blake, Wordsworth y Dickinson |

<p class="tbl-note">El dictado y el curso no tienen banco propio: salen de los párrafos y de las palabras.</p>

<figure>
  <img srcset="/img/projects/swiftflow/i18n-en-800.webp 800w, /img/projects/swiftflow/i18n-en-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/i18n-en-1600.webp" alt="La pantalla de escritura de SwiftFlow en inglés, con el modo Time, 15s, Options y un párrafo en inglés sobre jardinería." loading="lazy" decoding="async" />
  <figcaption>La pantalla de escritura en un navegador en inglés: interfaz y texto en inglés.</figcaption>
</figure>

## ¿¡ en un idioma, no en el otro

El modo Palabras arma oraciones a partir de palabras sueltas: mayúscula al empezar, alguna coma y, de vez en cuando, una pregunta o una exclamación. En español se abren y se cierran; en inglés solo se cierran. Es un cambio de dos caracteres, pero sin él el inglés salía con un «¿» que nadie escribe.

```js
// Simplificado: los signos de apertura dependen del idioma.
const [openQuestion, openExclamation] = inPracticeLanguage({
  es: ["¿", "¡"],
  en: ["", ""],
});
// 15 % preguntas, 12 % exclamaciones, el resto con punto.
// Nunca una coma justo después de la palabra que abre: «¿Dónde, está» se lee mal.
```

Con la puntuación apagada, el formateador quita todo eso, incluidos ¿ y ¡. Que se quitaran los de apertura junto con los de cierre fue un arreglo propio del español, del día que llegaron los Clásicos.

## Tildes: el inglés tiene pocas

El curso tiene una lección de tildes, y el inglés casi no las usa. La solución fue una lista corta de préstamos que el inglés escribe con tilde: «café», «résumé», «fiancé», «cliché», «décor», «entrée»… Así la lección tiene sentido en los dos idiomas sin inventar palabras.

El resto del curso no tuvo que cambiar por idioma. Las lecciones nombran sus teclas por posición (fila y columna), no por letra, porque ya debían adaptarse a la distribución del teclado: en un teclado la fila del medio es A S D F y en Dvorak es A O E U. Solo cambió de dónde salen las palabras reales que aparecen cuando ya hay letras suficientes.

Hay detalles de español que siguen ahí aunque la app esté en inglés: las letras en repaso se ordenan con `localeCompare(…, "es")`, para que la Ñ vaya después de la N y no después de la Z.

## Dictado: elegir la voz

El Dictado usa las voces del sistema con `speechSynthesis`. «Español» no es una sola voz: hay `es-MX`, `es-AR`, `es-ES`, `es-US`… y no todas suenan igual para quien escucha. Por eso la voz se elige con puntos:

| Criterio | Español | Inglés |
| --- | --- | --- |
| Tu variante exacta (la de `navigator.languages`) | +100 | +100 |
| Otra del mismo grupo | +50 si es de Latinoamérica o EE. UU. y tú también | +50 si es `en-US` |
| Respaldo | +20 si es `es-ES` | +20 si es `en-GB` |
| Voz local, sin conexión | +5 | +5 |
| La voz por defecto del sistema | +1 | +1 |

<p class="tbl-note">Si tu variante es de España, <code>es-ES</code> suma 50 en lugar de las latinoamericanas.</p>

Hay dos casos borde más. Las voces pueden llegar un momento después de cargar la página, así que se espera el evento `voiceschanged`, con un tope de 1,5 segundos porque algunos navegadores nunca lo disparan. Y si no hay ninguna voz del idioma, la app lo dice: «Tu navegador no tiene una voz en inglés. Probá con otro navegador, o instalá una voz en inglés desde los ajustes de tu sistema».

El texto dictado también tiene reglas por idioma. Una voz no pronuncia comas ni mayúsculas, así que no se piden. Pero sí distingue «está» de «esta», así que las tildes y la ñ se quedan; en inglés se queda el apóstrofo dentro de la palabra, como en «don't».

## Récords por idioma

Una vez que había partidas en dos idiomas, comparar 25 palabras en inglés con 25 en español no tenía sentido. Todo lo que se compara pasó a ir por idioma: récords, promedios, rondas perfectas, fantasmas y el reto semanal.

```js
// Simplificado: el tipo de sesión incluye el idioma, salvo el español,
// que conserva la clave que tenía antes de que hubiera opción.
export const sessionKind = ({ mode, modeValue, textLanguage }) => {
  const key = `${mode}:${modeValue ?? ""}`;
  return textLanguage && textLanguage !== "es" ? `${key}:${textLanguage}` : key;
};
```

Esa excepción del español se repite en todos lados, y es a propósito. Las sesiones viejas no tienen idioma y son españolas, así que guardan su clave de siempre y nada de lo guardado se pierde. El reto semanal hace lo mismo con su semilla: en español sigue siendo `weekly:<semana>`, y el inglés tiene la suya, así que el texto de una semana ya jugada no cambió.

En el historial aparece un filtro, «Idioma de los textos», y las partidas en inglés se etiquetan como «25 palabras · inglés». Tu resumen solo cuenta un récord si superó lo anterior en el mismo idioma. Hay además una categoría de logros y retos diarios para practicar en los dos.

## Enlaces en inglés y títulos de pestaña

Compartir SwiftFlow con alguien que habla inglés tenía que mostrar inglés desde la vista previa. Las vistas previas de WhatsApp, X o Discord no ejecutan JavaScript, así que en el build se genera un HTML real por ruta y por idioma, con su título, su descripción y su imagen:

| Ruta | Título en español | Título en inglés (`/en…`) |
| --- | --- | --- |
| `/` | SwiftFlow · Test de mecanografía en español e inglés | SwiftFlow · Typing test in English and Spanish |
| `/sobre` | Qué es SwiftFlow · SwiftFlow | What is SwiftFlow · SwiftFlow |
| `/curso` | Curso desde cero · SwiftFlow | Course from scratch · SwiftFlow |
| `/resumen` | Tu resumen · SwiftFlow | Your summary · SwiftFlow |
| `/historial` | Historial · SwiftFlow | History · SwiftFlow |

<p class="tbl-note">Cada página lleva <code>og:locale</code> (es_AR o en_US), su alternativa y enlaces <code>hreflang</code>; el español es el <code>x-default</code>.</p>

Al abrir `/en/curso`, el router cambia la app a inglés y te lleva a `/curso`: es la misma página, sin el prefijo. Dentro de la app, el título de la pestaña se vuelve a escribir cada vez que cambias de página y también cuando cambias de idioma. Un test end-to-end comprueba, por ejemplo, que `/curso` en un navegador en inglés se titula «Course from scratch · SwiftFlow».

## Cómo se hizo, según git

El plan estaba en el roadmap como fase 13, en cuatro partes: la base y la pantalla de escritura; el historial; el curso, el resumen y la landing; y el contenido. Ese día quedaron así:

| Commit | Qué hizo |
| --- | --- |
| La base | `t()`, el selector de idioma y toda la pantalla de escritura; el español queda igual |
| El historial | 84 logros (hoy son 94), consejos con gramática propia, retos, rangos, fechas y números |
| Las páginas | Curso, resumen, landing y títulos de pestaña: 33 archivos, unas 2.000 líneas nuevas |
| El contenido | Palabras, citas, textos, clásicos, dictado y curso en inglés: 42 archivos |
| Récords y enlaces | Récords por idioma y una versión en inglés de cada página para compartir |

<p class="tbl-note">Los cinco commits del 25 de septiembre de 2026, en orden.</p>

Primero se tradujo toda la interfaz, con el español idéntico al de antes, y recién después llegaron el contenido en inglés y el idioma de cada partida.

## Lo que queda

- El manifiesto de la PWA sigue con `lang: "es"` y la descripción en español: instalada, la app se presenta igual en los dos idiomas.
- La app tiene dos idiomas, y sumar un tercero no es solo traducir la interfaz: necesitaría bancos de texto, reglas de puntuación, voces y préstamos con tilde propios.

## Si vas a traducir una app con contenido

- Separa el idioma de la interfaz del idioma del contenido desde el primer día, aunque al principio apunten al mismo lugar.
- Usa mensajes que puedan ser funciones. La gramática (plurales, artículos, listas) no cabe en un texto con huecos.
- Haz que un test compare la forma de los catálogos. Es la forma más barata de no olvidar nada.
- Cuando agregues un idioma a datos que ya existen, haz que la ausencia de idioma signifique el de antes. Así no migras nada.
- Escribe las reglas del contenido por idioma (puntuación, tildes, voces) en el código, no en traducciones.
- Las vistas previas al compartir no ejecutan JavaScript: si quieres que un enlace se vea en otro idioma, genera su HTML en el build.

> Lo que me llevo: en una app donde el texto es el producto, la i18n no es una capa encima. Hay que decidir qué es interfaz y qué es contenido, y después cuidar que los datos de ayer sigan valiendo con el idioma de hoy.
