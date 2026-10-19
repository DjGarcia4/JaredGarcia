---
title: "Cada widget en cada tamaño, en una prueba"
description: "Hace Cuánto tiene 3 widgets en hasta 6 tamaños. Revisarlos a mano en el simulador era lento, así que una prueba los dibuja todos como PNG con datos fijos. Cómo funciona y qué permite revisar de un vistazo."
date: 2026-10-19
tags: [ios, widgetkit, testing, hacecuanto]
projects: [hacecuanto]
kind: learning
keyword: "snapshots"
---

Hace Cuánto tiene tres widgets: uno de un item, uno de varios y uno de pendientes. El de un item viene en seis tamaños: chico, mediano y grande para la pantalla de inicio, y circular, rectangular y en línea para la de bloqueo. Sumando variantes, son más de veinte vistas distintas.

Revisarlas en el simulador es lento: agregar el widget, elegir el item, esperar a que el sistema lo dibuje, cambiar de tamaño, repetir. Y para ver el caso «8 vasos de agua con 4 registrados» hay que registrar cuatro vasos de verdad. Así que hice una prueba que hace todo eso de una vez.

## La idea: dibujar sin el sistema

Un widget es, al final, una vista de SwiftUI que recibe una entrada (`TimelineEntry`) y la dibuja. WidgetKit decide cuándo y en qué tamaño, pero la vista en sí se puede dibujar en cualquier lado. `ImageRenderer` convierte una vista en una imagen, así que la prueba solo tiene que armar la vista con datos fijos y guardar el PNG.

El único obstáculo es el tamaño. Dentro de un widget, la vista lee `widgetFamily` del entorno, y fuera de WidgetKit ese valor no existe. Por eso cada vista de widget acepta un tamaño forzado, solo para las pruebas:

```swift
struct ItemWidgetView: View {
    @Environment(\.widgetFamily) private var environmentFamily
    let entry: ItemEntry
    /// Solo para las pruebas que dibujan cada tamaño.
    var forcedFamily: WidgetFamily?

    private var family: WidgetFamily { forcedFamily ?? environmentFamily }
}
```

## La prueba

La prueba define los tamaños reales en puntos y unos items de ejemplo con fechas relativas a una hora fija:

```swift
/// Hoy a las 6 p.m., para que "hoy" tenga registros sin importar a qué hora corra la prueba.
private let now = Calendar.current.date(bySettingHour: 18, minute: 0, second: 0, of: .now)!
private func ago(_ hours: Double) -> Date { now.addingTimeInterval(-hours * 3600) }
```

Ese detalle de las 6 p.m. importa: si la prueba corriera a las 8 de la mañana con fechas relativas a la hora real, «Tomar agua» con registros de hace 5 y 3 horas caería en el día anterior y el widget mostraría 0 de 8. La captura estaría bien; los datos no.

Luego, por cada tamaño y cada item, arma la vista, le pone el marco que tendría en la pantalla (fondo, esquinas redondeadas, modo oscuro en la pantalla de bloqueo) y la guarda a 3× en una carpeta:

```swift
@Test func itemWidgets() throws {
    for (family, size, label) in Self.sizes {
        for (item, tag) in [(water, "agua"), (haircut, "corte"), (project, "proyecto")] {
            try render(ItemWidgetView(entry: ItemEntry(date: now, snapshot: item), forcedFamily: family),
                       family: family, size: size, name: "item-\(label)-\(tag)")
        }
    }
}
```

Los items de ejemplo cubren los casos que más se rompen: un hábito con meta y unidad («4 de 8 vasos»), algo vencido («Vencido por 3 días»), un cronómetro corriendo y un evento sin meta. El widget de pendientes también se dibuja con todo hecho, para ver el estado «Todo al día».

## Un target que no necesita la app

La prueba vive en su propio target, que compila los archivos de los widgets directamente, menos el punto de entrada (`WidgetBundle.swift`) y el `Info.plist`. Así no depende de instalar la extensión ni la app, y corre en un par de segundos.

```yaml
WidgetSnapshotTests:
  type: bundle.unit-test
  sources:
    - WidgetSnapshotTests
    - Shared
    - path: HaceCuantoWidgets
      excludes: [WidgetBundle.swift, Info.plist, "*.entitlements"]
```

## No compara, muestra

Esta prueba no falla si un píxel cambia. A propósito: los widgets cambian seguido mientras los diseño, y una prueba que compara contra imágenes guardadas habría que regenerarla cada vez. Lo que quería era **ver** los veintitantos widgets juntos después de cada cambio, y eso hace. Las imágenes que muestro en el portafolio salen de esta misma prueba.

Lo que sí se prueba con aserciones es la lógica que hay detrás: rachas, «faltan X días», el texto de pendientes, el orden de los pendientes. Eso vive en 29 pruebas de Swift Testing que no dibujan nada.

## Qué se revisa de un vistazo

- **Textos que no caben.** Un nombre largo con «Vencido por 3 días» en el widget chico es lo primero que se rompe, y en la carpeta se ve sin buscarlo.
- **El modo oscuro.** Hay una variante oscura fija del widget mediano para revisar el contraste de los textos secundarios.
- **Los tamaños de bloqueo.** El circular mide 76 puntos. Verlo a 3× al lado del grande deja claro qué información sobra.

## Lo que aprendí

- **Si revisar algo es lento, no se revisa.** Con una prueba que dibuja todo en un par de segundos, revisar los widgets después de cada cambio deja de ser una tarea.
- **Las fechas de prueba tienen que ser fijas.** «Hace 3 horas» depende de cuándo corre la prueba. Anclarlas a una hora del día evita resultados distintos según la hora.
- **No toda prueba tiene que fallar.** Esta es una herramienta para mirar, y está bien que sea solo eso.
