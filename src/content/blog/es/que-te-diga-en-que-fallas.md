---
title: "Que te diga en qué fallas: convertir pulsaciones en consejos"
description: "Cómo SwiftFlow convierte cada tecla que presionas en un consejo concreto: qué tecla confundes con cuál, qué dedo se queda atrás, qué te frena aunque no lo falles y un modo que practica justo eso."
date: 2026-10-13
tags: [swiftflow, ux, datos]
projects: [swiftflow-typing-test]
cover: /img/projects/swiftflow/fallas-dedos.webp
kind: learning
keyword: "errores"
---

Saber que escribes a 58 palabras por minuto no te ayuda a escribir a 70. Eso fue lo que me llevó a hacer [SwiftFlow](/project/swiftflow-typing-test): el sitio de mecanografía que usaba se llenó de anuncios y, además, solo medía. No decía qué mejorar: qué hacer con el número quedaba por tu cuenta.

Lo que más tuve que rehacer en todo el proyecto fue justamente eso: cómo pasar de «fallaste aquí» a «esto es lo que te pasa y así se practica». Este post cuenta cómo quedó, con las reglas y los umbrales reales, y las veces que el consejo decía algo que no era cierto.

## El problema: un error solo dice «esta no»

La primera versión de las estadísticas por tecla guardaba dos contadores por carácter: cuántas veces apareció en el texto y cuántas lo fallaste. Con eso se puede armar un mapa de calor y un consejo del tipo «practica la R». Pero ese consejo tiene tres problemas:

- No dice qué pasó. Fallar la R porque el dedo se corre a la T es un problema de posición; fallarla porque escribes «tr» al revés es un problema de ritmo. Son arreglos distintos.
- No ve la velocidad. Las teclas que te cuestan tiempo casi nunca son las que fallas: la Ñ no la erras, dudas en ella.
- Confunde volumen con debilidad. En español, la tecla con más errores en números absolutos suele ser simplemente la que más escribes.

Así que el trabajo fue guardar más de cada pulsación y, sobre todo, poner umbrales para que el consejo solo hable cuando tiene algo que decir.

## Qué se guarda de cada pulsación

Cada vez que el texto escrito crece, una función compara lo nuevo contra el texto de referencia y devuelve, por cada carácter, qué tocaba, qué presionaste y en qué posición. Los retrocesos no generan pulsaciones: solo cuenta lo que crece.

```js
// Simplificado: de dos versiones del input, las pulsaciones nuevas.
const diffKeystrokes = (prev, next, text) => {
  const strokes = [];
  for (let i = prev.length; i < next.length && i < text.length; i++) {
    strokes.push({ index: i, expected: text[i], typed: next[i], correct: next[i] === text[i] });
  }
  return strokes;
};
```

Con eso, cada sesión guarda:

| Dato | Qué es | Para qué sirve |
| --- | --- | --- |
| Intentos y fallos por tecla | Por el carácter que pedía el texto | Qué teclas fallas en proporción |
| Confusiones | El par «lo que tocaba + lo que presionaste» («rt») | Qué tecla presionas en lugar de cuál |
| Inversiones | Pares que salieron al revés («ue» como «eu») | Si los dedos se te adelantan |
| Tiempo por tecla y por par | `[ms totales, cantidad]` | Qué te frena aunque no lo falles |
| Posición de cada error | El índice en el texto, corregido o no | Qué palabras enteras se te traban |

<p class="tbl-note">Lo que guarda cada sesión, además de WPM y precisión. Todo vive en el navegador, sin cuenta ni servidor.</p>

Un detalle que importó: los errores corregidos con retroceso también se guardan. Si te equivocas y lo arreglas, esa tecla igual te costó.

## Qué tecla confundes con cuál

Saber qué tecla presionaste en lugar de la correcta convierte «fallas la R» en «presionas la T», que es otro arreglo. El consejo «Confundís la R con la T» aparece solo si es un hábito, no algo disperso: la misma tecla equivocada tiene que salir al menos 6 veces y ser al menos el 35 % de los fallos de esa tecla. Juntos, esos dos números significan unos 17 fallos de una tecla con 6 cayendo en la misma vecina.

Después mira el teclado que estás usando (español de España, latinoamericano, inglés, Dvorak o Colemak) para ver si las dos teclas están lado a lado en la misma fila. Si lo están, el consejo dice que el dedo se corre a la de al lado y que bajes un cambio en esa zona; si no, dice que es un error de posición de la mano, no de velocidad.

