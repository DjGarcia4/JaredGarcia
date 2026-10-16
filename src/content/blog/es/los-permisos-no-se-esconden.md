---
title: "Los permisos no se esconden, se aplican"
description: "En GanttHub los roles vivían en la interfaz: un viewer no veía el botón de editar. Cuando entraron otras empresas, eso dejó de alcanzar. Cómo pasé los roles a las reglas de Firestore y Storage."
date: 2026-10-16
tags: [seguridad, firebase, gantthub]
projects: [gantthub]
kind: learning
keyword: "roles"
---

GanttHub nació para ordenar mis propias tareas. Mientras el único usuario era yo, la seguridad no era un problema. Después lo usé para Wink, luego para RapiSites y SwiftFlow, y hoy lo usan Wink y diez empresas más. Cada proyecto tiene su equipo, y cada persona entra con un rol: owner, admin, editor o viewer.

Durante mucho tiempo, esos roles vivieron solo en la interfaz. Un viewer no veía el botón de editar, un editor no veía la pestaña del equipo. Se veía bien. Y no protegía nada.

## Esconder un botón no es un permiso

En una app con Firebase, el navegador habla directo con la base de datos. No hay un servidor propio en el medio que revise cada pedido: lo único que se interpone son las reglas de seguridad. Si la regla deja escribir, cualquiera con una sesión y la consola del navegador puede hacer lo que el botón escondido hacía.

El síntoma más claro estaba en cómo se listaban los proyectos. La app leía la colección completa y filtraba en el navegador los que te correspondían. Para que eso funcionara, las reglas tenían que dejar leer todos los proyectos a cualquier usuario con sesión. Los filtros de la interfaz decidían qué veías; las reglas no decidían nada.

## El problema de fondo: las reglas no podían saber quién era miembro

Cada proyecto guardaba su equipo en `members`, un array de objetos: uid, email, nombre, rol, tarifa por hora. Es cómodo para la interfaz, pero las reglas de Firestore no pueden recorrer un array de objetos buscando tu uid. Y una consulta tampoco puede pedir «los proyectos donde aparezco en `members`», porque `array-contains` compara el objeto entero.

Así que agregué tres campos que existen solo para que la seguridad sea expresable:

- `memberIds`: la lista de uids, incluido el owner. Sirve para `array-contains` en las consultas y en las reglas.
- `memberRoles`: un mapa `{ uid: rol }`. Con eso, saber el rol de alguien es una sola lectura.
- `pendingInvites`: un mapa `{ uid: rol }` con las invitaciones sin aceptar.

Son datos denormalizados: repiten lo que ya dice `members`. El costo es mantenerlos sincronizados, y eso lo resuelve una sola función en el store de proyectos, que los arma siempre desde `members` y `ownerId`:

```ts
export const buildMembershipFields = (members: ProjectMember[], ownerId: string) => {
  const memberRoles: Record<string, UserRole> = {}
  for (const m of members) {
    if (!m?.uid) continue
    // Solo puede haber un owner: cualquier otro «owner» pasa a admin
    memberRoles[m.uid] = m.uid === ownerId ? 'owner' : (m.role === 'owner' ? 'admin' : m.role)
  }
  if (ownerId) memberRoles[ownerId] = 'owner'
  return { memberIds: Object.keys(memberRoles), memberRoles }
}
```

## Las reglas solo confían en esos campos

Con `memberRoles` en el documento, las reglas pueden preguntar por el rol directamente. Todo el archivo se apoya en cuatro funciones:

```js
function roleIn(projectId) {
  return signedIn() && exists(projectPath(projectId))
    ? projectData(projectId).get('memberRoles', {}).get(uid(), null)
    : null;
}
function isMember(projectId)        { return roleIn(projectId) in ['owner', 'admin', 'editor', 'viewer']; }
function isEditorOrAbove(projectId) { return roleIn(projectId) in ['owner', 'admin', 'editor']; }
function isProjectAdmin(projectId)  { return roleIn(projectId) in ['owner', 'admin']; }
```

A partir de ahí, cada colección dice quién hace qué. Las tareas las leen todos los miembros y las crean o editan owner, admin y editor. El viewer puede comentar, pero solo comentar: la regla le deja cambiar `notes` y nada más. Las finanzas las leen todos; el editor puede registrar movimientos, pero solo borra los gastos automáticos que genera una tarea al completarse. Y listar proyectos ya no es leer la colección entera: la única consulta permitida es `memberIds array-contains` tu propio uid.

## Lo difícil: actualizar el proyecto

Leer y crear son fáciles. Lo difícil es el `update` del documento del proyecto, porque ahí conviven muchas operaciones distintas sobre el mismo documento: el owner cambia el nombre, el admin archiva o cambia el presupuesto, cualquiera fija el proyecto en su barra lateral, alguien sube su foto de perfil, un invitado acepta la invitación, un miembro sale del equipo.

La solución fue escribir cada operación como una función que describe exactamente qué campos puede tocar y cómo, y permitir el `update` si alguna de ellas se cumple:

```js
allow update: if signedIn()
  && newData().ownerId == resource.data.ownerId
  && rolesOk(newData())
  && (ownerUpdate() || adminUpdate() || editorUpdate() || pinUpdate()
      || selfProfileUpdate() || leaveProject() || acceptInvite() || declineInvite());
```

Dos detalles me ahorraron muchos problemas:

- **`rolesOk` valida el estado final, no la operación.** Sea cual sea el cambio, el documento resultante tiene que ser coherente: `memberIds` y `memberRoles` con las mismas personas, `members` del mismo tamaño, exactamente un owner y que sea el `ownerId`, y ninguna invitación con rol de owner. Así ninguna combinación rara de operaciones deja el equipo en un estado imposible.
- **Aceptar una invitación es la operación más estricta.** Quien acepta todavía no es miembro, así que la regla le exige todo: que tenga una invitación pendiente, que se agregue solo a sí mismo, con exactamente el rol de la invitación, y que su invitación desaparezca de `pendingInvites` en el mismo cambio. Si intenta entrar como admin teniendo una invitación de editor, falla. Si intenta agregar a otra persona en el mismo cambio, falla.

## Storage también

Los archivos tenían el mismo problema: avatares, logos de proyecto y adjuntos de tareas. Las reglas de Storage no pueden leer Storage para saber quién es miembro, pero sí pueden leer Firestore (reglas *cross-service*). Así que usan la misma idea: buscan el proyecto en Firestore y miran `memberRoles`. Encima de eso van los límites de cada tipo de archivo: el avatar es solo tuyo y es una imagen de hasta 5 MB, el logo lo cambian owner y admin, los adjuntos de un comentario los sube cualquier miembro (hasta 20 MB) y los archivos de una tarea solo de editor para arriba (hasta 25 MB). Ninguno puede ser HTML ni JavaScript.

## Lo que me llevo

- Si el cliente habla directo con la base de datos, la interfaz es una sugerencia. El permiso es la regla.
- A veces hay que cambiar el modelo de datos para que la seguridad sea expresable. `memberIds` y `memberRoles` no aportan nada a la interfaz; existen para que las reglas puedan decir que no.
- Validar el estado final del documento atrapa más errores que validar cada operación por separado.
- Unas reglas así no se pueden probar a mano. Las probé con tests en el emulador, que es tema del [siguiente artículo](/blog/testear-reglas-de-firebase). Y cambiar el modelo con proyectos reales adentro tuvo su propio orden, que cuento en [migrar sin romper a nadie](/blog/migrar-sin-romper-a-nadie).
