---
title: "El teclado que de verdad usas: modelar cinco distribuciones en un test de mecanografía"
description: "Latinoamericano, España, EE. UU. internacional, Dvorak y Colemak: cómo SwiftFlow sabe qué tecla, qué dedo y qué Shift, AltGr o tecla muerta necesita cada carácter, y cómo el análisis, el curso y el modo Dedos se adaptan a tu teclado."
date: 2026-10-13
tags: [swiftflow, teclado, distribuciones, producto]
projects: [swiftflow-typing-test]
kind: learning
keyword: "distribuciones de teclado"
cover: /img/projects/swiftflow/layouts-latam.webp
---

[SwiftFlow](/project/swiftflow-typing-test) empezó dibujando un solo teclado: uno español genérico, con la Ñ al lado de la L. Para casi todo alcanzaba, hasta que mirabas los detalles. La tecla del acento estaba dibujada justo después de la Ñ, con un comentario en el código que decía que España y Latinoamérica la ponen en lugares distintos y que eso quedaba «lo bastante cerca para los dos». Shift+3 daba «·», que es del teclado de España, no del latinoamericano.

Para un test que dice «presiona esta tecla, con este dedo», «lo bastante cerca» no sirve. Si el teclado en pantalla ilumina una tecla que en el tuyo está en otro lado, te enseña mal. Este post cuenta cómo modelé las distribuciones de verdad y todo lo que cambió cuando la app empezó a saber en qué teclado escribes.

## Qué es una distribución, para el código

Cada distribución es un objeto con cuatro cosas: lo que está impreso en cada tecla, lo que hacen Shift y AltGr sobre esas teclas, y sus teclas muertas, las que se presionan antes de una letra para ponerle un acento. Solo se modelan las cuatro filas de escritura. La tecla a la izquierda del 1 y lo que queda más allá del borde derecho de las letras se dejan afuera.

```js
// Simplificado: el teclado latinoamericano en SwiftFlow.
const LATAM = {
  id: "latam",
  rows: [
    row("1234567890'¿"),
    row("qwertyuiop´+"),
    row("asdfghjklñ{}"),
    row("<zxcvbnm,.-", -1), // ISO: una tecla de más a la izquierda de la Z
  ],
  shift: { "!": "1", '"': "2", /* … */ "¡": "¿", "*": "+", "[": "{", ">": "<" },
  altgr: { "@": "q", "\\": "'", "~": "+", "^": "{", "`": "}" },
  dead: {
    [ACUTE]: { key: "´", shift: false },    // á é í ó ú
    [DIAERESIS]: { key: "´", shift: true }, // ü
  },
};
```

El `-1` de la última fila es la decisión que más usé después. Cada fila sabe en qué columna empieza, contando desde la columna del 1, la Q, la A y la Z. Los teclados ISO (los de España y Latinoamérica) tienen una tecla `<` a la izquierda de la Z que el de EE. UU. no tiene. Con esa columna de inicio, la Z cae en la misma columna en todos los teclados, y los dedos se pueden asignar igual en cualquiera.

## Las cinco distribuciones

| Distribución | Lo que la distingue | Teclas muertas | AltGr |
| --- | --- | --- | --- |
| Latinoamericano | ¿ en la fila de números (¡ con Shift), Ñ y luego { } en la fila guía | ´ para tilde, Shift+´ para diéresis | @ ~ ^ ` \ |
| Español (España) | ¡ en la fila de números (¿ con Shift), Ñ, ´ y Ç en la fila guía | ´ tilde, Shift+´ diéresis, ` grave, Shift+` circunfleja | € @ # [ ] { } \| ~ |
| Inglés (EE. UU.) internacional | Sin tecla ISO; la comilla funciona como acento | ' tilde, Shift+' diéresis | ñ (AltGr+N), ¡ (AltGr+1), ¿ (AltGr+/) |
| Dvorak | Vocales en la fila guía de la izquierda: A O E U | Ninguna modelada | Ninguna |
| Colemak | Fila guía A R S T D H N E I O | Ninguna modelada | Ninguna |

<p class="tbl-note">Los nombres son los que muestra el selector. Dvorak y Colemak se dibujan sobre su base estadounidense.</p>

Dvorak y Colemak no tienen teclas muertas ni AltGr en el modelo, a propósito. La forma de escribir acentos con esas distribuciones cambia de un sistema a otro, así que no adiviné ninguna. El selector lo dice en su texto de ayuda: «Las tildes y la ñ no se marcan: cada sistema las pone en otro lado».

