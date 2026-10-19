---
title: "El Watch no espera al iPhone"
description: "En el Apple Watch de Hace Cuánto el tap se aplica al momento, aunque el iPhone esté lejos. Cómo se encolan los registros con su hora original, cómo se evita que desaparezcan de la pantalla y cómo funciona deshacer."
date: 2026-10-19
tags: [watchos, swift, sincronización, hacecuanto]
projects: [hacecuanto]
kind: learning
keyword: "watch"
---

El Apple Watch es el mejor lugar para registrar algo: está en la muñeca, no hay que desbloquear nada y el tap dura un segundo. Pero tiene un problema: el iPhone, que es donde viven los datos, no siempre está cerca.

Si el Watch esperara a que el iPhone confirme cada tap, registrar sin el iPhone sería imposible, y con el iPhone cerca se sentiría lento. Así que la regla fue: **en la muñeca, el tap se aplica al momento; la sincronización viene después**.

## Quién manda

Primero hubo que decidir quién tiene la verdad. Dos bases de datos que se sincronizan en ambas direcciones son una fuente infinita de conflictos, así que no hay dos:

- **El iPhone es la única fuente de verdad.** Tiene la base de SwiftData con todos los registros.
- **El Watch tiene una copia de solo lectura**: un JSON con un resumen de cada item (nombre, emoji, color, tipo, meta y las fechas de sus últimos 200 registros). Con eso alcanza para «hace cuánto», las rachas y los promedios.
- **Lo que el Watch manda son acciones**, no datos: «tap en este item a esta hora» o «deshacer el tap de esta hora».

El iPhone manda el resumen con `updateApplicationContext` cada vez que algo cambia. Ese canal tiene una propiedad útil: solo guarda el último valor. Si el Watch estuvo apagado y hubo diez cambios, al encender recibe uno solo, el más nuevo.

## Un tap con su hora original

Cuando tocas un item en el Watch pasan tres cosas, en este orden:

1. Se agrega la fecha a la copia local y se guarda. La pantalla y la complicación cambian al momento, con vibración.
2. Se recuerda el tap como **pendiente**.
3. Se manda al iPhone.

```swift
private func send(_ message: [String: Any]) {
    let session = WCSession.default
    guard session.activationState == .activated else {
        session.transferUserInfo(message)
        return
    }
    if session.isReachable {
        session.sendMessage(message, replyHandler: { [weak self] reply in
            self?.apply(reply)
        }, errorHandler: { _ in
            session.transferUserInfo(message)
        })
    } else {
        session.transferUserInfo(message)
    }
}
```

Si el iPhone está cerca, `sendMessage` llega al instante y el iPhone responde con la lista actualizada. Si no, o si el mensaje falla, cae a `transferUserInfo`: una cola que el sistema guarda y entrega cuando vuelven a verse, aunque pasen horas.

Lo importante es que el mensaje lleva **la hora del tap**, no la hora en que llegó. Si registré «Ejercicio» a las 7 a.m. y el iPhone se enteró a las 9, el registro dice 7 a.m. Si no, las rachas y los patrones («lo haces más por la mañana») estarían mal.

## Que nada desaparezca

Aquí está el caso más sutil. Registro en el Watch, el tap se aplica localmente y viaja en la cola. Mientras tanto, llega del iPhone un resumen nuevo (por ejemplo, porque registré otra cosa en el teléfono). Ese resumen todavía no incluye mi tap, así que si el Watch lo reemplaza tal cual, **el registro desaparece de la pantalla**. Minutos después llega a la cola, el iPhone lo guarda, manda otro resumen y reaparece.

No se pierde nada, pero ver desaparecer un registro hace desconfiar de toda la app. La solución es que el Watch vuelva a aplicar sus taps pendientes sobre cualquier lista que reciba:

```swift
var merged = decoded
self.pendingTaps.removeAll { tap in
    guard let item = merged.first(where: { $0.id == tap.id }) else { return true }
    return item.dates.contains { abs($0.timeIntervalSince(tap.date)) < 1.5 }
}
for tap in self.pendingTaps {
    if let index = merged.firstIndex(where: { $0.id == tap.id }) {
        merged[index].dates.append(tap.date)
        merged[index].dates.sort()
    }
}
```

Un tap deja de estar pendiente cuando la lista del iPhone ya trae una fecha a menos de un segundo y medio de la suya. Hasta entonces, se sigue mostrando. La tolerancia existe porque las fechas viajan como segundos en un `Double` y no hace falta exigir que coincidan al milisegundo.

## Deshacer, también por hora

Después de cada tap, el Watch muestra un botón para deshacer. Deshacer local es fácil: el Watch guarda cómo estaba el item antes del tap y lo restaura. Pero el iPhone también tiene que borrar ese registro, y el registro nuevo todavía no tiene un id que el Watch conozca.

Así que deshacer se identifica igual que el tap: por item y por hora. El iPhone busca un registro de ese item a menos de 2 segundos de esa hora y lo borra. Si el item llevaba cronómetro y lo que se deshizo fue el arranque, apaga el cronómetro y cierra la Live Activity.

## La complicación

La complicación de la carátula lee la misma copia local que la app. En el Watch no hay pantalla para configurar un widget, así que en lugar de pedirte que elijas un item, ofrece una opción por cada item al agregarla a la carátula. Tocarla abre la app del Watch con un enlace (`hacecuanto://tap/<id>`) que registra ese item.

## Lo que aprendí

- **Una sola fuente de verdad simplifica todo lo demás.** El Watch nunca escribe datos, solo pide acciones. No hay conflictos que resolver.
- **Optimista en la interfaz, paciente en la red.** El tap se ve al instante, y la entrega puede tardar horas sin que importe.
- **El tiempo del evento es parte del dato.** Mandar la hora del tap, no la de llegada, es lo que mantiene las rachas correctas cuando el iPhone está lejos.
- **Los bugs de sincronización se ven como bugs de confianza.** Aunque no se pierda nada, ver un registro desaparecer un minuto basta para dudar de la app.