Las confusiones de mayúsculas («A» por «a») se descartan: decir «confundes la A con la A» no tiene sentido. Las de tildes sí quedan, porque escribir «a» donde iba «á» es el hábito de comerse la tilde.

## Cuando los dedos se te adelantan

Las inversiones fueron el caso en que el consejo más fácilmente podía mentir. La prueba floja, «la tecla que presionaste es la que venía después», se dispara con cualquier error que caiga en la letra siguiente, y en español la letra siguiente es una vocal la mayor parte del tiempo. Así que la regla exige el intercambio confirmado: dos errores seguidos, en posiciones consecutivas, donde cada uno es la letra del otro.

```js
// Simplificado: «qeu» por «que» necesita las dos mitades.
const isTransposition = (prev, cur) =>
  prev && cur.index === prev.index + 1 &&
  !prev.correct && !cur.correct &&
  prev.typed === cur.expected && cur.typed === prev.expected;
```

El consejo «Se te adelantan los dedos» sale con al menos 10 inversiones que sean al menos el 10 % de tus errores, y nombra el par que más se te da vuelta. Como una inversión también deja dos entradas en las confusiones («ue» y «eu»), al juntar los datos se restan en ambas direcciones: si no, una misma inversión contaría como dos confusiones.

<figure>
  <img srcset="/img/projects/swiftflow/fallas-patrones-800.webp 800w, /img/projects/swiftflow/fallas-patrones-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/fallas-patrones-1600.webp" alt="Tres consejos de SwiftFlow: «Confundís la R con la T», «Se te adelantan los dedos» y «Tu anular izquierdo falla más», con tres palabras que se traban debajo." loading="lazy" decoding="async" />
  <figcaption>La sección «Los errores tienen forma» de la landing, con datos de ejemplo: los mismos componentes que muestra el historial.</figcaption>
</figure>

## La tecla débil no es la que más fallas

El primer consejo por tecla ordenaba por tasa de error con un mínimo de 20 intentos. En español eso recomendaba siempre letras raras (X, Q, W) cuyo 25 % salía de un puñado de intentos, justo debajo de un ranking ordenado por fallos absolutos que encabezaba la R. Eran dos criterios distintos, ninguno explicado, y el consejo parecía contradecir la lista que tenía arriba.

La regla actual para que una letra cuente como débil:

| Condición | Umbral |
| --- | --- |
| Intentos de esa tecla | 60 o más |
| Fallos de esa tecla | 8 o más |
| Parte de todos tus errores | 3 % o más |
| Tasa de error | 1,25 veces tu promedio o más |
| Datos totales para dar cualquier consejo | 200 pulsaciones |

<p class="tbl-note">Las teclas que pasan se ordenan por los fallos que cuestan por encima de tu propio promedio, así cuentan tanto la tasa como el volumen.</p>

El orden por «fallos de más» resuelve el choque entre tasa y volumen: una tecla con 25 % de error escrita 60 veces (unos 9 fallos de más) queda por encima de una con 30 % escrita 20 veces (unos 5). Y cuando la tecla más fallada en números absolutos no es la recomendada, el consejo lo explica en lugar de ignorarlo, con una frase como «La R suma más errores, pero solo porque la tecleás mucho más seguido». Si además esa tecla débil es la que confundes, la confusión se pliega en el mismo consejo (por ejemplo: «Cuando la errás, 7 de cada 10 veces apretás la T») en lugar de gastar otro lugar.

Todo esto se calcula sobre las últimas 30 sesiones, no sobre las 200 que se guardan: lo que fallabas hace cincuenta sesiones no es lo que toca practicar hoy.

## Mano, fila y dedo

Algunos problemas no son de una tecla. Las estadísticas por tecla se suman por mano, por fila del teclado y por dedo, usando la distribución que elegiste: en Dvorak las letras cambian de dedo y el consejo también.

- Mano: la peor tiene que fallar al menos 1,3 veces lo que falla la mejor, con 50 intentos de cada lado.
- Fila: la misma brecha de 1,3 entre la peor y la mejor fila de letras.
- Dedo: se compara contra la mediana de tus dedos, no contra el mejor, porque el mejor suele ser uno que casi no escribe nada difícil. Hacen falta cuatro dedos medidos con 50 intentos cada uno, al menos 5 fallos del peor y la misma brecha de 1,3. Si casi todos tus dedos están en cero, la comparación es contra el resto junto, para que el único dedo malo de alguien muy preciso igual aparezca.

