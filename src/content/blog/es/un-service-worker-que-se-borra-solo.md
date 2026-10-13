---
title: "Un service worker que se borra solo"
description: "Para que una pantalla siga funcionando sin internet hacía falta permitir service workers en sitios ajenos. El problema es que sobreviven a todo. La salida de emergencia que construí."
date: 2026-10-12
tags: [offline, seguridad, rapisites]
projects: [rapisites]
kind: learning
keyword: "service worker"
---

[Wink](/project/wink-app) planea construir sus propias apps en HTML (clima, menú del día, turnero), subirlas a RapiSites por la API y mostrarlas en pantallas de señalización: una Raspberry Pi con Chromium, encendida todo el día, que pinta cada app dentro de un `<iframe>` de su reproductor. Cuando Wink mapeó ese caso contra lo que RapiSites permitía, su pedido chocó con una regla: los service workers estaban prohibidos en los sitios subidos. Sin service worker, una pantalla que pierde internet queda en blanco.

## Primero: qué es un service worker

Un service worker es un archivo de JavaScript que un sitio le entrega al navegador para que lo guarde y lo ejecute aparte de la página. No dibuja nada ni toca el HTML: se para entre la página y la red, como un intermediario que vive dentro del navegador. Cada vez que la página pide algo (el HTML, una imagen, un script), el pedido pasa primero por él, y él decide qué responder: ir a internet, sacarlo de una caché propia o armar una respuesta.

Esa posición es la que permite que un sitio funcione sin internet. Si mientras hay conexión el service worker guarda una copia de los archivos de la app, cuando la conexión se cae puede responder con esa copia. Para la página no hay diferencia: pidió su HTML y le llegó su HTML.

- Registro: la página le dice al navegador «este es mi service worker» con `navigator.serviceWorker.register()`. Solo funciona en HTTPS (o en `localhost`) y controla las páginas de su carpeta hacia abajo.
- Instalación (`install`): es el momento de guardar en la caché los archivos que la app necesita para arrancar sola: el HTML, el CSS, el JavaScript, las fuentes y los íconos.
- Activación (`activate`): el service worker nuevo toma el control, y es el momento de borrar las cachés de versiones viejas.
- Intercepción (`fetch`): desde ahí, cada pedido de la página pasa por él. Ahí se decide la estrategia: red primero y caché si falla, o caché primero y red para actualizar.

```js
// En la página (simplificado)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

// sw.js (simplificado): guardar al instalar, responder sin red
const CACHE = "app-v1";
const FILES = ["/", "/index.html", "/app.js", "/app.css"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
```

En una pantalla de cartelería eso es justo lo que hace falta. El reproductor recarga la app cada vez que cambia de escena, a veces cada pocos segundos. Si en ese momento la tienda se quedó sin internet, una app sin service worker no carga y la pantalla queda en negro. Con un service worker, la recarga la responde la caché y la pantalla sigue mostrando el menú o el turnero como si nada.

Hay un detalle que importa para el resto de este post: el service worker no muere al cerrar la pestaña. Queda registrado en el navegador, con su caché, y vuelve a activarse la próxima vez que alguien abre el sitio. El navegador revisa si hay una versión nueva del script cuando la página lo registra y, como mucho, cada 24 horas. Esa persistencia es lo que lo hace útil sin internet, y también lo que lo hace peligroso.

La prohibición tenía un buen motivo. Un service worker vive en el navegador del visitante y sobrevive a casi todo: si un sitio se da de baja o se bloquea por abuso, su service worker puede seguir sirviendo la página guardada. En un sitio de phishing, eso es mantener viva una página falsa después de bloquearla.

## Tres reglas que chocaban

El pedido de [Wink](/project/wink-app), del 8 de octubre, no tocaba solo los service workers. Tocaba tres decisiones que había tomado una semana antes, cuando abrí RapiSites a sitios con archivos propios:

- Los service workers estaban prohibidos: todo pedido del script respondía `403`.
- El HTML de un sitio solo para embeber salía con `no-store`, y todo lo demás con `max-age=60`. En el escenario de [Wink](/project/wink-app), cada vuelta de escena (cada 10 a 60 segundos) volvería a pedir todo al servidor.
- El modo de red era todo o nada: o el sitio usaba solo sus propios archivos, o podía llamar a cualquier host. Y el control de acceso fuerte, un token firmado que vence, no estaba construido.

