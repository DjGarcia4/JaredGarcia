# Sistema de diseño — Portafolio Jared Garcia

La versión viva (con contrastes calculados en el navegador y componentes
reales) está en la ruta **`/design-system`** del sitio
(`src/views/DesignSystemView.vue`). Este archivo resume los tokens para
quien lea el repo.

## Principios

1. **Contenido primero.** Cada pantalla responde una pregunta de quien la
   visita; lo decorativo acompaña.
2. **Un acento, con intención.** El verde marca acciones y estado.
3. **Accesible por defecto.** Contraste AA, foco visible, teclado completo y
   `prefers-reduced-motion` respetado.

## Color (`tailwind.config.js`)

| Token | Valor | Uso |
|---|---|---|
| `ink-950` | `#0F172A` | Fondo |
| `ink-900` | `#1E293B` | Superficies |
| `ink-850` | `#272F42` | Superficie apagada |
| `ink-800` | `#334155` | Superficie secundaria |
| `accent` | `#22C55E` | Acciones, estado |
| `accent-light` | `#4ADE80` | Texto de acento, anillo de foco |
| `accent-dark` | `#16A34A` | Degradés |

Texto sobre `ink-950`: blanco al 100 / 80 / 70 / 60 / 55 % para contenido
(≥ 6:1). Al 50 % solo para placeholders (≈ 5.2:1). Por debajo de eso,
solo decoración.

## Tipografía

| Rol | Familia | Peso |
|---|---|---|
| Display y títulos | Space Grotesk | 600–700 |
| Cuerpo | Inter | 400–600 |
| Etiquetas técnicas | Space Mono | 400–700, mayúsculas, +0.18–0.22em |

## Componentes (`src/assets/main.css`)

`btn-primary`, `btn-ghost`, `chip`, `field` (con estado de error vía
`aria-invalid` + mensaje con `aria-describedby`), `surface`,
`surface-hover`, `link-icon`, `eyebrow`, `mono-label`, `skip-link`.

## Motion

- Entradas de sección una sola vez (`playOnEnter` en `src/lib/gsap.js`),
  0.5–0.8 s, `power3.out`.
- Microinteracciones de 200–300 ms.
- Con `prefers-reduced-motion`: sin entradas, sin autoplay, 3D estático.
