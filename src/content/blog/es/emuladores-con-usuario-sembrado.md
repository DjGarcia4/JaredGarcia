---
title: "Desarrollar con Firebase sin tocar producción"
description: "Guía para trabajar en local con los emuladores de Firebase: un proyecto demo-, datos sembrados que siempre parecen de hoy, un botón para entrar como el usuario de prueba, correos apagados y puertos que no se pisan. Como lo uso en GanttHub."
date: 2026-10-16
tags: [firebase, desarrollo, herramientas, guía, gantthub]
projects: [gantthub]
kind: guide
keyword: "local"
---

Durante mucho tiempo, desarrollar GanttHub en local significaba usar el proyecto real de Firebase. Cada prueba creaba proyectos de verdad, cada comentario podía mandar un correo de verdad y probar los permisos implicaba crear usuarios de verdad. Y yo mismo uso GanttHub todos los días para mi trabajo, así que el riesgo de ensuciar mis propios datos era real.

Hoy hay un modo local completo: Auth, Firestore, Storage y Functions corriendo en los emuladores, con datos de ejemplo y un usuario de prueba. Esta guía es cómo está armado.

## 1. Un proyecto `demo-`

La pieza más importante es un nombre. En modo emulador, la app usa el proyecto `demo-gantthub`:

```ts
// En modo emulador usamos un proyecto "demo-": Firebase garantiza que nunca toca recursos reales.
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true'
if (useEmulators) firebaseConfig.projectId = 'demo-gantthub'
```

Firebase trata los proyectos que empiezan con `demo-` de forma especial: solo existen en los emuladores. Si algo queda mal configurado y una llamada se escapa del emulador, no llega a ningún proyecto real. Es una red de seguridad que no depende de que yo me acuerde de nada.

Después, la app conecta Auth, Firestore y Storage a sus emuladores:

```ts
if (useEmulators) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}
```

## 2. Dos comandos, dos modos

```bash
npm run emulators   # levanta los emuladores
npm run dev:local   # la app en modo emulador (vite --mode emulator)
```

`dev:local` carga `.env.emulator`, que activa los emuladores y define el usuario de prueba. Ese archivo va en el repo, porque no tiene secretos: esas credenciales solo existen dentro del emulador de Auth. `npm run dev`, sin más, sigue apuntando al proyecto real, para cuando hace falta.

Los emuladores usan las **mismas reglas de seguridad que producción**. En local se prueban las reglas reales, no una versión relajada. Si algo funciona en local, es porque las reglas de verdad lo permiten.

## 3. Datos que siempre parecen de hoy

Un emulador vacío no sirve para trabajar en un dashboard o en un Gantt. Por eso hay un script de siembra:

```bash
npm run seed:dev
```

Crea tres usuarios (el de prueba y dos compañeros), tres proyectos con equipos y roles distintos, tareas en todos los estados, subtareas, comentarios con menciones, presupuestos y reuniones.

El detalle que más importa: **todas las fechas son relativas a hoy**. Una tarea vence «en 3 días», un comentario es «de hace 2 días», una reunión es «el lunes». Si sembrara fechas fijas, en dos semanas todo estaría vencido y el dashboard dejaría de parecerse a un día normal.

```js
const days = (n) => {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d
}
```

Dos cosas más hacen que el script sea cómodo:

- **Es idempotente.** Escribe siempre los mismos documentos con los mismos ids. Correrlo otra vez actualiza en lugar de duplicar, así que sirve para «resetear» las fechas cuando quieras.
- **Se salta las reglas a propósito.** El emulador acepta el header `Authorization: Bearer owner` como un administrador. El script siembra con eso, porque su trabajo es crear el estado inicial, no probar permisos.

Los datos persisten entre sesiones: los emuladores exportan a `.emulator-data` al cerrarse y lo importan al arrancar.

## 4. Un botón para entrar

En modo emulador, la pantalla de login muestra un recuadro extra: «Entrar como usuario dev». Un clic y estás adentro, sin escribir el correo ni la contraseña.

```ts
const isEmulatorMode = import.meta.env.VITE_USE_EMULATORS === 'true'
const loginAsDev = async () => {
  await userStore.login(import.meta.env.VITE_DEV_EMAIL, import.meta.env.VITE_DEV_PASSWORD)
}
```

El botón depende de la variable del modo emulador, así que en producción no existe. Parece poca cosa, pero entrar cincuenta veces por día escribiendo credenciales se acumula.

## 5. Correos apagados

Las Cloud Functions de GanttHub mandan correos: menciones, recordatorios, invitaciones a reuniones, reportes. En el emulador de Functions, eso sería mandar correos reales desde tu máquina.

Firebase carga un archivo de entorno distinto según el proyecto. `functions/.env.demo-gantthub` solo se usa con `demo-gantthub` y deja las credenciales del correo vacías, así que en local las funciones corren pero no envían nada.

## 6. Puertos ocupados, con un mensaje útil

El problema más frecuente con los emuladores no es de configuración: es que una sesión anterior se cerró mal y dejó un emulador colgado ocupando el puerto. El error de Firebase en ese caso es genérico.

Así que `npm run emulators` revisa antes cada puerto (8080, 9099, 9199, 5001, 4000, 4400) con `lsof`. Si alguno está ocupado, dice cuál, qué proceso lo usa y cómo cerrarlo:

```text
✖ Hay puertos de los emuladores ocupados:
  · firestore :8080 → PID 28064 (java)

Si son emuladores de una sesión anterior, ciérralos con:
  npm run emulators:stop
```

`npm run emulators:stop` cierra solo los procesos que son emuladores de Firebase (los reconoce por su comando). Si otro programa usa uno de esos puertos, lo informa y no lo toca.

## 7. Tests que no se pisan con tu sesión

Dos detalles más para que los tests convivan con el desarrollo:

- Los **tests de reglas** levantan sus propios emuladores efímeros en otros puertos (Firestore en 8280, Storage en 9399). Puedes correrlos con tus emuladores de desarrollo abiertos. Lo cuento en detalle en [cómo testear reglas de Firebase](/blog/testear-reglas-de-firebase).
- Los **tests unitarios** bloquean la red. `fetch` y `XMLHttpRequest` se reemplazan por funciones que fallan con un mensaje claro. Si una prueba intenta llamar a Firebase o a una función real, falla en lugar de llamar.

## Lo que me llevo

- El prefijo `demo-` es la configuración más barata y más segura que hay: aunque te equivoques, no llegas a producción.
- Las mismas reglas en local y en producción. Si no, lo que funciona en local no prueba nada.
- Datos de ejemplo con fechas relativas, o en dos semanas tu entorno local se ve abandonado.
- Lo que haces cincuenta veces al día (entrar, liberar un puerto) merece un botón o un comando.
- Desarrollar sin miedo a romper algo real cambia cómo trabajas: pruebas más cosas, y más rápido.
