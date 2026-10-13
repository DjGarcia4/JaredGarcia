---
title: "Todo lo que puedes hacer con RapiSites"
description: "Del sitio generado con IA a tu dominio con HTTPS, formularios sin CAPTCHA, dos idiomas, versiones y una API para desarrolladores: un recorrido completo."
date: 2026-10-12
tags: [rapisites, producto, guía]
projects: [rapisites]
cover: /img/projects/rapisites/cover.webp
kind: guide
keyword: "recorrido"
---

<figure>
  <img srcset="/img/projects/rapisites/cover-800.webp 800w, /img/projects/rapisites/cover-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/cover-1600.webp" alt="La página principal de RapiSites." loading="lazy" decoding="async" />
  <figcaption>La página principal de RapiSites.</figcaption>
</figure>

RapiSites nació con una regla: cualquier persona tiene que poder publicar su web en menos de un día, y preferiblemente en minutos. Con el tiempo sumó más formas de usarlo, desde el sitio generado con IA hasta subir uno que ya tienes o crear sitios desde otro sistema por API. Este es el recorrido completo por lo que hoy puedes hacer, con los nombres que vas a ver en el panel.

## Tu cuenta

- Te registras con tu correo y una contraseña, o con «Continuar con Google». Con Google te saltas el aviso de verificación, porque Google ya confirma tu correo.
- La verificación del correo no es obligatoria para crear ni publicar un sitio. Solo la piden subir tus propios archivos y crear llaves de API.
- Si olvidas la contraseña, «¿Olvidaste tu contraseña?» te manda un enlace que vence en una hora. Al elegir una nueva, se cierran las demás sesiones abiertas.
- La verificación en dos pasos es opcional: en Ajustes → «Verificación en dos pasos» → «Activar», escaneas el código QR con tu app de autenticación, confirmas con el código de 6 dígitos y guardas los códigos de recuperación. Cada uno sirve una sola vez, por si pierdes el teléfono.
- Si entraste solo con Google, en Ajustes puedes crear una contraseña para entrar también con correo.

## Crear un sitio, de dos formas

Todo empieza en «Crear sitio», en la lista de Sitios. El camino principal es el asistente de cuatro preguntas: el nombre del negocio, qué hace (dos o tres líneas), cómo te contacta un cliente y qué estilo te gusta. Con eso, RapiSites le pide el contenido a la API de Claude, de Anthropic, elige fotos acordes a tu rubro y arma un sitio completo, con páginas, textos y SEO, en unos segundos. La IA no inventa precios, nombres ni cifras: donde falta un dato así deja «A definir» para que lo completes tú.

<figure>
  <img srcset="/img/projects/rapisites/01-800.webp 800w, /img/projects/rapisites/01-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/01-1600.webp" alt="Las cuatro preguntas del asistente." loading="lazy" decoding="async" />
  <figcaption>Las cuatro preguntas del asistente.</figcaption>
</figure>

El segundo camino es técnico y está en un enlace debajo de la primera pregunta: «¿Ya tienes tu sitio en HTML, CSS y JS? Sube tus archivos». Es para quien ya tiene su web hecha, con otra herramienta de IA, a mano o compilada con Vite, React, Vue o Astro. Está en los planes Pro y Business y tiene su propia sección más abajo.

<figure>
  <img srcset="/img/projects/rapisites/02-800.webp 800w, /img/projects/rapisites/02-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/02-1600.webp" alt="Un sitio generado con RapiSites para un restaurante." loading="lazy" decoding="async" />
  <figcaption>Un sitio generado con RapiSites para un restaurante.</figcaption>
</figure>

## El editor

Un sitio generado se retoca en el editor, que abres con «Abrir editor» desde el menú del sitio. Tiene tres columnas: a la izquierda las secciones de la página, al centro una vista previa que se actualiza mientras editas y a la derecha las propiedades de la sección elegida.

