---
title: "Me mudé de Netlify a mi propio producto, y el formulario se rompió"
description: "Subí este portafolio a RapiSites y chocó con dos límites: 20 MB por subida y un formulario de contacto que ya no tenía a dónde ir. Cómo lo resolví sin cambiar una línea del sitio."
date: 2026-10-18
tags: [rapisites, producto, seguridad]
projects: [rapisites]
kind: learning
keyword: "Netlify"
---

Este portafolio vivía en Netlify. [RapiSites](/project/rapisites) ya deja subir un sitio hecho por uno mismo (HTML, CSS y JS) en lugar de generarlo con IA, así que la prueba obvia era usarlo yo: subir la carpeta `dist` de este mismo sitio y apuntar mi dominio. Si mi propio producto no podía con mi propio portafolio, no podía venderlo como camino para desarrolladores.

Chocó dos veces. Este post cuenta las dos.

## Primer choque: 24 MB contra un tope de 20

Al soltar la carpeta, el panel respondió:

> Tu sitio pesa 24 MB y por ahora el máximo por subida es 20 MB.

El tope era el mismo para todos los planes y tenía su lógica: coincidía con el máximo de una imagen en la biblioteca de medios y quedaba debajo de los 25 MB que Caddy, el servidor que está delante de todo, deja pasar en el panel. Ese corte de Caddy salió de una auditoría de seguridad: frena un cuerpo enorme antes de que llegue a Node.

Miré qué pesaba tanto:

| Carpeta | Peso | Qué hay |
| --- | --- | --- |
| `img/` | 13 MB | ~180 imágenes `.webp` de los casos de estudio |
| `media/` | 4,3 MB | El video de un proyecto, en `.mp4` y `.webm` |
| `assets/` | 3,1 MB | El JS y el CSS que genera Vite |
| `blog/` | 2,5 MB | Los artículos ya renderizados a HTML |

<p class="tbl-note">Nada exagerado: un portafolio con casos de estudio pesa eso.</p>

Ningún archivo pasaba de 2,6 MB. El problema era la suma. Y un portafolio con casos de estudio, que es justo el tipo de sitio que alguien sube en vez de generarlo, va a pesar eso.

La solución rápida era subir el tope de Caddy para todo el panel. No la quise: abre la puerta a cuerpos grandes en todos los endpoints para resolver uno solo. Lo que hice:

- El total por subida pasó a **50 MB**. Cada archivo sigue con un máximo de 20 MB, como en medios.
- Caddy deja pasar 60 MB **solo** en las cinco rutas que suben un sitio entero (dos del panel y tres de la API pública). El resto sigue cortando en 25 MB.

```caddyfile
# Simplificado
@siteUpload {
	method POST PUT
	path /api/sites/upload /api/sites/*/upload /v1/sites /v1/sites/validate /v1/sites/*/content
}
handle @siteUpload {
	request_body {
		max_size 60MB
	}
	reverse_proxy app:3000
}
handle {
	request_body {
		max_size 25MB
	}
	reverse_proxy app:3000
}
```

Además, los mensajes de error tenían «20 MB» escrito a mano en tres lugares. Ahora salen de la misma constante que aplica el límite, así no vuelven a mentir cuando el número cambie.

## Segundo choque: el formulario ya no tenía a dónde ir

Con el sitio arriba, todo se veía bien hasta que probé el formulario de contacto. Error.

El formulario de este portafolio está hecho para Netlify Forms. Hace un `POST` a `/` del propio sitio con un campo `form-name` y un campo trampa para bots, y Netlify intercepta ese `POST`, guarda el mensaje y me lo reenvía por correo:

```js
// Simplificado: lo que manda el formulario de este sitio.
fetch("/", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    "form-name": "contact",
    fullname, email, message,
  }).toString(),
});
```

En RapiSites, un sitio subido se sirve aislado en otro dominio (`rapisites.app`), y ese servidor solo respondía `GET` y `HEAD`. Al `POST` le contestaba `405 Method Not Allowed`. Los sitios que genera RapiSites sí tienen formularios, con su antispam ([lo conté en otro post](/blog/la-cache-rompio-mi-antispam)), pero ese sistema depende de un token que el servidor mete en el HTML al renderizar la página. Un sitio subido es HTML estático que no se toca: no hay dónde poner el token.

## La decisión: copiar la convención de Netlify, tal cual

Tenía dos caminos:

| Opción | Por qué |
| --- | --- |
| Un endpoint propio (`/api/forms/{id}`) que el cliente pegue en su formulario | Obliga a editar el sitio antes de subirlo. Además habría que abrir rutas `/api/` en un dominio que hoy solo sirve archivos. |
| Aceptar la convención de Netlify: `POST` con `form-name` a cualquier ruta del sitio | Un sitio que viene de Netlify funciona sin tocar una línea. Es el mismo origen, así que la política de seguridad del sitio ni se entera. |

<p class="tbl-note">Me quedé con la segunda.</p>

La regla quedó así: un `POST` a cualquier ruta de un sitio subido **público** que trae el campo `form-name` es un envío de formulario. Sin ese campo, el `405` de siempre. Un detalle que me gustó: la política de seguridad de los sitios subidos ya tenía `form-action 'self'` y `connect-src 'self'`, así que el envío al mismo sitio estaba permitido en todos los modos de red sin cambiar nada.

