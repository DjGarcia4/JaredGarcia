# Portafolio — Jared Garcia

Portafolio personal construido con Vue 3 + Vite + Tailwind CSS.

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
```

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

- `profile.js` — nombre, roles, bio, contacto
- `projects.js` — proyectos del portafolio
- `certificates.js` — certificados
- `reviews.js` — testimonios
- `skills.js` — stack de tecnologías
