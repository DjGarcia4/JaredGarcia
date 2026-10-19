---
title: "Registrar sin abrir la app"
description: "Widgets, pantalla de bloqueo, Centro de Control, Siri, los avisos y la Dynamic Island: en Hace Cuánto todos usan la misma acción de App Intents. Cómo se comparte la base de datos y por qué el intent está declarado como LiveActivityIntent."
date: 2026-10-19
tags: [ios, app intents, widgetkit, hacecuanto]
projects: [hacecuanto]
kind: learning
keyword: "widgets"
cover: /img/projects/hacecuanto/03.webp
---

En una app de registros, cada paso entre «me acordé» y «quedó registrado» es una oportunidad para no hacerlo. Desbloquear, buscar la app, abrirla, encontrar el item, tocarlo: son cinco pasos para algo que dura un segundo.

Por eso en Hace Cuánto se puede registrar desde seis lugares sin abrir la app: los widgets de la pantalla de inicio, los de la pantalla de bloqueo, el Centro de Control, Siri, el botón «Registrar ✓» de los avisos y el Apple Watch. Este post es sobre los cinco que viven en el iPhone, y sobre la decisión que los hace fáciles de mantener: **todos usan la misma acción**.

<figure>
  <img srcset="/img/projects/hacecuanto/03-800.webp 800w, /img/projects/hacecuanto/03-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/hacecuanto/03-1600.webp" alt="Widgets de Hace Cuánto: uno de varios items, uno de Tomar agua con su barra de progreso, uno de Leer en modo oscuro, los de pantalla de bloqueo y la app del Apple Watch." loading="lazy" decoding="async" />
  <figcaption>Widgets de varios items, de uno solo, de pendientes y de pantalla de bloqueo, y la app del Watch.</figcaption>
</figure>

## Una base de datos que todos pueden leer

Un widget es otro proceso. Siri también corre fuera de la app. Para que todos vean los mismos items, la base de datos de SwiftData no vive en el contenedor de la app sino en un **App Group**, una carpeta que comparten la app y sus extensiones:

```swift
static var storeURL: URL {
    let base = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: groupID)
        ?? URL.applicationSupportDirectory
    let dir = base.appending(path: "Library/Application Support", directoryHint: .isDirectory)
    try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    return dir.appending(path: "HaceCuanto.store")
}
```

La primera versión guardaba en el contenedor propio de la app, así que hay una migración de una sola vez: si existe la base vieja y no la nueva, mueve los tres archivos (`.store`, `-shm` y `-wal`) al App Group. Sin ella, actualizar la app habría parecido borrar todos los datos.

## Una sola acción: registrar

El item se expone a Siri y a los widgets como una entidad de App Intents (`ItemEntity`), con búsqueda por nombre que ignora mayúsculas y acentos: «registra cafe» encuentra «Café». Y hay una sola acción que lo registra:

```swift
struct LogItemIntent: LiveActivityIntent {
    @Parameter(title: "Item")
    var item: ItemEntity

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let id = item.id
        let message: String = await MainActor.run {
            guard let item = SharedStore.item(id: id) else { return "No encontré ese item." }
            let label = "\(item.emoji) \(item.name)"
            switch item.tap(in: SharedStore.container.mainContext) {
            case .logged: return "Listo, registré \(label) ✓"
            case .started: return "Arrancó el cronómetro de \(label) ⏱"
            case .stopped(let entry): return "Listo: \(label), \(Fmt.duration(entry.duration ?? 0)) ✓"
            }
        }
        return .result(dialog: "\(message)")
    }
}
```

Esa misma acción la usan el botón del widget, el control del Centro de Control y las frases de Siri («Registra Leer en Hace Cuánto», «Anota Gasolina en Hace Cuánto»). Por dentro llama a `item.tap(...)`, que es exactamente lo que pasa cuando tocas la tarjeta en la app: registra, o arranca y detiene el cronómetro si el item lo lleva. **No hay una lógica de «registrar desde el widget»**; hay una sola.

## Por qué `LiveActivityIntent` y no `AppIntent`

Esta es la línea que más me enseñó. Un `AppIntent` disparado desde un widget corre en el proceso del widget. Funciona, guarda en la base compartida, pero la app (si está abierta en segundo plano) no se entera: su contexto de SwiftData sigue con los datos de antes hasta que vuelve a leer.

Declararlo como `LiveActivityIntent` hace que el sistema lo ejecute **dentro del proceso de la app**, aunque lo dispare un widget o el Centro de Control. Así hay un solo contexto escribiendo, la pantalla de la app se actualiza al momento y los avisos se reprograman en el mismo paso.

Para «¿Hace cuánto?», que solo lee, alcanza con un `AppIntent` normal. Siri responde hace cuánto fue, el día y la hora exactos, y cuántas veces llevas.

## Avisar a todos que algo cambió

Cada registro, venga de donde venga, termina en el mismo lugar:

```swift
/// Avisar a todos (widgets, recordatorios, Watch) que algo cambió.
static func didChange(in context: ModelContext) {
    reloadWidgets()
    let items = (try? context.fetch(FetchDescriptor<Item>(predicate: #Predicate { !$0.archived },
                                                          sortBy: [SortDescriptor(\.sortOrder)]))) ?? []
    Reminders.reschedule(items: items)
    NotificationCenter.default.post(name: didChangeNotification, object: nil)
}
```

Recargar los widgets, reprogramar los avisos (que dependen de tu último registro) y avisarle al Watch y al monitor de lugares. Que haya una sola función para esto evita el bug clásico de «registré desde Siri y el widget sigue diciendo hace 3 días».

## Los widgets

Hay tres widgets y cada uno responde algo distinto:

- **Un item**, en chico, mediano, grande y en la pantalla de bloqueo (circular, rectangular y en línea). El mediano muestra la barra de progreso de la meta o los puntitos de los últimos 7 días.
- **Varios items**: 4 en el chico y el mediano, 8 en el grande. Tú eliges cuáles.
- **Pendientes de hoy**: hábitos sin cumplir y lo que ya toca, primero lo vencido y luego lo que tiene menos avance. Cuando no queda nada dice «Todo al día».

Como «hace 3 días» cambia con el tiempo aunque no registres nada, cada widget entrega una línea de tiempo con una entrada por hora durante un día. El sistema los redibuja solos sin despertar a la app.

## El aviso que registra

Los avisos de Hace Cuánto tienen una categoría con un botón, «Registrar ✓». Al tocarlo, el delegado de notificaciones busca el item por su id y llama al mismo `tap`. La app no se abre; el aviso desaparece y el registro ya está hecho.

## Lo que aprendí

- **Un camino, muchas puertas.** Seis formas de registrar podrían ser seis lógicas distintas. Al hacer que todas pasen por `tap` y `didChange`, agregar el Centro de Control fueron 20 líneas.
- **Dónde corre el código importa tanto como qué hace.** El mismo intent, en otro proceso, deja la app desactualizada. `LiveActivityIntent` lo resuelve sin sincronizaciones extra.
- **Migrar desde el primer cambio de lugar.** Mover la base al App Group fue invisible para mí como usuario gracias a una función de 10 líneas que corre una sola vez.
