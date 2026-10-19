---
title: "Escribir al compás: lo que aprendí haciendo un juego de ritmo para SwiftFlow"
description: "Cuatro pistas sintetizadas con Web Audio, una partitura armada con palabras, cada golpe calificado en milisegundos y una calibración para tu teclado: cómo le sumé a un test de mecanografía un modo donde la velocidad la pone la canción."
date: 2026-10-19
tags: [swiftflow, web-audio, juegos, ritmo]
projects: [swiftflow-typing-test]
kind: learning
keyword: "ritmo"
cover: /img/projects/swiftflow/ritmo-juego.webp
---

En todos los modos de [SwiftFlow](/project/swiftflow-typing-test) la velocidad la pones tú: escribes lo más rápido que puedes y al final te dice cuánto fue. Quería un modo donde pasara lo contrario, donde la velocidad la marque la música y tu trabajo sea llegar a tiempo. Así nació **Ritmo**: las letras bajan hacia una línea, cada una por el carril del dedo que la toca, y hay que tocarlas justo cuando llegan, como en Guitar Hero.

Por fuera parece un juego más. Por dentro tiene tres problemas que no había resuelto nunca: hacer música sin archivos de audio, tener un reloj en el que se pueda confiar al milisegundo, y calificar cada golpe de forma justa aunque tu teclado y tus parlantes tengan su propio retraso. Esto es lo que armé, con las reglas reales del código.

## Lo que ves al entrar

Ritmo es un modo más del menú (con la tecla **R**), pero tiene su propia pantalla. Antes de empezar eliges una pista y una dificultad, y detrás corre una demo que se juega sola para que se entienda la mecánica sin leer nada.

<figure>
  <img srcset="/img/projects/swiftflow/ritmo-inicio-800.webp 800w, /img/projects/swiftflow/ritmo-inicio-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/ritmo-inicio-1600.webp" alt="La pantalla de inicio de Ritmo en SwiftFlow: «Escribí al compás», las cuatro pistas con su tempo (Neón elegida), las cuatro dificultades con barras (Difícil elegida), el botón Empezar y el desfase en 0 ms con el botón Calibrar." loading="lazy" decoding="async" />
  <figcaption>La pantalla de inicio: ↑↓ cambian la pista y ←→ la dificultad. Detrás, la demo que se juega sola.</figcaption>
</figure>

| Pista | Tempo | Clima |
| --- | --- | --- |
| Brisa nocturna | 84 BPM | Tranquila, para entrar en calor |
| Pulso urbano | 104 BPM | Con groove |
| Neón | 124 BPM | Bailable, cuatro en el piso |
| Hiperimpulso | 148 BPM | A toda velocidad |

<p class="tbl-note">Cada pista es un loop de cuatro acordes con batería, bajo, acordes de fondo y un arpegio.</p>

| Dificultad | Letras por tiempo | Largo de las palabras | Tiempo en pantalla |
| --- | --- | --- | --- |
| Fácil | 1 | 2 a 5 letras | 2,2 s |
| Normal | 1 | 3 a 7 letras | 1,9 s |
| Difícil | 2 | 3 a 9 letras | 1,6 s |
| Experto | 2, o 4 en pistas lentas | 4 a 12 letras | 1,35 s |

<p class="tbl-note">«Tiempo en pantalla» es cuánto tarda una letra desde que aparece hasta que llega a la línea.</p>

Lo de Experto en pistas lentas tiene una razón: dos letras por tiempo a 84 BPM son más lentas que Difícil en Hiperimpulso. Así que por debajo de 110 BPM, Experto pasa a cuatro letras por tiempo, en semicorcheas.

## Música sin archivos

No quería meter canciones con derechos ni archivos de audio pesados en una PWA que funciona offline. Así que cada pista está escrita como datos y la toca un sintetizador hecho con la Web Audio API. Un compás son 16 pasos: `x` suena, `.` es silencio.

```js
// Neón, 124 BPM: cuatro en el piso
{
  id: "neon",
  bpm: 124,
  chords: [[59, 64, 67], [60, 64, 67], [59, 62, 67], [57, 62, 66]], // Em C G D
  bass: [40, 48, 43, 50],
  kick:        "x...x...x...x...",
  snare:       "....x.......x...",
  hat:         "..x...x...x...x.",
  bassPattern: "x.o.x.o.x.o.x.o.", // x la raíz, o la octava, 5 la quinta
  arp:         "0120120120120120", // qué nota del acorde toca
}
```

