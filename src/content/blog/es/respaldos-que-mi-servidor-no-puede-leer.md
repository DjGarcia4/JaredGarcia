---
title: "Respaldos que mi propio servidor no puede leer"
description: "El respaldo diario lleva los datos de todos los clientes. Por qué se cifra con una llave pública y por qué la llave para leerlo no vive en el servidor."
date: 2026-10-12
tags: [infraestructura, seguridad, rapisites]
projects: [rapisites]
kind: learning
keyword: "age"
---

RapiSites hace un respaldo diario de la base de datos y lo guarda en un bucket de Cloudflare R2. Ese archivo tiene los datos de todos los clientes: cuentas, sitios, cada versión publicada, la bitácora. Así que hay que cifrarlo antes de que salga del servidor. La pregunta es con qué y, sobre todo, dónde queda la llave.

Lo decidí el 8 de septiembre, el mismo día del corte a producción, como la decisión 025. En código es de las decisiones más chicas del proyecto: dos scripts de shell y un timer. Lo grande está en dónde queda cada llave.

## La opción obvia

Lo obvio es cifrar con una contraseña guardada en el `.env` del servidor, con `gpg` simétrico u `openssl enc`. Funciona, pero tiene un problema: la llave para descifrar vive en la misma máquina que se respalda. Si alguien llega al `.env`, llega a todo, incluidos los 30 días de respaldos del bucket, porque el token para leer el bucket también está en ese `.env`.

Pensé en qué protege cada capa, no en si «está cifrado». El cifrado del propio bucket, por ejemplo, protege contra un disco robado del proveedor. Pero el riesgo real no es ese: es un token filtrado, y ese token vive en el servidor. Con el cifrado del bucket, quien tiene el token lee los respaldos en claro.

## Cifrar hacia una llave pública

Elegí `age` cifrando hacia una llave pública. Es cifrado asimétrico: lo que se cifra con la pública solo se abre con la privada. El servidor solo tiene la llave pública: puede crear respaldos, pero no puede leerlos. La llave privada vive solo en el gestor de contraseñas y baja al servidor a mano, a un archivo temporal, únicamente para un simulacro o una restauración real.

```sh
# En mi máquina, una sola vez (simplificado)
age-keygen -o respaldo.agekey
# Public key: age1…   → va al .env del servidor
# AGE-SECRET-KEY-1…   → va solo al gestor de contraseñas, nunca al servidor ni al repo
```

Si alguien entra al servidor tiene la base viva de todos modos; eso no cambia. Pero no puede descargar y descifrar el histórico. La diferencia parece chica hasta que piensas en qué datos había hace 29 días que hoy ya no están.

Elegí `age` sobre GPG por simpleza: es una sola herramienta, sin keyrings, sin fechas de expiración, sin modelo de confianza. Un binario y dos comandos. Para subir el archivo elegí `rclone`, que habla S3 con R2, se configura entero por flags y no deja un archivo de configuración con secretos en disco. Descarté `aws-cli` porque es más pesado y su configuración por defecto escribe las credenciales en un archivo.

## Qué hace el respaldo, paso a paso

Un timer de systemd lo dispara todos los días a las 07:10 UTC, cerca de las 2 de la mañana en Honduras, fuera de la hora pico. Cualquier paso que falla corta todo con un código de error, systemd lo registra y un servicio aparte avisa.

- `pg_dump` en formato custom desde dentro del contenedor de Postgres.
- Valida el dump con `pg_restore --list` antes de subir nada. Un dump truncado falla acá.
- Si el dump pesa menos de 4 KB, se detiene: es sospechoso.
- Lo cifra con `age` hacia la llave pública.
- Lo sube al bucket de respaldos y verifica que el tamaño remoto coincide con el local.
- Borra del bucket lo que tenga más de 30 días. El bucket tiene además su propia regla de ciclo de vida que hace lo mismo: cinturón y tirantes.
- Si está configurado, hace ping a un heartbeat. Así, un respaldo que no corre también dispara una alerta.

```sh
# El corazón del respaldo (simplificado)
pg_dump -Fc --no-owner --no-privileges > "$DUMP"
pg_restore --list < "$DUMP" > /dev/null || die "dump corrupto, no se sube"
age --recipient "$AGE_PUBLIC_KEY" --output "$DUMP.age" "$DUMP"
rclone copyto "$DUMP.age" "r2:respaldos/$(basename "$DUMP").age"
[ "$(remote_size)" = "$(local_size)" ] || die "el tamaño remoto no coincide"
```

El bucket de respaldos es aparte del de la aplicación, tiene versionado activado (un borrado accidental, o malicioso si se filtra el token, se puede recuperar) y su token tiene permiso solo sobre ese bucket.

Un detalle práctico: el `rclone` de los repositorios de Ubuntu 24.04 es una versión de 2022 que manda una cabecera de checksum que R2 rechaza con `501 NotImplemented` en el primer intento. El reintento funciona, pero ensucia el log en cada corrida. La solución fue instalar `rclone` desde su sitio y además forzar `--s3-disable-checksum` en los scripts. `age` desde los repositorios de Ubuntu está bien.

## Lo que descarté

