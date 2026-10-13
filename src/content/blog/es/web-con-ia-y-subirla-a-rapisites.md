---
title: "Crea tu web con IA y publícala en RapiSites"
description: "Dos caminos: que RapiSites la genere con cuatro preguntas, o subir la que ya hiciste con otra IA, a mano o con Vite. Paso a paso, con lo que conviene revisar antes."
date: 2026-10-12
tags: [rapisites, ia, guía]
projects: [rapisites]
cover: /img/projects/rapisites/01.webp
kind: guide
keyword: "guía"
---

Hay dos formas de tener tu web en RapiSites con ayuda de la IA. Si todavía no tienes nada, RapiSites la genera a partir de cuatro preguntas. Si ya la hiciste —con una herramienta de IA, a mano o con Vite, React, Vue o Astro—, subes la carpeta y se publica tal cual. Esta guía cubre los dos caminos, paso a paso.

<figure>
  <img srcset="/img/projects/rapisites/01-800.webp 800w, /img/projects/rapisites/01-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/01-1600.webp" alt="Las cuatro preguntas del asistente de RapiSites." loading="lazy" decoding="async" />
  <figcaption>Las cuatro preguntas del asistente de RapiSites.</figcaption>
</figure>

## Qué camino te conviene

|  | Camino 1: el asistente | Camino 2: subir tus archivos |
| --- | --- | --- |
| Para quién | Cualquier negocio, sin saber nada técnico | Quien ya tiene su sitio en HTML, CSS y JS |
| Plan | Todos, incluido Gratis | Pro y Business |
| Cómo se cambia | En el editor de RapiSites | Editas tus archivos y los vuelves a subir |
| Formulario, idiomas, fotos de stock | Incluidos | No aplican: se publica lo que traes |
| Dirección gratuita | tunegocio.rapisites.com | tusitio.rapisites.app |

<p class="tbl-note">Los dos terminan en un sitio publicado, con historial de versiones y la opción de conectar tu dominio.</p>

## Camino 1: que RapiSites la genere

Solo necesitas una cuenta, que puedes crear con tu correo o con «Continuar con Google». No hace falta tener textos, fotos ni dominio.

- 1. En la lista de Sitios, pulsa «Crear sitio» (o «Crear mi primer sitio» si todavía no tienes ninguno).
- 2. Nombre del negocio: el que verán tus visitantes, entre 2 y 80 caracteres. De ahí sale tu dirección `.rapisites.com`.
- 3. Qué hace tu negocio: dos o tres líneas en tus palabras, entre 20 y 600 caracteres. Es la pregunta que más pesa: de ahí la IA escribe los textos de todas las secciones.
- 4. Cómo te contacta un cliente: Teléfono, WhatsApp, Correo y Dirección. Todos son opcionales, pero hace falta al menos uno. Si pones correo, tu sitio nace con formulario de contacto.
- 5. Elige un estilo y pulsa «Crear mi sitio».
- 6. Espera unos segundos en «Creando tu sitio», mientras pasan «Entendiendo tu negocio…», «Escribiendo tu contenido…» y «Ajustando el SEO…».

RapiSites le pide el contenido a la API de Claude, de Anthropic, elige fotos acordes a tu rubro y arma las páginas con secciones ya diseñadas. La IA no inventa precios, nombres de personas ni cifras como «15 años de experiencia»: donde hace falta un dato así, deja la marca «A definir». Por eso conviene poner en la segunda pregunta los datos reales que quieres ver: la ciudad, lo que ofreces, desde cuándo trabajas.

Cuando termina, ves el borrador. Para retocarlo, abre el menú del sitio y elige «Abrir editor»: cambias textos y fotos, reordenas secciones arrastrándolas y pruebas otros colores con «Cambiar el tema». Todo se guarda solo y nada se ve en público hasta que publicas.

Al pulsar «Publicar», RapiSites revisa el sitio. Lo que bloquea, como «Falta el texto alternativo de una imagen…», detiene la publicación y te muestra «Revisa esto antes de publicar», con un botón «Ir ahí». Lo que solo avisa, como un dato «A definir», no lo impide. Si todo va bien, ves «¡Tu sitio está en línea!».