Solo uno de los tres llega a la lista, el de mayor brecha, para que «tu mano izquierda» y «tu anular izquierdo» no cuenten la misma historia dos veces. La tarjeta «Tus dedos» del historial y el consejo usan la misma función para decidir cuál es el dedo débil, así nunca se contradicen.

<figure>
  <img srcset="/img/projects/swiftflow/fallas-dedos-800.webp 800w, /img/projects/swiftflow/fallas-dedos-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/fallas-dedos-1600.webp" alt="La tarjeta «Tus dedos»: ocho dedos con su porcentaje de error y milisegundos por tecla, el meñique izquierdo marcado como el que más falla y el anular derecho como el más lento, sobre un teclado coloreado por dedo." loading="lazy" decoding="async" />
  <figcaption>«Tus dedos», con los datos de ejemplo de la landing. El dedo que falla más trae un botón para practicarlo solo.</figcaption>
</figure>

## Lo que te frena aunque no lo falles

Todo lo anterior es precisión. Pero las teclas que te cuestan tiempo casi nunca son las que fallas. Para verlas, cada sesión mide el intervalo entre teclas, con reglas estrictas sobre qué intervalo cuenta:

- Solo entre dos pulsaciones correctas y consecutivas. Un intervalo que termina en una tecla equivocada mide otra tecla; uno que empieza en un error es, sobre todo, el momento de darte cuenta.
- Solo si llegó un carácter a la vez. Varios juntos son un pegado, un teclado predictivo o un deslizamiento, no tecleo.
- Solo entre 15 ms y 2 s. Por debajo es repetición de tecla o un evento doble. El techo está debajo de la pausa automática de 3 s y por encima de una duda real: buscar la Ñ toma alrededor de un segundo, y esa es justo la señal.
- Lo que queda fuera se descarta, no se recorta. Fijarlo en 2 s arrastraría el promedio de las teclas lentas hacia el techo y fabricaría el resultado que el consejo reporta.

Los intervalos salen del reloj activo, que ya tiene las pausas restadas, así que no pueden atravesar una pausa por construcción.

Para decir «lenta» se compara contra la mediana de tus teclas, no contra el promedio. El promedio lo inflan justamente las teclas lentas que se buscan, lo que achicaría cada proporción y anularía el efecto. La mediana es literalmente «tu tecla del medio», que es lo que dice el consejo.

| Consejo | Cuándo aparece |
| --- | --- |
| «Te frena la Ñ» | Al menos 30 % más lenta que tu mediana, con 60 muestras, y que no sea ya una tecla débil |
| «Tus combinaciones más lentas» | Un par 50 % más lento, con 25 muestras: los pares aparecen menos y tienen que destacar más |
| «Tu … es el más lento» | Un dedo 35 % más lento que tu dedo típico, con 40 muestras y cuatro dedos medidos |
| Cualquiera de velocidad | 500 intervalos medidos en total |

<p class="tbl-note">El 30 % está por encima de lo que produce la geometría del teclado: la fila de abajo es un 10–15 % más lenta que la del medio para todo el mundo, y el consejo tiene que hablar de ti, no del teclado.</p>

La exclusión de teclas débiles tiene una razón concreta: el consejo dice «No la errás casi nunca». Si la tecla ya aparecía como débil, esa frase sería falsa, y además gastaría dos de los cuatro lugares en la misma tecla.

<figure>
  <img srcset="/img/projects/swiftflow/fallas-frena-800.webp 800w, /img/projects/swiftflow/fallas-frena-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/fallas-frena-1600.webp" alt="Tarjeta con las teclas y combinaciones más lentas: cada una con una barra, sus milisegundos y cuánto más lenta es que el ritmo habitual." loading="lazy" decoding="async" />
  <figcaption>«Lo que te frena aunque no lo erres», también con datos de ejemplo de la landing.</figcaption>
</figure>

## Cuatro consejos, ordenados por gravedad

«Qué mejorar» muestra como máximo cuatro consejos, y hay más candidatos que lugares: teclas débiles, confusión o inversión, espacio, mano/fila/dedo, velocidad, palabras que se traban, números, tildes y el balance entre velocidad y precisión (por debajo de 92 % de precisión reciente sugiere bajar el ritmo; desde 97 %, apretarlo).

