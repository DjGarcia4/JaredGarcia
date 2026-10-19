---
title: "Avisos que aprenden tu ritmo"
description: "Un corte de pelo cada 28 días, 8 vasos de agua al día y el súper «cuando toca» necesitan avisos distintos. Cómo los calcula Hace Cuánto, cómo caben en el límite de iOS y cómo un lugar te pregunta al llegar."
date: 2026-10-19
tags: [ios, notificaciones, core location, hacecuanto]
projects: [hacecuanto]
kind: learning
keyword: "avisos"
cover: /img/projects/hacecuanto/02.webp
---

Un recordatorio fijo («todos los días a las 9 p.m.») sirve para muy pocas cosas. Si ya leíste, te molesta. Si el corte de pelo es cada 28 días, te avisa 27 veces de más. Y para ir al súper ni siquiera hay un intervalo: vas cuando se acaba algo.

En Hace Cuánto cada tipo de item avisa distinto, y todo se recalcula cada vez que registras algo.

<figure>
  <img srcset="/img/projects/hacecuanto/02-800.webp 800w, /img/projects/hacecuanto/02-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/hacecuanto/02-1600.webp" alt="El formulario de un item nuevo desde la plantilla Tomar agua: meta de 8 vasos, recordatorios durante el día cada hora y media entre 8 a.m. y 9 p.m., y la opción de guardar un lugar." loading="lazy" decoding="async" />
  <figcaption>«Tomar agua» desde su plantilla: meta de 8 vasos, recordatorios durante el día y lugar.</figcaption>
</figure>

## Un aviso por tipo de item

Todos los avisos se calculan en una función que recibe el item y la hora actual y devuelve **cuándo** avisar y **qué** decir:

- **Cada X días**: el día que vence, a tu hora. «Ya toca. La última vez fue hace 28 días.» Si ese momento ya pasó, el siguiente día a la misma hora.
- **Hábito diario**: hoy a tu hora si aún no lo cumpliste; si ya lo cumpliste, mañana. «¿Ya le diste hoy? Llevas una racha de 🔥 12.»
- **Hábito semanal**: un solo aviso el último día de la semana, y solo si te falta. «Llevas 2 de 3 esta semana. Hoy es el último día.»
- **Evento**: este es el que «aprende». Con tres registros o más, la app conoce tu intervalo promedio y avisa cuando ya pasó **una vez y media** ese promedio.

```swift
case .event:
    guard stats.total >= 3, let average = stats.averageInterval, let last = stats.last else { return nil }
    let due = last.addingTimeInterval(average * 1.5)
    let date = nextSlot(from: cal.startOfDay(for: due))
    let days = cal.dateComponents([.day], from: cal.startOfDay(for: last), to: cal.startOfDay(for: date)).day ?? 0
    return (date, "\(Fmt.cada(average)) normalmente, y ya van \(Fmt.dias(days)).")
```

Si voy al súper cada 7 días, el aviso llega al día 11: «Cada 7 días normalmente, y ya van 11 días.» No me avisa el día 7, porque a veces voy el 8 y no pasa nada. Me avisa cuando ya es raro. Con menos de tres registros no hay promedio confiable, así que no avisa.

## Avisos durante el día, hasta la meta

Para «tomar agua» o «estirarme» un aviso al día no alcanza. Esos hábitos tienen una opción de recordatorio repetido: cada N minutos dentro de un horario (por defecto, de 8 a.m. a 9 p.m.).

Lo importante es **desde cuándo se cuenta**. Si el aviso es cada 90 minutos y tomaste un vaso a las 10:15, el siguiente no es a las 11:00 de la grilla, sino a las 11:45. Y cuando llegas a la meta, se calla hasta mañana:

```swift
let done = stats.periodCount(.day, now: now)
guard done < goal else { continue }
let lastToday = stats.dates.last.flatMap { cal.isDate($0, inSameDayAs: now) ? $0 : nil }
candidate = lastToday.map { max($0.addingTimeInterval(every), start) } ?? start
while candidate <= now { candidate.addTimeInterval(every) }
body = "Llevas \(done) de \(goal)\(unit) hoy. Toca Registrar para sumar uno."
```

## El límite de 64

iOS solo deja tener **64 avisos programados** por app. Con varios hábitos de agua y estiramientos cada hora, es fácil pasarse, y lo que pasa entonces es silencioso: los que sobran simplemente no se programan.

Por eso los avisos repetidos de un item programan solo lo que queda de hoy y el día de mañana, con un máximo de 24. No hace falta más: cada vez que registras, o cuando vuelves a la app, todo se reprograma desde cero. Los avisos son una ventana deslizante, no un calendario.

## Reprogramar todo, siempre

Reprogramar solo lo que cambió parece más eficiente, pero es una fuente de bugs: un aviso viejo que nadie borró, uno duplicado. La función que reprograma hace lo más simple:

1. Calcula todos los avisos de todos los items activos.
2. Borra los pendientes que empiezan con su prefijo (`item-`).
3. Agrega los nuevos.

El prefijo importa: el aviso de «la app vence mañana» y los de los lugares no empiezan con `item-`, así que no se tocan.

## Un lugar que te pregunta al llegar

Un item puede tener un lugar. Si estás en el súper y tocas «Guardar mi ubicación actual» (y le pones de nombre «Walmart»), la próxima vez que llegues te llega: «Llegaste a Walmart. ¿Lo registro?», con el botón «Registrar ✓».

Por dentro usa `CLMonitor` con una condición circular por item (150 m por defecto). Tres detalles importantes:

- **Desde iOS 18 hay que mantener una `CLServiceSession`** para que el sistema vigile los lugares con la app cerrada. Solo se crea si algún item tiene lugar.
- **No volver a registrar un lugar que no cambió.** Volver a agregarlo reinicia su estado y puede disparar un «llegaste» falso. Antes de agregar, compara centro y radio con lo que ya está.
- **Un enfriamiento de 6 horas.** Si ya lo registraste hace poco, llegar no dispara nada. Nadie quiere que le pregunten por el súper cuando vuelve por algo que olvidó.

Y la ubicación nunca sale del iPhone: no hay servidor, todo se evalúa en el dispositivo.

## Pedir permiso cuando hace falta

La app no pide permiso para notificaciones ni ubicación al abrirse por primera vez. Lo pide al activar un recordatorio o al guardar un lugar, que es cuando el permiso tiene sentido. Un permiso pedido sin contexto se rechaza; uno pedido justo después de tocar «Recordatorios» casi siempre se acepta.

## Lo que aprendí

- **Un buen aviso llega cuando algo es raro, no cuando toca según el reloj.** El factor de 1.5 sobre el promedio deja pasar los atrasos normales y avisa solo los que no lo son.
- **Los límites del sistema fallan en silencio.** El de 64 avisos no da error; hay que diseñar para no llegar.
- **Recalcular todo es más simple que sincronizar cambios.** Con unas decenas de avisos, borrar y volver a crear es instantáneo y siempre queda bien.