## De un carácter a una tecla

Todo se apoya en una función: dado un carácter y una distribución, devuelve qué tecla lo hace y qué hay que hacer antes o al mismo tiempo. El orden de las preguntas importa:

1. ¿Está impreso en una tecla? Es esa tecla.
2. ¿Sale con Shift o con AltGr? Esa tecla, con el modificador.
3. ¿Es una mayúscula? La tecla de su minúscula, más Shift.
4. ¿Es una letra con acento? Se separa con `normalize("NFD")`: «á» es «a» más una tilde combinable. Si la distribución tiene una tecla muerta para esa marca, es la tecla de la letra, después de la tecla muerta.
5. Si nada de eso funciona, devuelve `null`. No adivina.

| Carácter | Latinoamericano | Inglés (EE. UU.) internacional | Dvorak |
| --- | --- | --- | --- |
| ñ | La tecla Ñ | AltGr + N | Ninguna |
| ¿ | Su propia tecla | AltGr + / | Ninguna |
| á | ´ y luego A | ' y luego A | Ninguna |
| Á | ´ y luego Shift + A | ' y luego Shift + A | Ninguna |
| ü | Shift + ´ y luego U | Shift + ' y luego U | Ninguna |
| @ | AltGr + Q | Shift + 2 | Shift + 2 |

<p class="tbl-note">Lo que devuelve la función para algunos caracteres. «Ninguna» es `null`: el teclado en pantalla no ilumina nada.</p>

Ese `null` es una decisión de diseño. Prefiero no iluminar ninguna tecla antes que iluminar una equivocada. El paso 4 también deja algo afuera a propósito: si la letra base necesitara Shift o AltGr, no se combina con una tecla muerta, porque esa combinación no la modelé.

La ñ tiene historia propia. Ocho días antes de las distribuciones encontré que, al apagar la puntuación, el texto pasaba por un filtro que quitaba los acentos con `NFD`: separaba la ñ en «n» más una tilde combinable y quitaba la tilde. «Sueño» se mostraba como «sueno», y la ñ no se podía escribir. La ñ no es una n con acento, es otra letra: «año» y «ano» son palabras distintas. El test que había comprobaba el comportamiento roto, así que también lo corregí. Y en el banco de palabras había 10 con ñ de 781; pasaron a ser 49. Por eso, en el modelo, la ñ es una tecla en las distribuciones españolas y nunca una n con algo encima.

## El teclado en pantalla

Con esa función, el teclado que se dibuja mientras escribes muestra tres cosas a la vez:

- La próxima tecla, en sólido. Shift, AltGr o la tecla muerta que necesita, solo con el contorno. Las dos teclas Shift se iluminan juntas.
- El dedo que va, con su color y su nombre debajo: «Próxima: índice derecho». Los dedos del mismo tipo comparten color en las dos manos (meñiques violeta, anulares azul, medios verde, índices ámbar), así se ve de un vistazo que es «el mismo dedo, en la otra mano».
- Tus errores de esta partida. Una tecla que fallaste dos veces o más se tiñe de rojo, entre 12 % y 45 % según cuánto la fallas comparada con la peor. Un error hace parpadear en rojo la tecla que tocaba y en gris la que tocaste, durante 450 ms.

<figure>
  <img srcset="/img/projects/swiftflow/layouts-latam-800.webp 800w, /img/projects/swiftflow/layouts-latam-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/layouts-latam-1600.webp" alt="El test de SwiftFlow con el teclado latinoamericano en pantalla y colores por dedo. El texto sigue en «núme…»: la U está iluminada en ámbar y la tecla del acento, a la derecha de la P, tiene el contorno marcado. Debajo dice «Próxima: índice derecho»." loading="lazy" decoding="async" />
  <figcaption>Lo siguiente es una «ú» en un teclado latinoamericano: la U en sólido y la tecla ´ marcada, porque va antes. Debajo, el dedo que corresponde.</figcaption>
</figure>

Hay casos donde la próxima tecla se esconde. En Dictado no se muestra, porque te daría la respuesta. En «Sin red» las teclas no se tiñen por errores, porque eso delataría lo que fallaste. En un celular el teclado en pantalla no aparece: el sistema ya muestra uno.

## Qué cambia cuando sabe tu teclado