Al principio iban en un orden fijo. Ahora cada consejo se puntúa como «cuántas veces paso mi propio umbral», lo que pone a todos en la misma escala: uno que apenas calificó nunca desplaza a uno que lo pasó de largo. Se quedan los cuatro más graves y se muestran en el orden original, que va de lo más específico a lo más general. Los consejos del mismo tipo comparten lugar: confusión e inversión compiten por uno, los tres de velocidad por otro.

## Del consejo a la práctica

Un consejo que te deja solo para averiguar cómo practicar es la mitad del trabajo. El consejo de teclas débiles ya guardaba las teclas que nombraba en un arreglo que nadie leía; ahora ese arreglo alimenta el modo Entrenar.

La clave fue que el consejo y el entrenamiento usen la misma función para elegir teclas. Si fueran dos definiciones, tarde o temprano el historial recomendaría una cosa y el modo practicaría otra. Si eliges teclas a mano, tu elección gana.

El texto se arma así:

- La mayor parte son palabras reales del banco, porque escribir prosa es la habilidad real.
- Alrededor del 30 % son sílabas inventadas alrededor de la tecla objetivo, vocales a los lados de una consonante y consonantes a los lados de una vocal, para que sean pronunciables: la Ñ se practica como «ñaño», no como «ñtñs».
- Cada tecla tiene su propio grupo de palabras, ponderado por cuántas veces aparece la letra.

Ese último punto salió de un error. Al principio había un solo grupo para todas las teclas, y como la A está en casi todas las palabras en español, lo llenaba entero. Elegir a, f, m, h y ñ producía un texto sin ninguna f ni ninguna ñ. Ahora las teclas se sortean por ciclos: diez palabras para cinco teclas son dos para cada una, mezcladas en cada vuelta para que no suene a rotación.

Los otros consejos también llevan a algún lado: el de mano o dedo abre el modo Dedos con ese dedo solo, el de números abre Números, y el de palabras que se traban abre Entrenar con esas palabras. Durante la partida, si una letra se te escapa (al menos 3 fallos, 15 % de error y el doble de tu tasa en esa sesión, después de 40 pulsaciones), aparece un aviso con «Entrenar ahora».

Entrenar tampoco es infinito. Cada letra apunta a bajar al 60 % de la tasa con la que empezó el día, nunca por debajo del 5 %, con al menos 40 intentos en el día. Cuando todas llegan, terminaste por hoy; con cinco rondas sin mejora, o con ocho en total, te dice que descanses. Las letras practicadas entran en un repaso espaciado: vuelven al día siguiente y después a los 3, 7, 14 y 30 días.

## ¿Mejoró o no?

La foto de hoy no dice si vas mejorando. «Cómo van tus teclas» compara tus últimas sesiones contra las anteriores, hasta 30 de cada lado y nunca menos de 10, y solo muestra una tecla si se movió al menos dos puntos y un cuarto de donde estaba, con 40 intentos de cada lado. Las tarjetas de dedos hacen lo mismo con una flecha. Bajar a la mitad la tasa de una tecla o de un dedo desbloquea «Tecla domada» o «Dedo domado».

## Lo que queda pendiente

El plan sigue en la hoja de ruta del repositorio. Lo que tiene que ver con este análisis y no está hecho son cosas que necesitan servidor: desafiar a un amigo con un enlace (está diseñado para que quepa en la URL, pero en pausa) y una tabla de posiciones pública. Mientras los datos vivan solo en tu navegador, el análisis se queda contigo, y es una decisión que prefiero mantener.

## Si vas a construir algo parecido

- Guarda qué se presionó, no solo qué se falló. La diferencia entre «fallas la R» y «presionas la T» es la diferencia entre un dato y un consejo.
- Pon umbrales de volumen y de proporción a cada afirmación, y escríbelos con el porqué al lado. Un consejo sobre 12 intentos es ruido con buena redacción.
- Compara contra la mediana de la persona, no contra el promedio ni contra su mejor caso.
- Si el texto del consejo afirma algo («no la errás casi nunca»), asegúrate de que la regla lo garantice.
- Que el consejo y la práctica salgan de la misma función. Dos definiciones terminan diciendo cosas distintas.

> Lo que me llevo: un consejo es una afirmación sobre alguien, y cada afirmación necesita una regla que la haga verdadera. El trabajo no fue medir más, sino decidir cuándo callarse.
