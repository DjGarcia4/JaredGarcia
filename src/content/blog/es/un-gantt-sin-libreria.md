---
title: "Un Gantt sin librería"
description: "Cómo está hecho el cronograma de GanttHub: barras que se arrastran y se estiran con snap a días, hitos, teclado, táctil y guardado optimista. Y por qué cada barra maneja su propio arrastre."
date: 2026-10-16
tags: [frontend, vue, interacción, gantthub]
projects: [gantthub]
kind: learning
keyword: "gantt"
cover: /img/projects/gantthub/02.webp
---

El producto se llama GanttHub, así que el Gantt no podía ser un agregado. Tenía que sentirse parte de la app: mismas tareas que el tablero, mismos colores de estado, mismos responsables, y editar fechas tenía que ser tan directo como mover una tarjeta en el Kanban.

Lo hice a mano, sin librería. Son cuatro archivos: la pestaña que arma la grilla, la barra, la barra de herramientas y unas utilidades de fechas. Esto es lo que aprendí armándolo.

## Las mismas tareas, sin planificar dos veces

El Gantt no tiene datos propios. Cada tarea del tablero se convierte en una barra con una regla simple:

- **Inicio**: la fecha de inicio si la tiene; si no, la fecha de creación.
- **Fin**: el vencimiento si lo tiene; si no, el mismo día del inicio.
- **Datos inconsistentes** (un vencimiento antes del inicio): si el inicio es explícito, manda el inicio; si no, manda el vencimiento.
- **Hito**: las reuniones, y las tareas con inicio explícito igual al vencimiento. Se dibujan como un rombo en vez de una barra.

Una tarea sin vencimiento se dibuja con borde punteado. Es la forma de decir «esto está en el cronograma, pero nadie le puso fecha» sin esconderla.

## Fechas sin sorpresas de zona horaria

Las fechas de las tareas se guardan como texto `AAAA-MM-DD`. Parece un detalle, pero `new Date('2026-10-16')` se interpreta como medianoche UTC, y en Honduras (UTC−6) eso es el 15 a las seis de la tarde. Una barra que se corre un día según dónde estés es exactamente el tipo de bug que hace desconfiar de un cronograma.

Así que el parser trata ese formato como fecha local, a mano:

```ts
const YMD = /^(\d{4})-(\d{2})-(\d{2})$/
const m = YMD.exec(value)
if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
```

Y al guardar se escribe con el mismo formato que usa el selector de fechas del resto de la app. Una sola representación para las fechas en toda la app.

## Cada barra maneja su propio arrastre

La decisión que más rendimiento me dio: **el estado del arrastre vive dentro de la barra**, no en la pestaña. Mientras arrastras, la barra solo guarda cuántos días se movió el inicio y cuántos el fin, y se desplaza con un `transform`. El resto del Gantt no se entera ni se vuelve a renderizar. Recién al soltar, la barra emite `commit` con las fechas nuevas.

Hay tres modos de arrastre: desde el cuerpo mueve la barra entera, desde el borde izquierdo cambia el inicio y desde el derecho cambia el fin. El movimiento se redondea a días completos según el ancho del día en el zoom actual:

```ts
const applyDelta = (days: number, m: GanttDragMode) => {
  const span = spanDays.value
  if (m === 'move') {
    dStart.value = days
    dEnd.value = days
  } else if (m === 'start') {
    dStart.value = Math.min(days, span - 1) // el inicio no pasa al fin
    dEnd.value = 0
  } else {
    dStart.value = 0
    dEnd.value = Math.max(days, -(span - 1)) // el fin no pasa al inicio
  }
}
```

Mientras arrastras aparece un tooltip con las fechas y la duración en vivo. Va montado en `body` para que no quede debajo de la cabecera fija del calendario.

Un detalle de sensación: el arrastre empieza recién después de 4 píxeles. Si el puntero se mueve menos, es un clic y abre la tarea. Sin ese umbral, cada clic movía la barra por accidente o abría la tarea cuando querías moverla.

## Hitos que se pueden estirar

Un hito es un rombo, pero no tiene por qué quedarse así. El rombo tiene un agarre a la derecha: si lo estiras, se convierte en barra. Y una barra de un día con inicio explícito vuelve a verse como hito. Las reuniones son la excepción: siempre son de un día, así que se pueden mover pero no estirar.

## Teclado

Cada barra es un elemento con foco. Enter o Espacio abre la tarea. Las flechas la mueven un día; con Shift, cambian el fin. Esc cancela.

Con teclado no guardo en cada tecla: si mueves una barra cinco días, serían cinco escrituras. Las pulsaciones se acumulan y se guardan juntas 700 ms después de la última, o al salir de la barra. La etiqueta accesible de cada barra dice el título, las fechas, si está vencida o completada, y cómo moverla.

## Táctil

En el celular, un gesto horizontal sobre el Gantt es scroll, no arrastre. Intentar distinguir «quiero mover la barra» de «quiero ver la semana siguiente» con el dedo genera más errores que ayudas. Así que en táctil las barras no se arrastran: un toque abre la tarea y las fechas se cambian ahí.

## Guardado optimista, con vuelta atrás

Al soltar, la barra se queda donde la dejaste aunque Firestore todavía no haya respondido. Eso lo resuelve un mapa de *overrides*: fechas temporales por tarea, cada una con un número de secuencia.

```ts
const token = ++overrideSeq
overrides.set(t.id, { start, end, token })
try {
  await taskStore.updateTask(props.projectId, t.id, updates)
} catch {
  // El store ya mostró el error; al quitar el override la barra vuelve a su sitio
} finally {
  if (overrides.get(t.id)?.token === token) overrides.delete(t.id)
}
```

El número de secuencia evita una carrera: si mueves la misma barra dos veces seguidas, la respuesta del primer guardado no borra la posición del segundo. Y si el guardado falla, no hay que deshacer nada a mano: el override desaparece y la barra vuelve a la fecha que dice la base.

Al mover una barra se escribe también el inicio, aunque la tarea no lo tuviera. Si no, una tarea cuyo inicio se calculaba desde la fecha de creación «saltaría» de vuelta al recalcularse.

## Lo demás

Zoom por día, semana o mes (40, 20 y 7 píxeles por día), agrupación por estado, responsable o categoría con grupos plegables, filtro por persona, mostrar u ocultar completadas y un botón para volver a hoy. El zoom, la agrupación y el filtro de completadas se recuerdan por navegador. El scroll a hoy respeta `prefers-reduced-motion`.

## Lo que me llevo

- En interacciones de arrastre, que el estado viva en el elemento que se mueve. El resto de la pantalla solo necesita enterarse al final.
- Las fechas sin hora se guardan como texto y se parsean como locales. `new Date('AAAA-MM-DD')` es UTC.
- Un umbral de unos pocos píxeles separa el clic del arrastre, y se nota más de lo que parece.
- Lo optimista necesita una salida: si el guardado falla, la interfaz tiene que volver sola a la verdad.
- Hacerlo propio fue más trabajo que instalar una librería, pero el Gantt habla el mismo idioma visual que el resto de GanttHub, y eso era lo que buscaba.
