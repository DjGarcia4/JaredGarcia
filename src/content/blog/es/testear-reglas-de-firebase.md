---
title: "Cómo testear reglas de Firebase en el emulador"
description: "Guía práctica: un proyecto de prueba con una persona por rol, assertSucceeds y assertFails, emuladores efímeros en otros puertos y qué casos vale la pena escribir. Con ejemplos reales de GanttHub."
date: 2026-10-16
tags: [testing, firebase, seguridad, guía, gantthub]
projects: [gantthub]
kind: guide
keyword: "tests"
---

Las reglas de seguridad de GanttHub tienen unas 400 líneas. Deciden quién lee, crea, edita y borra proyectos, tareas, finanzas, reuniones, ideas y archivos, según el rol de cada persona en cada proyecto (lo cuento en [los permisos no se esconden](/blog/los-permisos-no-se-esconden)). Probar eso a mano, entrando con cuatro usuarios distintos, no escala. Y una regla mal escrita no avisa: simplemente deja pasar algo que no debía.

Hoy esas reglas tienen más de 70 tests que corren contra el emulador de Firebase. Esta guía es cómo están armados.

## Lo que necesitas

- `@firebase/rules-unit-testing`, el paquete oficial para probar reglas.
- El emulador de Firestore (y el de Storage, si tienes reglas de archivos). Necesitan Java.
- Un runner de tests. Uso Vitest, el mismo de los tests unitarios, pero con su propia configuración.

## 1. Un elenco fijo: una persona por rol

Lo primero es un proyecto de prueba que tenga a alguien en cada situación posible. En GanttHub son seis personas con nombres fáciles de recordar:

```ts
export const U = {
  owner: 'alice',
  admin: 'adam',
  editor: 'eve',
  viewer: 'vic',
  outsider: 'mallory', // con sesión, pero ajeno al proyecto
  invited: 'ian',      // con una invitación pendiente como editor
} as const
```

El proyecto `p1` tiene a los cuatro primeros como miembros y una invitación pendiente para `ian`. Antes de cada test se borra Firestore y se vuelve a sembrar ese proyecto, con las reglas desactivadas:

```ts
export const seedProject = async (env, id = 'p1', data = baseProject()) => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'projects', id), data)
  })
}

beforeEach(async () => {
  await env.clearFirestore()
  await seedProject(env)
})
```

Que cada test empiece desde el mismo estado es lo que permite leerlos sin pensar en el orden.

## 2. Un cliente por persona

El paquete te da un Firestore «como si fueras» cada usuario. Con un atajo de una línea, los tests se leen casi como una tabla de permisos:

```ts
const db = (uid?: string) =>
  uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore()
```

`db(U.viewer)` es el viewer. `db()` es alguien sin sesión.

## 3. Probar lo que pasa y lo que no pasa

Cada caso usa `assertSucceeds` o `assertFails`. La regla de oro: **por cada cosa permitida, prueba también quién no puede hacerla.** Un test que solo prueba lo permitido sigue pasando si la regla deja pasar todo.

```ts
it('members of every role can get; outsiders, invitees and anonymous cannot', async () => {
  for (const r of ['owner', 'admin', 'editor', 'viewer'] as const)
    await assertSucceeds(getDoc(doc(db(U[r]), 'projects', 'p1')))
  await assertFails(getDoc(doc(db(U.outsider), 'projects', 'p1')))
  await assertFails(getDoc(doc(db(U.invited), 'projects', 'p1')))
  await assertFails(getDoc(doc(db(), 'projects', 'p1')))
})
```

## 4. Prueba las consultas, no solo los documentos

Las reglas de Firestore no filtran resultados: evalúan la consulta entera. Si la consulta *podría* devolver algo que no puedes leer, se rechaza completa. Por eso conviene probar exactamente las consultas que hace la app, y también las que no debería poder hacer nadie:

```ts
it('list only with memberIds array-contains own uid', async () => {
  const ref = collection(db(U.viewer), 'projects')
  await assertSucceeds(getDocs(query(ref, where('memberIds', 'array-contains', U.viewer))))
  await assertFails(getDocs(ref)) // la colección entera
  await assertFails(getDocs(query(ref, where('memberIds', 'array-contains', U.owner)))) // la de otro
})
```

## 5. Ataca las operaciones delicadas

Los tests más valiosos no son los de leer: son los que intentan colarse. Para aceptar una invitación, por ejemplo, pruebo que el invitado entre con su rol y también todas las trampas:

```ts
it('invitee cannot escalate role or keep the invite', async () => {
  // invitado como editor, intenta entrar como admin
  await assertFails(updateDoc(doc(db(U.invited), 'projects', 'p1'), acceptAs(U.invited, 'admin')))
  // entra con su rol, pero sin borrar su invitación
  const { [`pendingInvites.${U.invited}`]: _drop, ...keepInvite } = acceptAs(U.invited, 'editor')
  await assertFails(updateDoc(doc(db(U.invited), 'projects', 'p1'), keepInvite))
})
```

Otros que vale la pena tener: nadie cambia el `ownerId`, nadie crea un segundo owner, un admin no agrega miembros por la puerta de atrás, un viewer no mueve una tarea de estado, y una tarea no se puede mudar a otro proyecto cambiando su `projectId`.

## 6. Emuladores efímeros, en otros puertos

Los tests de reglas no forman parte de `npm test`: corren con `npm run test:rules`, que levanta emuladores propios, ejecuta Vitest y los apaga.

```js
const args = [
  'emulators:exec',
  '--config', 'firebase.rules-test.json',
  '--project', 'demo-gantthub',
  '--only', 'firestore,storage',
  'npx vitest run -c vitest.rules.config.ts',
]
```

Dos decisiones hacen que esto sea cómodo:

- **`firebase.rules-test.json` usa los mismos archivos de reglas que producción**, pero otros puertos (Firestore en 8280, Storage en 9399). Así puedes correr los tests con tus emuladores de desarrollo abiertos, sin que choquen.
- **El proyecto se llama `demo-gantthub`.** Firebase garantiza que un proyecto con prefijo `demo-` nunca toca recursos reales.

En la configuración de Vitest, `fileParallelism: false`: todos los archivos comparten el mismo emulador, y en paralelo uno borraría los datos del otro.

## 7. Storage se prueba igual

Las reglas de Storage de GanttHub leen Firestore para saber quién es miembro. El patrón es el mismo: sembrar el proyecto en Firestore y probar con un cliente de Storage por persona. Ahí los casos interesantes son de tamaño y tipo: un avatar de más de 5 MB falla, un adjunto `.html` falla, un viewer que intenta subir un archivo a una tarea falla.

## Lo que me llevo

- Escribe los tests como una tabla de permisos: para cada acción, quién sí y quién no.
- Prueba las consultas tal como las hace la app. Una consulta que la regla rechaza rompe la pantalla entera, no un documento.
- Los tests que intentan colarse (escalar el rol, saltarse un campo, mover algo de proyecto) son los que más valen.
- Si las reglas y los tests viven en el repo, cada cambio de reglas pasa por los tests antes de desplegarse. Antes, las reglas vivían solo en la consola de Firebase, sin historial.
