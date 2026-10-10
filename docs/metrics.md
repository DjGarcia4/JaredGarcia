# Métricas del rediseño v2

Lighthouse 12.2.1, build de producción servido con `vite preview` y Chrome
headless. Mobile usa el throttling por defecto (4G lento + CPU 4×).

| | Perf. mobile | Perf. desktop | Accesibilidad | Best practices | SEO | LCP mobile | TBT mobile | Peso total |
|---|---|---|---|---|---|---|---|---|
| **Antes** (`main` @ fe6ece3) | 60 | 93 | 80 | 100 | 92 | 6.0 s | 300 ms | 1149 KB |
| **Fase 1** (`redesign/v2`) | 81–83 | 99–100 | 100 | 100 | 100 | 3.5–3.6 s | 0–300 ms* | 267 KB |

\* El TBT mobile varía entre corridas (0 y 300 ms en dos corridas seguidas).

JS inicial: 695 KB gzip en un archivo → ~159 KB gzip en 4 chunks cacheables.

Pendiente para la fase 2: el LCP mobile lo marca el `h1` del hero, que
arranca con `opacity: 0` por la animación de entrada.