Revisando la zona de Cloudflare de `rapisites.app` apareció además un problema que no venía del pedido: el \*Browser Cache TTL\* estaba en 4 horas y pisaba el `max-age=60` del servidor, y algunas opciones de Cloudflare modificaban el HTML de los sitios subidos (como ofuscar correos o reescribir enlaces a HTTPS). Eso se corrigió en la zona, sin código: respetar las cabeceras del origen y no tocar el HTML.

## Permitirlos, con una salida de emergencia

La solución, escrita como la decisión 035, fue permitirlos con tres condiciones. Solo cuando el sitio lo pide con `offline: true`, una opción que se congela al publicar, como el modo de red. Solo en sitios que no son públicos: los de `access_mode` `embed_only` (solo se sirven dentro de un iframe) o `key` (además piden una llave). Y nunca en la vista previa, porque su dirección vence. En un sitio público, un service worker viviría en el navegador de cualquier visitante, que es justo el caso del phishing.

Y sobre todo, una salida de emergencia: cada vez que el script del service worker no se puede servir, el navegador recibe uno que se desinstala solo. Borra sus cachés, se desregistra y recarga las páginas que controlaba, que esta vez van a la red y ven lo que el servidor responde ahora.

```js
// El service worker de emergencia (simplificado)
self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) await caches.delete(name)
    const pages = await self.clients.matchAll({ type: "window" })
    await self.registration.unregister()
    for (const page of pages) page.navigate(page.url)
  })())
})
```

El orden importa: las páginas controladas se piden antes de desregistrarse, porque después ya no hay a quién preguntarle. Y `skipWaiting()` hace que el reemplazo no espere a que se cierren las pestañas, que en una pantalla encendida todo el día sería nunca.

## Quién recibe qué

El navegador pide el script de un service worker con la cabecera `Service-Worker: script`. Una página no la puede falsear ni quitar: la controla el navegador. Con eso, el servidor decide:

| Situación | Qué recibe el navegador |
| --- | --- |
| Sitio en línea, con `offline: true`, en `embed_only` o `key`, y el script existe en la versión publicada | El script real, con `private, no-cache` y `Service-Worker-Allowed: /` |
| Sitio sin `offline` | El que se desinstala solo |
| Sitio público o vista previa | El que se desinstala solo |
| Sitio bloqueado, dado de baja, despublicado o en impago | El que se desinstala solo |
| La versión nueva ya no trae ese archivo, o no es un script | El que se desinstala solo |

<p class="tbl-note">Solo un caso sirve el script del cliente. Todos los demás lo apagan.</p>

```ts
// La decisión en el servidor (simplificado)
const allowsServiceWorker = (site) =>
  site.offline && !site.isPreview && ["embed_only", "key"].includes(site.accessMode)

if (request.headers["service-worker"] === "script") {
  if (site.state !== "live" || !allowsServiceWorker(site)) return killSwitch()
  const file = resolve(site, request.path)
  if (!file || !isJavaScript(file)) return killSwitch()
  return serve(file, { "cache-control": "private, no-cache", "service-worker-allowed": "/" })
}
```

`Service-Worker-Allowed: /` va en los dos: sin eso, un service worker registrado con alcance `/` desde un script en una carpeta no se podría reemplazar por el de emergencia. Y el de emergencia sale con `no-store`.

## Por qué un 403 no servía

La regla original respondía con un error. Parecía lo más seguro. Pero si el navegador no puede actualizar el service worker, se queda con el anterior y con todo lo que guardó. Un `403` no apaga nada: congela lo que había. Un sitio bloqueado seguía viéndose desde la caché. Para apagar un service worker hay que mandarle otro que se apague.

Esto funciona porque el navegador vuelve a pedir el script cada vez que la página llama a `register()`, y además como mucho cada 24 horas, sin pasar por su propia caché. Así que el interruptor llega solo, sin que nadie toque la pantalla.

Lo probé en Chromium real: un service worker que servía la página desde la caché quedó en cero registros y cero cachés después de recibir el de emergencia. Y una página que lo registra por primera vez no entra en un ciclo de recargas: todavía no está controlada por ningún service worker, así que no se recarga.

Hay un efecto lateral que me gusta: un sitio que antes registraba un service worker sin pedir `offline` ya no ve un `register()` que falla. El registro funciona y el service worker se desinstala solo. Ningún sitio queda con uno vivo.

## La caché que casi lo arruina

