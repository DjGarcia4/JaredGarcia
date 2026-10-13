---
title: "La caché rompió mi antispam: formularios sin CAPTCHA"
description: "Medir cuánto tarda alguien en llenar un formulario parece fácil, hasta que todos los visitantes reciben el mismo HTML cacheado. Cómo lo resolví con tres capas y un token firmado."
date: 2026-10-12
tags: [seguridad, caché, rapisites]
projects: [rapisites]
kind: learning
keyword: "antispam"
---

Los sitios de RapiSites tienen formulario de contacto, y todo formulario recibe spam. Este post es la historia de cómo una decisión de rendimiento (servir los sitios desde una caché) rompió la forma obvia de frenar a los bots, y de cómo lo resolví sin agregar un CAPTCHA.

## Por qué no un CAPTCHA

La especificación ya lo descartaba, por tres motivos que siguen valiendo:

- Fricción. La regla principal del producto es que todo sea rápido de punta a punta, y eso incluye a quien llena el formulario, no solo al dueño del sitio.
- JavaScript de terceros. Los sitios públicos no cargan nada de JavaScript, y un CAPTCHA (reCAPTCHA, hCaptcha, Turnstile) es justamente un script externo.
- Accesibilidad. Hacer un CAPTCHA accesible de verdad es difícil.

El plan era el clásico: un campo trampa, un límite por IP y medir cuánto tarda la persona en llenar el formulario. Una persona tarda segundos; un bot lo llena en milisegundos.

## Cómo se sirve un sitio (y por qué importa)

Para entender el problema hay que ver cómo llega una página al visitante. Cuando alguien entra a un sitio, un middleware mira el dominio, resuelve qué sitio es y renderiza la página en el servidor. Antes de renderizar, revisa una caché por dominio y ruta: si la página ya está ahí, la devuelve sin renderizar nada.

- Solo se guardan respuestas `200` a pedidos `GET` sin parámetros en la URL. Nunca un error.
- Las entradas se borran al publicar, al volver a una versión anterior, al cambiar el dominio principal o al quitar un idioma del sitio.
- La cookie de sesión anónima que trae la respuesta interna no se guarda nunca. Si se guardara, la cookie de un visitante se le serviría a todos los que lleguen después a esa misma entrada.

En la práctica, el visitante recibe HTML estático. Es bueno para el rendimiento, y el rendimiento es SEO. Pero tiene una consecuencia que no había pensado.

## El problema: el HTML no es por visitante

Lo natural para medir el tiempo de llenado es poner un campo oculto con la hora en que se pintó la página y, al recibir el envío, ver cuánto tiempo pasó.

```html
<!-- Simplificado: la idea obvia, que no sirve aquí -->
<input type="hidden" name="rendered_at" value="1767225600000">
```

Pero con la caché, todos los visitantes de una página reciben el mismo HTML, con la misma hora adentro, hasta la próxima publicación. «Hace cuánto se pintó» deja de ser por visitante: puede decir que la página se pintó hace tres días aunque la persona la haya abierto hace diez segundos.

Y además, una hora en un campo oculto la puede cambiar el propio bot. Si el servidor confía en ese número, el bot solo tiene que mandar uno viejo.

## La solución: tres capas, ninguna infalible sola

No busqué una barrera perfecta, sino tres baratas que se cubren entre sí. Cada una atrapa algo que las otras dejan pasar, y ninguna le pide nada a la persona que escribe.

## 1. El campo trampa

Es un `<input>` real en el HTML, escondido con CSS, sin `tabindex` y con `autocomplete="off"`. Una persona no lo ve ni llega a él con el teclado; un bot que rellena todo lo llena. Se llama `website` y no `honeypot` a propósito: tiene que parecer un campo de verdad para que el bot muerda.

Si llega con contenido, el envío se guarda igual (en RapiSites nada se borra) pero con la puntuación de spam al máximo, no se reenvía por correo y no aparece en la bandeja. Y al bot se le responde que todo salió bien, para no enseñarle qué lo delató.

## 2. El límite por IP

Diez envíos cada diez minutos por IP. Una persona no llega a eso; un bot que pasó las otras capas, sí. Si se supera, el visitante vuelve a la página con un aviso de que espere un momento. Es el mismo limitador que protege el inicio de sesión.

## 3. Un token firmado con el instante adentro

