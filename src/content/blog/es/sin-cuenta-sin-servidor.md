---
title: "Sin cuenta y sin servidor: cómo SwiftFlow guarda todo en tu navegador"
description: "Qué guarda SwiftFlow, dónde y con qué límites; qué se calcula en vez de guardarse; el respaldo como archivo, la PWA sin conexión, Tu resumen sin backend y lo que cuesta no tener servidor."
date: 2026-10-13
tags: [swiftflow, local-first, pwa, privacidad]
projects: [swiftflow-typing-test]
kind: learning
keyword: "local-first"
cover: /img/projects/swiftflow/local-resumen.webp
---

Hice [SwiftFlow](/project/swiftflow-typing-test) porque el test de mecanografía que usaba se llenó de anuncios. Desde el principio tuve claras tres cosas: sin anuncios, sin cuenta y sin un servidor que guarde lo que escribes. Abres la página y escribes; todo lo que la app sabe de ti queda en tu navegador.

A eso se le suele llamar local-first: los datos viven en el dispositivo y la app funciona sin depender de nadie. Suena simple, pero obliga a decidir cosas que con un backend ni te planteas: cuánto cabe, qué pasa cuando no cabe, cómo te llevas tu historial a otra computadora y qué no se puede hacer. Esto es lo que aprendí resolviéndolas.

## Qué significa local-first en SwiftFlow

SwiftFlow es una app de Vue compilada con Vite y servida como archivos estáticos desde Netlify. No hay API propia, ni base de datos, ni cuentas. Tampoco telemetría: no hay analítica ni llamadas de red desde el código de la app. Lo único que viaja por internet es la app misma, la primera vez que la abres.

Incluso el modo Dictado, que lee frases en voz alta, usa las voces del sistema (`speechSynthesis`), sin mandar el texto a ningún lado. Y la página lo dice en sus preguntas frecuentes: «¿Dónde se guardan mis datos?» «En tu navegador, en este dispositivo, y en ningún otro lado».

## Qué se guarda y dónde

Todo vive en `localStorage`, como texto JSON. No uso IndexedDB: los datos son pocos y simples, y `localStorage` se lee de forma síncrona al arrancar, sin esperar a nada. Cada cosa tiene su propia clave:

| Clave | Qué guarda |
| --- | --- |
| `swiftflow_results` | Las sesiones terminadas: wpm, precisión, errores por tecla, tiempos |
| `swiftflow_config` | El modo, la duración, las opciones, el teclado, el idioma de los textos |
| `swiftflow_best_wpm_v3` (y `_en`) | El récord, uno por idioma de práctica |
| `swiftflow_ghosts` | La mejor partida de cada tipo, para correr contra ella |
| `swiftflow_key_review` | El calendario de repaso de las letras entrenadas |
| `swiftflow_xp` y `swiftflow_perfect_rounds` | La experiencia y las rondas perfectas |
| `swiftflow_custom_texts` | Tus textos de «Mi texto» (hasta 20, de hasta 5.000 caracteres) |
| `swiftflow_locale`, `swiftflow_theme`, `swiftflow_contrast` | Idioma, tema y alto contraste |
| `swiftflow_text_appearance`, `swiftflow_sound_settings` | Fuente, tamaño, cursor y sonidos |
| `swiftflow_weekly_goal`, `swiftflow_streak_reminder`, `swiftflow_palette_recent` | La meta semanal, el recordatorio de racha y los comandos usados hace poco |

<p class="tbl-note">Las claves principales. Ninguna sale del navegador.</p>

## La persistencia, detrás de una función

Una regla que me sirvió mucho: ningún componente ni store toca `localStorage` directamente. Cada cosa que se guarda tiene su `xRepository.js`, con la clave privada al módulo, y una API de funciones pequeñas. Si lo guardado no se puede leer, devuelve un valor por defecto en lugar de lanzar un error.

```js
// Simplificado: así se ve un repositorio.
const STORAGE_KEY = "swiftflow_results";

export const getResults = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
```

