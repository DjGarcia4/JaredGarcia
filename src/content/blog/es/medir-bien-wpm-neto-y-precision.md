---
title: "Medir bien: WPM neto, precisión y un reloj que sabe cuándo parar"
description: "Por qué SwiftFlow solo cuenta las palabras completas y correctas, mide la precisión sobre cada tecla (también las que borraste), pausa el reloj a los 3 segundos y separa las sesiones medidas con fórmulas distintas."
date: 2026-10-13
tags: [swiftflow, métricas, producto]
projects: [swiftflow-typing-test]
cover: /img/projects/swiftflow/medir-resultados.webp
kind: learning
keyword: "WPM"
---

Antes de dar cualquier consejo, un test de mecanografía tiene que medir bien. Parece lo fácil: palabras divididas entre minutos. Pero la primera fórmula de [SwiftFlow](/project/swiftflow-typing-test) inflaba los números, y uno de los motivos por los que me gustaba el sitio que usaba antes era justamente ese: no tenía muchas cosas, pero medía bien.

Este post cuenta cómo mide SwiftFlow hoy, qué estaba mal en la primera versión y qué pasa en los casos raros: el reloj que se pausa solo, la última palabra que corta el tiempo, el código con saltos de línea y las partidas que no cuentan.

## Lo que medía mal la primera versión

La fórmula original era de dos líneas. Partía todo lo escrito por espacios, contaba los pedazos y los dividía entre los segundos enteros transcurridos. La precisión comparaba solo el texto final contra el de referencia.

```js
// La fórmula original (simplificada): cuenta pedazos, no aciertos.
const wpm = typed.trim().split(/\s+/).length / (seconds / 60);
const accuracy = correctCharsInFinalText / typed.length;
```

Eso tenía varios problemas a la vez:

- Una palabra mal escrita contaba igual que una bien escrita. Y una palabra corta contaba igual que una larga.
- Lo que borrabas con retroceso desaparecía de la precisión. Si corregías todo, terminabas con 100 %.
- El tiempo eran segundos enteros, así que en una partida corta un segundo de redondeo movía mucho el resultado.
- La pausa ponía un cartel, pero no detenía el reloj: el tiempo pausado se cobraba al volver.
- En el modo Palabras, la partida terminaba en cuanto empezabas la última palabra, no cuando la terminabas.

Lo rehíce todo en un solo cambio grande, a mediados de septiembre de 2026. El comentario del código documenta tres versiones de la fórmula, y las sesiones guardan con qué versión se midieron (más abajo explico por qué eso importó).

## WPM neto: solo cuentan las palabras completas y correctas

La convención de los tests de mecanografía es que una «palabra» son 5 caracteres, para que el resultado no dependa de si el texto tiene palabras largas o cortas. Sobre eso, SwiftFlow sigue la regla de Monkeytype para el WPM neto:

- Una palabra suma sus caracteres solo si está completa y exactamente igual al texto.
- El espacio que sigue a una palabra correcta también suma; el que sigue a una incorrecta, no.
- Una palabra con un solo error, o a medio escribir, no suma nada.

```js
// Simplificado: recorre el texto en palabras y espacios.
for (const { index, 0: chunk } of text.matchAll(/\S+|\s+/g)) {
  if (index >= input.length) break;
  if (/\S/.test(chunk)) {
    prevOk = input.slice(index, index + chunk.length) === chunk;
    if (prevOk) counted += chunk.length;
  } else if (prevOk) {
    counted += matchingChars(input, text, index, chunk.length);
  }
}
const wpm = Math.round(Math.max(0, counted - 1) / 5 / (elapsedMs / 60000));
```

Dos detalles de esa última línea:

- El tiempo va en milisegundos, no en segundos enteros.
- Se resta un carácter. El reloj arranca con la primera tecla, así que esa tecla no toma tiempo: n caracteres ocupan en realidad n − 1 intervalos. Sin esa resta, los textos cortos regalaban un carácter de velocidad.

Mientras escribes, el WPM en vivo se calcula como si hubiera pasado al menos un segundo; si no, las primeras dos teclas dan picos absurdos. Al terminar se usa el tiempo real.

Al lado del neto se muestra el WPM bruto: todas las teclas presionadas, correctas o no, incluso las que después borraste. La distancia entre los dos es lo que te cuestan los errores.

## Precisión: sobre cada tecla, también las que borraste

La precisión es la parte de todas las teclas presionadas que fueron correctas. Un error corregido con retroceso sigue contando en contra, para que corregir todo no se lea como 100 %.

```js
// Simplificado.
const accuracy = keystrokes ? Math.round(((keystrokes - errorKeystrokes) / keystrokes) * 100) : 100;
```

Los «Errores» del resultado son otra cosa: los caracteres que quedaron mal en el texto final. La diferencia entre las teclas equivocadas y los errores finales se muestra aparte como «errores corregidos».

Un ejemplo hipotético, con el texto «hola mundo feliz» (16 caracteres) escrito en 4 segundos:

| Caso | WPM neto | WPM bruto | Precisión | Fórmula vieja |
| --- | --- | --- | --- | --- |
| Sin errores | 45 | 45 | 100 % | 45 WPM · 100 % |
| «mundi» en vez de «mundo», sin corregir | 27 | 45 | 94 % | 45 WPM · 94 % |
| La misma «i», corregida con retroceso (mismo tiempo) | 45 | 48 | 94 % | 45 WPM · 100 % |

<p class="tbl-note">Números calculados a mano con las fórmulas del código, sobre un caso inventado. En la segunda fila, «mundi» y el espacio que la sigue no suman: quedan 10 caracteres.</p>

La fila del medio es la que más cambió: con la fórmula vieja, una palabra mal escrita valía lo mismo que una bien escrita. La de abajo muestra el otro lado: corregir te salva el WPM neto, pero no la precisión.

<figure>
  <img srcset="/img/projects/swiftflow/medir-resultados-800.webp 800w, /img/projects/swiftflow/medir-resultados-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/medir-resultados-1600.webp" alt="Pantalla de resultados de SwiftFlow: WPM, precisión, tiempo y errores en cuatro tarjetas, y debajo combo máximo, WPM bruto, consistencia, errores corregidos y la tecla más fallada, con la gráfica de WPM por segundo." loading="lazy" decoding="async" />
  <figcaption>Una partida de 15 segundos escrita por un script de prueba, con dos errores corregidos: no queda ninguno en el texto, pero la precisión no llega al 100 %.</figcaption>
</figure>

## El reloj: cuándo arranca, cuándo para, cuándo se pausa

Medir bien es, sobre todo, medir el tiempo correcto.

| Momento | Regla |
| --- | --- |
| Arranque | Con la primera tecla, no al abrir la página |
| Fin en Tiempo | Exactamente el límite elegido (15, 30, 60 o 120 s) |
| Fin en el resto | En la última tecla: lo que tardes en buscar el botón no cuenta |
| Palabras y Números | Terminan cuando el texto está completo, no al empezar la última palabra |
| 3 s sin escribir | Pausa automática, con el reloj congelado en la última tecla |
| Volver a escribir | Reanuda sola, y el tiempo pausado no se cobra |

<p class="tbl-note">Las reglas del reloj. En Tiempo, el texto se va alargando mientras escribes, así que nunca se termina antes del límite.</p>

La pausa automática tiene una sutileza: no congela el reloj en el momento en que salta, sino en la última tecla. Si no, los tres segundos de espera antes de que salte se cobrarían igual. Al reanudar, el inicio del reloj se corre hacia adelante lo que duró la pausa, así el tiempo activo sigue siendo continuo. Los intervalos entre teclas que uso para el análisis salen de ese mismo reloj activo, así que no pueden atravesar una pausa.

Esc también pausa, y un segundo Esc termina la partida, que se muestra pero no se guarda. Ahí hubo un error de diseño: si te quedabas pensando, los 3 segundos pausaban solos, y el Esc que presionabas para pausar terminaba la partida. Ahora el estado recuerda si la pausa la pediste tú, y solo un Esc sobre una pausa pedida la termina. En Zen, que no tiene límite, ese segundo Esc es la forma normal de terminar, y la partida sí se guarda.

Al terminar, hay 2 segundos en los que ninguna tecla hace nada. Lo agregué porque el espacio después de la última palabra, sobre todo cuando el reloj corta a mitad de palabra, reiniciaba la partida antes de que vieras los resultados.

## El combo y la consistencia

El combo es la racha de caracteres correctos que termina donde está el cursor: un error la corta. Hay mensajes al llegar a 25, 50, 100, 150, 200, 300, 400, 500, 750 y 1000. Dos reglas evitan que celebre de más:

- Debajo de 100, cada hito se celebra una vez por partida, porque se alcanzan una y otra vez cada vez que el combo arranca de nuevo.
- Solo cuenta si la racha sube exactamente de a uno. Al corregir con retroceso, la racha salta de vuelta a donde estaba, y volver a celebrar un combo que ya tenías no tiene sentido.

La consistencia mide otra cosa: no qué tan rápido, sino qué tan parejo. Se cuenta el terreno nuevo cubierto en cada segundo entero de la partida (reescribir lo que borraste es recorrer dos veces la misma distancia, no ritmo) y se calcula el coeficiente de variación entre segundos. Ese número se transforma igual que en Monkeytype, para que signifique lo que la gente ya conoce: 100 % es un metrónomo. El último segundo, incompleto, no cuenta porque se leería como una frenada, y una partida de menos de 3 segundos enteros no muestra consistencia.

Elegí la línea de tiempo y no la gráfica de WPM porque el WPM acumulado se suaviza a medida que avanza la partida y no puede mostrar un tropiezo.

## Qué cuenta como sesión y qué como récord

Una partida se guarda en el historial solo si llegó a su fin. Estas no se guardan, aunque muestren resultados:

- Cortada con Esc antes del límite.
- Con «Muerte súbita», si un error la terminó.
- Con «Precisión mínima» (90, 95 o 98 %), si quedó por debajo.

Con «Corregir para avanzar», la letra equivocada no entra en el texto, pero la tecla sí cuenta en la precisión y el combo arranca de nuevo desde ese punto. Una partida que pasa un modo exigente es una partida normal, marcada en el historial, así que no hacen falta récords aparte.

Los récords son por tipo de sesión: modo, valor e idioma. «Tiempo · 15 s» y «Tiempo · 60 s» no compiten, y un texto en inglés no compite con uno en español. Una ronda perfecta exige cero teclas equivocadas, ni siquiera corregidas, y al menos 20 pulsaciones: una partida de Zen terminada a las cinco letras no es un logro.

El historial guarda las últimas 200 partidas. Los tiempos por tecla, que son lo más pesado, se descartan pasadas las 40 más recientes; el WPM, la precisión y los errores por tecla se quedan.

## Versionar la fórmula

Cambiar cómo se mide tiene un costo: las sesiones viejas quedan medidas con otra vara. Si las mezclaba, un récord inflado por la fórmula vieja iba a ser imbatible.

Cada sesión guarda `metricsVersion`. Los récords, los promedios, la tendencia y la consistencia entre días usan solo las sesiones de la versión actual. Las viejas siguen en la lista con una etiqueta «v1» y el aviso «Medida con la fórmula anterior de WPM: no cuenta para récords ni promedios». Las rachas, los conteos y los logros sí usan el historial completo: lo que ya ganaste no se pierde.

Después agregué una segunda versión separada, `insightsVersion`, para las reglas del análisis por tecla (qué cuenta como inversión, qué intervalo cuenta como tecleo). Las mantuve aparte a propósito: invalidar un análisis viejo nunca debería llevarse los récords de alguien.

## Casos raros

- Sin puntuación. Si la apagas, el texto se pasa a minúsculas y se le quitan tildes y signos, incluidos ¿ y ¡. La ñ se salva: al descomponer los caracteres se separaría en n + tilde y se perdería, así que se aparta antes y se devuelve después. «Año» y «ano» son palabras distintas.
- Modos que nunca se formatean. Código (los símbolos y las mayúsculas son la sintaxis), Entrenar y Dedos (perderían las tildes que practican), Reto semanal (tiene que ser el mismo texto para todos), Mi texto, Dictado y las lecciones.
- Código. Se escribe en un `textarea`, no en un input de una línea, para que Enter y la sangría sean pulsaciones reales. Para el WPM neto, un salto de línea es espacio en blanco como cualquier otro.
- Dictado. El texto se dicta llano, pero con tildes y ñ, porque eso se oye. Se mide con las mismas fórmulas que el resto.
- La última palabra en Tiempo. Si el reloj la corta a la mitad, no suma al WPM neto (está incompleta) y tampoco cuenta como «palabra que te cuesta».

## Qué tan parejo eres de un día al otro

La consistencia de una partida no dice si el martes escribes como el jueves. Para eso hay otra medida: toma el tipo de sesión que más juegas entre las últimas 80, porque 15 segundos y 120 segundos no corren a la misma velocidad, y promedia cada uno de tus últimos 14 días de práctica. Con menos de 5 días no dice nada.

El puntaje es 1 menos la desviación estándar entre la media, de 0 a 100: desde 93 es «Muy parejo», desde 87 «Parejo», desde 80 «Con altibajos», y debajo, «Irregular». Mantener 90 o más en al menos 7 días desbloquea el logro «Constante».

La tendencia de WPM sigue la misma idea de no reaccionar a una sola partida: la línea a mirar es el promedio de 5, y la frase compara tus últimas 10 contra las 10 anteriores. Una diferencia de menos de 2 WPM se lee como estable, no como tendencia.

## Lo que queda pendiente

Lo pendiente que toca la medición es una tabla de posiciones pública para el reto semanal. Necesita un servidor, y también una defensa contra marcas falsas, por ejemplo validar la línea de tiempo de la partida contra el texto de esa semana. Hoy todo vive en el navegador, y nada impide editar tu propio historial; para una herramienta personal no importa, para un ranking sí.

## Si vas a medir algo parecido

- Decide qué significa cada número y escríbelo junto a la fórmula. «Precisión» puede significar tres cosas distintas.
- Mide el tiempo activo, no el del reloj de pared, y decide qué hacer con la pausa antes de que alguien se quede pensando.
- Versiona la fórmula desde el día uno. Vas a cambiarla, y los récords viejos no deberían competir con los nuevos.
- Separa lo que se guarda de lo que cuenta: una partida fallada puede mostrar resultados sin ensuciar el historial.
- Prueba los bordes con tests: la última palabra cortada, el primer carácter, un retroceso, un salto de línea.

> Lo que me llevo: un número que la gente va a perseguir tiene que ser difícil de inflar. Cada regla de este post existe porque, sin ella, alguien podía mejorar su marca sin escribir mejor.