La fase de distribuciones no fue solo dibujar. La hoja de ruta la planteaba así: el mapa del teclado pasa de uno solo a uno por distribución, y lo usan el teclado en pantalla, el mapa de errores, los dedos, los consejos y el entrenamiento.

### El análisis

El historial guarda caracteres, no posiciones: guarda que fallaste una «ñ», no que fallaste la tecla de la columna 9. La distribución se aplica al leerlo, con una función que junta los contadores en la tecla que los produce: «A», «a» y «á» caen todas en la A. Eso tiene dos consecuencias:

- El historial anterior a las distribuciones se sigue leyendo igual, sin migración.
- Si cambias de distribución, todo el análisis se recalcula para el teclado nuevo: el mapa de errores, qué dedo falla más, qué mano o qué fila te cuesta.

Uno de los consejos depende directamente de la posición. Cuando una tecla se confunde seguido con otra, el consejo revisa si las dos están una al lado de la otra en la misma fila de tu teclado. No es lo mismo un dedo que se resbaló hacia la tecla vecina que una mano apoyada en el lugar equivocado.

### El curso de 24 lecciones

El curso (`/curso`) no nombra letras, nombra posiciones: fila y columna. Por eso sigue al teclado que elijas. Son tres filas (la del medio, la de arriba y la de abajo), cada una en cinco pares de dedos más un repaso, y después seis lecciones más: mayúsculas, tildes, números de la izquierda, números de la derecha, signos y un texto final.

| Par (columnas) | Latinoamericano / España | EE. UU. internacional | Dvorak |
| --- | --- | --- | --- |
| Índices (3 y 6) | F y J | F y J | U y H |
| Medios (2 y 7) | D y K | D y K | E y T |
| Anulares (1 y 8) | S y L | S y L | O y N |
| Meñiques (0 y 9) | A y Ñ | A | A y S |
| Estiramiento de índices (4 y 5) | G y H | G y H | I y D |

<p class="tbl-note">Las cinco lecciones de la fila del medio, según el teclado. En EE. UU. la columna 9 es «;», y el curso solo enseña letras más la coma y el punto.</p>

<figure>
  <img srcset="/img/projects/swiftflow/02-800.webp 800w, /img/projects/swiftflow/02-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/02-1600.webp" alt="La página del curso de SwiftFlow con el teclado de España: 0 de 24 lecciones, F y J marcadas como la próxima lección, y la lista de la fila del medio con F y J, D y K, S y L, A y Ñ, G y H y repaso." loading="lazy" decoding="async" />
  <figcaption>El curso con «Para tu teclado: Español (España)». Los títulos de las lecciones salen de las teclas de esa distribución.</figcaption>
</figure>

Cada lección usa solo teclas ya aprendidas, y las suyas son las que más aparecen. Primero como grupos cortos, y en cuanto con esas letras se escriben al menos seis palabras, como palabras reales del idioma que practicas. Se pasa con la velocidad de la lección (8 wpm en la fila del medio, 12 en la de arriba, 14 en la de abajo, dos más en cada repaso) y 94 % de precisión. La segunda estrella pide 98 %, y la tercera, además, 1,5 veces la velocidad.

Modelar por posición tuvo un efecto que no planeé, pero que es correcto. La coma y el punto entran en el curso con la fila de abajo, porque ahí están en QWERTY. En Dvorak están en la fila de arriba, así que llegan con ella. Las palabras de práctica, en cambio, no cambian con el teclado. Por eso la ñ entra en las palabras de las lecciones solo cuando el teclado tiene una tecla Ñ que ya aprendiste.

### El modo Dedos

En Dedos eliges qué dedos practicar, y el texto sale solo de las letras que esos dedos escriben en tu teclado. Con un índice izquierdo en el latinoamericano, eso es R, T, F, G, V y B (lo comprueba un test). Dvorak y Colemak cambian las letras, no los dedos. Cuando con esas letras se forman suficientes palabras reales, como pasa con una mano entera, son la mayor parte del texto. Cuando no, como con un solo dedo, el texto se arma con grupos de sus letras, como en un curso de mecanografía.

<figure>
  <img srcset="/img/projects/swiftflow/layouts-dedos-dvorak-800.webp 800w, /img/projects/swiftflow/layouts-dedos-dvorak-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/layouts-dedos-dvorak-1600.webp" alt="El modo Dedos con los índices elegidos en Dvorak: el selector muestra PYUIKX para el índice izquierdo y FGDHBM para el derecho; el teclado en pantalla apaga las teclas de los otros dedos y el texto usa solo esas letras." loading="lazy" decoding="async" />
  <figcaption>Índices en Dvorak: las letras de cada dedo salen de la distribución, y el teclado apaga las teclas de los demás.</figcaption>