- Se guarda solo: el editor te muestra «Guardando…» y después «Guardado». Todo queda en un borrador que solo ves tú.
- «Deshacer» (Ctrl+Z) y «Rehacer» (Ctrl+Shift+Z), sobre cualquier cambio: mover una sección, editar un texto, borrar algo.
- Reordenas arrastrando las secciones en la columna izquierda, o con «Subir» y «Bajar». Cada sección tiene además «Duplicar» y «Eliminar».
- «Agregar sección» abre el catálogo con una vista previa en vivo de cada sección, ya con los colores de tu sitio. Se inserta con contenido de ejemplo, nunca vacía.
- Las páginas se manejan desde el menú de páginas: «Crear página», cambiarle el nombre, duplicarla o eliminarla (la de inicio no se puede borrar) y el interruptor «Mostrar en el menú del sitio».
- «Cambiar el tema» abre un panel con el color de marca, la tipografía y la personalidad (más sobria, más cálida, más técnica). Elijas el color que elijas, RapiSites ajusta los tonos para que el texto se lea bien, con el nivel AA de accesibilidad.
- Cada imagen tiene tres opciones: «Subir imagen», «Elegir de la biblioteca» (todo lo que ya subiste vive en Medios) y «Buscar fotos», que busca fotos de stock gratuitas de Pexels sin salir del editor. Las fotos se procesan solas: varios tamaños y formatos modernos, sin optimizar nada a mano.
- El texto alternativo de cada imagen es obligatorio: lo usan los lectores de pantalla y los buscadores.

## 57 secciones, ningún JavaScript

El catálogo tiene 57 componentes: portadas, sobre nosotros (texto con imagen, cifras, línea de tiempo), características, catálogo (tarjetas, carrusel, comparación, menú, lista de precios), planes de precios, cifras, equipo, testimonios, galería, preguntas frecuentes, llamadas a la acción, contacto (formulario, datos, WhatsApp), más la navegación y el pie, que son del sitio y no de cada página. Ninguno carga JavaScript en el sitio público, ni siquiera los que tienen formulario: es un formulario nativo, que funciona aunque el visitante tenga los scripts apagados o una conexión mala.

<figure>
  <img srcset="/img/projects/rapisites/03-800.webp 800w, /img/projects/rapisites/03-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/03-1600.webp" alt="Otro sitio generado, esta vez para un estudio de fotografía." loading="lazy" decoding="async" />
  <figcaption>Otro sitio generado, esta vez para un estudio de fotografía.</figcaption>
</figure>

## Publicar, con revisión y versiones

Editar y publicar son dos cosas distintas. Al pulsar «Publicar», RapiSites revisa el sitio antes de ponerlo en línea:

- Bloquea lo que dejaría el sitio roto o mal indexado: «Falta el texto alternativo de una imagen…» o «La página … no tiene título». Ves «Revisa esto antes de publicar» y un botón «Ir ahí» que te lleva a la sección.
- Avisa, sin impedir publicar, lo mejorable: un dato pendiente («Hay un dato pendiente de completar…»), una reseña de ejemplo sin reemplazar, un título o una meta descripción demasiado largos, o un idioma a medio traducir.
- La publicación es de todo o nada: si algo falla a mitad, no queda un sitio a medio publicar.
- Si sale bien, ves «¡Tu sitio está en línea!», con los avisos que haya, y el botón «Ver sitio publicado». Desde el menú del sitio también tienes su «Código QR».
- Si después editas, la lista muestra «Cambios sin publicar» hasta que vuelvas a publicar.

Cada publicación queda guardada. En «Ver historial» está la lista de versiones, con la actual marcada como «Versión actual», y «Restaurar» vuelve a poner cualquiera en línea y también en el editor. Si tienes cambios sin publicar, te avisa antes de descartarlos. Ninguna versión se borra.

## Tu dirección y tu dominio

Desde que lo creas, tu sitio tiene una dirección gratuita del tipo `tunegocio.rapisites.com`, que sale del nombre del negocio y funciona con HTTPS. En los planes de pago puedes conectar tu propio dominio desde «Dominios»:

- Eliges «Ya tengo un dominio» o «Necesito comprar uno».
- Si no tienes, RapiSites busca si el nombre parece disponible (es una pista, no una garantía) y te muestra dónde comprarlo: Cloudflare Registrar, Namecheap o GoDaddy. Después lo conectas con «Ya lo compré, conectarlo aquí».
- Si ya tienes uno, eliges tu proveedor (Cloudflare, Namecheap, GoDaddy u «Otro proveedor») y te da los pasos exactos para ese proveedor: los dos registros a crear, un `A` y un `CNAME` para `www`, con botones para copiar cada valor. En Cloudflare te muestra cómo dejar el registro en «DNS only».
- Pulsas «Conectar dominio» y RapiSites verifica solo cada minuto, o cuando pulsas «Verificar ahora». Los estados son «Falta configurar», «Verificando», «Revisa el DNS» y «Activo».
- Cuando el dominio queda activo, el certificado HTTPS se emite automáticamente. Puedes «Marcar como principal» el dominio que quieras, y tu dirección `.rapisites.com` sigue funcionando y lleva a la principal.
- Si te trabas, «Escríbenos y te ayudamos» le avisa a un asesor con tu sitio y tu dominio, sin que tengas que escribir nada más.

## Formularios y mensajes

Cuatro variantes de sección traen formulario de contacto: la de contacto, dos portadas y una llamada a la acción. Si pusiste un correo en el asistente, tu sitio ya nace con uno. Lo que te escriben llega a dos lugares:

- «Mensajes», en el panel, junta los mensajes de todos tus sitios, con el conteo de los que están sin leer y un filtro por sitio si tienes varios. Cada mensaje muestra quién escribió, cuándo y desde qué sitio, y tiene un botón «Responder».
- Tu correo: cada envío se te reenvía, con el correo del visitante como «responder a», así contestas con un clic.
- Sin CAPTCHA: el visitante no tiene que demostrar que no es un robot. RapiSites filtra por detrás con un campo trampa, un límite por IP y un token firmado que detecta los envíos demasiado rápidos. El spam se guarda, porque nada se borra, pero no se te reenvía, y los mensajes dudosos llevan la etiqueta «Sospechoso».
- Cada plan reenvía por correo una cantidad de mensajes al mes. Pasado el tope, los mensajes se siguen guardando en la bandeja: solo deja de llegar el aviso por correo.

## Dos idiomas

Tu sitio nace en un idioma y, desde «Idiomas» en el menú del sitio, puedes agregar inglés con «Agregar idioma». La IA traduce todo el contenido en segundo plano; los rótulos automáticos, como los campos del formulario, ya vienen traducidos. El inglés vive bajo `/en/`, el sitio muestra un selector de idioma y los buscadores reciben las etiquetas `hreflang` correctas. Puedes corregir cualquier texto traducido en el editor y quitar el idioma cuando quieras: las traducciones no se borran. Hoy los idiomas disponibles son español e inglés; Gratis permite un idioma por sitio, Pro hasta tres y Business sin límite.

## El SEO ya viene hecho

- Un solo encabezado principal (`h1`) por página, colocado por el sistema.
- `sitemap.xml` y `robots.txt` generados solos.
- Datos estructurados según tu negocio, como `LocalBusiness` en la sección de contacto o `FAQPage` en las preguntas frecuentes.
- Enlaces canónicos y, con dos idiomas, `hreflang`.
- Vista previa para redes: si no subiste una imagen para compartir, RapiSites genera una con el nombre de tu sitio.
- La revisión previa a publicar vigila títulos, descripciones y textos alternativos.

## Sitios con tus propios archivos

En Pro y Business puedes publicar un sitio que ya tienes hecho en HTML, CSS y JS. Arrastras la carpeta (o un solo `.html`), RapiSites te dice cuánto pesa antes de subir nada, la revisa y te muestra una vista previa del borrador antes de publicar. Hay un informe con lo que bloquea (código de servidor como `.php`, tipos de archivo no permitidos, páginas que no están en UTF-8) y lo que solo avisa (archivos que faltan, rutas de tu computadora, falta de `<title>` o de viewport). Detecta la página de inicio y las carpetas de build como `dist`, y por defecto el sitio solo usa sus propios archivos, salvo que permitas que se conecte a otros sitios.