Cada instrumento son unos pocos nodos. El bombo es una onda senoidal que cae de 150 a 42 Hz en 120 ms; el redoblante, ruido blanco por un filtro pasa banda más un golpe de triángulo; el hi-hat, ruido por un pasa altos. El bajo es una sierra filtrada y los acordes, triángulos suaves. Todo pasa por un compresor al final para que la mezcla no sature.

Hay un detalle que me gusta: cuando aciertas una letra suena una nota del acorde que está sonando en ese momento, y cada letra de la palabra sube un escalón en el acorde. Escribir «ancho» a tiempo suena como un arpegio dentro de la canción, no como un clic encima de ella.

## Un reloj en el que se pueda confiar

Esta fue la parte que más aprendí. En un juego de ritmo, 45 ms es la diferencia entre «Perfecto» y «Bien». Con `setTimeout` o `requestAnimationFrame` no alcanza: el navegador los atrasa cuando está ocupado, y una nota que suena tarde arruina todo lo demás.

La solución es la de siempre en audio web, el planificador con anticipación. Cada 25 ms un temporizador mira qué notas caen en los próximos 150 ms y las programa en el reloj del propio `AudioContext`, que es exacto. Si la página se traba un momento, las notas ya están programadas y suenan a tiempo igual.

Y el juego entero corre sobre ese mismo reloj. La pregunta «¿en qué milisegundo de la canción estamos?» no la responde `performance.now()`, sino lo que de verdad se está escuchando:

```js
// Simplificado: el momento de la canción que está sonando ahora
const now = () => {
  const stamp = ctx.getOutputTimestamp?.();
  if (stamp?.performanceTime > 0) {
    const heard = stamp.contextTime + (performance.now() - stamp.performanceTime) / 1000;
    return (heard - startAt) * 1000;
  }
  // Sin marca de tiempo: el reloj del audio menos la latencia de salida
  return (ctx.currentTime - startAt - (ctx.outputLatency || ctx.baseLatency || 0)) * 1000;
};
```

Lo mismo con las teclas. Un `keydown` llega al código un poco después de que apretaste, así que el golpe se fecha con el `timeStamp` del evento, no con el momento en que el código lo lee:

```js
const at = player.now() - (performance.now() - event.timeStamp) - rhythm.offset;
```

`rhythm.offset` es el desfase de la calibración, que explico más abajo.

## La partitura sale de las palabras

Ritmo no tiene canciones con letras fijas. La partitura se arma cada vez con palabras del idioma que estás practicando, en español o en inglés:

1. Se filtran las palabras que encajan en la dificultad y que se pueden tocar con una sola tecla cada letra en tu distribución: nada de Shift ni teclas muertas. Por eso «canción» no entra en un teclado de EE. UU. internacional.
2. Cada letra cae en un paso de la grilla, y cada palabra empieza en un tiempo. Así suena como una frase y no como una ristra de letras.
3. Entre palabra y palabra hay un silencio de uno o dos pasos.
4. A veces la última letra trae una **cola**: hay que mantenerla apretada durante el silencio. La cola termina un paso antes de la palabra siguiente, para que no se pisen.

El azar se pasa como parámetro (`random`), así que con la misma semilla sale la misma partitura. Eso permite que los tests comprueben cosas como «cada palabra empieza en un tiempo» o «ninguna letra cae fuera de la parte que se juega» con resultados que no cambian entre corridas.

<figure>
  <img srcset="/img/projects/swiftflow/ritmo-sostenida-800.webp 800w, /img/projects/swiftflow/ritmo-sostenida-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/ritmo-sostenida-1600.webp" alt="Ritmo en Pulso urbano, dificultad Normal: la letra «u» de «usted» se acierta con «Perfecto», y por el carril del índice derecho baja la «s» siguiente. Abajo, la palabra actual y las que vienen." loading="lazy" decoding="async" />
  <figcaption>Abajo, la palabra actual con la letra que toca y las que vienen. El número grande del fondo es el combo.</figcaption>
</figure>

## Un carril por dedo

El escenario tiene ocho carriles, uno por dedo, del meñique izquierdo al meñique derecho. Cada letra cae por el carril del dedo que la toca en tu distribución, con el color de ese dedo, el mismo del selector de dedos y del teclado en pantalla. En un teclado latinoamericano la «ñ» baja por el meñique derecho; en Dvorak, la «h» baja por el índice derecho.

Eso convierte el juego en práctica de verdad. Si una palabra te obliga a cruzar de un meñique al otro, lo ves venir en la pantalla antes de tocarlo.

## Cada golpe se califica

La lógica de puntaje está en un módulo puro: entran tiempos, salen calificaciones. No sabe nada del canvas ni del audio, y por eso se puede probar entera.