## Camino 2: subir la web que ya hiciste

Es la respuesta a «le pedí a una IA que me hiciera mi página, tengo el archivo, ¿dónde lo pongo?». También sirve si la armaste a mano o si tu proyecto se compila. Necesitas el plan Pro o Business, tu correo verificado y un lugar libre de sitios en tu plan.

## Qué pedirle a tu herramienta de IA

La mayoría de los problemas se evitan pidiendo bien el resultado desde el principio. RapiSites necesita:

- Un sitio estático: HTML, CSS, JavaScript, imágenes, tipografías, audio y video. Nada de PHP, Python, código de servidor ni base de datos.
- Un `index.html` como página de inicio. Si es una sola página, lo más simple es que todo vaya dentro de ese archivo.
- Rutas relativas (`img/logo.png`), nunca `C:\Users\…` ni `file://`, y que cada archivo que nombra el HTML venga en la carpeta.
- Un `<title>` y `<meta name="viewport">`, para que se vea bien en el teléfono.
- Si quieres que no dependa de nadie, sin tipografías ni librerías de otros sitios. Si las necesita, también se puede (más abajo).
- Archivos en UTF-8, lo normal en cualquier herramienta actual.

Un ejemplo de pedido para obtener el sitio en un solo archivo, listo para subir:

```text
Ejemplo de pedido (adáptalo a tu negocio):

Hazme un sitio web de una sola página para mi panadería en San Pedro Sula.
Entrégalo como UN SOLO archivo index.html, autocontenido:
- el CSS dentro de <style> y el JavaScript, si hace falta, dentro de <script>;
- sin tipografías, librerías ni imágenes de otros sitios: usa tipografías
  del sistema y deja marcadores para las fotos;
- con <title>, <meta name="viewport"> y codificación UTF-8;
- sin PHP: el contacto puede ser un enlace a WhatsApp o mailto.
Secciones: portada, productos, horarios y contacto.
```

Si el sitio tiene fotos propias o varias páginas, pide una carpeta con rutas relativas:

```text
mi-panaderia/
├── index.html
├── productos.html
├── css/
│   └── estilos.css
└── img/
    ├── logo.svg
    └── portada.webp
```

La carpeta que lo envuelve todo (`mi-panaderia/`) se quita sola, y los archivos ocultos, `.DS_Store`, `Thumbs.db` y `node_modules` se dejan afuera sin subirse.

## Si tu proyecto usa Vite, React, Vue o Astro

- Compila (por ejemplo con `npm run build`) y sube la carpeta que genera, normalmente `dist` o `build`.
- Si subes la carpeta del proyecto, RapiSites busca una de build con `index.html` (`dist`, `build`, `out`, `public` o `_site`) y te ofrece «Usar la carpeta dist».
- Si subes el código fuente sin compilar, te avisa: «Esto parece el código fuente de tu proyecto. Sube la carpeta que genera al compilar: normalmente `dist` o `build`.»
- Si es una aplicación de una sola página con su propio router, activa después «Es una aplicación de una sola página»: así `/contacto` abre tu página de inicio en vez de dar 404.

## Paso a paso en RapiSites

- 1. Pulsa «Crear sitio» y, debajo de la primera pregunta, abre «¿Ya tienes tu sitio en HTML, CSS y JS? Sube tus archivos».
- 2. En «Sube tu sitio», arrastra la carpeta o usa «Elegir carpeta» o «Elegir archivo .html».
- 3. Antes de subir nada, ves cuántos archivos son, cuánto pesan y cuánto almacenamiento te queda. El «Nombre del sitio» sale del `<title>` de tu página; solo lo ves tú y lo puedes cambiar.
- 4. Pulsa «Subir y revisar».
- 5. Si algo bloquea, ves «Tu sitio necesita un ajuste». Muchos casos se resuelven ahí con un botón; los demás, con «Elegir otros archivos».
- 6. Si pasa, llegas a «Revisa tu sitio»: vista previa del borrador, nombre, «Dirección» (lo que va antes de `.rapisites.app`, editable hasta publicar), página de inicio detectada y avisos.
- 7. Pulsa «Publicar sitio», o «Dejar en borrador» para publicarlo más tarde.

