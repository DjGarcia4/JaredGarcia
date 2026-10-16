---
title: "Migrar datos sin romperle la app a nadie"
description: "Las reglas nuevas de GanttHub necesitaban campos que los proyectos existentes no tenían. Desplegarlas sin migrar hacía desaparecer proyectos. El orden que seguí y por qué el frontend escucha dos fuentes a la vez."
date: 2026-10-16
tags: [firebase, datos, despliegue, gantthub]
projects: [gantthub]
kind: learning
keyword: "migración"
---

Cuando pasé los permisos de GanttHub a las reglas de Firestore ([lo cuento aquí](/blog/los-permisos-no-se-esconden)), las reglas nuevas empezaron a confiar en tres campos de cada proyecto: `memberIds`, `memberRoles` y `pendingInvites`. Los proyectos nuevos los traían. Los existentes, los de Wink y las otras empresas, no.

Eso tiene una consecuencia directa. La única consulta que permiten las reglas nuevas para listar proyectos es «los proyectos donde mi uid está en `memberIds`». Un proyecto sin `memberIds` no aparece en esa consulta para nadie. Si desplegaba las reglas sin migrar los datos, los proyectos de los equipos simplemente desaparecían de la app.

## Tres piezas que se despliegan por separado

El cambio tocaba tres cosas que en Firebase salen por caminos distintos:

1. **El frontend**, que se publica solo con cada push a `main` (GitHub Actions a Firebase Hosting).
2. **Los datos**, que hay que completar con un script.
3. **Las reglas**, que se despliegan con `firebase deploy --only firestore:rules,storage`.

No hay forma de publicar las tres al mismo tiempo. Así que la pregunta no era cómo hacerlo atómico, sino en qué orden, y cómo hacer que cada paso funcione tanto con lo anterior como con lo siguiente.

## Paso 1: un frontend que funciona con las dos reglas

El frontend nuevo hace dos cosas para no depender del orden.

Primero, **escribe los campos nuevos siempre**. Crear un proyecto, invitar, aceptar, cambiar un rol o sacar a alguien actualiza `members` y, en el mismo cambio, `memberIds`, `memberRoles` y `pendingInvites`. Así, todo lo que se toque desde el día del despliegue ya queda en el formato nuevo.

Segundo, **lee de dos fuentes a la vez** y las combina:

```ts
// 1. La consulta que permiten las reglas nuevas.
onSnapshot(query(collection(db, 'projects'), where('memberIds', 'array-contains', uid)), ...)

// 2. Legado: la colección completa, filtrada en el cliente.
//    Con las reglas viejas funciona y trae los proyectos sin migrar.
//    Con las reglas nuevas se rechaza (permission-denied) y se ignora en silencio.
onSnapshot(collection(db, 'projects'), ..., () => {
  legacyAlive = false
  fromLegacy.clear()
  if (membersAlive) publish()
})
```

Los resultados se unen por id. Con las reglas viejas, la segunda fuente trae todo y la primera trae lo ya migrado. Con las reglas nuevas, la segunda falla y queda solo la primera, que para entonces ya tiene todo. Solo si fallan las dos la app muestra un error.

Al principio el frontend leía solo la consulta nueva, y eso obligaba a migrar antes de desplegar. Agregar la fuente de legado convirtió el orden en una recomendación en lugar de una condición: el frontend se puede publicar en cualquier momento.

## Paso 2: un script que se puede correr dos veces

La migración es un script de Node con `firebase-admin`, que no pasa por las reglas. Recorre los proyectos y, para cada uno:

- Calcula `memberIds` y `memberRoles` desde `members` y `ownerId`.
- Arma `pendingInvites` a partir de las invitaciones pendientes que existen como notificaciones.
- Normaliza `members`: el formato más viejo era un mapa `{ uid: rol }` y pasa a ser un array; las entradas duplicadas se reducen a una; si el owner no está en la lista, se agrega; y si alguien más figura como owner, pasa a admin.

Tres decisiones lo hacen seguro:

- **Es idempotente.** Correrlo de nuevo no cambia los proyectos ya migrados. Si se corta a la mitad, se vuelve a correr y listo.
- **Tiene `--dry-run`.** Muestra qué cambiaría sin escribir nada. En producción se corre siempre primero así.
- **Sabe a qué base apunta.** Con `--emulator` usa el proyecto local `demo-gantthub`; para producción hay que pasar `--project` explícitamente. Si no indicas ninguno, no hace nada.

```bash
node scripts/migrate-member-ids.mjs --emulator --dry-run
node scripts/migrate-member-ids.mjs --emulator
node scripts/migrate-member-ids.mjs --project <projectId> --dry-run
node scripts/migrate-member-ids.mjs --project <projectId>
```

Las normalizaciones salieron de preguntarme qué datos raros podía haber en más de ocho meses de uso. Las reglas nuevas validan que el equipo sea coherente: exactamente un owner, las mismas personas en `members` y en `memberIds`. Un proyecto con datos viejos inconsistentes no solo no se listaría: tampoco se podría editar, porque cualquier cambio dejaría un documento que la regla rechaza.

## Paso 3: las reglas, al final

Con el frontend nuevo publicado y los datos migrados, recién ahí se despliegan las reglas. Antes, una copia de las reglas actuales de la consola, por si hay que volver atrás. La primera vez Firebase pide permiso para que Storage lea Firestore, porque las reglas de archivos consultan la membresía del proyecto; hay que aceptarlo.

Y una red de seguridad más, escrita en las propias reglas y cubierta por un test: un proyecto sin `memberIds` sigue siendo legible por su owner. Si algún proyecto se escapa de la migración, su dueño no lo pierde.

## Lo que me llevo

- Si tienes varias piezas que se despliegan por separado, decide el orden y haz que cada paso funcione con el anterior y con el siguiente.
- Un frontend que tolera los dos mundos te libera del orden exacto. Leer de dos fuentes durante la transición es barato; un proyecto desaparecido no lo es.
- Una migración tiene que poder correrse dos veces, con un modo de prueba, y fallar si no le dices dónde.
- Antes de migrar, haz la lista de datos raros que puede haber. Lo que la regla nueva va a rechazar es exactamente lo que el script tiene que arreglar.
