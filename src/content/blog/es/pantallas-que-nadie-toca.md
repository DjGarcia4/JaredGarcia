---
title: "Diseñar para pantallas que nadie toca"
description: "Sin clics, sin scroll y a varios metros: lo que cambia al diseñar interfaces para digital signage, con ejemplos del Turnero, Pedido listo y Avisos."
date: 2026-10-12
tags: [ux, diseño, wink]
projects: [wink-studio]
cover: /img/projects/wink-studio/turnero.webp
kind: learning
keyword: "signage"
---

Casi todo lo que sabemos de diseño de interfaces asume que alguien interactúa: hace clic, hace scroll, vuelve atrás. En una pantalla de [Wink](/project/wink-app) no pasa nada de eso. La gente la mira de pasada, a varios metros, mientras hace fila o espera su pedido. Nadie la toca.

Técnicamente, el toque funciona en el equipo, pero no hay teclado en pantalla y el cursor está oculto. Así que la regla de las apps de Wink Studio es que no son interactivas, salvo que el manifiesto diga lo contrario. Las que no lo son desactivan la selección de texto, los gestos y el menú contextual, para que un toque accidental no deje nada resaltado durante horas.

Diseñar las diez apps me obligó a cambiar varias costumbres. Estas son las que más pesaron.

<figure>
  <img srcset="/img/projects/wink-studio/turnero-800.webp 800w, /img/projects/wink-studio/turnero-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/turnero-1600.webp" alt="Turnero: el último turno llamado, destacado, y los anteriores con su ventanilla." loading="lazy" decoding="async" />
  <figcaption>Turnero: el último turno llamado, destacado, y los anteriores con su ventanilla.</figcaption>
</figure>

## Una cosa en grande

La guía de diseño parte de un dato: la pantalla se lee a entre 2 y 5 metros. De ahí salen dos números. En pantalla completa, el texto principal ocupa al menos el 8 % del alto, y nada baja del 3 %. Si algo no se puede leer a 3 %, no va.

Si alguien la mira medio segundo, la pantalla tiene que haberle dicho lo importante. Por eso cada app tiene una sola cosa protagonista y lo demás acompaña, más chico y con menos contraste:

- Turnero: el turno que acaban de llamar y su ventanilla, casi tan grande como el turno, porque es lo que la persona necesita para moverse.
- Pedido listo: los números listos para recoger, en tarjetas grandes sobre un panel verde; los que están en preparación, en filas más chicas al costado.
- Avisos: un aviso a la vez, con la letra más grande que le quepa, y los importantes en rojo.
- Clima: la temperatura de ahora. El pronóstico es secundario.
- Menú del día: el platillo y su precio, con una línea de puntos que lleva el ojo de uno al otro.

Si todo es grande, nada lo es. El trabajo de diseño está en decidir qué se achica. Y los números van con `tabular-nums`: todos los dígitos miden lo mismo, así un reloj o un precio no bailan cuando cambian.

<figure>
  <img srcset="/img/projects/wink-studio/01-800.webp 800w, /img/projects/wink-studio/01-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/01-1600.webp" alt="Clima en pantalla completa con aviso de tormenta: la temperatura manda, el resto acompaña." loading="lazy" decoding="async" />
  <figcaption>Clima en pantalla completa con aviso de tormenta: la temperatura manda, el resto acompaña.</figcaption>
</figure>

## Contraste para leer de lejos

Los colores los elige el cliente, y a veces elige gris sobre gris. Por eso el tema calcula el contraste y, si el texto no se lee, lo corrige solo. La pregunta fue: ¿con qué mínimo?

Empecé con 4,5:1, el AA de WCAG para texto normal. El problema fue que cambiaba colores que se leen bien: el blanco sobre un azul medio da 3,9:1, y el tema lo convertía en azul marino. En señalización la letra es grande por definición, así que para el texto de pantalla pasé al mínimo de texto grande, 3:1. El 4,5:1 quedó para texto chico sobre un relleno, como el de una etiqueta.

