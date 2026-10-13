---
title: "Decirle que sí a lo que mi propia especificación prohibía"
description: "La especificación de RapiSites excluía dos veces subir HTML propio. Un pedido real me hizo cambiarla: qué revisé, qué descarté y por qué el código ajeno se aísla en vez de limpiarse."
date: 2026-10-12
tags: [seguridad, producto, rapisites]
projects: [rapisites]
kind: learning
keyword: "rapisites.app"
---

La especificación de RapiSites lo decía dos veces. En «Qué NO es»: no es un editor de código ni de HTML custom, porque rompe la garantía de calidad y de SEO. Y en «Explícitamente fuera de v1»: exportar a HTML estático, API pública, webhooks.

Después llegó un pedido concreto: un cliente de [Wink](/project/wink-app), que hace cartelería digital, quería mostrar en una pantalla un juego interactivo que ya tenía hecho en HTML. Wink no hospeda web. RapiSites tenía todo lo necesario —subdominios, dominios propios con SSL automático, almacenamiento en R2, publicación con versiones—, pero mis propias reglas decían que no.

## Revisar la regla, no saltársela

La regla existía por un motivo: proteger la garantía de diseño y de SEO de los sitios generados. RapiSites arma los sitios con una librería de secciones cerrada, un renderer que no manda JavaScript al visitante y un SEO técnico que el cliente no puede romper. Si dejo entrar HTML arbitrario por ese mismo camino, la garantía deja de ser verdad.

Así que la pregunta no era «¿lo hago o no?», sino «¿cómo lo hago sin romper lo que esa regla protege?». La respuesta quedó escrita el 1 de octubre como la decisión 034, junto con un plan que cubre todo: producto, arquitectura, aislamiento, API, planes, abuso, operación y fases. RapiSites suma una forma de crear un sitio, subir los archivos que ya tienes, y la garantía de diseño y SEO sigue siendo de los sitios generados. En un sitio subido, la responsabilidad es de quien lo sube.

Lo más útil de ese ejercicio fue hacer una tabla con cada regla vigente que chocaba, dónde estaba escrita y cómo se resolvía. Ninguna se derogó. Todas se acotaron:

| Regla | Choque | Cómo quedó |
| --- | --- | --- |
| No es un editor de código ni de HTML custom | Un sitio subido es HTML custom | Sigue sin haber editor de código. La garantía aplica a los sitios generados; el subido se rotula «Archivos propios» |
| Restringir para garantizar | Un sitio subido no tiene restricciones de diseño | El principio rige el constructor. El sitio subido es otra entrada, rotulada |
| El sitio público no carga JavaScript | Un sitio subido es JavaScript del cliente | La regla habla del renderer. Los sitios subidos no pasan por el renderer |
| API pública fuera de v1 | El plan agrega una API | Cambio de alcance: se actualizó la especificación antes de escribir código |
| Nada se borra nunca | Un integrador necesita dar de baja de verdad | La plataforma no borra nada sola. Los archivos solo desaparecen si su dueño los depura |

<p class="tbl-note">Las reglas que chocaban con el pedido, y cómo se acotó cada una.</p>

## No es otro producto

La primera versión del plan era un producto aparte, «Apps», con sus propias tablas, su lista y sus cupos. Lo descarté: duplicaba dominios, publicación, historial y cobros, que ya existían para los sitios. Un sitio subido es una fila más de `sites`, con `kind = 'uploaded'`, y hereda sin trabajo extra la lista de sitios, el código QR, los dominios propios, publicar como acto separado de editar, el historial con vuelta atrás, el calendario de impago y el cupo del plan.

Lo que no aplica se dice claro: un sitio subido no abre el editor por ningún camino, no tiene tema, no pasa por la auditoría de SEO (la reemplaza un informe de validación), no lleva sitemap ni datos estructurados automáticos, no tiene formularios ni traducción. Se edita como se edita cualquier sitio estático: descargas los archivos, los cambias y los vuelves a subir.

Lo que sí cambió fue el lugar en la interfaz. Generar con IA y elegir un estilo siguen siendo las dos opciones principales, sin cambiar ni una palabra. Subir archivos es un enlace debajo, «¿Ya tienes tu sitio en HTML, CSS y JS? Sube tus archivos», no una tercera tarjeta. Quien no sabe qué es un HTML no se detiene ahí. Adentro se habla en términos técnicos, porque su público los usa, y la primera línea aclara la diferencia: publicamos tus archivos tal como están, y para cambiar algo vuelves a subirlos.

