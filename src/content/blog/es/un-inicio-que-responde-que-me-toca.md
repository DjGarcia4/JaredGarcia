---
title: "Un inicio que responde «¿qué me toca hoy?»"
description: "El dashboard de GanttHub era una pared de números. Lo rehice para que responda tres preguntas al abrir la app: qué requiere atención, qué cambió desde mi última visita y qué me asignaron. Sin escribir nada en la base."
date: 2026-10-16
tags: [producto, diseño, ux, gantthub]
projects: [gantthub]
kind: learning
keyword: "inicio"
cover: /img/projects/gantthub/01.webp
---

Abro GanttHub todas las mañanas. Lo uso para mis proyectos y para los de Wink, y lo primero que quiero saber no es cuántas tareas hay en total. Quiero saber qué se está prendiendo fuego, qué hizo el equipo desde ayer y qué me toca a mí.

El dashboard anterior era una fila de tarjetas con números: proyectos activos, tareas pendientes, completadas en la semana, presupuesto gastado. Datos correctos, pero había que interpretarlos. Un «15 tareas pendientes» no te dice si eso está bien o mal, ni cuáles son tuyas.

## Empezar con una frase, no con un gráfico

El inicio abre con un saludo según la hora y un resumen en lenguaje natural:

> 1 proyecto requiere atención. 2 cambios de tu equipo en las últimas 24 h.

La frase se arma con lo que haya: tareas vencidas, lo tuyo que vence hoy, reuniones, invitaciones, menciones, pedidos de actualización y proyectos en riesgo. Cada fragmento es un botón que lleva a su sección. Si no hay nada pendiente, la frase cambia a «todo al día». Leer una oración es más rápido que leer seis números, y te dice por dónde empezar.

Debajo siguen los indicadores, pero cada uno con contexto: no solo «15 pendientes», sino «6 asignadas a ti»; no solo «1 vencida», sino «0 tuyas · 1 prioridad alta».

## «Requiere atención» con reglas que se pueden explicar

Para decir que un proyecto requiere atención, la app calcula su salud con reglas simples y, sobre todo, explicables:

- **Atrasado**: la fecha límite del proyecto ya pasó y quedan tareas abiertas.
- **En riesgo**: al menos un 25 % de las tareas abiertas están vencidas, o el avance va más de 20 puntos por detrás del tiempo transcurrido, o el presupuesto ya se consumió entero.
- **Sin datos**: no hay tareas ni fecha límite.
- **En curso**: todo lo demás.

Cada estado viene con su motivo en texto: «4 de 10 tareas abiertas vencidas», «70% del plazo transcurrido, 40% completado». Un semáforo sin explicación genera desconfianza; uno que dice por qué está en amarillo te dice qué hacer.

La regla del avance contra el tiempo es la que más uso. Si un proyecto va por la mitad de su plazo y tiene un 20 % de tareas completadas, no hay ninguna tarea vencida todavía, pero ya está atrasado. Es la alerta que llega antes de que las fechas empiecen a vencer.

## «Qué cambió» desde tu última visita

La sección «Qué cambió» muestra lo que hizo el equipo: tareas completadas, creadas, cambios de estado, comentarios, pedidos de actualización y gente nueva en los proyectos. Por defecto, desde tu última visita.

Lo interesante es cómo se sabe cuál fue tu última visita. No hay escrituras en Firestore: todo se guarda en el navegador.

- Al abrir el inicio, la app lee cuándo fue tu visita anterior y la fija como línea base de la sesión en `sessionStorage`. Así, ir a un proyecto y volver al inicio no la reinicia: sigue mostrándote lo que cambió desde la mañana.
- Después guarda la hora actual en `localStorage` como la visita de mañana.
- Si nunca entraste, muestra las últimas 24 horas. Y si volviste después de mucho tiempo, el tope es 30 días, para no volcarte el historial entero.

```ts
let baseline = Number(read(session, baseKey))
if (!baseline) {
  baseline = Number(read(local, visitKey)) || 0
  write(session, baseKey, String(baseline))
}
lastVisit.value = new Date(
  baseline ? Math.max(baseline, Date.now() - 30 * DAY) : Date.now() - DAY,
)
write(local, visitKey, String(Date.now()))
```

También hay pestañas para ver las últimas 24 horas o los últimos 7 días, sin depender de la visita.

## «Para ti»: lo que es tuyo

La bandeja «Para ti» junta lo que te involucra directamente: menciones en comentarios, tareas que te asignaron y pedidos de actualización. Se puede marcar como visto, y eso también vive en el navegador: una lista acotada de claves (hasta 400) para que no crezca sin límite.

Todo esto se calcula con las tareas que la vista ya cargó: comentarios, quién creó y actualizó cada tarea, los pedidos de actualización y la fecha en que cada miembro entró al proyecto. No hay consultas extra ni colecciones de actividad. Es una decisión que tiene un costo (si cambias de navegador, «lo visto» empieza de cero), pero mantiene el inicio rápido y no suma escrituras por cada persona que lo abre.

## El orden de la pantalla

El orden sigue las preguntas, de lo urgente a lo general:

1. El resumen y los indicadores.
2. **Hoy**: las reuniones del día y lo tuyo que vence hoy.
3. **Para ti**: menciones y asignaciones.
4. **Qué cambió** y **Próximos días**.
5. Más abajo, tu trabajo, la distribución por estado, la salud de cada proyecto, el portafolio, la actividad de la semana y la carga del equipo.

Los gráficos siguen ahí, pero al final. Son para cuando tienes tiempo de mirar el panorama, no para la primera mirada de la mañana.

## Lo que me llevo

- Un dashboard se diseña a partir de las preguntas de quien lo abre, no de los datos que hay.
- Una frase con enlaces le gana a una fila de números para decir por dónde empezar.
- Si marcas algo como «en riesgo», di por qué. El motivo convierte una alerta en una acción.
- No todo estado tiene que vivir en la base de datos. «Mi última visita» es del navegador, y guardarlo ahí hace el inicio más simple y más rápido.
