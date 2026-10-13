---
title: "Un número que nadie podía usar"
description: "El plan Pro prometía 30 sitios con IA al mes, pero era imposible usar más de 3. Una lección corta sobre límites que se ven bien en una tabla y no tienen sentido en la realidad."
date: 2026-10-12
tags: [producto, precios, rapisites]
projects: [rapisites]
kind: learning
keyword: "1 de 30"
---

Los planes de RapiSites tenían dos límites que parecían razonables: cuántos sitios puedes tener (Gratis 1, Pro 3, Business 10) y cuántos sitios con IA puedes generar al mes (3, 30 y 100). Los dos se aplicaban en el servidor desde finales de agosto, y la página de precios lo decía con todas las letras: «30 sitios generados con IA al mes».

En una tabla de precios se veía bien. En la realidad, el segundo número no se podía usar.

## Por qué

El asistente de IA es el corazón de RapiSites: respondes cuatro preguntas sobre tu negocio y el sistema decide qué páginas y secciones necesitas, escribe el contenido y arma el sitio. Pero corre una sola vez por sitio, al crearlo. No hay forma de regenerar un sitio con IA desde el editor: el editor sirve para retocar lo generado.

<figure>
  <img srcset="/img/projects/rapisites/01-800.webp 800w, /img/projects/rapisites/01-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/01-1600.webp" alt="Las cuatro preguntas del asistente, en la landing de RapiSites. Corren una vez por sitio, al crearlo." loading="lazy" decoding="async" />
  <figcaption>Las cuatro preguntas del asistente, en la landing de RapiSites. Corren una vez por sitio, al crearlo.</figcaption>
</figure>

Y los sitios no se borran desde el panel. Entonces la cuenta es simple: si cada sitio usa la IA como mucho una vez, y no puedes tener más sitios que los de tu plan, nunca vas a usar la IA más veces que la cantidad de sitios. Un usuario Pro, con 3 sitios, puede usar la IA 3 veces como mucho. Nunca 30. Y el plan Gratis prometía 3 al mes con un solo sitio.

| Plan | Sitios | IA prometida | IA que se podía usar |
| --- | --- | --- | --- |
| Gratis | 1 | 3 al mes | 1, en toda la vida de la cuenta |
| Pro | 3 | 30 al mes | 3 |
| Business | 10 | 100 al mes | 10 |

<p class="tbl-note">El segundo número nunca podía pasar del primero.</p>

Lo noté en la tarjeta del plan, en Ajustes, que decía «Sitios con IA: 1 de 30 este mes» al lado de «Sitios: 2 de 3». Leídas juntas, las dos líneas no tenían sentido. Un medidor que nunca se va a llenar no informa nada; solo hace que el usuario se pregunte qué se está perdiendo.

## El primer arreglo se quedó corto

Lo arreglé el 6 de septiembre, en el mismo PR que terminó los límites por plan (#36), y el primer intento fue tapar solo el caso más visible. El plan Gratis pasó a tener «un sitio con IA de por vida» en vez de tres al mes, con un campo nuevo para eso, mientras Pro y Business seguían con 30 y 100 al mes.

Funcionaba, pero solo arreglaba el síntoma más evidente. El razonamiento que hacía absurdo el 3 de Gratis era el mismo que hacía absurdo el 30 de Pro. En el mismo PR reemplacé ese arreglo por el de verdad y reescribí la decisión 021 alrededor de él: el caso de Gratis era solo el más visible.

## La decisión

El cupo de IA es el mismo que el de sitios, de por vida, y el campo separado desapareció. Para saber cuánto usaste, el servidor cuenta las generaciones de estructura de toda la vida de la cuenta, una por sitio generado, y las compara con los sitios del plan.

```ts
// El cupo de IA (simplificado)
async function aiSiteQuota(accountId) {
  const plan = await getAccountPlan(accountId)
  const used = await aiGenerations.countAll(accountId, "structure") // de toda la vida
  return { used, limit: PLAN_LIMITS[plan].sites }                  // el cupo de sitios
}
```

En la práctica, el cliente elige sitio por sitio si lo genera con el asistente o parte de una plantilla, y el asistente está disponible mientras le quede espacio en su plan. Si se acaba, el mensaje es directo: «Tu plan Pro incluye 3 sitios con IA. Mejora tu plan para generar más.»

En la interfaz, la IA dejó de ser un medidor y pasó a ser una capacidad. En la página de precios y en la comparación de planes es una línea: «Asistente de IA para el contenido de cada sitio». En la tarjeta del plan hay un solo medidor, el de sitios, y la IA aparece como dato: «Incluido en cada sitio · usaste 1 de 3».

## Lo que descarté

- Bajar el cupo de IA a 1, 3 y 10 y dejar el campo: era exactamente el cupo de sitios, solo que había que mantenerlo en sincronía a mano.
- Dejar 30 y 100 y agregar «regenerar con IA» en el editor: era construir una funcionalidad entera para justificar un número.
- Que el plan Gratis no tuviera IA, solo plantillas: las cuatro preguntas son el camino para que alguien publique su primer sitio en minutos. Quitarlas del primer sitio de un usuario nuevo lo manda a la ruta larga en el primer minuto.

## Lo que gané, y lo que tuvo que ver con el costo

Cada llamada al modelo queda registrada con el modelo usado, los tokens, el costo en dólares y la duración, se use o no el resultado, porque el costo se paga igual. Con el cupo atado a los sitios, el gasto de IA de cada cuenta queda acotado por algo que ya controlo: cuántos sitios tiene.

Eso se puso a prueba un mes después. Para los integradores de la API, como [Wink](/project/wink-app), agregué excepciones de límites por cuenta: una cuenta puede tener cientos de sitios sin inventar un plan nuevo. Pero el cupo de IA usa a propósito los sitios del plan, no los de la excepción. Subirle los sitios a un integrador no le regala cientos de generaciones con IA, que es lo que cuesta dinero.

Lo que pierdo también está escrito: si más adelante quiero cobrar la IA como un extra, o permitir regenerar un sitio, voy a tener que reintroducir un cupo propio. Si ese día llega, la decisión se revisa.

## Lo que le diría a alguien armando sus planes

- Por cada límite, pregúntate qué tiene que pasar para que alguien lo alcance. Si no puede pasar, el número sobra.
- Lee los límites juntos, como los va a leer el usuario, no uno por uno.
- Cuando arregles el caso más visible, revisa si el mismo razonamiento rompe los demás.
- Si algo no se agota en la práctica, muéstralo como capacidad, no como medidor.
- Ata los límites que cuestan dinero a algo que ya controlas, y cuida que las excepciones no los arrastren.

> Lo que me llevo: un límite que no se puede alcanzar no es generoso, es confuso. Cada número que le muestras a alguien tiene que poder pasarle.
