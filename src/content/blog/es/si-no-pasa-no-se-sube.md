---
title: "Si no pasa, no se sube: certificar apps para pantallas con Playwright"
description: "Desbordes, CPU lenta, sin red y 24 horas de reloj acelerado: la certificación automática que toda app de Wink pasa antes de publicarse."
date: 2026-10-12
tags: [testing, playwright, wink]
projects: [wink-studio]
cover: /img/projects/wink-studio/report.webp
kind: learning
keyword: "certificación"
---

Una app de [Wink](/project/wink-app) corre en una Raspberry Pi 4 con Chromium, conectada a una pantalla que nadie toca, las 24 horas, con un reinicio diario de madrugada. Vive dentro de un iframe, al lado de videos y otras apps, y la destruyen y la vuelven a crear cada vez que el layout cambia de escena. Si se rompe, nadie lo ve hasta que un cliente llama.

Por eso en Wink Studio ninguna app se publica sin pasar una certificación automática. Cada prueba termina en uno de tres estados: «Bien», «Revisar» o «No pasa». Una sola en «No pasa» y la app no se sube, y el CI tampoco deja mergear.

<figure>
  <img srcset="/img/projects/wink-studio/report-800.webp 800w, /img/projects/wink-studio/report-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/report-1600.webp" alt="Reporte de certificación de Menú del día: 51 pruebas, todas bien." loading="lazy" decoding="async" />
  <figcaption>Reporte de certificación de Menú del día: 51 pruebas, todas bien.</figcaption>
</figure>

## Qué corre, en orden

`npm run certify <app>` hace todo esto, de lo más barato a lo más caro:

- Build de producción con Vite, compilado para Chromium 134 (el navegador del player).
- Revisión del paquete: las reglas del hosting (hasta 500 archivos y 20 MB, solo extensiones permitidas, nombres en ASCII) y los presupuestos para la Pi: JavaScript de hasta 60 KB con gzip, código de hasta 300 KB y paquete completo de hasta 1,5 MB.
- Revisión del código fuente: lo prohibido, llaves escritas en el código y hosts no declarados.
- Las pruebas unitarias de la app. Sin pruebas, no pasa; con menos de cinco, queda para revisar.
- Chrome con Playwright: la app dentro de un player falso de otro origen, en los once tamaños y en todos los escenarios.

Al final deja dos archivos: `report.json`, para el CI, y `report.html`, para mirar, con capturas de cada tamaño y de cada escenario. Para tener una idea de qué sale, estos son algunos números del último reporte de Menú del día:

| Prueba | Resultado |
| --- | --- |
| Paquete | 14 archivos · JS 12,9 KB con gzip · código 63,3 KB · total 192,2 KB |
| Pruebas unitarias | 50 pasan |
| Primer pintado en los 11 tamaños | Entre 16 y 48 ms |
| Primer pintado con la CPU 4× más lenta | 163 ms |
| Recarga sin red, desde el service worker | 44 ms |
| 24 horas de reloj acelerado | Memoria de 1,1 a 1,3 MB; nodos de 163 a 161 |
| Total | 51 pruebas bien, en poco menos de dos minutos |

<p class="tbl-note">Medido en Chrome de escritorio, no en la Pi.</p>

Estos son los grupos de pruebas que más me enseñaron.

## 1. Tamaños: nada afuera, nada encimado, nada cortado

La app se monta en cada uno de los 11 tamaños (de 60×30 a 4K, con tiras horizontales y verticales). En cada uno, la certificación recorre todos los elementos visibles que tienen texto propio o son una imagen, y revisa:

- Scroll: la página es más grande que la caja. No pasa.
- Afuera: un elemento se sale de la caja de la app. No pasa.
- Encimado: dos elementos que no son uno dentro del otro se tapan en más del 20 % del más chico. No pasa.
- En blanco: no hay nada visible. No pasa, salvo que el tamaño esté debajo del mínimo que declara la app.
- Cortado: tiene texto, su overflow no es visible, no usa «…» y aun así su contenido es más grande que su caja. Queda para revisar.
- `wink:ready`: la app tiene que avisar que pintó en menos de 1 s. Entre 1 y 3 s queda para revisar; sin aviso a los 3 s, no pasa, porque el player lo tomaría como «no cargó».

```ts
// ¿Texto cortado sin «…»? (simplificado)
const cs = getComputedStyle(el);
const ellipsis = cs.textOverflow === "ellipsis" || cs.webkitLineClamp !== "none";
const cortado =
  cs.overflow !== "visible" && !ellipsis &&
  (el.scrollWidth > el.clientWidth + 3 || el.scrollHeight > el.clientHeight + 3);
```

Ese `+ 3` es una tolerancia de 3 px. Existe porque todas las apps se desplazan 2 px cada tanto para cuidar la pantalla, y sin esa tolerancia el propio desplazamiento contaría como desborde.