## Cómo se elige la página de inicio

- El `index.html` de la raíz (o un `index.htm`). Si en la raíz hay un solo `.html`, ese, se llame como se llame.
- Si hay varios y ninguno es `index.html`, RapiSites te pregunta: «¿Cuál es tu página de inicio?».
- Si no hay ninguna en la raíz pero sí en una carpeta de build, te ofrece usar esa carpeta.

## El informe: qué bloquea y qué solo avisa

Un error impide publicar hasta que lo corrijas; un aviso no, pero conviene leerlo. Los mensajes nombran el archivo concreto.

| Bloquea | Lo que te dice RapiSites |
| --- | --- |
| Código de servidor | «Tu sitio trae código de servidor y aquí solo publicamos sitios estáticos: `contacto.php` no va a funcionar.» |
| Tipo de archivo no permitido | «No podemos publicar `…`. Quita esos archivos y vuelve a subir la carpeta.» |
| HTML que no está en UTF-8 | «`index.html` no está guardado en UTF-8. Guárdalo con esa codificación y vuelve a subirlo.» |
| Archivos que solo cambian en mayúsculas | «`Logo.png` y `logo.png` solo se diferencian en mayúsculas. Deja uno de los dos.» |
| Recursos de otros sitios, con la opción apagada | «Tu sitio carga recursos o envía datos a `fonts.googleapis.com`. Hoy está configurado para usar solo sus propios archivos.» |

| Solo avisa | Lo que te dice RapiSites |
| --- | --- |
| Falta un archivo | «No encontramos `img/logo.png`, que `index.html` usa.» |
| Ruta de tu computadora | «`index.html` busca un archivo en `C:\…`. Esa ruta solo existe en tu computadora.» |
| Sin título | «`index.html` no tiene `<title>`: la pestaña del navegador va a mostrar la dirección.» |
| Sin viewport | «`index.html` no tiene `<meta name="viewport">`: en un teléfono se va a ver en miniatura.» |
| Archivo de más de 5 MB | «`video.mp4` pesa …: va a tardar en cargar.» |
| Datos en el navegador | «… guarda datos en el navegador. Esos datos viven en cada dispositivo: no se comparten ni se respaldan.» |
| Aplicación de una sola página | «Parece una aplicación de una sola página. Si maneja sus propias direcciones, activa esa opción para que una dirección directa no dé 404.» |

<p class="tbl-note">Sin avisos, la revisión dice «Tus archivos pasaron la revisión sin avisos.»</p>

## El interruptor de red

Por defecto, un sitio subido solo usa sus propios archivos: no carga nada de otros dominios ni envía datos afuera. Si tu página usa Google Fonts, una librería de un CDN o un mapa embebido, la revisión lo bloquea y te ofrece «Permitir que se conecte a otros sitios»: se vuelve a subir con la opción encendida y el bloqueo pasa a ser un aviso. Después la cambias en «Opciones», con «Puede conectarse a otros sitios»; se aplica al publicar.

## Límites

| Qué | Límite |
| --- | --- |
| Archivos por subida | 500 |
| Peso por subida y por archivo | 20 MB (aviso desde 5 MB por archivo) |
| Almacenamiento total | 2 GB en Pro, 10 GB en Business |
| Tipos de archivo | HTML, CSS, JS, JSON, XML, texto, PDF, WebAssembly, imágenes (svg, png, jpg, webp, avif, gif, ico), tipografías (woff, woff2, ttf, otf), audio y video (mp3, ogg, wav, m4a, mp4, webm) |
| Archivos .zip | Todavía no: descomprímelo y arrastra la carpeta |

## La página del sitio

Un sitio subido lleva la etiqueta «Archivos propios» y no tiene editor. Su menú abre «Archivos y opciones»:

- Archivos: lo que está en línea, con su tamaño y un enlace «Descargar» en cada uno.
- Opciones: «Es una aplicación de una sola página», «Puede conectarse a otros sitios», «Permitir que Google lo encuentre» (apagada por defecto: hasta que la enciendas, el sitio pide no ser indexado) y «Solo se muestra dentro de otra página».
- «Ver historial» y «Dominios».
- Estado: «Despublicar» (los archivos se quedan) o «Dar de baja» (libera un lugar en tu plan).