| Calificación | Margen | Puntos |
| --- | --- | --- |
| Perfecto | ±45 ms | 100 |
| Bien | ±100 ms | 70 |
| Temprano / Tarde | ±160 ms | 40 |
| Fallo | La letra pasó de largo, o tocaste otra | 0, y el combo vuelve a cero |

<p class="tbl-note">Los puntos se multiplican por el combo (×1 a ×8) y se duplican en modo estrella.</p>

Lo que más me costó decidir fue qué pasa con una tecla que no corresponde:

- **Un toque lejos de cualquier nota no cuenta.** Si aprietas algo cuando no hay ninguna letra a menos de 160 ms, se ignora. Castigarlo haría que el juego se sintiera injusto con cada roce del teclado.
- **La letra equivocada cerca de una nota sí cuesta.** Le cuesta un fallo a la nota más próxima que estaba esperando.
- **Si dos notas están en rango**, la tecla va a la que coincide con la letra, y si ninguna coincide, a la más temprana.

El combo sube el multiplicador un escalón cada 10 aciertos seguidos, hasta ×8. Cada 50 seguidos se prende el **modo estrella**: ocho segundos de puntos dobles, con la línea tornasolada y las tarjetas brillando.

<figure>
  <img srcset="/img/projects/swiftflow/ritmo-estrella-800.webp 800w, /img/projects/swiftflow/ritmo-estrella-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/ritmo-estrella-1600.webp" alt="Ritmo en Hiperimpulso, Experto, con «¡Modo estrella!» en grande, el multiplicador en ×6 resaltado y la línea de los dedos de colores, a mitad de la palabra «escribir»." loading="lazy" decoding="async" />
  <figcaption>El combo 51 prende el modo estrella: el cartel en grande, la tarjeta del multiplicador encendida y el doble de puntos por ocho segundos.</figcaption>
</figure>

### Las letras sostenidas

Las colas suman puntos por cada milisegundo que la tecla sigue apretada, multiplicados por el combo. Dos reglas las hacen justas:

- Soltar hasta 100 ms antes del final cuenta como sostenida entera. Nadie suelta exacto.
- Soltar antes de tiempo solo pierde el resto del bono, no el combo. La letra ya la acertaste.

Y si la ventana pierde el foco con una tecla apretada, todas las colas terminan ahí. Sin eso, un Cmd+Tab dejaría una nota «sostenida» para siempre.

## Calibrar tu teclado

Cada teclado y cada salida de audio tienen su retraso. Con auriculares Bluetooth, por ejemplo, lo que oyes llega bastante después de lo que el navegador programó. Si no lo corriges, alguien que toca perfecto ve «Tarde» en todo.

La calibración es una prueba corta: doce clics a 100 BPM y tú aprietas Espacio con cada uno. Los cuatro primeros son para agarrar el tiempo y no se cuentan. Del resto se toma la **mediana** de la diferencia, no el promedio, para que un golpe muy errado no mueva todo. Si no se contaron al menos la mitad de los golpes, la prueba no se guarda y te pide repetirla. También se puede ajustar a mano.

El resultado ayuda a calibrar sin que lo pidas. Si tu desvío promedio pasa de 35 ms hacia un lado, te dice «Tus golpes llegan siempre tarde: si no es a propósito, calibrá el desfase».

## El resultado

Al terminar aparece un sello con el rango, como en los juegos de ritmo:

| Rango | Qué hace falta |
| --- | --- |
| S | Ningún fallo y 95 % o más de puntería |
| A | 90 % de puntería |
| B | 80 % |
| C | 65 % |
| D | Menos de eso |

<p class="tbl-note">La puntería pesa cada letra por su calificación: un Perfecto vale entero, un Bien 0,7 y un Temprano o Tarde 0,4.</p>

<figure>
  <img srcset="/img/projects/swiftflow/ritmo-resultado-800.webp 800w, /img/projects/swiftflow/ritmo-resultado-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/ritmo-resultado-1600.webp" alt="El resultado de una pista de Ritmo: rango S, «¡Sin un fallo!», 298.890 puntos, 100 % de letras acertadas y de puntería, combo máximo de 258, 258 perfectos, 5 ms atrasado con ±6 ms de dispersión, 48 wpm, 18 de 18 sostenidas y modo estrella ×5." loading="lazy" decoding="async" />
  <figcaption>Además del puntaje: el conteo de cada calificación, si vas adelantado o atrasado y cuánto se dispersan tus golpes.</figcaption>
</figure>