La configuración va un paso más allá: al cargarla, se sanea contra las opciones válidas de hoy. Si guardaste un lenguaje de código que después quité, no se rompe nada: vuelve al valor por defecto. Y el día que haya backend, solo cambian los repositorios; ni el store ni la vista.

## Cuánto se guarda: 200 sesiones y el peso del tiempo

`localStorage` tiene un límite de espacio, y una app que guarda cada partida tiene que pensar en él. El historial se corta en las 200 sesiones más recientes desde el primer día.

El problema llegó después, cuando empecé a medir cuánto tarda cada tecla y cada transición entre dos letras. Ese detalle es lo más pesado de una sesión: unos 2,5 KB, contra unos 0,6 KB de todo lo demás. Y solo se lee para las sesiones más nuevas: las estadísticas de teclas lentas miran las últimas 30. Así que pasadas las 40 más recientes, ese detalle se descarta y la sesión se queda: wpm, precisión, errores y confusiones se guardan siempre, igual que récords, rachas y logros.

```js
// Simplificado: guardar nunca rompe la pantalla de resultados.
const results = [entry, ...getResults()]
  .slice(0, 200)
  .map((r, i) => (i < 40 ? r : withoutTiming(r)));

try {
  save(results);
} catch {
  // Sin espacio (o almacenamiento bloqueado): sin tiempos, otra vez
  try { save(results.map(withoutTiming)); } catch { /* se ve, no se guarda */ }
}
```

Ese `try` doble no estaba al principio. Guardar lanzaba una excepción con el almacenamiento lleno, y eso tumbaba la pantalla de resultados a mitad de render. Ahora, si no hay forma de guardar, la partida igual se muestra; solo no queda en el historial.

## Lo que no se guarda: se calcula

Lo que más simplificó todo fue guardar lo mínimo y calcular el resto a partir del historial:

- Los 94 logros: cada uno tiene una función `check()` que recibe un contexto calculado del historial completo. El estado «desbloqueado» nunca se guarda, así que no puede desincronizarse.
- El progreso del curso: las estrellas de cada lección salen de los resultados de esa lección.
- Los retos diarios: la fecha decide cuáles tocan, y las sesiones anteriores a ese día fijan qué tan difíciles son. Los días pasados se recalculan, así que un reto nuevo solo puede sumarse desde el día siguiente y al final de su lista.

La experiencia y las rondas perfectas son la excepción: se calculan del historial la primera vez y después se guardan aparte. Como el historial se corta en 200, esas cuentas pueden saber más que él. Por eso, al importar un respaldo, se queda con el mayor de los dos números: nadie debería perder experiencia por recuperar sus datos.

## Récords por idioma, sin migrar nada

Cuando SwiftFlow empezó a tener textos en inglés, cada sesión tuvo que saber en qué idioma se jugó. Para no tocar lo ya guardado, la regla fue: el español no se anota. Una sesión vieja, sin campo de idioma, se lee como española, que es lo que era. Solo las partidas en inglés llevan `textLanguage: "en"`, y el récord en inglés tiene su propia clave (`swiftflow_best_wpm_v3_en`). Los datos de antes siguieron funcionando sin una sola migración.

## Exportar e importar: el respaldo es un archivo

Durante unos días, todo el historial vivió en una sola clave, sin salida. Un «borrar datos de navegación» y se perdían meses de práctica, sin forma de pasarlo a otra computadora. La solución fue lo más simple que no necesita servidor: en el historial, «Exportar» descarga un archivo `swiftflow-AAAA-MM-DD.json` con tus sesiones, e «Importar» lo vuelve a leer.

```json
{
  "app": "swiftflow",
  "version": 1,
  "exportedAt": "2026-10-13T…",
  "results": [ … ]
}
```

Ese archivo es el único lugar por donde entran datos de afuera, así que lo trato como hostil:

| Caso | Qué pasa |
| --- | --- |
| No es JSON | «El archivo no es un JSON válido.» |
| Es JSON, pero no de SwiftFlow | «Ese archivo no es una copia de SwiftFlow.» |
| No trae sesiones | «La copia no tiene sesiones adentro.» |
| Algunas sesiones no se leen | Se descartan y se cuentan: «Se saltearon … sin leer.» |
| Una sesión ya existe | Gana la de este dispositivo |

<p class="tbl-note">Los mensajes tal como aparecen en la app. Nada de esto lanza un error.</p>

Importar fusiona por id en vez de reemplazar: traer el historial de otra computadora no debería borrar lo que hiciste en esta. Si una sesión está en los dos lados, gana la local, que es la que se fue manteniendo (por ejemplo, con los tiempos ya recortados). Y lo importado pasa por el mismo tope de 200 y el mismo recorte que una partida normal.

Tampoco hay diálogos de confirmación: congelan la página. «Borrar historial» usa dos pasos en el mismo botón, «¿Confirmar borrado?», con una línea de estado debajo.

Un detalle que conviene saber: el archivo lleva las sesiones. Logros, curso y retos se reconstruyen solos a partir de ellas; la configuración, tus textos propios, los fantasmas y el calendario de repaso no viajan en el respaldo.

## Instalable y sin conexión

SwiftFlow se instala como PWA con `vite-plugin-pwa`. En cada build genera el manifiesto y un service worker que precachea la app:

```js
// vite.config.js (simplificado)
VitePWA({
  registerType: "autoUpdate",
  // También las fuentes del texto, para que la elegida ande offline
  workbox: { globPatterns: ["**/*.{js,wasm,css,html,woff2}"] },
  manifest: {
    name: "SwiftFlow",
    lang: "es",
    theme_color: "#f97316",
    display: "standalone",
    start_url: "/",
  },
});
```

El `woff2` de ese patrón tiene su historia. Cuando agregué fuentes para el texto (JetBrains Mono, Atkinson Hyperlegible, OpenDyslexic), cada una se carga solo cuando la eliges. Si el service worker no las precacheaba, la fuente que elegiste desaparecía sin conexión. Ahora van en el paquete, se cargan al elegirlas y se precachean para usarlas offline.

Para instalarla hay un botón propio, «Instalar app». El navegador ofrece la instalación una sola vez con el evento `beforeinstallprompt`. Lo atrapo al cargar la página y lo guardo para cuando lo pulses. Safari y Firefox no disparan ese evento, así que ahí el botón simplemente no aparece y se instala desde el menú del navegador.

## Tu resumen, sin backend

<figure>
  <img srcset="/img/projects/swiftflow/local-resumen-800.webp 800w, /img/projects/swiftflow/local-resumen-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/local-resumen-1600.webp" alt="La página Tu resumen de SwiftFlow con partidas, minutos, récord, velocidad promedio, precisión, modo favorito, racha y logros nuevos del mes." loading="lazy" decoding="async" />
  <figcaption>«Tu resumen», armado con tres partidas de prueba en un navegador limpio: todo sale del historial local.</figcaption>
</figure>

«Tu resumen» (`/resumen`) cuenta un mes o un año de práctica: partidas, minutos, días, tu mejor sesión y si fue récord, el promedio contra el período anterior, la precisión, la tecla que domaste, tu modo favorito, la racha más larga, el día con más partidas y los logros nuevos. Todo sale del historial, en el navegador. El período queda en la URL (`/resumen?periodo=2026-09`), así que puedes volver al mismo.

Lo que se comparte es una imagen, no un enlace. Con los datos solo en tu navegador, un enlace abriría el resumen de quien lo abre, con su propio historial. Así que la tarjeta se dibuja en un `<canvas>` cuadrado de 1080 px, se muestra en una vista previa y se descarga o se comparte. Si el navegador acepta compartir archivos (`navigator.canShare`), aparece la hoja de compartir del sistema; si no, queda la descarga. La tarjeta de cada resultado funciona igual, con un diseño distinto cuando es récord.

