---
title: "De comandos a un estudio: una pantalla para hacer apps de Wink"
description: "Crear, ajustar, certificar y preparar para subir eran comandos que había que saberse. Los convertí en un estudio con una puerta de entrada, sin cambiar dónde vive la verdad: en los archivos del repo."
date: 2026-10-14
tags: [herramientas, ux, wink]
projects: [wink-studio]
kind: learning
keyword: "estudio"
---

Hasta hace poco, hacer una app para las pantallas de [Wink](/project/wink-app) en Wink Studio era una lista de comandos: `npm run new` para crearla, `npm run dev` para verla en el [simulador](/blog/un-simulador-antes-que-la-pi), `npm run certify` para [certificarla](/blog/si-no-pasa-no-se-sube) y `npm run shots` para las capturas de la ficha. Cada uno hacía bien su parte. El problema era todo lo que quedaba entre uno y otro.

¿Cuál de las diez apps está certificada? ¿Cuál cambió después de certificarse? ¿Cuál espera algo del backend? ¿El `dist/` que estoy por subir es el mismo que pasó la revisión? Las respuestas existían, repartidas en reportes, en el README y en el historial de git. Había que saber dónde mirar, y eso solo lo sabía yo.

Así que convertí los comandos en un estudio: `npm run studio` abre una pantalla con todas las apps y, desde ahí, todo lo que antes se hacía a mano.

<figure>
  <img srcset="/img/projects/wink-studio/studio-home-800.webp 800w, /img/projects/wink-studio/studio-home-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/studio-home-1600.webp" alt="El inicio de Wink Studio: las diez apps con su captura, su versión y su estado." loading="lazy" decoding="async" />
  <figcaption>El inicio: cada app con su captura, su versión, cuántos ajustes y escenarios tiene, y qué le falta.</figcaption>
</figure>

## La puerta de entrada responde lo que antes había que averiguar

Cada tarjeta dice lo que importa antes de tocar nada:

- **Certificada**, con la fecha, si pasó la certificación y no cambió nada desde entonces.
- **Cambios sin certificar** si estaba certificada pero después cambió el código, el build o hay cambios sin commit. Es la insignia más útil: lo que antes había que recordar, ahora salta a la vista.
- **Lo que espera**: «Espera K1», «Cola»… lo que la app necesita del backend o del player para salir completa.

Arriba, el resumen y tres filtros: todas, por revisar y las que esperan al backend. Y un botón, **Certificar las por revisar**, que pone en la cola todas las que tienen la insignia amarilla.

Lo que espera cada app no lo escribí dos veces: sale de la columna «Estado» de la tabla de apps del README. Si el estudio tuviera su propia lista, tarde o temprano dirían cosas distintas.

## El estudio no es dueño de nada

Esa fue la regla que más cuidé. Todo lo que se edita en el estudio se guarda en los mismos archivos de siempre: el manifiesto de ajustes (`wink-app.json`), los escenarios de la certificación (`certify.json`), la ficha (`store/`) y el CHANGELOG. No hay base de datos ni estado escondido. Para que un cambio llegue al resto del equipo, se hace commit y push como siempre, y quien prefiera la terminal sigue teniendo los mismos comandos.

Eso tiene una consecuencia práctica: el estudio no puede dejar las cosas a medias. Los editores validan en vivo y, con un problema, no dejan guardar. Al guardar un ajuste, pregunta si es un arreglo o algo nuevo —en el repo, si cambia un ajuste, sube el build— y pide la nota para los clientes, que va a «Novedades» y al CHANGELOG. La regla que antes vivía en un documento ahora está en el botón.

<figure>
  <img srcset="/img/projects/wink-studio/studio-escenarios-800.webp 800w, /img/projects/wink-studio/studio-escenarios-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/studio-escenarios-1600.webp" alt="El editor de escenarios de Pedido listo: la lista a la izquierda, el escenario elegido al centro y la app en vivo a la derecha." loading="lazy" decoding="async" />
  <figcaption>Escenarios de Pedido listo: cada uno con su hora fija, los ajustes que cambia y la app en vivo al lado.</figcaption>