Una decisión de planes salió directo de la regla original: el plan Gratis no sube archivos. Los sitios gratis llevan «Hecho con RapiSites» en el pie, y en un sitio subido no puedo ponerlo sin tocar archivos ajenos. Además, sería la puerta de entrada del abuso anónimo. En los planes de pago no hay tope por sitio: lo que limita es el almacenamiento de la cuenta, el mismo que ya comparten las imágenes.

## Aislar, no sanitizar

Un sitio subido trae JavaScript ajeno. Para los textos enriquecidos de los sitios generados ya tenía una lista blanca de etiquetas, pero un juego interactivo es JavaScript: limpiarlo lo deja inservible. Así que no se reescribe nada, ni se quitan scripts ni se inyecta nada. Lo subido es lo servido. La protección está en dónde y cómo se sirve.

La primera pieza es el dominio. Los sitios subidos se sirven en un segundo dominio, `rapisites.app`, no en `rapisites.com`. Servirlos en `{slug}.rapisites.com` me ahorraba comprar un dominio, pero tenía tres problemas:

| Problema | Por qué |
| --- | --- |
| Peticiones al panel con la sesión de otra persona | Para el navegador, todos los subdominios de un mismo dominio registrado son el mismo sitio. `SameSite=Lax` no protege entre ellos: un script en un subdominio podía disparar peticiones al panel con la cookie de quien lo visitara. Y la API del panel no comprobaba el origen |
| Cookies plantadas | Un script en un subdominio puede escribir cookies para todo el dominio, que después viajan al panel |
| Reputación | Una página de phishing puede meter el dominio entero en listas negras y tumbar los sitios de todos los clientes |

<p class="tbl-note">Por qué el código ajeno no podía vivir bajo rapisites.com.</p>

Un detalle que vino con el nombre: todo el dominio de nivel superior `.app` está en la lista de precarga HSTS de los navegadores, así que una dirección `http://` ni se intenta. En producción no cambia nada, porque todo ya se sirve por HTTPS, pero en desarrollo hay que usar un dominio local distinto.

Dentro de ese dominio, cada sitio subido tiene su propio origen, nunca recibe `Set-Cookie`, solo responde `GET` y `HEAD`, nunca llega a la API ni al panel, y sale con sus propias cabeceras de seguridad:

