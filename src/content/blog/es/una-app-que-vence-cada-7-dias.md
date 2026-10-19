---
title: "Una app que vence cada 7 días"
description: "Hace Cuánto vive en mi iPhone firmada con una cuenta gratis de Apple, que la deja de abrir a los 7 días. Cómo la app sabe cuándo vence, y cómo la Mac la renueva sola cada noche por Wi-Fi."
date: 2026-10-19
tags: [ios, automatización, xcode, hacecuanto]
projects: [hacecuanto]
kind: learning
keyword: "7 días"
---

Hace Cuánto es una app nativa que hoy uso solo yo, instalada desde Xcode con una cuenta gratis de Apple. Esa cuenta tiene una regla que no se negocia: **la firma dura 7 días**. Al octavo, la app ya no abre. Los datos no se pierden, pero hay que conectar el iPhone a la Mac y volver a instalar.

Un hábito que se rompe porque la app no abrió es justo lo que no puede pasar en una app de hábitos. Así que resolví el problema en dos partes: que la app sepa cuándo vence, y que la Mac la renueve sin que yo me acuerde.

## La fecha está adentro de la app

Cuando Xcode instala la app, mete dentro del paquete el perfil con el que se firmó: `embedded.mobileprovision`. Es un archivo firmado (CMS), pero en medio trae un plist en texto plano, y ese plist tiene `ExpirationDate`. No hace falta ninguna API: basta con buscar el XML dentro de los bytes.

```swift
enum AppExpiration {
    static let date: Date? = {
        guard let url = Bundle.main.url(forResource: "embedded", withExtension: "mobileprovision"),
              let data = try? Data(contentsOf: url),
              let start = data.range(of: Data("<?xml".utf8)),
              let end = data.range(of: Data("</plist>".utf8)) else { return nil }
        let plistData = data.subdata(in: start.lowerBound..<end.upperBound)
        let plist = try? PropertyListSerialization.propertyList(from: plistData, format: nil) as? [String: Any]
        return plist?["ExpirationDate"] as? Date
    }()
}
```

Con la fecha, la app hace dos cosas:

- **Un aviso el día antes, a las 7 p.m.**: «Hace Cuánto vence mañana. Conecta tu iPhone a la Mac y reinstálala. Tus datos no se pierden.»
- **Una franja roja en el inicio** cuando faltan dos días o menos. Al tocarla abre los ajustes, donde se ve la fecha exacta.

Si la app se instala de otra forma (por ejemplo, desde la App Store algún día), el archivo no existe, `date` es `nil` y nada de esto aparece. No hay que acordarse de quitarlo.

## La Mac la renueva sola

Avisar ayuda, pero lo ideal es no tener que hacer nada. La Mac ya tiene todo lo necesario para renovar: Xcode genera un perfil nuevo cuando el viejo no está, `xcodebuild` compila y `devicectl` instala en el iPhone, **incluso por Wi-Fi** si están en la misma red.

El script `renovar.sh` corre todas las noches a las 9:30 p.m. y hace esto:

1. **¿Está el iPhone?** Si no aparece como conectado o disponible, termina sin hacer nada. Mañana lo intenta otra vez.
2. **Copia el respaldo.** La app guarda un respaldo diario en JSON dentro de su App Group; `devicectl` lo copia a una carpeta de la Mac. Se quedan los últimos 60.
3. **¿Cuántos días le quedan?** Lee los perfiles de Xcode con `security cms -D`, busca el de la app y saca su `ExpirationDate` con `plutil`.
4. **Si faltan 3 días o menos**, borra los perfiles viejos para que Xcode genere uno nuevo, compila en Release e instala.

```bash
if [ "$FORCE" = 0 ] && [ "$days_left" -gt "$RENEW_WHEN_DAYS_LEFT" ]; then
    log "Todavía no hace falta renovar."
    exit 0
fi
```

Renovar con margen de 3 días, y no el último día, deja varias noches de reintento: si una noche el iPhone estaba fuera de casa o bloqueado y la instalación falló, la siguiente lo vuelve a intentar.

## El detalle menos obvio: la carpeta Documentos

El proyecto vive en `~/Documents`. Correr el script a mano desde ahí funciona; desde `launchd`, no necesariamente. macOS protege Documentos, Escritorio y Descargas (TCC), y una tarea en segundo plano no tiene permiso para leerlos aunque la haya programado yo.

La solución fue no pedir permisos de más: **una copia espejo del proyecto** fuera de Documentos, en `~/Library/Application Support/HaceCuanto/src`. Hay dos scripts de entrada:

- `instalar-nocturno.sh` sincroniza la copia con `rsync`, escribe el `.plist` del LaunchAgent y lo registra con `launchctl bootstrap`. Se corre una vez.
- `reinstalar.sh` sincroniza la copia y fuerza una reinstalación ahora mismo. Lo uso cuando cambio algo de la app.

La tarea nocturna solo toca la copia espejo, así que nunca necesita entrar a Documentos.

## Lo que aprendí

- **La información suele estar más cerca de lo que parece.** Antes de pensar en guardar la fecha de instalación, el perfil ya traía la fecha exacta de vencimiento.
- **Una tarea que corre sola tiene que fallar bien.** Cada paso escribe en una bitácora con fecha y hora, y cada falla termina en «se reintenta la próxima vez», no en un estado a medias.
- **Respaldar antes de tocar nada.** El respaldo se copia en el paso 2, antes de borrar perfiles o reinstalar. Si algo sale mal, los datos ya están en la Mac.

El resultado es que la limitación de los 7 días dejó de existir para mí: la app se renueva sola mientras duermo, y si un día no puede, me avisa con tiempo.