Hay dos números que no existen en los otros modos: el **desvío promedio** (si tiendes a ir adelantado o atrasado) y la **dispersión** (qué tan lejos del tiempo caen tus golpes, para cualquier lado). El primero se arregla calibrando; el segundo es lo que de verdad mejora con práctica.

La partida se guarda en el historial como un modo más. Tiene su WPM (las letras acertadas en el tramo de la canción), su precisión y las mismas estadísticas por tecla que los otros modos, así que alimenta el mapa de errores, la racha y los consejos. Lo propio de Ritmo (puntaje, calificaciones, desvío, colas) va aparte, y los récords se guardan por pista y dificultad. También trae tres logros: «A tiempo» (una pista entera sin fallos), «Metrónomo» (±35 ms de dispersión o menos con 90 % de letras) y «Estrella» (prender el modo estrella), además de un reto diario.

## Que se vea vivo, en todos los temas

El escenario se dibuja en un `<canvas>` una vez por cuadro. Las notas se mueven con el reloj de la canción, y los efectos que dejan (chispas, etiquetas, confeti) con el de la página, para que sigan corriendo cuando la canción termina y en la demo de inicio.

Hay un haz de luz por el carril de la próxima letra y un anillo que se cierra sobre el lugar donde va a caer, ondas al acertar, una sacudida y bordes rojos al fallar, y un ecualizador de fondo. Todo se pinta con los colores del tema leídos de la página, así que se ve igual de bien en claro, oscuro y alto contraste. Con movimiento reducido, todo eso queda quieto.

<figure>
  <img srcset="/img/projects/swiftflow/ritmo-claro-800.webp 800w, /img/projects/swiftflow/ritmo-claro-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/ritmo-claro-1600.webp" alt="Ritmo en tema claro: los ocho carriles con los colores de cada dedo sobre fondo blanco, la «e» y la «c» de «cerebro» cayendo por el carril del dedo medio izquierdo con su haz de luz." loading="lazy" decoding="async" />
  <figcaption>El mismo escenario en tema claro: el canvas lee los colores del tema en lugar de tenerlos fijos.</figcaption>
</figure>

## Cómo lo pruebo

- **27 tests unitarios** en Vitest sobre las partes puras: la partitura (cada palabra empieza en un tiempo, ninguna letra cae fuera de la canción, misma semilla misma partitura, las colas terminan antes de la palabra siguiente, se arma en las cuatro pistas y las cuatro dificultades), el juicio (márgenes, combo, multiplicador, modo estrella, colas soltadas antes) y el resultado (rango, récords por pista).
- **2 tests end-to-end** en Playwright: la pantalla de inicio recuerda la pista y la dificultad al recargar, y Esc sale de una partida sin guardarla.
- **Lo que no tiene tests**: el sintetizador y el canvas. jsdom no tiene `AudioContext` ni canvas, el mismo compromiso que ya tenía la tarjeta para compartir. Sin `AudioContext`, el reloj sigue corriendo en silencio sobre `performance.now()`, así que el resto del juego se puede probar igual.

## Lo que no está

- **Se juega con un teclado físico.** En un celular aparece un aviso: no hay forma justa de calificar milisegundos con un teclado en pantalla.
- **El retraso de salida depende del navegador.** `getOutputTimestamp` y `outputLatency` no están igual de bien en todos lados; por eso existe la calibración y no confío solo en la estimación.
- **Pocas pistas.** Son cuatro y son loops de cuatro acordes. Hacer más es barato (son datos), pero que suenen distintas entre sí es trabajo de composición, no de código.
- **Las palabras con Shift o tecla muerta quedan afuera.** Es una decisión: una letra, una tecla. Cuesta algunas palabras en español, pero cada golpe se califica sin ambigüedad.

## Si vas a hacer algo parecido

- Usa el reloj del audio para todo. Si la música va por un reloj y el juego por otro, se separan.
- Fecha cada tecla con `event.timeStamp`, no con el momento en que la lees.
- Separa el juicio en un módulo puro. Es lo que más reglas tiene y lo único que de verdad necesita tests.
- Pasa el azar como parámetro. Una partitura que sale igual con la misma semilla se puede probar.
- Ofrece calibración desde el principio y usa la mediana. El hardware de cada persona es distinto, y un golpe errado no debería mover la cuenta.
- Decide qué no castigas. Ignorar los toques lejos de una nota hizo más por que el juego se sintiera justo que cualquier ajuste de márgenes.

> Lo que me llevo: en un juego de ritmo el problema no es dibujar letras que caen, es ponerse de acuerdo sobre qué es «ahora». Cuando la música, las letras y las teclas miden el tiempo con el mismo reloj, todo lo demás se vuelve una cuenta.
