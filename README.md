# Portafolio — Jared Garcia

Portafolio personal de Jared Garcia, Frontend Developer & UI/UX Designer.
Vue 3 + Vite + Tailwind CSS, con GSAP para motion y three.js (con carga
diferida) para la demo 3D del caso Wink App.

- Sistema de diseño vivo en `/design-system`.
- Métricas de Lighthouse antes/después en `docs/metrics.md`.

El contenido (proyectos, certificados, reviews, skills) vive de forma local en
`src/data/`. No requiere base de datos ni backend.

## Requisitos

- Node.js 18+

## Setup

```sh
npm install
```

## Desarrollo

```sh
npm run dev
npm run lint
```

### Variables de entorno

`.env` → `VITE_SITE_URL`: URL pública del sitio, sin `/` final. Se usa en
las metas Open Graph, el canonical y el `sitemap.xml` que genera el build.

## Build de producción

```sh
npm run build
```

El resultado queda en `dist/`.

## Deploy (Netlify)

El proyecto se publica en Netlify. Build command `npm run build`, publish
directory `dist/`.

El archivo `public/_redirects` redirige todas las rutas a `index.html` con
código 200, necesario para que funcione el ruteo de la SPA al recargar o
entrar directo a una URL interna.

## Editar contenido

Toda la información editable está en `src/data/`:

- `profile.js` — nombre, roles, contacto, año de inicio (`careerStart`)
- `projects.js` — proyectos (los de `status: "Práctica"` se listan aparte)
- `cases.js` — casos de estudio (TL;DR, decisiones, resultado)
- `stack.js` — stack agrupado por disciplina
- `experience.js` — rol actual
- `certificates.js` — certificados
- `reviews.js` — testimonios (pendientes; el componente no está en la home)
- `skills.js` — íconos y nombres de tecnologías

Las capturas de proyectos tienen variantes `-800.webp` y `-1600.webp`
(para `srcset`); el original se usa en el lightbox.
