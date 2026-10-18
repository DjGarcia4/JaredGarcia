---
title: "Analítica sin cookies: medir la landing, el panel y los sitios de mis clientes"
description: "RapiSites no medía nada: ni visitas, ni de dónde llegaba la gente, ni qué campaña traía las cuentas que pagan. Cómo armé una analítica propia sin cookies, sin terceros y sin guardar la IP de nadie."
date: 2026-10-18
tags: [rapisites, privacidad, datos]
projects: [rapisites]
kind: learning
keyword: "analítica"
---

Hasta hace poco, [RapiSites](/project/rapisites) no medía nada. No sabía cuánta gente entraba a la landing, de dónde llegaba (Instagram, Google, un enlace que compartí) ni qué campaña traía las cuentas que terminan pagando. Y los clientes no podían ver cuántas visitas tenía su propio sitio, que es lo primero que pregunta cualquier dueño de negocio.

Había que medir tres cosas distintas: la landing (`rapisites.com`), el panel (`app.rapisites.com`) y los sitios de los clientes. Este post cuenta cómo lo resolví sin agregar ni una cookie.

## Por qué no Google Analytics (ni Plausible, ni PostHog)

La respuesta rápida era pegar un script de alguien más. La descarté por cuatro razones:

| Razón | Detalle |
| --- | --- |
| La política de privacidad ya lo prometía | «Una sola cookie, la de tu sesión», y ningún rastreador de terceros, tampoco en los sitios de clientes. Google Analytics o PostHog obligaban a cambiar eso y a poner un aviso de cookies en la landing: fricción antes de registrarse. |
| Los sitios de clientes no cargan JavaScript | Es una regla del proyecto: [el rendimiento es SEO](/blog/ningun-javascript). Un script de analítica es justo lo que no entra. |
| El tráfico ya llega directo a mi servidor | La landing está en «solo DNS» en Cloudflare. Medir ahí no necesita a nadie más. |
| Se cruza con mis datos | Una visita, un registro y un pago viven en la misma base. «Instagram trajo 40 registros y 3 pagan» sale de una consulta. Con Plausible o Umami esos datos vivirían aparte. |

<p class="tbl-note">Además, cero dependencias nuevas: Postgres, Nitro y la cola de trabajos que ya tenía.</p>

## Contar personas sin una cookie

Sin cookie no hay un identificador que viaje con el visitante. Usé el mismo método que Plausible:

```ts
// Simplificado
const visitor = sha256(saltOfTheDay + ip + userAgent + host);
```

- La **sal cambia cada día** (a medianoche de Honduras) y la del día anterior se borra. El mismo visitante es otra persona mañana. Se cuentan únicos por día, y nunca se puede seguir a alguien entre días.
- **No se guarda la IP ni el User-Agent.** Solo el hash y categorías: la fuente (Instagram, Google, directo…), el tipo de dispositivo, la familia del navegador y la ruta normalizada.
- Dentro del panel, donde la persona ya inició sesión, la visita lleva su cuenta. Eso es uso de mi propio servicio, no seguimiento, y la política de privacidad lo dice.

Este método tiene una consecuencia que hay que contar en la interfaz: los «visitantes» de un mes son la **suma** de los únicos de cada día. Alguien que entra tres días distintos cuenta tres veces, porque su hash cambia. La página lo explica en una línea en lugar de esconderlo.

## Tres superficies, dos formas de capturar

| Dónde | Cómo | Por qué |
| --- | --- | --- |
| Landing y panel | Una baliza propia: `navigator.sendBeacon` a mi propio endpoint, al cargar y en cada cambio de ruta | Después de la primera carga, Nuxt navega sin pedirle páginas al servidor: el servidor solo vería la primera. |
| Sitios generados | En el servidor, en el middleware que sirve el HTML | El sitio no tiene JavaScript, y todo pedido de página pasa por el servidor. |
| Sitios subidos por el cliente | En el servidor, al servir un documento HTML de un sitio público | Igual que los generados, sin tocar sus archivos. |

<p class="tbl-note">En los sitios de clientes no se agregó ni una línea de JavaScript.</p>

La baliza tiene un regalo: los bots casi nunca ejecutan JavaScript, así que se filtran solos. En el servidor no hay ese filtro gratis, así que se descartan por User-Agent (`bot`, `crawler`, `spider`, los previsualizadores de enlaces de WhatsApp o Facebook), y también los pedidos `HEAD`, la precarga especulativa del navegador (`Sec-Purpose: prefetch`) y cualquier respuesta que no sea `200`.

Para los sitios subidos hay un filtro más: solo cuenta un documento pedido como página principal (`Sec-Fetch-Dest: document`). Un `fetch()` de la propia app que pide un HTML no es una visita. Tampoco cuentan los sitios en modo pantalla, los que se muestran en señalización digital: se recargan solos todo el día, y contaría recargas, no personas.

## Medir nunca rompe una página

La regla que más me importaba: contar una visita no puede demorar ni romper la página de un cliente.

- La función que registra una visita **nunca lanza**. Todo va dentro de un `try/catch`.
- Las visitas se juntan en memoria y se insertan **por lotes**, cada 5 segundos o cada 100 filas.
- Si la base falla, se pierden visitas, nunca una página.
- El endpoint de la baliza responde `204` al instante y tiene límite por IP.