- `Content-Security-Policy` según el modo de red del sitio.
- `X-Content-Type-Options: nosniff`, y el tipo de contenido sale de la extensión, no de lo que diga el cliente.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` que niega cámara, micrófono, geolocalización, pagos y USB.
- `X-Robots-Tag: noindex` cuando el sitio no debe indexarse: por defecto, todo sitio subido que viva en `rapisites.app` y todo sitio creado por API. Con dominio propio, se indexa; el dominio y su reputación son del cliente.

El modo de red por defecto es autocontenido: el sitio solo puede usar sus propios archivos, sin llamadas a otros hosts ni formularios que envíen afuera. Corta el phishing de raíz, porque una página falsa de login no tiene a dónde mandar lo robado. El costo es real, muchos sitios cargan tipografías o librerías de otros hosts, así que el modo abierto está a un clic, y la validación lista los hosts externos que encontró.

```text
# CSP del modo autocontenido (simplificada)
default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;
connect-src 'self' data: blob:;
form-action 'self';
object-src 'none';
base-uri 'self';
worker-src 'self' blob:
```

Antes de aceptar un paquete se valida entero: que haya una página de inicio, extensiones en una lista blanca, rutas sin `..` ni rutas absolutas ni enlaces simbólicos, HTML en UTF-8 que parsea, y que entre en el cupo de sitios y de almacenamiento. Lo que no bloquea se avisa: imágenes que faltan, rutas al disco del usuario como `C:\`, páginas sin `<title>`. Al principio, 20 MB y 500 archivos por paquete.

## Endurecer el panel de paso

Aunque el código ajeno ya no iba a correr bajo `rapisites.com`, el análisis dejó a la vista que el panel dependía de eso para estar protegido. Así que agregué una segunda barrera: toda petición que escribe tiene que venir del mismo origen que la recibe.

```ts
// ¿Escritura desde otro origen? (simplificado)
function isCrossOriginWrite({ method, host, origin, secFetchSite }) {
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return false
  if (origin) {
    try { return new URL(origin).host !== host }
    catch { return true } // "null" no es el mismo origen
  }
  if (secFetchSite) return secFetchSite === "cross-site" || secFetchSite === "same-site"
  return false // curl o un servidor: no llevan la cookie de nadie
}
```

`same-site` es justamente «otro subdominio», y por eso se rechaza. Los formularios de los sitios publicados y el de la landing siguen funcionando porque postean a su propio dominio. También evalué renombrar la cookie de sesión con el prefijo `__Host-`, que impide que un subdominio le plante una cookie al panel. Lo dejé para más adelante: renombrarla cerraba la sesión de todos los usuarios al desplegar, y protegía contra algo que hoy no puede pasar.

## Lo que descarté y lo que cuesta

- Un producto aparte («Apps»): duplicaba todo lo que ya existía para los sitios.
- Sanitizar el HTML: deja inservible cualquier sitio interactivo.
- Servirlos bajo `rapisites.com`: el riesgo de sesión y de reputación caía sobre el producto principal.
- Abrir la subida al plan Gratis: sin marca en el pie y con riesgo de abuso anónimo.
- Una copia completa de los archivos por versión: los archivos se guardan por su `sha256`, una vez por sitio, y una actualización solo ocupa lo que cambió.
- Borrar automáticamente versiones viejas: choca con «nada se borra». El dueño decide qué depurar.
- Todos los sitios de un integrador bajo un mismo host, por ruta: un solo certificado, pero compartirían origen y un sitio podría leer los datos de otro.

Y lo que acepté pagar: RapiSites deja de ser solo «el constructor que garantiza», porque hay sitios en la plataforma cuya calidad no controla. Hospedar código ejecutable ajeno trae un riesgo de abuso que antes no existía, así que construí el bloqueo de sitios desde el panel de administración, y el plan pide además un canal de reporte y términos de uso; los legales siguen pendientes de abogado. Y quedó un segundo dominio y un segundo bucket que operar.

## Y apareció un cliente real

Junto con los sitios subidos salió una API pública en `api.rapisites.com/v1`, para que otro sistema publique en nombre de sus clientes. Las llaves tienen la forma `rsk_live_…`, se muestran una sola vez y se guardan como hash SHA-256. Usarla pide cuenta registrada, correo verificado, plan activo que incluya API, condiciones aceptadas y un contacto de abuso. El integrador se da de alta como cualquier usuario nuevo: no hay cuentas especiales.

Lo construí por fases, en pocos días: el servido aislado (PR #51), el flujo en el panel (PR #52) y la API completa (PR #53, el 4 de octubre). El primer integrador real fue [Wink](/project/wink-app), y mapear su flujo contra la API en producción trajo ajustes que ningún plan anticipaba:

- Una vista previa del borrador que [Wink](/project/wink-app) pudiera embeber desde sus propios orígenes, incluido `http://` para un host interno sin punto.
- Un `429` con `code: upload_in_progress` y `Retry-After` cuando dos subidas chocan, y un candado de subida más angosto: antes serializaba la subida entera por cuenta; ahora solo el instante de releer el cupo y escribir.
- Un límite de 60 peticiones por minuto por llave que se puede subir por cuenta, para una sola cuenta con muchos clientes detrás.
- Descartar el borrador por API, y después historial, vuelta atrás y copia de sitios del lado del servidor.

Del lado de [Wink](/project/wink-app), la integración todavía depende de su propio backend: sus apps no están publicadas en pantallas hoy. Y del lado de RapiSites quedan cosas abiertas en el plan: subir `.zip`, el modo de acceso con token firmado, el respaldo de los archivos en R2 y un tope de ancho de banda.

## Lo que le diría a alguien en la misma situación

- Antes de cambiar una regla, escribe qué protegía. Si no lo sabes, no la cambies todavía.
- Busca la forma de acotarla en vez de derogarla: «rige el renderer» es mucho más fácil de sostener que «ya no aplica».
- Si vas a hospedar código ajeno, sepáralo por dominio registrado, no por subdominio. Para el navegador es otra cosa.
- Aprovecha el análisis para cerrar lo que estaba abierto aunque nadie lo explotara, como el chequeo de origen.
- Deja la opción nueva donde no estorbe a quien no la necesita.

> Lo que me llevo: una especificación es una herramienta, no un contrato con uno mismo. Cambiarla está bien si dejas escrito qué protegía la regla y cómo lo sigues protegiendo.