En lugar de una hora suelta, cada formulario lleva un token. Adentro tiene el sitio y el momento en que se emitió, y va firmado con HMAC-SHA256 con un secreto que solo conoce el servidor. Se emite durante el render de la página (el mismo render que después queda en caché) y se verifica en el endpoint que recibe el envío.

```ts
// Simplificado: emitir el token.
const payload = base64url(JSON.stringify({ s: siteId, t: Date.now() }));
const token = `${payload}.${base64url(hmacSha256(secret, payload))}`;
```

```ts
// Simplificado: verificarlo, en este orden.
const [payload, signature] = token.split(".");
if (!payload || !signature) return "malformed";
if (!timingSafeEqual(signature, sign(payload))) return "bad-signature";
const { s, t } = JSON.parse(fromBase64url(payload));
if (s !== siteId) return "wrong-site";
const age = Date.now() - t;
if (age < 0 || age > 24 * HOUR) return "expired";  // del futuro, o muy viejo
return { ok: true, age };                           // «muy rápido» lo decide el endpoint
```

El token hace dos trabajos a la vez:

- Impide falsificar. El envío no tiene sesión ni cookie que proteger, pero sin el secreto no se puede fabricar un token válido. Para mandar uno, primero hay que pedir la página. Un script que apunta al endpoint a ciegas no pasa. Y como lleva el sitio adentro, un token de un sitio no sirve para otro.
- Sirve de reloj. Como el instante viaja firmado, el bot no puede cambiarlo. Si el envío llega menos de 2,5 segundos después de emitido el token, suma puntos de spam. Si el token tiene más de 24 horas, o una fecha en el futuro, se rechaza.

Un detalle de diseño: la función que verifica el token no decide si el envío es spam. Solo devuelve la edad. «Demasiado rápido» es una señal que suma, no un error del token, y esa decisión es del endpoint.

| Señal | Qué pasa con el envío |
| --- | --- |
| Token mal formado, firma inválida o de otro sitio | Se rechaza. El visitante ve «No pudimos procesar el formulario. Recarga la página e inténtalo de nuevo.» |
| Token de más de 24 horas | Se rechaza con un motivo propio: «El formulario caducó. Recarga la página…» |
| Campo trampa con contenido | Se guarda con spam al máximo, no se reenvía, no se lista. Al bot se le dice que salió bien. |
| Enviado en menos de 2,5 s | Se guarda y se reenvía, con una puntuación de spam de 0,4. No se corta. |
| Más de 10 envíos en 10 minutos desde la misma IP | Vuelve a la página con un aviso de que espere. |
| Todo en orden | Se guarda con puntuación 0 y se reenvía por correo. |

<p class="tbl-note">Cada capa tiene un efecto distinto. Solo la firma y la edad del token rechazan.</p>

## Lo que pasa cuando alguien envía

El recorrido completo, sin una línea de JavaScript en el navegador:

- El navegador valida lo obligatorio y el formato del correo con `required` y `type="email"`, y hace un `POST` nativo al endpoint del sitio.
- El endpoint aplica el límite por IP y verifica el token.
- Busca la sección en la versión publicada del sitio, no en el borrador, y comprueba que de verdad sea una sección con formulario y no, por ejemplo, una galería.
- Reconstruye la lista de campos con la misma función que usó la sección para dibujarlos, así el formulario y el servidor nunca tienen ideas distintas de qué campos existen.
- Revisa el campo trampa y valida con Zod: 160 caracteres para los campos cortos, 2.000 para el mensaje.
- Guarda el envío. La IP no se guarda: se guarda un hash con clave, suficiente para reconocer envíos del mismo origen sin conservar el dato personal.
- Encola el aviso por correo. Sale desde el dominio de la plataforma, con «Responder a» apuntando al visitante, nunca «desde» el visitante, porque eso rompe SPF y DKIM. Si el envío del correo falla, el mensaje ya está guardado y la cola reintenta.
- Responde con un redirect 303 a la misma página, con `?rs_sent=` o `?rs_error=` en la URL, y la sección muestra el mensaje de éxito o el error.