## Atribución: de Instagram al pago, sin cookie

La pregunta que decide dónde invertir el marketing es: ¿qué fuente trae a la gente que paga? Para eso hay que unir la landing con el registro, que vive en otro dominio. Sin cookie, la fuente viaja en la URL:

1. La landing toma la fuente de la **primera página** de la visita (los parámetros `utm_*` o el dominio de origen).
2. Todos los enlaces a «Crear mi sitio» salen con esa fuente en la URL.
3. Al crear la cuenta, por contraseña o con Google, se guarda en una columna `signup_source`.

Acá tuve que cambiar el plan. El borrador decía «nada guardado en el navegador», pero la landing recarga en cada página (son enlaces normales), y la fuente se perdía en cuanto la persona pasaba de la home a precios. Lo resolví con `sessionStorage`: no lleva identificador, se borra al cerrar la pestaña y solo sale del navegador al registrarse. Quedó escrito en la política de privacidad.

El límite honesto: si alguien vuelve otro día escribiendo la dirección a mano, cuenta como «directo».

## La caché que se comía visitas

Los sitios subidos se sirven detrás de la caché de Cloudflare, que guardaba el HTML hasta 60 segundos. Cada visita que Cloudflare respondía desde su caché nunca llegaba a mi servidor, así que no se contaba.

El arreglo fue mandar `CDN-Cache-Control: no-store` solo en el HTML de los sitios públicos. Cloudflare deja de guardarlo; el navegador lo sigue guardando su minuto, y el CSS, el JS y las imágenes siguen en la caché del borde, que es lo que pesa.

## Los datos y cuánto se guardan

- `page_views`: una fila por visita.
- `page_view_daily`: un resumen por día, sitio, página, fuente y dispositivo, que arma una cola cada hora. Las gráficas largas leen de acá, rápidas aunque haya millones de filas crudas. Los últimos 88 días se leen en vivo; lo anterior, del resumen.
- La sal del día, en su propia tabla, que se renueva cada día.

RapiSites tiene una regla: **nada se borra nunca**. Acá hice una excepción a propósito. Las filas crudas se borran a los 90 días; los resúmenes se guardan para siempre. La regla protege el contenido del cliente, y una fila de visita anónima no lo es. Guardarla para siempre solo suma riesgo de privacidad y peso.

## Lo que ve cada quien

**Yo, en el panel de administración**, tengo una pestaña «Tráfico»: visitas y únicos de la landing, fuentes, campañas, páginas de entrada, dispositivos, clics en «Crear mi sitio» y la conversión por fuente (visitas → registros → publicaron → pagan).

**Cada cliente** ve «Visitas» en cada sitio. Lo que ve depende del plan, y el plan se define con un solo número, los días de historial:

| Plan | Qué ve |
| --- | --- |
| Gratis | El total del mes: «Tu sitio tuvo 340 visitas este mes». |
| Pro | 30 días: visitas, páginas más vistas y de dónde llegan. |
| Business | 365 días: lo mismo, más campañas y dispositivos. |

<p class="tbl-note">Se mide a todos. Quien mejora de plan ve su historial al instante.</p>

Puse «Visitas» en Pro y no solo en Business porque el salto natural de un negocio chico desde Gratis es Pro. Si estuviera solo en Business, casi nadie la vería. Y nunca bloquea publicar: es información extra, no una puerta.

## Dos bugs del mismo día

- **La página «Visitas» salía en blanco para los sitios subidos.** El servidor tiene una protección que impide abrir el editor sobre un sitio subido, escrita como lista de rutas permitidas. La ruta nueva de visitas no estaba en la lista, así que respondía `409`, y la página no tenía estado de error: quedaba vacía. Ahora la ruta está permitida, y la página muestra el error con un botón para reintentar.
- **El embudo del asistente se cortaba en las cuentas con pago pendiente.** Esas cuentas quedan en solo lectura, y la baliza de métricas también quedaba bloqueada. Una baliza no cambia nada de la cuenta, así que ahora pasa.

## Lo que quedó abierto

- **El país.** Necesita una base de datos de IP a país, que es una dependencia nueva. Lo voy a decidir con un mes de datos.
- **Eventos de producto y retención.** Hoy sé cuánta gente visita y de dónde llega. Todavía no sé el recorrido de cada persona dentro del panel (creó sitio → abrió el editor → publicó → pagó) ni quién vuelve cada semana. Es la próxima fase.

## Lo que le diría a alguien que se topa con esto

- Antes de pegar un script de analítica, lee tu política de privacidad. Si promete algo, el script puede romper esa promesa.
- Mide donde ya pasa el tráfico. Si todo llega a tu servidor, no necesitas a nadie más.
- Un hash con sal diaria cuenta personas por día sin seguir a nadie. Explica en la interfaz qué significa sumar días.
- Medir nunca puede romper lo que mides: por lotes, sin lanzar, sin bloquear la respuesta.
- Revisa qué guarda tu caché: una visita que responde la caché es una visita que no ves.
- Una regla como «nada se borra» tiene un porqué. Si un dato no está dentro de ese porqué, la excepción puede ser lo correcto.

> Lo que me llevo: la analítica más útil no es la que más sabe de cada persona, sino la que responde tus preguntas sin saber quién es nadie.