## Reusar todo lo que ya existía

No quise un segundo sistema de formularios. El envío de un sitio subido entra por otra puerta, pero de ahí en adelante es el mismo camino que el de un sitio generado:

- Se guarda en la **misma tabla** de envíos, sin sección asociada.
- El aviso sale por la **misma cola** de correo, al correo de aviso del sitio o a los usuarios de la cuenta, con «Responder a» apuntando al visitante.
- Aparece en la **misma bandeja** de mensajes del panel.
- Cuenta contra el **mismo cupo** mensual de reenvíos del plan.

Lo único que tuve que generalizar fue el «Responder a». En un sitio generado, el correo del visitante se guarda bajo el rótulo «Correo», que pone el propio sistema. En un sitio subido, el nombre del campo lo eligió quien programó el sitio: `email`, `correo`, `contact_email`… Ahora se busca el primer campo cuyo nombre parece de correo y cuyo valor parece un correo, y la misma función sirve para los dos tipos de sitio.

## El antispam sin token

Sin el token firmado, quedan capas más simples que igual encarecen el spam:

| Capa | Qué hace |
| --- | --- |
| Campo trampa | `bot-field` (el de Netlify) o `_gotcha` (el de Formspree). Si llega lleno, se guarda como spam, no se reenvía, y al bot se le responde como si hubiera salido bien. |
| Límite por persona | 10 envíos cada 10 minutos por IP, igual que los sitios generados. |
| Límite por sitio | 60 envíos por hora. Frena a un bot que reparte envíos entre muchas IPs. |
| Tamaño | Hasta 128 KB de cuerpo, 30 campos y 5.000 caracteres por valor. |

<p class="tbl-note">Ninguna es infalible sola; juntas alcanzan para un formulario de contacto.</p>

El límite de tamaño tiene una razón concreta. Los dominios propios de los clientes entran por un bloque de Caddy que no tiene tope de cuerpo, porque sirve cualquier dominio que alguien conecte. Así que el corte lo hace la app, mirando el `Content-Length` **antes** de leer nada.

## Responder como espera quien envía

Un formulario se puede mandar de dos formas, y cada una espera algo distinto:

- **Un `<form>` nativo, sin JavaScript.** El navegador navega, así que espera una página. Recibe un `303` a la ruta a la que se mandó, que es lo que hace Netlify con el `action`: tu página de «gracias». Sin `action`, el navegador manda a la página actual y vuelve a ella.
- **Un `fetch()`, como el de este sitio.** Espera un estado. Recibe `200 { ok: true }` y el sitio muestra su propio aviso, como hacía con Netlify.

Para distinguirlas, la cabecera que manda el navegador es `Sec-Fetch-Mode: navigate`. Y acá apareció una trampa en los tests: el `fetch()` de Node siempre pisa esa cabecera con `cors`, por más que se la pongas a mano. El test del envío nativo pasaba por el camino equivocado sin que yo me diera cuenta. Para simular la navegación de un navegador tuve que usar `http.request`, que manda las cabeceras tal cual.

## Un bug de regalo

Al probar, encontré otra cosa: en la página de un sitio subido, guardar el nombre o el correo de aviso devolvía `409`. La protección que impide abrir el editor sobre un sitio subido está escrita como una lista de lo **permitido**: un endpoint nuevo queda cerrado hasta que alguien decide abrirlo. Es una buena regla, pero esas dos rutas nunca se habían sumado a la lista, aunque la página mostraba sus tarjetas. Ahora el correo de aviso importaba, porque es a dónde llegan los formularios, así que se abrieron las dos.

## Lo que quedó abierto

- Los límites viven en la memoria de cada proceso. Con una sola instancia alcanza; con varias, tienen que pasar a un almacén compartido.
- Los archivos adjuntos no se guardan: de un `multipart/form-data` solo se toman los campos de texto.
- Si en Netlify usabas otro nombre para el campo trampa (`netlify-honeypot="x"`), hay que renombrarlo a `bot-field`. Leer ese atributo del HTML al subir el sitio era otra pieza más para un caso raro.
- Los sitios en modo pantalla, los que se muestran en señalización digital, no reciben formularios a propósito.

## Lo que le diría a alguien que se topa con esto

- Usa tu producto con un caso tuyo de verdad. Mis datos de prueba eran sitios chicos; el primer sitio real pasó el límite.
- Cuando un límite de infraestructura molesta, súbelo solo donde molesta, no en todo el servidor.
- Si tus usuarios vienen de otra plataforma, copiar su convención puede valer más que diseñar una mejor. Lo que más pesa en una migración es tener que cambiar cosas.
- Los mensajes con números escritos a mano mienten el día que el número cambia. Que salgan de la constante.
- Desconfía de los tests que tocan cabeceras de navegador: el cliente HTTP puede estar pisándolas sin avisar.

> Lo que me llevo: el mejor test de un producto para desarrolladores es mudarte tú mismo. Encontré dos límites y un bug en una tarde, y los tres los habría encontrado un cliente.
