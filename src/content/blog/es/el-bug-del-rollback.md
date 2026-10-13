---
title: "El bug que me enseñó qué significa «volver atrás»"
description: "Un cliente restauró una versión sana de su sitio y, al abrir el editor, encontró la versión mala otra vez. Por qué pasaba y por qué ahora volver atrás vuelve todo."
date: 2026-10-12
tags: [producto, datos, rapisites]
projects: [rapisites]
kind: learning
keyword: "rollback"
---

En RapiSites, lo que editas y lo que está publicado son cosas separadas. El editor trabaja sobre un borrador: las tablas vivas de páginas y secciones. Publicar congela ese borrador en una versión, un snapshot en JSON que se guarda en `site_versions`, y el sitio público sirve esa versión. Volver atrás, en el diseño original, era mover un puntero: «el sitio publicado ahora es la versión 4».

Limpio, simple y equivocado.

## Cómo estaba armado

Publicar en RapiSites no es un build. Es una transacción corta: primero corre la auditoría de SEO (si hay un error rojo, no se escribe nada), después se serializa el sitio completo en un snapshot, se inserta como una fila nueva en `site_versions` y se apunta `sites.published_version_id` a esa fila. Recién después del commit se invalida la caché de cada dominio del sitio. El visitante nunca ve un estado a medias.

Con ese diseño, el historial y el rollback salían casi gratis. Los construí en la fase 4.6, en agosto: una lista de versiones con fecha, autor y nota, y un botón «Restaurar» en cada una. La especificación definía el rollback en una línea: cambiar `published_version_id` a una versión anterior. Mover el puntero y no tocar nada más. La idea era mantener separados de verdad el borrador y lo publicado.

Había un detalle más, que después resultó importante. La lista de sitios muestra «Cambios sin publicar» comparando dos fechas: si `updatedAt` es posterior a `publishedAt`, el borrador está por delante. Por eso, al publicar, `updatedAt` se iguala a `publishedAt` en vez de quedar en «ahora»: si no, quedaría un instante por delante y todo sitio recién publicado se vería con cambios pendientes. El rollback hacía lo mismo con la fecha de la versión restaurada.

## Lo que pasó

Probando la fase 10, un cliente publicó una versión con un componente mal. Restauró la anterior y el sitio en vivo volvió a estar bien. Hasta ahí, todo correcto. Pero al abrir el editor se encontró con la versión mala otra vez: el editor lee las tablas vivas, y el rollback no las había tocado.

Y había algo peor. Como el rollback ajustaba `updatedAt` para que coincidiera con `publishedAt`, la lista de sitios no mostraba «Cambios sin publicar». Nada indicaba que el editor y el sitio en vivo ya no coincidían. Si el cliente hacía cualquier cambio menor y le daba a publicar, volvía a subir el componente malo sin querer.

- Versión 5 publicada, con el componente roto. Borrador = versión 5.
- Restaurar la versión 4: el puntero pasa a la 4 y el sitio en vivo se arregla. El borrador sigue siendo la 5.
- La lista dice que no hay cambios sin publicar, porque las fechas coinciden.
- El cliente abre el editor, corrige un texto y publica: sale una versión 6 que trae de vuelta el componente roto.

Técnicamente, cada pieza hacía lo que decía. El problema era el conjunto: el sistema tenía un estado divergente, borrador y publicado distintos, y además le decía al cliente que no lo tenía.

## Lo que decidí

Lo arreglé el 30 de agosto y quedó escrito como la decisión 008. Ahora el rollback reescribe también el borrador con la versión restaurada, en la misma transacción que mueve el puntero. Borra las páginas del sitio (las secciones se van en cascada) y las vuelve a crear desde el snapshot, con el mismo mecanismo que ya usaba para reemplazar el contenido de un sitio. También vuelven el tema, los datos del negocio, los valores de SEO por defecto y los idiomas. Después de restaurar, borrador y publicado son lo mismo: no queda ningún estado divergente.

