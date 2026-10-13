---
title: "Todo sin soltar el teclado: lo que aprendí haciendo SwiftFlow 100 % usable con el teclado"
description: "Una paleta de comandos en Ctrl/⌘K, una tecla junto a cada botón, menús con su propia letra y diálogos que devuelven el foco: cómo hice que un test de mecanografía no te obligue a tocar el mouse, y cómo lo compruebo con axe."
date: 2026-10-13
tags: [swiftflow, teclado, accesibilidad, ux]
projects: [swiftflow-typing-test]
kind: learning
keyword: "teclado"
cover: /img/projects/swiftflow/teclado-paleta.webp
---

[SwiftFlow](/project/swiftflow-typing-test) es un test de mecanografía en español. Mientras escribes, las dos manos están sobre el teclado, en la fila guía. Si para empezar otra prueba, cambiar de modo o abrir el historial tienes que ir al mouse, los dedos salen de su lugar y se pierde el ritmo. Esa molestia, que primero sentí como usuario, es el origen de todo este post.

El problema tiene una trampa: en la pantalla del test, casi cualquier tecla es texto. Si la «R» reinicia, nadie puede escribir «perro». Esto es lo que armé para que todo se pueda hacer con el teclado sin pisar lo que estás escribiendo, con las reglas reales del código y lo que tuve que cambiar en el camino.

## Tres capas, de la más general a la más directa