</figure>

## Escenarios: armar el caso mirándolo

La certificación prueba cada escenario de una app en los once tamaños: «de noche», «lista vacía», «textos al máximo», «la API no contesta». Lo que no está como escenario puede romperse sin que nadie lo vea. Antes se escribían a mano en el `certify.json`, y había que adivinar cómo se iban a ver.

Ahora hay dos caminos. En el simulador armo el caso —cambio los ajustes, pongo la hora de la pantalla— y toco **Guardar como escenario**. Solo guarda lo que difiere de los valores de ejemplo, así el escenario queda corto y se entiende qué prueba. Y en el estudio, el editor de escenarios muestra la app de verdad al lado, en cuatro tamaños, con la hora y las respuestas de su API. **Abrir en el simulador** lo abre ya aplicado, para recorrerlo en los once.

## Certificar sin mirar la terminal

La certificación tarda entre uno y tres minutos, y cada una abre Chrome. Por eso corren en cola, una a la vez, y mientras tanto se puede seguir trabajando: la tarjeta muestra el avance, y el modal tiene el paso a paso en vivo, el reporte y el historial de esa app.

El estudio no reimplementa la certificación. Corre el mismo `npm run certify`, que con `--progress` avisa cada paso en una línea que el estudio lee. Si mañana cambia la certificación, el estudio no se entera, y está bien que sea así. Y si una certificación se corta a la mitad, el reporte anterior no se pierde.

## Preparar para subir: la última revisión, escrita

Subir una app al panel era el paso con más formas de equivocarse, y el que menos se repetía. Ahora es un botón que revisa todo antes:

<figure>
  <img srcset="/img/projects/wink-studio/studio-subir-800.webp 800w, /img/projects/wink-studio/studio-subir-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/studio-subir-1600.webp" alt="Preparar para subir Avisos: la revisión en verde a la izquierda y los textos de la ficha a la derecha." loading="lazy" decoding="async" />
  <figcaption>Preparar para subir: lo rojo bloquea; lo amarillo se puede subir igual, pero hay que mirarlo.</figcaption>
</figure>

- **Certificada**, y sin cambios desde entonces.
- **El paquete es el certificado**: la certificación guarda la huella del `dist/` que probó, y aquí se compara. Así nunca se sube algo que no pasó por la revisión.
- **Todo en el repo**: lo que se sube tiene que estar guardado.
- **La versión y su nota**, el logo, la descripción y las capturas de la ficha.
- **Probada en una Pi 4**, siempre en amarillo.

Ese último punto es a propósito. El estudio todavía no puede comprobar que alguien dejó la app una hora en una Raspberry Pi real, horizontal y vertical, sin red. Podría no mostrarlo; preferí que lo diga y que lo confirme una persona. Una lista que solo muestra lo que sabe revisar da una seguridad que no tiene.

Sin nada en rojo, arma una carpeta con dos partes: `sitio/`, que es lo que se arrastra a App Web, y `ficha/`, con el logo, las capturas en orden y todos los textos del formulario de publicación, cada uno con su botón para copiarlo. También hay un .zip, pero App Web recibe la carpeta, no el .zip, y el estudio lo dice ahí mismo.

## El manual, adentro

Cada pantalla tiene un **?** al lado del título que abre su sección del manual, y el inicio tiene el manual entero con buscador. Es el mismo archivo Markdown del repo: lo que se corrige ahí se ve en el estudio. Un manual aparte, en otro lado, se queda viejo la primera semana.

## Lo que aprendí

Lo más valioso del estudio no son las pantallas: es que las reglas que yo tenía en la cabeza quedaron a la vista. Qué hay que revisar antes de subir, cuándo sube el build y qué falta para que una app salga completa ya no dependen de que alguien me pregunte.

Y la decisión que más me ahorró fue la más aburrida: que el estudio sea una capa sobre los mismos archivos y los mismos comandos, no un sistema nuevo. Así cada pantalla se pudo hacer de a una, sin migrar nada ni romper la forma de trabajar que ya funcionaba.
