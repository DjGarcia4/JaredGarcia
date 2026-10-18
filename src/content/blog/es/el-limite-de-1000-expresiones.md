---
title: "Los tests pasaban y las reglas estaban rotas: el límite de 1000 expresiones"
description: "Firestore deja de evaluar una regla cuando llega a 1000 expresiones. En GanttHub lo provocó una regla para ceder la propiedad de un proyecto, y los 99 tests seguían en verde. Por qué pasó, cómo se arregló con un condicional y el test que lo vigila."
date: 2026-10-18
tags: [firebase, seguridad, testing, gantthub]
projects: [gantthub]
kind: learning
keyword: "1000"
---

Las reglas de seguridad de GanttHub tienen su propia batería de tests ([la cuento aquí](/blog/testear-reglas-de-firebase)). Cuando agregué la opción de ceder la propiedad de un proyecto a otro miembro, escribí la regla, escribí sus tests y corrí todo: **99 de 99 en verde.**

Pero entre los `PERMISSION_DENIED` esperados del log había una línea distinta:

```text
PERMISSION_DENIED: Unable to evaluate the expression as the maximum of
1000 expressions to evaluate has been reached. for 'update' @ L306
```

Ningún test falló, y aun así las reglas estaban mal.

## El límite

Firestore no evalúa una regla sin límite: por cada petición hay un tope de **1000 expresiones**. Si la evaluación lo alcanza, se detiene y la petición se **rechaza**.

Ese rechazo es lo que hacía invisible el problema. Los tests que lo provocaban eran casos de «esto no se puede», como que el owner no puede cambiar el `ownerId` sin más. Esperaban un rechazo y recibieron un rechazo. Que el motivo fuera el límite y no la lógica de la regla no les importaba.

## Por qué se disparaba

La regla de actualizar un proyecto era una cadena de caminos posibles unidos con `||`:

```js
allow update: if signedIn()
  && rolesOk(newData())
  && ((newData().ownerId == resource.data.ownerId
        && (ownerUpdate() || adminUpdate() || editorUpdate() || pinUpdate()
            || selfProfileUpdate() || leaveProject() || acceptInvite() || declineInvite()))
      || transferOwnership());
```

`||` corta en cuanto un camino da `true`. Cuando la petición está permitida, eso sale barato. Cuando está **prohibida**, ningún camino da `true` y se evalúan todos, hasta el último: `transferOwnership()`.

Y esa función era la cara. Para comprobar que en `members` solo cambiaban dos personas, calculaba qué entradas se agregaban y cuáles se quitaban:

```js
let added = newData().members.removeAll(resource.data.members);
let removed = resource.data.members.removeAll(newData().members);
// …y después comparaba uid y rol de cada una
```

`removeAll` sobre una lista de mapas cuesta en proporción al número de miembros. Sumado a los ocho caminos anteriores, ya pasaba el límite con los cuatro miembros del proyecto de prueba.

Lo grave no eran los rechazos de los tests: esos tenían que fallar de todos modos. Lo grave era que el costo dependía del tamaño del proyecto. Una petición **legítima** en un proyecto con muchos miembros también podía llegar a 1000 y rechazarse. Para el usuario, la app simplemente diría «no tienes permiso» al fijar un proyecto o cambiar su foto.

## El arreglo: elegir una rama, no probarlas todas

Dos cambios.

**1. Un condicional en vez de `||`.** Ceder la propiedad es la única operación que cambia `ownerId`. Así que la regla primero mira eso y evalúa solo la rama que corresponde:

```js
// Condicional en vez de ||: así solo se evalúa una de las dos ramas.
allow update: if signedIn()
  && rolesOk(newData())
  && (newData().ownerId == resource.data.ownerId
      ? (ownerUpdate() || adminUpdate() || editorUpdate() || pinUpdate()
         || selfProfileUpdate() || leaveProject() || acceptInvite() || declineInvite())
      : transferOwnership());
```

Fijar un proyecto, cambiar un rol o salir de él ya no pagan nunca el costo de la transferencia.

**2. Una transferencia más barata.** Las reglas ya confiaban en `memberRoles` (un mapa uid → rol) para todo lo demás, y comparar las claves de un mapa sale barato. Así que el chequeo pasó a ser:

```js
&& newData().memberIds.toSet() == resource.data.memberIds.toSet()  // nadie entra ni sale
&& newData().members.size() == resource.data.members.size()
&& newData().memberRoles[next] == 'owner'
&& newData().memberRoles[uid()] == 'admin'
&& newData().memberRoles.diff(resource.data.memberRoles).affectedKeys().hasOnly([next, uid()]);
```

Sin `removeAll`. Al que cede la propiedad no le estoy regalando nada: como owner, ya podía editar `members` por su propio camino.

## El test que lo vigila

Un test que pasa con el error no sirve para vigilarlo. Así que agregué uno que sí falla si el límite vuelve: un proyecto con **30 miembros**, donde se prueban las operaciones **permitidas** más comunes. Son fijar el proyecto, cambiar la foto, salir, cambiar un rol, aceptar una invitación y transferir la propiedad.

Si alguna vuelve a pasar de 1000 expresiones, se rechaza, y `assertSucceeds` lo marca en rojo. Con eso, el log quedó limpio: **101 tests y ninguna línea `maximum of 1000`.**

## Lo que me llevo

- **Un rechazo puede tener el motivo equivocado.** `assertFails` no distingue «lo prohibió tu lógica» de «se quedó sin presupuesto». Revisa el texto de los `PERMISSION_DENIED` de vez en cuando.
- **En las reglas, `||` es caro justo cuando se rechaza.** Si una rama es costosa y solo aplica a un caso, sepárala con un condicional.
- **Cuidado con lo que crece con los datos.** `removeAll`, recorrer listas y comparar arrays cuestan según el tamaño del documento. Lo que pasa con 4 miembros puede no pasar con 40.
- **Prueba lo permitido con datos grandes.** Es la única forma de que el límite se vea como un test en rojo y no como una queja de un usuario.