```ts
// Rollback de un sitio generado (simplificado)
async function rollback(siteId, versionId, { force = false } = {}) {
  return db.transaction(async (tx) => {
    const site = await tx.sites.find(siteId)
    const version = await tx.versions.find(versionId)
    if (!site || version?.siteId !== siteId) return { ok: false, reason: "not-found" }

    // ¿El borrador va por delante? Reescribirlo descartaría trabajo.
    const draftAhead = site.publishedAt && site.updatedAt > site.publishedAt
    if (draftAhead && !force) return { ok: false, reason: "unpublished-changes" }

    await tx.sites.update(siteId, {
      publishedVersionId: version.id,
      publishedAt: version.publishedAt,
      updatedAt: version.publishedAt, // ahora es verdad: el borrador ES esta versión
      ...version.snapshot.settings,   // tema, negocio, SEO, idiomas
    })
    await tx.pages.deleteBySite(siteId)          // las secciones caen en cascada
    await tx.pages.writeFrom(version.snapshot)   // el editor abre lo restaurado
    return { ok: true }
  })
  // Después del commit: invalidar la caché de cada dominio activo del sitio.
}
```

Las versiones no se tocan. `site_versions` nunca se reescribe: cada publicación sigue guardada, restaurar no borra ninguna, y volver «hacia adelante» a la versión que se había abandonado sigue siendo un clic.

## Lo único que se pierde, y siempre con aviso

Reescribir el borrador tiene una consecuencia: si el cliente tenía cambios sin publicar, se pierden. Así que el servidor no lo hace en silencio. Si `updatedAt` es posterior a `publishedAt`, responde `409` con `reason: "unpublished-changes"` y no toca nada. La interfaz pide confirmación en la misma fila del historial, nada de modal sobre modal: «Tienes cambios en el editor sin publicar. Restaurar esta versión los descarta.», con un botón «Restaurar de todos modos» que reintenta con `force: true`.

La interfaz ya sabe si hay cambios pendientes y muestra la confirmación antes de llamar al servidor. Pero quien decide es el servidor: si el aviso llegó tarde (el borrador cambió después de cargar la lista), el `409` vuelve, la interfaz lo reconoce y muestra la misma confirmación en vez de un error genérico. Y el texto del historial dice lo que pasa: «Restaurar una versión la pone al aire y también en el editor; ninguna versión se borra».

- `404` si el sitio o la versión no existen, o son de otra cuenta. No `403`: no confirmo que exista algo que no es tuyo.
- `409 unpublished-changes` si el borrador va por delante y no vino `force`.
- `200` con el sitio publicado en la versión restaurada, y la caché de sus dominios invalidada después del commit.

## Lo que descarté

La alternativa era dejar el rollback como puntero y hacer visible la diferencia: un aviso en la lista y una barra en el editor que dijera «estás editando una versión más nueva que la publicada; descartar y editar desde la publicada». Funciona, pero deja vivo un estado que el cliente tiene que entender y administrar. La regla principal de RapiSites es que cualquiera publique su web en minutos, y ese tipo de complejidad es justo lo que evita.

|  | Solo puntero + avisos | Reescribir el borrador |
| --- | --- | --- |
| Qué abre el editor después de restaurar | La versión que el cliente quería dejar atrás | La versión restaurada |
| Estado que el cliente tiene que entender | Borrador y publicado distintos, con barra y aviso | Ninguno: son lo mismo |
| Riesgo de republicar lo malo sin querer | Bajo, si lee el aviso | Ninguno |
| Qué se pierde | Nada | Los cambios sin publicar, con confirmación |
| Bajar el sitio a una versión sana y seguir arreglando en el editor | Posible | No, sin publicar primero el arreglo |

<p class="tbl-note">Las dos opciones que comparé en la decisión 008.</p>

El costo de la decisión es real y está en la última fila: ya no puedes bajar el sitio a una versión sana mientras sigues arreglando en el editor sin publicar primero el arreglo a medias. Lo acepté porque el caso real es otro: publiqué algo malo y quiero volver.

