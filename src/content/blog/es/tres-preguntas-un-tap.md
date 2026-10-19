---
title: "Tres preguntas, un solo tap"
description: "En Hace Cuánto cada cosa es un evento, un hábito o algo que toca cada X días. Cómo un modelo tan chico alcanza para rachas, «faltan 3 días» y «lo haces más los domingos por la noche», calculando todo a partir de las fechas."
date: 2026-10-19
tags: [ios, swiftui, diseño de producto, hacecuanto]
projects: [hacecuanto]
kind: learning
keyword: "un tap"
cover: /img/projects/hacecuanto/01.webp
---

Hace Cuánto nació de una pregunta: ¿hace cuánto fue la última vez que me corté el pelo? Pero en cuanto la empecé a usar aparecieron otras parecidas que no eran la misma pregunta:

- **«¿Hace cuánto fui al súper?»** Solo quiero saber cuándo fue y cuántas veces. No hay meta.
- **«¿Ya leí hoy?»** Aquí sí hay meta (una vez al día, o 3 veces por semana) y me importa no romper la racha.
- **«¿Ya toca cortarme el pelo?»** Hay un intervalo (cada 28 días) y lo que quiero es que me diga cuánto falta o hace cuánto se venció.

Esas son las tres clases de item de la app: **evento**, **hábito** y **cada X días**. Lo importante es que las tres se registran igual: con un tap.

<figure>
  <img srcset="/img/projects/hacecuanto/01-800.webp 800w, /img/projects/hacecuanto/01-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/hacecuanto/01-1600.webp" alt="El inicio de Hace Cuánto con lo que ya toca y el resumen de la semana, y el detalle del hábito Leer con su racha y su calendario." loading="lazy" decoding="async" />
  <figcaption>El inicio, y el detalle de un hábito: racha, totales, promedio y calendario.</figcaption>
</figure>

## Un registro es una fecha

El modelo es casi ridículo de chico. Un `Item` tiene su configuración (tipo, meta, intervalo, color, emoji) y una lista de `Entry`. Y un `Entry` es, sobre todo, una fecha. El texto, el número, la nota o la duración son opcionales.

Lo que no guardo es igual de importante: **no hay campo de racha, ni de «última vez», ni de «vencido»**. Todo se calcula a partir de las fechas, en un tipo aparte que no sabe nada de SwiftData:

```swift
/// Todas las cuentas de un item, calculadas a partir de sus fechas.
struct ItemStats {
    let dates: [Date] // de más viejo a más nuevo

    func remainingDays(interval: Int, now: Date = .now) -> Int? {
        daysSinceLast(now: now).map { interval - $0 }
    }
}
```

Si borras un registro viejo, o agregas uno de la semana pasada que se te olvidó, la racha se recalcula sola. No hay nada que sincronizar porque no hay nada derivado guardado. Y como `ItemStats` solo recibe fechas, lo usan igual la app, los widgets, Siri y el Apple Watch.

## La racha no se rompe a medio día

La regla de la racha tiene un detalle que se nota en el uso real. Si tu meta es leer una vez al día y son las 9 de la mañana, todavía no leíste hoy, pero eso no significa que rompiste la racha. El día aún no termina.

```swift
/// La racha sigue viva si el periodo actual aún no se cumple pero el anterior sí.
func currentStreak(goal: Int, period: GoalPeriod, now: Date = .now) -> Int {
    let counts = periodCounts(period)
    var cursor = periodStart(now, period)
    if (counts[cursor] ?? 0) < goal { cursor = step(cursor, period, by: -1) }
    var streak = 0
    while (counts[cursor] ?? 0) >= goal {
        streak += 1
        cursor = step(cursor, period, by: -1)
    }
    return streak
}
```

La misma función sirve para metas por día y por semana: solo cambia qué es un «periodo». La mejor racha usa la misma idea, recorriendo los periodos cumplidos y contando los que son consecutivos.

## «Lo haces más los domingos por la noche»

Mi parte favorita de la pantalla de detalle es una frase. Con tres registros o más, la app cuenta en qué día de la semana y en qué parte del día (mañana, tarde o noche) caen tus registros, y te dice el más común. Es un cálculo de dos histogramas, pero se lee como algo que te conoce.

La pantalla de detalle completa tiene los números (hoy, racha, total, este mes, este año, promedio, mejor racha), un calendario de las últimas 18 semanas, el conteo por mes de los últimos 6 meses y, si el item tiene detalle, el desglose: «Hábitos Atómicos, 31 veces; El Principito, 24 veces».

## Un tap, y luego lo opcional

Registrar es tocar la tarjeta. Nada más. Aparece un aviso abajo con dos botones: **deshacer** y **agregar detalle**. Si el item pregunta algo («¿Cuánto costó?», «¿Qué libro?»), lo respondes después, solo si quieres.

Hay dos ajustes que hacen que el detalle casi nunca haga falta:

- **Repetir el último detalle.** Si estás leyendo el mismo libro todo el mes, cada registro nuevo copia el título del anterior.
- **Opciones fijas.** «¿Dónde?» con Walmart, Costco o Soriana se elige con un toque, sin teclado.

Y si el item lleva cronómetro (trabajar en un proyecto, hacer ejercicio), el tap no registra: arranca. El segundo tap lo detiene y guarda la duración.

## Plantillas para no empezar en blanco

Crear un item desde cero obliga a decidir tipo, meta, intervalo y detalle antes de usarlo. Por eso el formulario abre con 14 plantillas: «Corte de pelo» ya trae cada 28 días, «Tomar agua» trae meta de 8 vasos con recordatorios durante el día, «Gasolina» ya pregunta cuánto cargaste. Tocas una, ajustas lo que quieras y guardas.

## Lo que aprendí

- **Separar la pregunta de la acción.** Las tres clases de item responden preguntas distintas, pero la acción es una sola. Esa decisión es la que hace que registrar desde un widget, desde Siri o desde el reloj sea igual de simple.
- **No guardar lo que se puede calcular.** Con unos cuantos cientos de fechas por item, calcular todo al vuelo es instantáneo y elimina una categoría entera de bugs.
- **Lo opcional va después.** Pedir el detalle antes de registrar haría que la mitad de las veces no se registre nada.