| Opción | Por qué no |
| --- | --- |
| GPG simétrico u `openssl enc` con contraseña en el `.env` | La llave para descifrar vive en la misma máquina que se respalda |
| Cifrado del lado del bucket | Protege contra un disco robado del proveedor, no contra un token filtrado, que es el riesgo real |
| `aws-cli` en vez de `rclone` | Más pesado, y escribe las credenciales en un archivo por defecto |
| Una base administrada con respaldos incluidos (unos US$15 más al mes) | Sigue siendo una opción si mantenerla a mano duele, pero igual quiero un respaldo propio, fuera del proveedor de la base |

<p class="tbl-note">Las alternativas de la decisión 025.</p>

## El costo: una llave irremplazable

La llave privada es el único secreto del sistema que no se puede regenerar. Si pierdo una contraseña de la base, la cambio. Si pierdo un token de R2, genero otro. Si pierdo la llave privada de `age`, los respaldos existentes son ilegibles para siempre. Por eso vive en el gestor de contraseñas con acceso documentado.

Rotarla tiene una salida simple: no hace falta volver a cifrar nada. Basta con empezar a cifrar hacia una llave nueva y dejar que los respaldos viejos caduquen solos a los 30 días; mientras tanto, la llave vieja sigue siendo la que los abre.

Y eso cambia otra cosa importante: el simulacro mensual de restauración deja de ser opcional. La especificación ya lo decía, «un backup no probado no es un backup», pero con este modelo hay una razón más: el simulacro es el único momento en que se usa la llave privada y se comprueba que todavía abre lo que el servidor cifra.

## El simulacro

Se hace el primer lunes de cada mes. Restaura el último respaldo a una base de prueba en el mismo servidor, sin tocar producción. El script, por defecto, nunca restaura sobre la base real: para eso exige un flag explícito, `--force-prod`.

```sh
# Simulacro (simplificado)
umask 077
vim ~/respaldo.agekey                 # pegar la llave privada del gestor
export AGE_IDENTITY_FILE=~/respaldo.agekey
./ops/restore.sh latest               # → base de prueba, nunca producción
# descarga, descifra, valida, recrea la base de prueba, pg_restore,
# e imprime conteos y cuánto tardó
rm ~/respaldo.agekey && unset AGE_IDENTITY_FILE
```

Al terminar, el script imprime conteos de cuentas, usuarios, sitios y versiones, y la fecha de la última publicación, para compararlos con producción. Y el tiempo que tardó, que es el tiempo de recuperación medido de esa corrida. Después se borra la base de prueba, se borra la llave del servidor y se anota el resultado en una tabla del documento de operación.

El primer simulacro fue el mismo 8 de septiembre, en el corte a producción: R2, descifrado con `age`, `pg_restore` a la base de prueba, conteos idénticos a producción. Tardó unos 3 segundos, porque la base todavía era muy chica (el dump pesaba unos 800 KB). Ese número va a crecer, y por eso se mide cada mes en vez de suponerlo.

La auditoría de seguridad del 19 de septiembre encontró un detalle en el script de restauración: el nombre de la base destino se metía tal cual en un `DROP DATABASE`. Solo lo puede usar quien corre el script a mano, pero cerrarlo costaba una línea: ahora el nombre tiene que pasar una expresión regular de identificador válido.

## Lo que cubre y lo que no

| Dato | Cómo | Retención |
| --- | --- | --- |
| Postgres (todo) | Dump diario cifrado con `age` | 30 días |
| El servidor entero (sistema, Docker, `.env`) | Snapshot semanal del proveedor | 4 semanas |
| El `.env` de producción | Copia manual en el gestor de contraseñas | — |
| Certificados TLS | No se respaldan: Caddy los vuelve a emitir solo | — |
| Imágenes y archivos de sitios subidos en R2 | Sin respaldo propio hoy | — |

<p class="tbl-note">El dump diario es el que importa para no perder trabajo de clientes.</p>

La pérdida máxima de datos es de 24 horas, porque el respaldo es diario. El snapshot semanal recupera la máquina, pero con hasta una semana de datos viejos: es respaldo de infraestructura, no de datos.

Y hay un hueco que tengo escrito como pendiente: los archivos en R2 no tienen respaldo propio. Para las imágenes, el bucket es el almacén durable. Pero desde octubre RapiSites acepta sitios hechos con archivos propios, y en un sitio subido los archivos son el sitio. Hay que decidir cómo respaldarlos, y todavía no lo hice.

## Lo que le diría a alguien montando sus respaldos

- Pregúntate dónde vive la llave para leer el respaldo. Si es la misma máquina, el cifrado no te protege del caso que más importa.
- El cifrado asimétrico resuelve eso con una herramienta chica: el servidor cifra, no descifra.
- Valida el dump antes de subirlo y verifica que lo que llegó pesa lo mismo que lo que salió.
- Alerta también cuando el respaldo no corre, no solo cuando falla.
- Haz que el script de restauración no pueda pisar producción sin que se lo pidas explícitamente.
- Agenda el simulacro y anota cuánto tarda. Es la única prueba de que la llave y el proceso todavía sirven.

> Lo que me llevo: un respaldo que nunca restauraste no es un respaldo, es una esperanza. Y la llave para leerlo no puede vivir junto a lo que protege.