| Capa | Cómo se abre | Para qué sirve |
| --- | --- | --- |
| La paleta de comandos | **Ctrl K** o **⌘K**, desde cualquier página | Todo lo que se puede cambiar, buscándolo por nombre |
| La tecla de cada botón | La letra sola, o **Alt**/**⌥** + letra durante el test | Lo que está a la vista, sin abrir nada |
| Las teclas dentro de un menú | Con el menú abierto, la letra o el número sola | Cada opción del menú, sin flechas |

<p class="tbl-note">Las tres conviven: la paleta encuentra cualquier cosa; las otras dos son más rápidas para lo que ya ves.</p>

Encima de eso hay tres atajos fijos: **Tab** a mitad de una partida empieza de nuevo con otro texto, **Esc** pausa (y un segundo Esc termina), y **?** fuera del test muestra la lista de atajos.

## La paleta: escribes lo que quieres

**Ctrl K** abre la paleta en cualquier sistema, y **⌘K** también: el código acepta las dos combinaciones en los dos, para quien trae el hábito de otro lado. El texto de ayuda dice qué se puede escribir: «Escribí un comando: 30, palabras 50, oscuro, historial…».

<figure>
  <img srcset="/img/projects/swiftflow/teclado-paleta-800.webp 800w, /img/projects/swiftflow/teclado-paleta-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/teclado-paleta-1600.webp" alt="La paleta de comandos de SwiftFlow con «teclado» escrito: mostrar el teclado en pantalla, colores por dedo, atajos de teclado y las cinco distribuciones, con Latinoamericano marcada como activa." loading="lazy" decoding="async" />
  <figcaption>Escribir «teclado» trae lo del teclado en pantalla, la lista de atajos y las cinco distribuciones. La activa lleva una marca, y la primera fila muestra su propia tecla (⌥K).</figcaption>
</figure>

La lista no es fija. Se arma de nuevo cada vez que se abre, a partir del estado de la app, así que solo ofrece lo que tiene sentido en ese momento: «Terminar la partida» aparece solo si hay una en curso, la cantidad de frases solo en Dictado, y las lecciones del curso solo las que ya están abiertas. Si hay una partida en curso, abrir la paleta la pausa, igual que Esc.

### Cómo busca

Cada palabra que escribes tiene que aparecer al principio de alguna palabra del comando: su grupo, su nombre o una de sus palabras clave. Las tildes y las mayúsculas no cuentan («tipografia» encuentra «Tipografía»), y se busca en los dos idiomas: con la app en inglés, «tiempo» igual encuentra las opciones de tiempo. Cada palabra suma puntos según qué tan bien encaja:

| Encaje | Puntos |
| --- | --- |
| Es una palabra entera del nombre o del grupo | 4 |
| Es una palabra clave entera | 3 |
| Es el comienzo de una palabra del nombre | 2 (1 si es un número) |
| Es el comienzo de una palabra clave | 1 |
| No aparece | El comando queda afuera |

<p class="tbl-note">Los empates conservan el orden de la lista, que pone primero lo más común.</p>

Lo de los números lo aprendí escribiendo «5»: no es lo mismo que «50». Un número solo puntúa alto si es entero, y si nada más encaja, el comienzo igual vale algo, porque es mejor que no responder nada.

```js
// Simplificado: cuánto encaja una palabra escrita en un comando.
const scoreToken = (token, { title, keywords }) => {
  const numeric = /^\d+$/.test(token);
  if (title.includes(token)) return 4;
  if (keywords.includes(token)) return 3;
  if (title.some((w) => w.startsWith(token))) return numeric ? 1 : 2;
  if (keywords.some((w) => w.startsWith(token))) return 1;
  return 0; // con un solo 0, el comando no entra
};
```

Con la paleta vacía, los cinco comandos usados por última vez van arriba, bajo «Recientes». Se guardan en `localStorage`, y si el navegador lo bloquea se recuerdan solo durante la visita. Se mueve con ↑/↓ (o Ctrl+N y Ctrl+P), PageUp/PageDown saltan de a cinco, Enter elige y Esc cierra.

## Una tecla junto a cada botón

La paleta resolvía todo, pero para lo que ya está a la vista era un paso de más. En la siguiente iteración cada botón pasó a mostrar su tecla en un chip al lado, y esa tecla lo presiona. El chip cambia según dónde estás:

- En los resultados y en las otras páginas, la letra sola: **F** «¿Dónde te frenaste?», **C** compartir, **L** los retos del día, **R** otra partida.
- En el test, antes de terminar, las letras son texto, así que la misma tecla va con **Alt** (**⌥** en Mac), y el chip lo dice: «⌥L» en lugar de «L».
- La barra de arriba: **P** el test, **O** el curso, **H** el historial, **Q** qué es SwiftFlow, **Z** sonido e idioma, **T** el tema.

<figure>
  <img srcset="/img/projects/swiftflow/01-800.webp 800w, /img/projects/swiftflow/01-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/01-1600.webp" alt="La pantalla del test de SwiftFlow en tema oscuro, con un chip pequeño junto a cada botón que indica su tecla con ⌥." loading="lazy" decoding="async" />
  <figcaption>En el test, cada chip lleva ⌥ (Alt en Windows y Linux): ahí la letra sola es texto.</figcaption>
</figure>

Cada botón registra su tecla mientras está en pantalla y la quita al desmontarse, así que una tecla solo hace algo cuando hay algo que presionar. Si el mismo botón está dos veces (la barra y su copia en la hoja de ajustes del celular), responde el más reciente, y cuando uno se va le devuelve la tecla al otro. Eso último fue un bug: antes, el que se iba le borraba la tecla al que quedaba.

Los chips solo se ven con un puntero fino, mouse o trackpad (`pointer: fine`). En un celular no hay teclado que apretar, y los chips serían ruido.

### Cómo se evita pisar lo que escribes

Esta es la parte que más reglas tiene, y todas salen de algún caso concreto:

| Regla | Por qué |
| --- | --- |
| Durante el test, la letra sola no es atajo: hace falta Alt/⌥ | Toda letra es texto mientras escribes |
| Alt + letra se reconoce por la tecla física (`event.code`), no por el carácter | En Mac, ⌥G escribe «©», no «g» |
| Ningún atajo dispara con Ctrl, ⌘ o Shift, ni mientras se compone un carácter | No robarle combinaciones al sistema ni romper una tecla muerta a medias |
| Fuera del test, la letra sola no cuenta si el foco está en un campo de texto | Ahí la letra es lo que estás escribiendo |
| Con un diálogo abierto, no responde ningún botón de atrás | Solo los del diálogo deberían contestar |
| Al terminar una partida, dos segundos sin que ninguna tecla haga nada, Espacio incluido | Las letras que todavía iban en camino caían en los botones de los resultados |
| Mantener una tecla apretada no repite el atajo | Un botón no debería abrirse y cerrarse solo |

<p class="tbl-note">Cada fila es una condición en el código que decide si una tecla es un atajo o no.</p>

```js
// Simplificado: ¿esta tecla es un atajo?
const match = (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return null;
  let letter = null;
  if (event.altKey) {
    // La tecla física: KeyL → "l", Digit3 → "3"
    const found = /^(?:Key([A-Z])|Digit([0-9]))$/.exec(event.code ?? "");
    letter = found ? (found[1] ?? found[2]).toLowerCase() : null;
  } else if (!typingNow && !isEditable(event.target)) {
    letter = event.key?.length === 1 ? event.key.toLowerCase() : null;
  }
  // El botón puesto en pantalla más recientemente gana
  return letter ? newestEnabledHotkeyFor(letter) : null;
};
```

La regla de los dos segundos la comprueba un test de Playwright: termina una partida, aprieta «f» y Espacio enseguida, y verifica que no se abrió ningún diálogo y que los chips todavía no aparecen. Recién después, la «L» sola abre los retos.

### Las letras de Mac

Elegir las letras no fue solo cuestión de iniciales. En Mac, ⌥ más E, I, N o U no da una letra: es una tecla muerta que espera la siguiente para ponerle un acento. Con esas cuatro, ⌥ + letra no funciona como atajo. Por eso la barra de arriba las esquiva, y por eso «Entrenar ahora» empezó en la **E** y terminó en la **D**. El marcapasos también se movió: estaba en la **M**, pero cuando el menú de modos necesitó una letra, la **M** de «Modo» ganó y el marcapasos pasó a la **B**.

## Teclas dentro de cada menú

En la última iteración, los menús de la barra de configuración también se abren con su tecla, con Alt/⌥ en el test: **M** el menú de modos, **1–9** el tiempo o la cantidad en orden (⌥1 es 15 s, o 10 palabras), **J** lo propio del modo y **W** las opciones.

Y adentro de un menú abierto, cada opción tiene su tecla, escrita en la opción y sin Alt, porque con el menú abierto nada va al texto:

| Menú | Teclas |
| --- | --- |
| Modos | T Tiempo, P Palabras, N Números, C Cita, L Clásicos, D Dictado, O Código, M Mi texto, E Entrenar, F Dedos, Z Zen |
| Dedos | La tecla de la fila guía donde descansa cada dedo; 1–5 para mano izquierda, mano derecha, las dos, índices y meñiques |
| Opciones | P puntuación, S sin red, M muerte súbita, C corregir para avanzar, y 0/9/5/8 para la precisión mínima |
| Apariencia del texto | F fuente, T tamaño, I interlineado, C cursor, O foco, A alto contraste |
| Sonido e idioma | I idioma, P textos para practicar, S sonido general, T tecleo, E errores, L logros y récords |

<p class="tbl-note">Las flechas, Tab, Enter, Espacio y Esc siguen funcionando como siempre adentro de cada menú.</p>

El menú de Dedos tiene un detalle que conecta con el otro post de esta serie. Cada dedo se elige con la tecla donde descansa, y esa tecla se reconoce por su posición física, no por lo que imprime: en un teclado latinoamericano el meñique derecho es la **Ñ**; en Dvorak, el índice derecho es la **H**.

<figure>
  <img srcset="/img/projects/swiftflow/layouts-dedos-dvorak-800.webp 800w, /img/projects/swiftflow/layouts-dedos-dvorak-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/layouts-dedos-dvorak-1600.webp" alt="El selector de dedos de SwiftFlow abierto con la distribución Dvorak: cada dedo muestra arriba la tecla donde descansa (A, O, E, U, H, T, N, S) y los atajos 1 a 5." loading="lazy" decoding="async" />
  <figcaption>El menú de Dedos en Dvorak: cada dedo se elige con su tecla de la fila guía, y los atajos con 1–5.</figcaption>
</figure>

Las teclas de menú se escuchan en la fase de captura, antes que la pantalla del test, y la tecla que un menú usa no llega a ningún otro lado. Un test lo cubre: con el foco en el campo de texto abre los modos, elige Dedos con «f», los meñiques con «5», agrega el anular izquierdo con «s», activa «Sin red» y la precisión mínima de 90 %, y al final comprueba que el campo de texto sigue vacío.

## Foco, diálogos y lector de pantalla

Que todo se pueda hacer con el teclado no sirve si el foco se pierde. Todos los diálogos usan la misma pieza, y hace cuatro cosas:

1. Al abrirse, guarda qué elemento tenía el foco y lo mueve adentro: a lo que se le indique (el buscador, en la paleta) o al primer elemento enfocable.
2. Tab y Shift+Tab dan la vuelta adentro del diálogo en lugar de irse a la página de atrás.
3. Esc lo cierra. Escucha en fase de captura, así los atajos de la página (Espacio para reiniciar, escribir en cualquier lado) nunca ven las teclas que eran para el diálogo.
4. Al cerrarse, devuelve el foco a lo que lo abrió, si sigue en la página.

Dos detalles que solo vi usándolo:

- El buscador de la paleta recibe el foco en cuanto se dibuja. Si espera un cuadro, la primera letra de alguien que escribe rápido después de Ctrl+K cae en el texto del test.
- Espacio sobre un botón con foco lo presiona, en lugar de empezar otra partida o escribir.

Tab también tiene su regla. A mitad de una partida empieza de nuevo con otro texto, pero sin nada escrito, o en pausa, mueve el foco como siempre. Si Tab siempre reiniciara, alguien que navega con el teclado quedaría atrapado en el campo de texto.

Para el lector de pantalla hay dos regiones `aria-live`, una cortés y otra que interrumpe. Los resultados, los logros, el coach y las pausas se anuncian ahí: al terminar se oye algo como «Terminaste: 64 palabras por minuto, 97 % de precisión, 0 errores». Cada mensaje entra como una línea propia y se quita a los diez segundos. Así, si llegan dos juntos (los resultados y un logro), se leen los dos. La paleta también avisa cuántos comandos encontró, y al ejecutar uno dice «Listo:» y el nombre. Los números se leen como se dicen en cada idioma: «64,5» en español, «64.5» en inglés. Y como los chips son `aria-hidden`, cada botón lleva su tecla en `aria-keyshortcuts`.

El alto contraste sigue el ajuste del sistema (`prefers-contrast: more`) hasta que lo cambias en el menú del texto. A partir de ahí manda lo que elegiste.

<figure>
  <img srcset="/img/projects/swiftflow/teclado-atajos-800.webp 800w, /img/projects/swiftflow/teclado-atajos-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/teclado-atajos-1600.webp" alt="La lista «Atajos de teclado» de SwiftFlow: ⌘K abre o cierra los comandos, Tab empieza de nuevo, Espacio para otra partida, Esc pausa, ? muestra la lista, A–Z presiona el botón y ⌥ A–Z hace lo mismo en el test." loading="lazy" decoding="async" />
  <figcaption>«?» en el historial abre la lista de atajos. El foco entra directo en «Volver a los comandos».</figcaption>
</figure>

## Cómo lo compruebo

Nada de esto se mantiene solo. Hay tres tipos de prueba:

- **axe en Playwright.** Un test recorre cada pantalla y cada diálogo (el test, el menú del texto, a mitad de una partida, los resultados, «¿Dónde te frenaste?», el historial, el resumen, el curso y la landing) y corre axe con las reglas WCAG 2.0 y 2.1, niveles A y AA. Con alto contraste, en tema claro y oscuro, no puede haber ni una violación. En el tema normal se excluye una sola regla, la de contraste de color, porque el color de la marca no la pasa. Prefiero decirlo así a esconderlo: por eso existe el alto contraste.
- **El foco.** Abre «¿Dónde te frenaste?» con Espacio, aprieta Tab ocho veces y Shift+Tab una, y en cada paso comprueba que el foco sigue adentro. Con Esc, verifica que el foco volvió al botón que lo abrió y que la pantalla de resultados sigue ahí.
- **El teclado.** Tests de la paleta («30» elige Tiempo 30 s, «pal 50» elige Palabras 50, Tab reinicia, «?» muestra la lista fuera del test) y de cada tecla de botón y de menú, con y sin Alt.

Hay uno más que me gusta. Una partida armada desde el teclado (con la paleta o con la tecla de un botón) y terminada sin tocar el mouse queda marcada en el historial. Eso alimenta dos logros, «Sin soltar el teclado» y «El mouse junta polvo» (25 partidas así), y un reto diario. El test arma la partida con «palabras 10», la juega, comprueba la marca, hace un clic y verifica que la siguiente ya no la tiene.

## Cómo llegó a esto

Todo esto pasó en pocos días y en cuatro pasos, cada uno con su commit:

| Fecha | Paso |
| --- | --- |
| 25/09/2026 | Teclado, lector de pantalla y alto contraste: diálogos que atrapan y devuelven el foco, anuncios y axe en CI |
| 27/09/2026 | La paleta en Ctrl/⌘K, Tab para empezar de nuevo y ? para los atajos |
| 28/09/2026 | Cada botón con su tecla, y el curso sin mouse |
| 28/09/2026 | La barra de configuración con teclas, y una tecla por opción dentro de cada menú (primero los de modos, dedos y opciones; después apariencia y sonido) |

<p class="tbl-note">Según el historial de commits del repositorio de SwiftFlow.</p>

En el camino también arreglé un Esc que hacía más de lo que debía. Si te quedabas pensando, a los tres segundos sin escribir la partida se pausaba sola, y el Esc que apretabas después la terminaba. Ahora solo la termina un segundo Esc sobre una pausa que pediste.

## Lo que no está

- En el celular, los chips no se muestran, a propósito. La app funciona con toque, pero esta capa es para teclados físicos.
- Lo que un lector de pantalla dice de verdad no lo prueba ningún test automático. La hoja de ruta lo trata como una revisión aparte del flujo principal: axe encuentra problemas de estructura, pero no reemplaza escuchar la app de punta a punta.
- Alt + letra se reconoce por la posición física de la tecla, con el nombre que le da un teclado estadounidense (`KeyL`). Con una distribución distinta configurada en el sistema, el atajo sigue a la posición y no a la letra impresa. Es el precio de que ⌥ funcione en Mac.

## Si vas a hacer algo parecido

- Empieza por la regla de conflicto, no por los atajos: decide cuándo una tecla es texto y cuándo es comando, y escríbelo en un solo lugar.
- Muestra la tecla en el botón. Una lista de atajos escondida no la lee nadie; un chip de dos caracteres al lado del botón sí.
- Haz que la tecla solo exista mientras el botón existe. Así un atajo nunca hace algo invisible.
- Prueba en Mac con ⌥. Te va a cambiar letras.
- Trata el foco como estado: guárdalo al abrir y devuélvelo al cerrar, y piensa qué hace Tab en cada pantalla.
- Pon axe en los e2e de cada pantalla y de cada diálogo, y escribe en el código qué regla excluyes y por qué.

> Lo que me llevo: hacer algo usable con el teclado no es sumar atajos, es decidir qué hace cada tecla en cada momento. Cuando esa decisión vive en un solo lugar y tiene sus tests, alcanza para no soltar el teclado nunca.
