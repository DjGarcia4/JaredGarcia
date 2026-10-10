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

## Fase 5: prerender y fuentes propias

Cada ruta se prerenderiza a HTML en el build (Vue SSR) y se hidrata en el
navegador. Las fuentes se sirven desde el sitio (`@fontsource`) en vez de
Google Fonts.

Lighthouse 12.2.1, mobile, con throttling aplicado (`--throttling-method=devtools`,
4G lento + CPU 4×) y no simulado: la simulación estima el FCP sumando todo lo
que se descarga antes del primer paint, JS incluido, aunque no bloquee el
render. Por eso estos números no se comparan con las fases anteriores: la
columna "antes" es `main` medido igual. Mediana de 3 corridas.

Navegador en español (el HTML prerenderizado se ve en el primer paint):

| | Perf. antes | Perf. después | LCP antes | LCP después | CLS antes | CLS después |
|---|---|---|---|---|---|---|
| Home | 61 | 71 | 4.2 s | 2.1 s | 0 | 0 |
| `/projects` | 59 | 73 | 5.0 s | 2.8 s | 0 | 0 |
| Artículo del blog | 80 | 80 | 4.0 s | 2.0 s | 0.049 | 0 |

Navegador en inglés (el contenido espera a que la app monte en inglés):

| | Perf. antes | Perf. después | LCP antes | LCP después |
|---|---|---|---|---|
| Home | 52 | 71 | 4.7 s | 4.5 s |
| Artículo del blog | 72 | 83 | 3.9 s | 3.4 s |

El TBT en español sube (home: ~530 ms → ~1.4 s) porque ahora hay contenido
pintado antes de que corra el JS, y el TBT solo cuenta lo que bloquea
después del primer paint. El trabajo total del hilo principal bajó (home:
4.3 s → 3.8 s; `/projects`: 2.8 s → 2.4 s).

Pendiente:

- La hidratación de la home es una sola tarea de ~1.4 s con CPU 4×. Con
  Vue 3.5 se podría hidratar de forma diferida lo que está debajo del
  primer pantallazo (`hydrateOnVisible`).
- El inglés no se beneficia del prerender: necesita URLs propias
  (`/en/...`) prerenderizadas en inglés.
