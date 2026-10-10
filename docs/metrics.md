# Métricas del rediseño v2

Lighthouse 12.2.1, build de producción servido con `vite preview` y Chrome
headless. Mobile usa el throttling por defecto (4G lento + CPU 4×).

| | Perf. mobile | Perf. desktop | Accesibilidad | Best practices | SEO | LCP mobile | TBT mobile | Peso total |
|---|---|---|---|---|---|---|---|---|
| **Antes** (`main` @ fe6ece3) | 60 | 93 | 80 | 100 | 92 | 6.0 s | 300 ms | 1149 KB |
| **Fase 1** (`redesign/v2`) | 81–83 | 99–100 | 100 | 100 | 100 | 3.5–3.6 s | 0–300 ms* | 267 KB |

| **Fases 2–4** (home) | 90 | 100 | 100 | 100 | 100 | 3.2 s | 80 ms | 376 KB |
| **Fases 2–4** (`/projects`) | 88 | 99 | 100 | 100 | 100 | 3.5 s | 60 ms | 382 KB |
| **Fases 2–4** (caso Wink App) | 85 | 99 | 100 | 100 | 100 | 3.8 s | 80 ms | 298 KB* |

\* El TBT mobile varía entre corridas (0 y 300 ms en dos corridas seguidas).
En el caso de Wink App, three.js (117 KB gzip) se descarga recién al
acercarse a la demo 3D, así que no entra en la carga inicial.

CLS: `/projects` y los casos tenían **0.75** (el footer se pintaba arriba
mientras cargaba el chunk de la ruta y después saltaba); con `min-height`
en `<main>` quedó en **0.001**.

JS inicial: 695 KB gzip en un archivo → ~159 KB gzip en 4 chunks cacheables.

Pendiente: el LCP mobile (3.2–3.8 s con throttling) lo frenan sobre todo las
fuentes de Google Fonts (CSS que bloquea el render) y que el contenido es
client-side. Siguientes pasos posibles: self-host + preload de las fuentes,
o prerender de las rutas.