## Actualizar, historial y volver atrás

- 1. Edita tus archivos, o pídele el cambio a tu herramienta de IA.
- 2. Pulsa «Actualizar archivos» y sube el sitio completo otra vez. Lo que está en línea no cambia hasta que publiques.
- 3. La revisión te dice qué cambia («3 archivos nuevos · 5 cambiaron · 1 ya no está») y cuánto espacio usa: solo ocupan espacio los archivos que cambiaron.
- 4. Pulsa «Publicar cambios».

Cada publicación queda en «Ver historial», y «Restaurar» vuelve a poner en línea los archivos de una versión anterior. Si las versiones viejas te ocupan mucho, «Liberar espacio», en la tarjeta del plan en Ajustes, depura lo que ya no está en uso, sin tocar lo publicado ni tus borradores.

## Conectar tu dominio

- 1. Abre «Dominios» y elige «Ya tengo un dominio» o «Necesito comprar uno». Si no tienes, RapiSites te dice si el nombre parece disponible y dónde comprarlo.
- 2. Elige tu proveedor (Cloudflare, Namecheap, GoDaddy u «Otro proveedor») y escribe el dominio, sin «www» ni «https://».
- 3. Crea los dos registros que te muestra, con botones para copiar: un `A` para el dominio y un `CNAME` para `www`. En Cloudflare, tiene que decir «DNS only».
- 4. Pulsa «Conectar dominio». RapiSites verifica solo cada minuto y, cuando el estado pasa a «Activo», emite el certificado HTTPS.

Si te trabas, «Escríbenos y te ayudamos» le avisa a un asesor. Y si tu sitio subido debe salir en Google, enciende «Permitir que Google lo encuentre».

## Problemas comunes

| Problema | Lo que ves | Cómo se arregla |
| --- | --- | --- |
| Subiste un .zip | «Todavía no aceptamos archivos .zip. Descomprímelo y arrastra la carpeta.» | Descomprímelo y arrastra la carpeta. |
| No se abre la subida | «Disponible en los planes Pro y Business» | Pasa a Pro o Business desde «Ver planes». |
| Correo sin verificar | «Verifica tu correo para subir un sitio» | Abre el enlace que te llegó al registrarte o pide uno nuevo. |
| La IA hizo un formulario en PHP | «Tu sitio trae código de servidor…» | Pídele un enlace a WhatsApp o `mailto:`. |
| Las fuentes no cargan | «Tu sitio carga recursos o envía datos a …» | «Permitir que se conecte a otros sitios», o pide a la IA que no use recursos externos. |
| Imágenes rotas | «No encontramos `…`, que `…` usa.» | Agrega el archivo o corrige la ruta (mayúsculas incluidas) y vuelve a subir. |
| Una dirección interna da 404 | Aviso de aplicación de una sola página | Activa «Es una aplicación de una sola página» y publica. |
| No alcanza el espacio | «Tu sitio necesita … y te quedan … Libera espacio o mejora tu plan.» | «Liberar espacio» o «Mejorar plan». |
| Demasiado grande | «Tu sitio pesa … y por ahora el máximo por subida es 20 MB.» | Comprime imágenes y videos pesados. |
| Otra subida en curso | «Ya hay una subida en curso. Vuelve a intentarlo en unos segundos.» | Espera unos segundos. |

## Planes

El asistente funciona en todos los planes, una vez por sitio: Gratis incluye un sitio en `.rapisites.com`, con «Hecho con RapiSites» en el pie. Subir tus archivos y conectar tu dominio son de los planes de pago: Pro (3 sitios, 2 GB, US$11.99 al mes) y Business (10 sitios, 10 GB, US$39.99 al mes). Precios en dólares; el pago anual equivale a diez meses.

> Si quieres tu sitio hoy sin tocar código, usa el asistente. Si ya tienes la web hecha, pídele a tu IA un `index.html` con rutas relativas y sin código de servidor, súbela, y la revisión te dice el resto.