La segunda decisión fue cómo corregir. Un color que no alcanza se acerca lo justo a blanco o a negro, primero hacia su propio lado: un amarillo se aclara en vez de volverse café. Y nada se cambia en silencio: el formulario de ajustes avisa qué color se ajustó y por qué. Para probarlo, varias apps tienen un escenario de certificación con colores del cliente en azul medio.

## Sin scroll: rotar

Una pantalla no hace scroll, pero el contenido no siempre entra. La solución es rotar, siempre a un ritmo que el cliente puede ajustar:

| App | Qué rota | Cada cuánto |
| --- | --- | --- |
| Menú del día | Páginas del menú; en tira y mini, un platillo a la vez | 5 a 60 s por página; 6 s en tira y mini |
| Avisos | Un aviso a la vez; los importantes duran la mitad más | 5 a 60 s por aviso |
| Clima | En tira y mini, «ahora» y el pronóstico | 12 s |
| Cumpleaños | Páginas de la lista del mes y la felicitación | 5 a 60 s |

Rotar tiene un costo: quien llega a mitad de la rotación no sabe cuánto falta ni qué viene. Por eso Avisos tiene un pie con una barra de tiempo, «2 de 5» y «Sigue: …». Y medir antes de paginar evita el otro extremo: un menú corto no rota, agranda la letra hasta llenar la pantalla.

## Cuando algo cambia, avisar

En una fila, la gente no está mirando la pantalla: está mirando el celular. Por eso el Turnero y Pedido listo avisan con sonido y con movimiento. El Turnero se comporta así:

- El turno llamado sale en grande, con su animación, y toda la pantalla destella una vez.
- Se dice en voz alta («Turno A 23, Ventanilla 3») las veces que lo llamaron, con 0,9 s entre una y otra. Si el sistema de turnos manda su propia grabación, se usa esa.
- Si el mismo llamado llega otra vez dentro de 8 s, no se repite. Si de verdad lo vuelven a llamar, sí, y suma la etiqueta «Segunda vez».
- Los llamados en fila salen uno por uno; con fila, cada uno suena una sola vez.
- Después pasa arriba de los anteriores, que se van apagando de a poco. Se muestran hasta 24, solo en filas completas.

En Pedido listo el cliente elige: leer el número y el nombre, solo el timbre o nada. Y hay un detalle que salió de pensar en la hora pico: cuando hay dos o más pedidos esperando su anuncio, suena solo el timbre y cada uno se queda en grande 2,5 s, para que la pantalla no se quede atrás leyendo nombres. La fila de anuncios tiene un tope de 8.

<figure>
  <img srcset="/img/projects/wink-studio/04-800.webp 800w, /img/projects/wink-studio/04-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/04-1600.webp" alt="Pedido listo: en preparación a un lado, listos para recoger en grande." loading="lazy" decoding="async" />
  <figcaption>Pedido listo: en preparación a un lado, listos para recoger en grande.</figcaption>
</figure>

Lo que se va también se diseña. Un pedido listo sale de la pantalla solo, a los minutos que diga el cliente (de 1 a 30), aunque el sistema de caja lo siga mandando. Lo que se va se desvanece antes de que las columnas se reacomoden, y los recién salidos brillan 45 s. Los pedidos que ya estaban listos cuando la app arrancó no se anuncian, y la hora en que quedó listo cada uno se guarda en el equipo: si la app se recarga, no vuelve a anunciar ni a contar desde cero.

El sonido tiene sus propios detalles. El timbre son dos notas (mi y do) generadas con el sintetizador del navegador, sin archivos de audio. Un tono inaudible mantiene despierto el audio para que el primer llamado no salga cortado. Si el equipo no tiene una voz en español, va el timbre directamente, sin esperar a una voz que no va a sonar. Y las frases nunca se acumulan: si una no termina en 8 s, se cancela.

## La hora de la pantalla, no la del navegador

Muchas apps dependen de la fecha y la hora, y el equipo no tiene zona horaria configurada. Así que todas usan la zona que entrega el SDK (la del player o la de un ajuste), siempre formateada con `Intl`, y comparan fechas con la fecha de la pantalla, no con la del navegador en UTC:

```ts
// La fecha de hoy en la zona de la pantalla (simplificado)
function todayIn(timeZone: string, now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now); // "2026-10-12"
}
```

- Menú del día cambia solo entre desayuno, almuerzo y cena, y el encabezado dice «Almuerzo · hasta las 5:00 p. m.». Si en este servicio no hay platillos, avisa cuándo empieza el siguiente.
- Avisos revisa cada 30 s si alguno empezó o venció, y dice cuánto le queda en palabras: «Solo hoy», «Hasta mañana», «Hasta el sábado».
- Cumpleaños felicita el viernes o el lunes si el cumpleaños cae en fin de semana, cuando sí hay alguien para verlo. Si el 1 de enero cae sábado, se festeja el 31 de diciembre. El 29 de febrero, en los años que no son bisiestos, es el 28. Y la edad nunca se muestra: solo cuentan el día y el mes.

## Nunca en blanco, nunca un error

En una web, un error se puede explicar. En una pantalla de una tienda, «Error 500» o «undefined» solo hace ver mal al negocio. Por eso cada app tiene los mismos estados, en orden:

| Estado | Qué se ve |
| --- | --- |
| Datos frescos | Normal |
| Datos viejos | Normal, con una marca chica: «Actualizado hace 2 h» |
| Datos demasiado viejos o sin datos | Una versión sin datos: marca, hora y un mensaje neutro como «Pronto vas a ver el clima aquí» |
| Error | Igual que sin datos; el detalle va al player por mensaje, nunca a la pantalla |
| Cargando la primera vez | La marca en calma; nunca un spinner solo |

Los estados vacíos también se escriben: «Esperando el primer turno», «Nada en preparación por ahora», «No hay avisos por ahora», «Este mes no hay cumpleaños». Son pantallas que alguien va a ver, así que se diseñan igual que las llenas.

## Cuidar la pantalla

Una imagen fija durante horas puede marcar algunas pantallas (burn-in). Por eso ninguna app queda quieta: el tema trae una clase que desplaza todo 2 px en cuatro posiciones, con una vuelta completa cada 8 minutos, o el contenido rota. La certificación revisa que exista al menos una animación infinita y, si no la encuentra, la deja para revisar.

El movimiento tiene sus propias reglas: transiciones de 300 a 600 ms, solo con `opacity` y `transform`, y nada que parpadee o se mueva sin motivo. Es una pantalla en un local, no un anuncio. Si el sistema pide menos movimiento, el desplazamiento y los fundidos se apagan.

## El contexto es otro equipo

Todo esto corre en una Raspberry Pi 4, y la GPU se comparte con el video que está en el mismo layout. Diseñar para ella también es diseño:

- Nada de `backdrop-filter` ni blurs grandes, ni `will-change` permanente.
- Las fuentes (Poppins, Titillium Web e Inter) van dentro del paquete, solo latín y de dos a tres pesos por familia: el equipo no tiene fuentes y sin red no hay Google Fonts.
- La app avisa a Chrome que no la traduzca: una traducción automática en una pantalla pública cambiaría los textos del cliente sin que nadie lo note.
- El Clima tiene un ajuste para apagar su fondo animado si la pantalla va lenta.

Una interfaz linda que se traba en el equipo real no sirve.

## Lo que le diría a alguien que diseña para señalización

- Diseña para medio segundo de atención. Si no se entiende de un vistazo, no se entiende.
- Pon números a la legibilidad: distancia de lectura, alto mínimo del texto, contraste. Discutir «se ve chico» sin números no termina nunca.
- Respeta los colores del cliente hasta donde se pueda, y cuando los cambies, dilo.
- Diseña los estados vacíos, viejos y de error con el mismo cuidado que el normal.
- Si algo cambia y la gente no está mirando, usa sonido, pero piensa en la hora pico antes que en el caso ideal.
- Prueba en el equipo de verdad. La Pi es parte del diseño.

> Lo que me llevo: sin interacción, la jerarquía hace todo el trabajo. Y cuando la gente no está mirando, la interfaz también puede hablar.
