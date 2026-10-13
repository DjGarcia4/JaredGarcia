---
title: "La IA llega tarde, el sitio no: diseñar con un presupuesto de 30 segundos"
description: "Qué hacer cuando la generación tarda más de lo prometido: entregar algo al instante, no cancelar lo que ya está pagado y dejar que el contenido real llegue solo."
date: 2026-10-12
tags: [ia, rapisites, ux]
projects: [rapisites]
kind: learning
keyword: "30 s"
---

La promesa de RapiSites es que pasas de la página de inicio a tu sitio publicado en menos de cinco minutos. Casi todo ese recorrido lo controlo yo: cuántas preguntas hago, cuánto tarda en guardarse el sitio, cuánto tarda en publicarse. La parte que no controlo es la IA. A veces responde rápido y a veces tarda bastante más, y eso no depende de nada que yo pueda optimizar en mi código.

Así que la generación tiene un presupuesto: 30 segundos como máximo. Lo interesante de este post no es el número, sino qué pasa cuando se pasa, y por qué la respuesta obvia era la equivocada.

## De dónde salen los 30 segundos

Antes de escribir código, la especificación repartió los cinco minutos paso a paso. El presupuesto de la IA sale de lo que queda:

| Paso | Tiempo estimado |
| --- | --- |
| Registro (correo y contraseña, o Google) | ~30 s, o ~5 s con Google |
| ¿Cómo se llama tu negocio? | ~10 s |
| ¿Qué haces? (2 o 3 líneas) | ~60 s |
| Datos de contacto | ~40 s |
| Elegir un estilo | ~20 s |
| Generación con IA | 15 a 30 s |
| Publicar en el subdominio | ~5 s |

<p class="tbl-note">El flujo de alta, tal como lo fija la especificación. La meta: de la landing a un sitio publicado en menos de cinco minutos.</p>

La especificación también marca el punto de no retorno: si la generación no produce algo que la persona reconozca como «mi negocio», el producto falla. O sea, no puedo comprar velocidad entregando algo genérico. Tengo que entregar algo bueno y rápido, y cuando no se puede las dos cosas, decidir qué hago.

## Qué pasa en esos segundos

La generación usa la API de Claude y corre en tres etapas. Cada una necesita lo que produjo la anterior, así que van en orden; pero dentro de cada etapa todo va en paralelo.

- Estructura, una llamada: a partir del nombre y la descripción, decide qué secciones del catálogo lleva cada una de las cuatro páginas (inicio, servicios, nosotros, contacto), de una a seis por página. En la misma llamada devuelve un término corto en inglés para buscar una foto de stock del rubro, así no hace falta otra llamada solo para eso.
- Contenido, una llamada por sección, todas a la vez: las de las cuatro páginas arrancan juntas. Escribir una sección detrás de otra no entraba en el presupuesto.
- SEO, una llamada por página, las cuatro a la vez: meta descripción y texto alternativo de cada imagen, a partir del contenido que ya se escribió. No se adivinan aparte.

Son entre 12 y 20 llamadas por sitio. El tiempo total se parece a la llamada de estructura, más la sección más lenta, más la página más lenta en SEO. Esa es la cuenta que importa: con todo en paralelo, una sola sección lenta marca el ritmo de toda su etapa.

```ts
// Simplificado: tres etapas en orden, todo en paralelo dentro de cada una.
const plan = await inferStructure(business);            // 1 llamada

const pages = await Promise.all(plan.pages.map((page) =>
  Promise.all(page.sections.map((s) => writeSection(s))) // 1 por sección
));

const seo = await Promise.all(pages.map(writePageSeo));  // 1 por página
```

## Aislar el fallo de una sección

Paralelizar trae un riesgo: con `Promise.all`, basta que una promesa falle para que falle todo el conjunto. Si una sección de doce no valida, no quiero perder las otras once.

Por eso escribir una sección nunca lanza por un problema de contenido. Si la respuesta no cumple el esquema tras los reintentos, la función devuelve un texto de respaldo neutral y sigue. En el SEO pasa lo mismo: si la descripción de una página no valida, se usa la descripción del negocio recortada a 160 caracteres. Hay un test que genera las cuatro páginas en paralelo, hace fallar una sección a propósito y comprueba que el resto sale bien.

Lo que sí se propaga son los errores que no son de contenido, como una falla de red o del servicio. Ahí no tiene sentido fingir: si eso pasa antes de vencer el presupuesto, la persona ve un mensaje («No pudimos generar tu sitio. Intenta de nuevo.») y puede reintentar.

## Si se pasa del tiempo, entregar igual

El presupuesto es una carrera entre dos promesas: la generación y un temporizador de 30 segundos.

```ts
// Simplificado: el presupuesto decide cuándo dejo de esperar, no cuándo dejo de trabajar.
const pending = computeSnapshot(args);              // la generación, ya en marcha
const outcome = await Promise.race([pending, timeout(30_000)]);

if (outcome !== TIMED_OUT) return writeSite(outcome);

const site = await writeSite(template.snapshot);    // la plantilla, al instante
pending
  .then((snapshot) => replaceSiteContent(site.id, snapshot)) // mismo sitio
  .catch((error) => log("se queda con la plantilla", error));
return site;
```