La revisión del código encontró un hueco. Cloudflare guarda por URL e ignora la cabecera `Service-Worker`. Sin una regla específica, el script podía salir de la caché del borde (hasta un año, en las rutas que el sitio marca como inmutables) y el servidor nunca llegaba a decidir. Un sitio bloqueado no se enteraría, y un sitio público podría instalar un service worker real si alguien precalentaba la caché con el mismo archivo.

La zona ahora tiene una Cache Rule que no cachea ningún pedido de script de service worker, creada y verificada el 8 de octubre:

```text
# Cloudflare → Caching → Cache Rules (zona rapisites.app)
Expresión:  any(http.request.headers["service-worker"][*] == "script")
Acción:     Bypass cache
```

La misma revisión pidió que el barrido de cobro también purgue el borde cuando despublica los sitios de una cuenta por impago, y cuando la reactiva. Si no, un sitio despublicado podía seguir saliendo de la caché de Cloudflare.

## Lo que vino en el mismo paquete

El service worker era la pieza más delicada, pero la decisión 035 resolvió las otras dos reglas que chocaban.

- Llaves de acceso por instancia (`access_mode: "key"`): como `embed_only`, y además la página solo se sirve con `?k=<llave>` de ese sitio. Una llave por pantalla, sin vencimiento, revocable por API. Solo se guarda su SHA-256, y revocar vale en menos de un minuto.
- Rutas inmutables (`immutable_paths`): patrones explícitos por sitio, como `assets/*`, congelados al publicar y servidos con `max-age=31536000, immutable`. Una página nunca es inmutable.
- Purga de Cloudflare por host cada vez que cambia lo que ese host sirve (publicar, volver atrás, despublicar, bloquear, dar de baja), en lotes y sin bloquear la publicación.
- Una caché en memoria de los archivos chicos (hasta 256 KB) por su `sha256`: nunca se invalida, porque el contenido es el nombre.
- Un tercer modo de red, `allowlist`: como el autocontenido, más una lista de hasta 20 orígenes `https://` para datos, imágenes, tipografías y medios. Scripts y estilos siguen siendo solo propios.

Dos de esas piezas tienen un descarte detrás. Para el acceso, descarté el token firmado que vence: la dirección vive meses en el layout de la pantalla, que tiene que arrancar sin red, y un token vencido solo dejaría pantallas en negro sin que nadie hiciera nada. La llave no es un secreto fuerte (queda en la pantalla, en el sistema de [Wink](/project/wink-app) y en registros); es una segunda capa contra una dirección copiada. Para la caché, descarté adivinar qué archivos son inmutables por el hash del nombre: una adivinanza mal hecha deja un archivo un año en el navegador, y purgar el borde no lo arregla.

Y una que no cambió: el HTML de los sitios para embeber sigue en `no-store`. Pensé en hacerlo cacheable con `stale-if-error`, pero Chromium no lo implementa en su caché, así que no habría dado funcionamiento sin red. Para eso está el service worker.

## Lo que queda abierto

Quedó un límite que hay que decir en voz alta: una pantalla sin red sigue mostrando lo guardado aunque el sitio se haya bloqueado, hasta que vuelva a tener red. Ahí el interruptor no puede llegar. [Wink](/project/wink-app) lo aceptó.

Todo esto se mergeó a `main` el 8 de octubre (PR #69), con cuatro migraciones y dos variables nuevas para la purga. Los cambios en la zona de Cloudflare y la Cache Rule ya están hechos; el despliegue de la imagen nueva, según la documentación, sigue pendiente. El plan de despliegue tiene su propio rollback, y su consecuencia también está escrita: si vuelvo a la imagen anterior, un sitio con `offline` vuelve a recibir `403` en el script, y lo que una pantalla ya haya guardado se queda ahí hasta volver a desplegar. Y las apps de [Wink](/project/wink-app) todavía no están en pantallas: esperan a que Wink termine su lado.

## Lo que le diría a alguien que hospeda código ajeno

- Responder con un error a un service worker no lo desinstala. Lo congela con todo lo que tenía.
- Si permites algo que sobrevive en el navegador del visitante, construye primero cómo apagarlo, y que se aplique solo.
- La decisión de qué script recibe el navegador tiene que llegar siempre al servidor. Revisa que ninguna caché intermedia la tome por ti.
- No adivines qué es inmutable. Que te lo digan explícitamente, porque un error ahí dura un año.
- Escribe el límite que no puedes cerrar y compártelo con quien lo va a usar.

> Lo que me llevo: antes de prohibir algo peligroso, pregúntate si lo que te da miedo se puede apagar. Si se puede, a veces basta con construir el interruptor.