Ese último paso tuvo su propio choque con la caché. La clave de caché es dominio más ruta, sin los parámetros. Si la página de confirmación se guardara, `/contacto?rs_sent=…` colisionaría con `/contacto`: o el visitante nunca vería el «mensaje enviado», o todos los demás lo verían sin haber mandado nada. Por eso una URL con parámetros no se sirve ni se guarda en caché. Son pedidos raros, y ese render siempre es fresco.

## Aceptar lo que no es perfecto

Con la caché, el token sigue siendo compartido: todos los visitantes de una página reciben el mismo hasta que la caché se renueva. Eso tiene efectos, y decidí vivir con ellos:

| Efecto | Por qué lo acepto |
| --- | --- |
| El token puede tener horas cuando el visitante recién abrió la página | La cota inferior igual atrapa al bot que pide la página y envía de corrido sobre un token recién emitido. La superior, de 24 horas, fuerza la rotación. El bot que pide la página, espera tres segundos y envía pasa esa capa, pero ya no es spam de volumen, y lo encarecen el campo trampa y el límite por IP. |
| Un token sirve para varios envíos | No hay nada de un solo uso que proteger: no es una transacción, es un mensaje de contacto. Si apareciera spam repetido con el mismo contenido, se podría deduplicar por hash. Hoy no hace falta. |
| El token no identifica al visitante | Es a propósito: no quiero cookies ni huellas digitales en el sitio público. |

<p class="tbl-note">Por qué el reloj suma puntos pero no corta: con la caché, es aproximado.</p>

| Alternativa | Por qué la descarté |
| --- | --- |
| CAPTCHA | Fricción para el visitante y JavaScript de terceros en el sitio público: las dos cosas que el proyecto no hace. |
| Hora plana en un campo oculto | Falsificable y, con la caché, ni siquiera por visitante. |
| Token de un solo uso guardado en la base | Una escritura por render y una lectura más un borrado por envío, cuando con la caché el render ni siquiera ocurre por visitante. Todo ese costo para un formulario que no mueve dinero. |
| Sacar de la caché las páginas con formulario | Mata el rendimiento de la página de contacto, que suele ser de las más visitadas. El token tolerante a la caché existe justo para no hacer esto. |
| Solo un límite global, sin IP | Insuficiente por sí solo. |

<p class="tbl-note">Lo que consideré y por qué no.</p>

## Lo que todavía queda abierto

- El límite por IP vive en la memoria de cada proceso. Con una sola instancia funciona; si algún día hay varias, tiene que pasar a un almacén compartido. Es la misma deuda que tiene el límite del inicio de sesión.
- Los campos del formulario se nombran por posición (`f0`, `f1`…). Si el dueño reordena o borra preguntas y vuelve a publicar, alguien que tenía el formulario abierto puede mandar una respuesta que queda guardada con el rótulo de otra pregunta. El tope de 24 horas del token acota esa ventana. El peor caso es un envío mal rotulado, nunca una caída.
- La decisión da por hecho que el tope de 24 horas obliga a renovar la caché al menos una vez por día. Pero hoy la caché en memoria no tiene un vencimiento propio: se renueva al publicar, al volver a una versión, al cambiar el dominio principal o un idioma, o al reiniciar el proceso. Una página que pasara más de un día sin nada de eso serviría un token caducado, y el formulario respondería que caducó. Darle a la caché un vencimiento menor a 24 horas cerraría ese borde.
- Falta un aviso de privacidad para los datos de contacto que se recogen. Está anotado como decisión abierta.

## Lo que le diría a alguien que se topa con esto

- Antes de usar «cuándo se pintó esta página» como dato, averigua si la página se pinta por visitante. Con una caché delante, casi nunca.
- Lo que viaja por el navegador y luego vuelve al servidor, fírmalo. Una firma convierte un dato editable en uno confiable sin guardar nada.
- Separa las señales que suman de las que rechazan. Una señal aproximada que rechaza produce falsos positivos; una que suma no.
- Apila capas baratas en vez de buscar una perfecta. Ninguna sola es infalible; juntas encarecen el spam lo suficiente.
- No le enseñes al bot qué lo delató, y no borres nada: guarda el spam marcado, por si te equivocaste.
- Revisa qué guarda tu caché además del cuerpo: una cookie cacheada es una sesión compartida.

> Lo que me llevo: la caché cambia qué es verdad en tu sistema. Antes de diseñar algo que depende de «cuándo se pintó esta página», pregúntate quién la pintó y para cuántos.