- Si la generación gana, el sitio completo se escribe de una vez, en una transacción atómica.
- Si gana el temporizador, se escribe en ese momento un sitio con la plantilla del estilo que eligió la persona, y la respuesta vuelve sin esperar más. La persona ve un sitio completo con el estilo que eligió, no un error ni un spinner eterno.
- La generación sigue corriendo. Cuando termina, reemplaza el contenido de ese mismo sitio, sin crear otro: dentro de una transacción borra las páginas de la plantilla y escribe las generadas. El nombre y la dirección del sitio no cambian.
- Si la generación en segundo plano falla, el error queda registrado y el sitio se queda con la plantilla, que ya es un sitio completo y publicable.

Un detalle que me gustó: ese mecanismo (borrar las páginas de un sitio y reescribirlas desde un snapshot, en una transacción) no quedó solo para esto. Es el mismo que después usó la vuelta atrás de versiones para reescribir el borrador desde una versión publicada. Cuando dos problemas distintos terminan pidiendo la misma operación, suele ser señal de que la operación está bien cortada.

## No cancelar lo que ya está pagado

Mi primer instinto fue cancelar la generación al vencerse el tiempo. Es lo que uno hace con un timeout: cortar y limpiar. Pero aquí cortar no ahorraba nada. Las llamadas al modelo ya estaban en curso y se pagan igual, y su resultado iba a ser mejor que la plantilla. Cancelar era pagar por nada y entregar algo peor.

| Opción al vencer el tiempo | Qué ve la persona | Qué pasa con lo ya pagado |
| --- | --- | --- |
| Cancelar y mostrar un error | Un error, justo en el primer minuto | Se tira |
| Cancelar y entregar la plantilla | Un sitio genérico para siempre | Se tira |
| Seguir esperando lo que haga falta | Un spinner sin fin | Se aprovecha, tarde |
| Entregar la plantilla y seguir en segundo plano | Su sitio al instante, con el contenido real después | Se aprovecha |

<p class="tbl-note">La última fila es la que quedó. El presupuesto no corta el trabajo: solo decide cuándo dejo de hacer esperar a la persona.</p>

Tampoco se reintenta la generación al vencer el tiempo, por la misma razón: ya estaba en curso y pagada, y empezarla de nuevo duplicaría el costo para llegar todavía más tarde.

## Lo que ve la persona mientras espera

Mientras corre la generación, el asistente muestra una barra de progreso y una frase que cambia cada 4,5 segundos: «Entendiendo tu negocio…», «Eligiendo qué necesita tu sitio…», «Escribiendo tu contenido…», «Ajustando el SEO…», «Últimos detalles…».

Lo honesto es contar que esa barra no la alimenta el servidor. Es una estimación: arranca en 4 %, sube 2 puntos cada medio segundo y se detiene en 92 % hasta que llega la respuesta, y recién ahí salta a 100 % y abre la vista previa del sitio. Llega al 92 % en unos 22 segundos, dentro de la ventana de 15 a 30 que fija la especificación. Las frases siguen el orden real de las etapas, pero no están sincronizadas con ellas.

## Proteger el costo, no solo el tiempo

Una generación son entre 12 y 20 llamadas pagas, así que el endpoint que la dispara tiene sus propios frenos:

- Un límite de cinco generaciones cada quince minutos por origen.
- Una sola generación a la vez por cuenta. Lo agregué después de una auditoría de seguridad: el chequeo de cupo lee filas que no existen hasta que la generación termina, así que varias peticiones simultáneas de la misma cuenta pasaban todas el chequeo antes de que terminara la primera.
- El cupo de sitios con IA es el mismo que el de sitios del plan, y cada llamada queda registrada con su costo, también las que fallan.

## Lo que este diseño todavía no cubre

Leyendo el código con ojos de quien lo mantiene, hay dos bordes que conviene decir en voz alta:

- La generación en segundo plano vive en la memoria del proceso, no en la cola de trabajos (la traducción de un sitio, que también usa IA, sí va por cola). Si el proceso se reinicia justo en esos segundos, la generación se pierde y el sitio se queda con la plantilla. Es un resultado aceptable, porque la plantilla es un sitio completo, pero es una pérdida silenciosa.
- El reemplazo borra y reescribe las páginas del sitio. Si alguien empezara a editar la plantilla antes de que llegue el contenido real, esos cambios se pisarían. La ventana es de segundos, pero existe.

Los dos tendrían la misma salida si algún día hacen falta: mover la generación tardía a la cola de trabajos y avisarle al editor cuando el contenido cambie.

## La regla que manda

Todo esto sale de la regla número uno del producto: cualquier persona debe poder generar su web en menos de un día, preferiblemente en minutos. Con esa regla, «la IA tardó» no puede ser el motivo por el que alguien se va. Y de ahí sale otra consecuencia que la especificación dice sin rodeos: nunca existe una pantalla vacía. Ni un sitio vacío, ni una sección vacía, ni un formulario vacío. La plantilla de respaldo existe para que eso se cumpla incluso cuando la IA llega tarde.

## Si tienes un servicio lento en el camino crítico

- Escribe el presupuesto de tiempo de todo el flujo antes de escribir código, y deja que el del servicio lento salga de ahí.
- Paraleliza lo que no depende entre sí, y asegúrate de que un fallo de contenido no tumbe todo un `Promise.all`.
- Ten algo digno que entregar al instante. No un error: algo que la persona pueda usar.
- Separa «dejar de esperar» de «dejar de trabajar». Si el trabajo ya está pagado y su resultado es mejor, que termine.
- Si muestras progreso estimado, que sea honesto: que nunca llegue al 100 % antes de tiempo.
- Anota los bordes que aceptas. Saber qué se pierde y cuándo es parte del diseño.

> Lo que me llevo: un timeout no tiene por qué ser un error. Puede ser el momento en que entregas lo que tienes y sigues trabajando por detrás.