Las reglas no salieron completas la primera vez; se fueron ajustando con las apps. `line-clamp` pasó a contar igual que «…», y para lo decorativo que va debajo del texto o se asoma a propósito (las gotas y las estrellas del fondo del Clima) agregué un atributo: lo que se marca con `data-wk-decor` no cuenta ni como encimado ni como desborde. Así el chequeo puede ser estricto sin dar falsos positivos.

## 2. Con player, sin player y con un equipo lento

El player instalado hoy todavía no le habla a la app, así que la app tiene que funcionar sola, con los valores del manifiesto y los ajustes de la URL. La certificación la monta una vez sin mandarle el contexto del player y revisa que igual pinte.

Después mide el primer pintado con la CPU cuatro veces más lenta, como aproximación a la Pi. Como la app es de otro origen, Chrome la corre en otro proceso: hay que frenar el frame de la app, no la página del player, y recargarla ya frenada. Se hace con el protocolo de Chrome DevTools:

```ts
// Simplificado
const cdp = await context.newCDPSession(frameDeLaApp);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await frameDeLaApp.evaluate(() => location.reload());
const ms = await esperarReady();
```

## 3. Ajustes al límite

Los ajustes los llena el cliente, así que la certificación los llena peor que cualquier cliente:

- Cada texto al máximo que permite el manifiesto, repitiendo «Wéñ😀 » (acentos, eñe y emoji a la vez).
- Las listas llenas hasta su tope, con cada campo al límite.
- Colores grises sobre grises (#777777, #888888, #7a7a7a) para forzar la corrección de contraste.
- La última opción de cada lista de opciones y cada interruptor al revés de su valor por defecto.

Eso se monta en 480×270, 1920×360, 1080×1920 y 240×120, y no puede haber desbordes ni encimados. Aparte, cada texto se llena con `<img src=x onerror=…>`: si ese HTML se ejecuta, no pasa. Y por último se rompe el fragmento de la URL a mano (`#wink=%%%roto`): la app tiene que seguir viéndose con sus valores por defecto.

## 4. Escenas: 20 cargas seguidas y dos copias a la vez

Cada cambio de escena destruye la app y la vuelve a cargar, y en una transición fade hay dos copias vivas durante unos 700 ms. La certificación monta y desmonta la app 20 veces seguidas, con 60 ms entre una y otra, y revisa que no aparezcan errores en la consola. Después monta dos copias al mismo tiempo y las dos tienen que avisar que cargaron. Si una app guarda algo como si fuera la única instancia, acá se nota.

## 5. Sin red

En una tienda la red se cae. La prueba tiene tres pasos: que la app siga viéndose cuando el player avisa que no hay red, que registre su service worker (tiene 5 s para quedar activo) y, lo más importante, que vuelva a cargar con la red cortada de verdad. Si la app no carga sin internet, el siguiente cambio de escena deja la pantalla en negro.

Hay un detalle de plataforma: hoy el hosting donde se publican las apps todavía no sirve service workers (responde 403 al script) y la opción para habilitarlos está pedida. El SDK lo intenta, falla en silencio y la app sigue igual. La certificación sí lo prueba con su propio servidor, así que cuando el hosting lo habilite, las apps ya van a estar probadas.

## 6. Un día entero en dos minutos

La prueba que más me gusta es el remojo: 24 horas de uso en un par de minutos. Playwright instala un reloj falso y lo adelanta de hora en hora; la app cree que pasó un día entero, con sus timers, sus rotaciones y sus cambios de horario.

```ts
// Simplificado
await context.clock.install();
// …montar la app…
const antes = await memoriaUsada();
for (let h = 0; h < 24; h++) {
  await context.clock.runFor(60 * 60 * 1000); // una hora
  muestras.push(await contarNodos());
}
const despues = await memoriaUsada();
```

La memoria se mide en el frame de la app (que corre en otro proceso) después de forzar el recolector de basura. Los umbrales:

|  | Memoria JS | Nodos del DOM |
| --- | --- | --- |
| Bien | Crece hasta 2 MB | Crecen hasta 20 |
| Revisar | Más de 2 MB | Más de 20 |
| No pasa | Más de 10 MB | Más de 200 |

Hay un detalle: lo que muestra una app cambia durante el día. La primera versión de esta prueba marcaba el Clima para revisar: arrancaba a las 17:30 con sol, a las 24 horas llovía, y las 22 gotas decorativas de más parecían una fuga. Por eso ahora el conteo ignora lo marcado como decorativo, y el final no se compara con el inicial sino con lo más alto de las primeras 12 horas. Una fuga sigue creciendo y lo pasa; un cambio de contenido no.

## 7. Lo que no se puede escribir

También hay reglas de código que se revisan solas, leyendo el `src/` de la app sin comentarios (para que una regla mencionada en un comentario no cuente):

| Regla | Si aparece | Por qué |
| --- | --- | --- |
| Sin `alert`, `confirm` ni `prompt` | No pasa | Traban el player entero |
| Sin `window.open` | No pasa | El player no tiene ventanas |
| Sin tocar `window.top` ni `window.parent` | No pasa | Solo el SDK le habla al player |
| Sin `eval`, `new Function` ni `document.write` | No pasa | Inseguro, y rompe la página |
| Sin cookies | No pasa | No se usan |
| Sin `backdrop-filter` ni blur grande | No pasa | La GPU de la Pi se comparte con el video |
| Sin Google Fonts ni CDNs | No pasa | Todo va dentro del paquete |
| Sin `innerHTML` | Revisar | Con textos del cliente es una puerta a inyectar código |
| Fechas con `Intl` y la zona del SDK | Revisar | El equipo no tiene zona horaria configurada |
| Medidas en `cq*`, no en `vw`/`vh` | Revisar | El iframe puede no ser toda la pantalla |

Además busca patrones de llaves conocidas (Google, Stripe, GitHub, AWS, Slack, llaves privadas) y cualquier URL en el código cuyo host no esté declarado en el manifiesto. Mientras la app corre, una trampa reemplaza `alert` y compañía para avisar si alguien los llama, y todo pedido a un host externo se corta: la prueba no tiene internet, y al final se compara la lista de hosts pedidos con la declarada.

## Escenarios: lo que la app muestra solo a veces

Con los ajustes de ejemplo, el Clima nunca muestra el aviso de tormenta y el Menú siempre está en el mismo servicio. Para eso cada app puede traer un `certify.json` con escenarios: ajustes y, si hace falta, una hora fija en la que se congela el reloj del navegador. Cada escenario se prueba en los once tamaños, con captura.

```json
{ "scenarios": [
  { "name": "Desayuno", "at": "2026-10-08T14:00:00Z", "settings": {} },
  { "name": "Sin platillos", "settings": { "items": [] } }
] }
```

Menú del día tiene nueve: desayuno, almuerzo, cena, cocina cerrada, pantalla de bebidas y postres, pocos platillos, cafetería en dólares sin categorías, sin descripciones ni destacados y sin platillos. Los escenarios entraron junto con un arreglo del Clima, cuyo aviso de lluvia se montaba sobre los días en la tarjeta; antes de arreglarlo comprobé que la certificación fallaba con el CSS anterior. La regla que me quedó: si una app muestra algo solo en ciertos casos, ese caso va como escenario, porque si no, la certificación no lo ve.

## En el CI, solo lo que cambió

Certificar una app toma de un par de minutos a varios: en los últimos reportes, entre uno y nueve, según cuántos escenarios trae y cuánto tarda cada uno. Con diez apps, certificar todo en cada PR sería lento. Un script mira qué archivos cambiaron contra la rama base y decide:

```ts
// Simplificado
const COMPARTIDO = [/^packages\//, /^scripts\//, /^package(-lock)?\.json$/, /^\.github\//];

function queCertificar(cambios: string[], apps: string[]) {
  if (cambios.some((f) => COMPARTIDO.some((re) => re.test(f)))) return ["template", ...apps];
  return apps.filter((id) => cambios.some((f) => f.startsWith(`apps/${id}/`)));
}
```

- Si cambió una app, se certifica esa.
- Si cambió algo compartido (el SDK, los scripts, el lock, la configuración o el propio CI), se certifican todas, más la plantilla.
- Si solo cambió documentación, nada.
- Si no se sabe qué cambió (un push forzado, la primera vez), todas.

Los reportes de cada corrida quedan como artefacto del CI, aunque falle. Y para certificar todo a mano hay un botón en GitHub Actions.

## Lo que la certificación todavía no cubre

- Corre en el Chrome instalado, que es más nuevo que el Chromium 134 del player. Se le puede pasar la ruta de un Chromium 134, pero eso no reemplaza al equipo real.
- La CPU 4× más lenta es una aproximación. Los presupuestos de tamaño se van a calibrar con números reales de la Pi.
- La lista para publicar todavía incluye probar cada app una hora en una Pi 4, en horizontal, en vertical y sin red. Esa parte es a mano.

Las diez apps pasan la certificación, sin pruebas para revisar. Ninguna está publicada todavía: publicarlas espera al backend de [Wink](/project/wink-app).

## Lo que le diría a alguien que arma algo así

- Empieza por lo que ya te dolió. Cada prueba de esta lista corresponde a algo que pasa en una pantalla real: un `alert` que traba el player, una escena que no carga sin red.
- Usa tres estados, no dos. «Revisar» deja avanzar sin esconder el problema.
- Cuando una prueba da un falso positivo, arregla la prueba con una regla explícita (como `data-wk-decor`), no bajando el umbral.
- Deja evidencia. Una captura por tamaño hace que el reporte se lea en un minuto.
- Comprueba que la prueba falla. Antes de dar por bueno un arreglo, vuelve al código roto y mira que la certificación lo marque.

> Lo que me llevo: una regla que vive en un documento se olvida; una regla que vive en la certificación se cumple. Y el error aparece en el reporte, no en la pantalla de un cliente.
