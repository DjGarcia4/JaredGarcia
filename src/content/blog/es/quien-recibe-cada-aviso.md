---
title: "Quién recibe cada aviso: notificaciones como una función pura"
description: "La bandeja de notificaciones de GanttHub avisa cuando te asignan, te mencionan, comentan o cambian el estado de una tarea. La parte difícil no es enviar el aviso, sino decidir a quién. Esa decisión vive en una función sin Firebase, probada con Vitest, y la Cloud Function solo la ejecuta."
date: 2026-10-18
tags: [firebase, cloud functions, testing, arquitectura, gantthub]
projects: [gantthub]
kind: learning
keyword: "avisos"
---

Hasta ahora, GanttHub mandaba correos: cuando te asignaban una tarea o te mencionaban, llegaba un email. Dentro de la app, la campana solo mostraba invitaciones a proyectos. Si alguien comentaba en tu tarea o la movía a Revisión, te enterabas al abrirla.

Quería una bandeja dentro de la app que avisara de cinco cosas:

- te asignaron una tarea;
- te mencionaron en un comentario;
- alguien comentó en una tarea tuya o que sigues;
- cambió el estado de una tarea tuya o que sigues;
- te pidieron una actualización.

Escribir el aviso en Firestore es una línea. Lo difícil es decidir **a quién** le llega cada uno sin hacer ruido.

## Las reglas de quién recibe qué

Escritas en español, las reglas son estas:

1. **Nunca a quien hizo el cambio.** Si tú comentas, no te avisas a ti mismo.
2. **Nunca a quien ya no es miembro del proyecto.** Alguien que salió puede seguir en `assigneeIds` de una tarea vieja.
3. **Un aviso por persona y evento.** Si te mencionan en un comentario de una tarea que sigues, recibes «te mencionó», no también «comentó».
4. **Si te acaban de asignar, no te aviso además del cambio de estado.** Con «te asignó» basta.

Todas dependen de comparar la tarea **antes** y **después** del cambio. Y eso se puede escribir sin Firebase.

## Una función pura

El archivo `inbox_rules.ts` no importa nada de Firebase. Recibe la tarea antes, la tarea después y los miembros del proyecto, y devuelve una lista de avisos:

```ts
export const inboxForUpdate = (prev: InboxTask, next: InboxTask, members: Set<string>): InboxItem[] => {
  const out: InboxItem[] = []
  const actor = next.updatedBy || ''
  const taken = new Set<string>() // un aviso por persona y evento
  const push = (uid: string, item: Omit<InboxItem, 'uid'>, key: string) => {
    if (!uid || !members.has(uid) || taken.has(`${key}:${uid}`)) return
    taken.add(`${key}:${uid}`)
    out.push({ uid, ...item })
  }
  // asignaciones nuevas, cambio de estado, comentarios nuevos, pedido de update…
  return out
}
```

`push` concentra las reglas 2 y 3: filtra a los que no son miembros y descarta duplicados con una clave por evento (`assign`, `status`, `note:<id>`, `request`).

Los comentarios se detectan por id: los que están en `next.notes` y no estaban en `prev.notes` son nuevos. Para cada uno, primero van las menciones, y después el resto de responsables y seguidores reciben «comentó»:

```ts
for (const uid of mentioned) push(uid, { type: 'mention', actorId: author, detail }, `note:${n.id}`)
for (const uid of watchers) {
  if (uid === author || mentioned.includes(uid)) continue
  push(uid, { type: 'comment', actorId: author, detail }, `note:${n.id}`)
}
```

Las menciones se guardan en el texto como `@[uid|Nombre]`. Una función pequeña, `cleanNote`, las convierte en `@Nombre` y recorta el comentario a 140 caracteres para mostrarlo en el aviso.

## Probarla sin emuladores

Como no depende de Firebase, la función se prueba con Vitest como cualquier util del frontend, importándola desde la carpeta de funciones:

```ts
import { inboxForUpdate } from '../../../functions/src/inbox_rules'

it('comentario nuevo: mención a los mencionados y comentario al resto (sin el autor)', () => {
  const note = { id: 'n1', userId: 'ana', text: 'Ojo @[cy|Cy] con esto', mentionedIds: ['cy'] }
  const out = inboxForUpdate(base, { ...base, notes: [note], updatedBy: 'ana' }, members)
  expect(pick(out)).toEqual(['comment:fol', 'mention:cy'])
  expect(out.find((i) => i.type === 'mention')).toMatchObject({ actorId: 'ana', detail: 'Ojo @Cy con esto' })
})
```

Son nueve tests que corren en milisegundos. Cubren asignaciones, el autor excluido, los que salieron del proyecto, mención contra comentario, el estado con los recién asignados y el pedido de update. También cubren un caso fácil de olvidar: editar un comentario que ya existía no avisa a nadie. Cada regla de la lista de arriba tiene su caso.

## La Cloud Function solo ejecuta

Con la decisión fuera, los triggers quedan cortos. `inboxOnTaskUpdated` hace tres cosas:

1. **Un atajo barato.** La mayoría de los cambios en una tarea (descripción, fechas, checklist) no generan avisos. Antes de leer nada, mira si cambió el estado, los responsables, los ids de los comentarios o el pedido de update. Si no cambió nada de eso, termina sin leer el proyecto.
2. **Lee el proyecto** para saber quién es miembro, los nombres y las etiquetas de los estados.
3. **Escribe los avisos en un batch**, uno por persona en `users/{uid}/notifications`.

Escribe con el Admin SDK, que no pasa por las reglas de seguridad. El cliente solo puede leer y marcar como leída su propia bandeja; nadie puede escribirle avisos a otro desde el navegador.

## En la app

La bandeja se suscribe a los últimos 50 avisos. Para mostrar un aviso emergente cuando llega uno nuevo con la app abierta, ignora la primera respuesta (lo que ya estaba) y después solo mira los documentos `added`:

```ts
if (!firstSnapshot && onArrive) {
  for (const ch of snap.docChanges()) {
    if (ch.type !== 'added' || ch.doc.metadata.hasPendingWrites) continue
    if (!ch.doc.data().read) onArrive({ ...ch.doc.data(), id: ch.doc.id })
  }
}
firstSnapshot = false
```

Sin la primera condición, al abrir la app saltarían cincuenta avisos de golpe.

## Un tropiezo al probarlo

La primera prueba de punta a punta no generó ningún aviso. Simulé desde un script que Ana asignaba una tarea y mencionaba a otra persona, y la bandeja seguía vacía. Antes de tocar el código, miré qué puertos estaban escuchando: de los emuladores solo seguía vivo Firestore. Auth y Functions se habían caído horas antes, así que no había nadie para ejecutar los triggers.

Al reiniciarlos, los avisos llegaron al momento. La lección es vieja, pero se olvida: cuando un trigger «no hace nada», primero comprueba que el emulador de funciones esté corriendo y haya cargado tu código.

## Lo que me llevo

- **Separa el «a quién» del «cómo».** La lógica de negocio en una función pura se prueba en milisegundos y se lee como una lista de reglas.
- **Escribe las reglas antes del código.** «Nunca al autor», «nunca a quien salió», «un aviso por evento». Cada una se volvió una línea y un test.
- **Corta temprano en los triggers.** Un `onUpdate` corre con cada cambio de cada tarea. Si casi nunca hace falta, que lo descubra sin leer nada más.
- **El primer snapshot no es una novedad.** Si muestras avisos en vivo, ignora lo que ya estaba.