## Dos huecos más, tres semanas después

La auditoría de seguridad del 19 de septiembre encontró que el arreglo no estaba completo. En septiembre el menú y el pie de página pasaron a ser del sitio y no de cada página (decisión 022), y viven en otra tabla. El rollback reescribía las páginas, pero no esa tabla: después de restaurar, el cuerpo volvía a la versión vieja y el menú y el pie se quedaban con las ediciones posteriores. Ahora también se borran y se reescriben desde el snapshot.

El segundo hueco era más sutil. Una edición manual o de la IA siempre pasa por el schema de la sección antes de guardarse. El rollback no revalidaba nada: copiaba lo que había en el snapshot. Pero una versión de hace semanas puede no calzar con el schema actual de su sección, por ejemplo si después se agregó un campo obligatorio. Ahora cada sección histórica se valida contra el schema de hoy, y si ya no pasa, cae a los valores por defecto de esa sección. Es el mismo criterio que uso al insertar una sección nueva: ninguna sección se guarda rota.

```ts
// Una sección vieja contra el schema de hoy (simplificado)
function sanitizeHistorical(section) {
  const definition = getSection(section.type, section.variant)
  if (!definition) return section
  return definition.parse(section.props).success
    ? section
    : { ...section, props: definition.defaults }
}
```

## La misma idea, en los sitios subidos

En octubre RapiSites empezó a aceptar sitios hechos con archivos propios: HTML, CSS y JavaScript que el cliente ya tiene. Ahí no hay páginas ni secciones que reescribir; una versión es una referencia a un paquete de archivos. Pero la regla de la decisión 008 se mantuvo: volver a una versión también deja ese paquete como borrador, y vuelven con ella las opciones que se congelan al publicar. Si el dueño depuró los archivos de una versión vieja para liberar espacio, esa versión sigue en el historial con la etiqueta «Archivos depurados», pero ya no se puede restaurar (`409 purged`).

El 7 de octubre el historial y el rollback llegaron también a la API pública: `GET /v1/sites/{id}/versions` devuelve cada versión con `is_current`, `is_draft` y `files_purged`, y `POST /v1/sites/{id}/versions/{versionId}/rollback` cambia cuál está en línea sin crear una versión nueva.

Y la señal de «Cambios sin publicar» volvió a morder. El 5 de octubre, revisando la integración con [Wink](/project/wink-app), salieron tres problemas seguidos en una operación vecina, descartar el borrador por API. Primero, reusaba el rollback, que siempre deja el sitio publicado: un sitio que el dueño había despublicado a propósito volvía a quedar en línea. Al separarlo, apareció que no igualaba las dos fechas y el panel seguía mostrando el aviso, aunque la API ya decía que no había cambios. Y el arreglo de eso las igualaba siempre, lo que apagaba el aviso aunque quedaran opciones del sitio sin publicar. Una bandera que se deriva de dos fechas obliga a que cada operación que toca el borrador las mantenga honestas.

## Lo que le diría a alguien que construye algo parecido

- Si tienes borrador y publicado separados, decide qué significa «volver» para el usuario, no para el modelo de datos. Para mí, terminó siendo «vuelve todo».
- Una señal como «cambios sin publicar» es parte del contrato. Si una operación la apaga, tiene que ser porque de verdad no hay diferencia.
- Lo que puede destruir trabajo lo decide el servidor y lo confirma la interfaz, no al revés. Y la confirmación va donde el usuario ya está mirando.
- Los datos viejos no siempre calzan con el código nuevo. Restaurar un snapshot es escribir: valida igual que en cualquier otra escritura.
- Cuando agregues una tabla nueva al sitio (como el menú y el pie), revisa todas las operaciones que copian o reescriben el sitio entero.

> Lo que me llevo: el modelo de datos correcto no siempre es el que el usuario espera. Cuando alguien dice «volver a esta versión», espera que vuelva todo, no un puntero.