</figure>

Cada dedo del selector se elige con la tecla de la fila guía donde descansa, y se reconoce por su posición física, no por lo que imprime. El chip muestra la letra de tu distribución: Ñ para el meñique derecho en latinoamericano, S en Dvorak. El teclado en pantalla aparece con los colores por dedo y deja al 25 % de opacidad las teclas de los otros dedos.

## Elegir sin preguntar

Nadie quiere configurar el teclado antes de escribir una línea. Así que, hasta que eliges uno, SwiftFlow lo deduce del primer idioma del navegador:

| Primer idioma del navegador | Distribución |
| --- | --- |
| `es-ES`, o catalán (`ca`, `ca-…`) | Español (España) |
| Cualquier inglés (`en…`) | Inglés (EE. UU.) internacional |
| Todo lo demás | Latinoamericano |

<p class="tbl-note">La mayoría de quienes escriben en español usan el teclado latinoamericano, por eso es el valor por defecto.</p>

La configuración guarda `null` mientras no elijas, no el valor deducido. Así, la deducción sigue al navegador hasta el día que eliges uno, y desde ahí manda tu elección. Se cambia desde el selector debajo del teclado en pantalla, desde el curso o desde la paleta de comandos: escribir «dvorak» alcanza.

## Cómo llegó a esto

| Fecha | Paso |
| --- | --- |
| 17/09/2026 | La ñ deja de perderse con la puntuación apagada, y el banco pasa de 10 a 49 palabras con ñ |
| 22/09/2026 | El teclado en pantalla, con un solo mapa español; después, los colores por dedo |
| 25/09/2026 | Las cinco distribuciones, la deducción por idioma y el análisis adaptado; el mismo día, el curso desde cero |
| 28/09/2026 | El modo Dedos y «Tus dedos» en el historial, los dos sobre la distribución elegida |

<p class="tbl-note">Según el historial de commits del repositorio de SwiftFlow.</p>

Los tests acompañan cada paso. Las pruebas unitarias del mapa cubren, entre otras cosas, dónde guarda cada teclado los signos de pregunta, los símbolos con AltGr, el español en el teclado de EE. UU. y que ninguna distribución repite una tecla ni pone un carácter en dos. En Playwright, un test comprueba que con el navegador en español se deduce el latinoamericano (y que se dibuja la tecla ¿), que al elegir España aparece la Ç y la elección sobrevive a recargar la página, y que en Dvorak no hay Ç ni tecla AltGr.

## Lo que falta

En la hoja de ruta no queda una fase pendiente sobre distribuciones, pero hay límites que conozco:

- Las tildes y la ñ en Dvorak y Colemak no se marcan. Habría que modelar cada sistema por separado.
- Cinco distribuciones no son todas. Agregar una es un objeto más, con sus filas, Shift, AltGr y teclas muertas, pero hay que conocerla bien.
- Las teclas de los costados no se modelan: la de la izquierda del 1, ni lo que queda más allá de las letras por la derecha. Un carácter que solo sale de ahí devuelve `null`.
- El historial no guarda en qué teclado escribiste cada partida. Es a propósito, porque así se lee siempre igual, pero si cambias de distribución, el análisis reinterpreta tus partidas viejas con el teclado nuevo.

## Si vas a modelar teclados

- Separa qué está impreso en una tecla de dónde está. Con filas y columnas de inicio, los dedos y las lecciones se definen una sola vez para todos los teclados.
- Guarda caracteres en los datos y aplica la distribución al leerlos. Cambiar de teclado no debería obligarte a migrar nada.
- Cuando no sepas, devuelve nada. Una tecla iluminada en el lugar equivocado enseña mal, y un hueco no.
- Cuidado con `normalize("NFD")` en español: es la forma correcta de separar una tilde, y también la forma más fácil de romper la ñ.
- Deduce un valor por defecto, pero guarda que no se eligió, para que la deducción siga funcionando hasta que alguien decida.

> Lo que me llevo: el teclado no es un detalle visual del test, es el modelo sobre el que se apoya todo lo demás. Cuando la app sabe en qué teclado escribes, cada consejo, cada lección y cada tecla iluminada empiezan a ser ciertos para ti.