Estos sitios viven en `tusitio.rapisites.app`, llevan la etiqueta «Archivos propios» y no tienen editor: para cambiarlos subes el sitio de nuevo con «Actualizar archivos», y solo ocupan espacio los archivos que cambiaron. Tienen historial y «Restaurar», dominio propio, descarga de cada archivo publicado y opciones propias: aplicación de una sola página, conexión a otros sitios, «Permitir que Google lo encuentre» y mostrarse solo dentro de otra página. Los límites son 500 archivos y 20 MB por subida, y todavía no se aceptan archivos `.zip`. La guía paso a paso está en el post «Crea tu web con IA y publícala en RapiSites».

## Una API para integradores

Si tienes un sistema propio y quieres crear y publicar sitios en nombre de tus clientes, RapiSites tiene una API pública en `api.rapisites.com/v1`, documentada en rapisites.com/desarrolladores. [Wink](/project/wink-app), por ejemplo, la usa como integrador.

- Requisitos, todos desde Ajustes → API: correo verificado, un plan Pro o Business, aceptar las condiciones de la API y un contacto para reportes de abuso. El botón «Crear llave» te dice cuál te falta.
- La llave se muestra una sola vez al crearla. Le eliges un nombre y un alcance, y confirmas con tu contraseña.
- Con ella creas un sitio subiendo sus archivos, lo actualizas, obtienes una vista previa del borrador para mostrarla antes de publicar, publicas o despublicas, consultas sus versiones, vuelves a una anterior y copias un sitio sin volver a subir nada.
- Puedes conectar un dominio base propio con un solo registro DNS comodín, para que cada sitio que crees por API reciba su dirección debajo de tu dominio sin volver a tocar el DNS.
- El tope es de 60 peticiones por minuto por llave, y los reintentos son seguros con la cabecera `Idempotency-Key`.

## Planes

|  | Gratis | Pro | Business |
| --- | --- | --- | --- |
| Sitios (y sitios con el asistente de IA) | 1 | 3 | 10 |
| Dominio propio con HTTPS automático | No: subdominio en rapisites.com | Sí | Sí |
| «Hecho con RapiSites» en el pie | Sí | No | No |
| Mensajes de formulario reenviados al mes | 20 | 500 | Ilimitados |
| Almacenamiento | 100 MB | 2 GB | 10 GB |
| Idiomas por sitio | 1 | 3 | Sin límite |
| Subir un sitio que ya tienes | No | Sí | Sí |
| API pública | No | Sí | Sí |
| Dominios base para la API | — | 1 | 3 |
| Precio mensual | Gratis | US$11.99 | US$39.99 |
| Precio anual | Gratis | US$119.90 | US$399.90 |

<p class="tbl-note">Precios en dólares estadounidenses. El pago anual equivale a diez meses: dos meses gratis.</p>

El plan Gratis no tiene costo ni vencimiento. Para pasar a un plan de pago, eliges el plan y el periodo, mensual o anual, haces una transferencia bancaria con el código de referencia que te da el panel y subes el comprobante; cuando se verifica, el plan queda activo y te avisamos por correo. Puedes pagar en lempiras al tipo de cambio del día. Bajar de plan no lleva pago y se aplica al vencer el periodo ya pagado. Si un plan vence sin pagarse, hay un periodo de gracia, después la cuenta queda en solo lectura con el sitio en línea y, pasado alrededor de un mes, el sitio deja de mostrarse hasta que te pongas al día. En ningún paso se borra tu contenido.

> La idea de fondo no cambió: cualquier persona tiene que poder publicar su web en menos de un día, y preferiblemente en minutos. Todo lo demás —el editor, el dominio, los idiomas, los archivos propios, la API— está para después de ese primer sitio en línea.