## Lo que cuesta no tener servidor

Local-first no es gratis. Estos son los costos que acepté:

- Si borras los datos del sitio, se pierde todo. Lo único que lo evita es exportar de vez en cuando.
- No hay sincronización. Usar SwiftFlow en dos dispositivos es tener dos historiales. Se juntan a mano: exportas en uno e importas en el otro.
- Si el almacenamiento está bloqueado (como en algunos modos privados), la app funciona igual, pero no recuerda nada al recargar.
- El recordatorio de racha solo llega con SwiftFlow abierto, aunque sea en una pestaña de fondo. Avisar con la app cerrada necesita un servidor: Web Push requiere uno que mande el aviso, las notificaciones programadas fueron un experimento de Chrome que se abandonó, y Periodic Background Sync solo existe en Chrome con la app instalada y corre cuando el navegador decide. El propio aviso lo explica.
- No hay tabla de posiciones pública: necesitaría guardar resultados de todos, apodos o cuentas y alguna defensa contra marcas falsas.

## Cómo llegó a ser así

El historial de git cuenta el orden en que fueron apareciendo los problemas:

| Fecha | Cambio |
| --- | --- |
| 14/09/2026 | La PWA instalable; la configuración persiste; el historial se guarda, con tope de 200 |
| 16/09/2026 | Las sesiones llevan `metricsVersion`: récords y promedios solo comparan lo medido igual |
| 17/09/2026 | Los tiempos por tecla, el recorte después de 40 y guardar sin lanzar errores; exportar e importar |
| 22/09/2026 | El aviso de racha y el recordatorio de la noche, solo con la app abierta |
| 25/09/2026 | Las fuentes precacheadas; los récords por idioma |

<p class="tbl-note">Fechas de los commits del repositorio de SwiftFlow.</p>

El cambio de `metricsVersion` también es local-first: cuando cambié cómo se calcula el WPM, las sesiones viejas no se podían recalcular, porque no tengo los datos crudos en ningún servidor. Así que se quedan en la lista, marcadas, sin contar para récords ni promedios.

## Lo que queda pendiente

En `docs/ideas.md` quedó escrito lo que viene, y cómo lo pensé:

- Desafiar a un amigo con un enlace. El reto semanal ya genera el mismo texto para todos a partir de una semilla, así que solo falta pasar cómo escribió la otra persona. Un fantasma comprimido ocupa unos 600 a 1.000 caracteres y entra en el `#` de la URL, que nunca llega al servidor. La limitación está asumida: sin servidor, nada impide fabricar un enlace con un tiempo imposible.
- Una tabla de posiciones, que sí necesita backend.
- El recordatorio con la app cerrada, por Web Push, cuando exista ese backend. Implica pasar el service worker de `generateSW` a `injectManifest`.

Los repositorios existen justamente para que ese día no haya que tocar el resto de la app.

## Si vas a hacer una app local-first

- Pon cada clave detrás de un módulo con funciones pequeñas, y haz que lea con un valor por defecto en vez de lanzar errores.
- Mide qué pesa cada registro y decide qué se puede soltar con el tiempo. Lo que nadie lee no tiene por qué ocupar espacio.
- Calcula todo lo que se pueda calcular. Lo que no se guarda no se desincroniza.
- Ofrece exportar desde temprano y trata el archivo que entra como hostil.
- Cuando agregues un campo, haz que su ausencia signifique lo que ya había. Así no migras nada.
- Escribe lo que no puedes hacer sin servidor, con el porqué. Te ahorra repetir la investigación.

> Lo que me llevo: sin servidor no hay a quién echarle la culpa ni dónde rescatar los datos. Eso obliga a diseñar con cuidado qué se guarda, qué se calcula y qué pasa cuando el navegador dice que no. A cambio, nadie tiene que crear una cuenta para empezar a escribir.
