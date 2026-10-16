---
title: "Por qué rehice GanttHub sobre mi propia librería de componentes"
description: "Tablero, Gantt, finanzas, reuniones y flujos: cada pantalla había crecido con sus propios botones y modales. Cómo armé una librería con tokens y reglas estrictas, y migré la app entera sobre ella."
date: 2026-10-16
tags: [diseño, sistema-de-diseño, vue, gantthub]
projects: [gantthub]
kind: learning
keyword: "componentes"
---

GanttHub creció por necesidad. Cada vez que uno de mis proyectos pedía algo, lo agregaba: primero el tablero, después el presupuesto, las reuniones, las ideas, los flujos. Cada pantalla se hizo en su momento, y cada una resolvió sus botones, campos y modales a su manera.

Se notaba. Antes de la librería había 17 componentes de modal distintos, y 26 archivos armaban su propio fondo oscuro con `fixed inset-0`. Cada uno con su padding, su sombra, su forma de cerrarse y su manera de manejar (o no) el foco y la tecla Esc.

## Una librería que no conoce la app

La librería vive dentro del repo, en `src/components/ui`, pero con una regla estricta: **no importa nada de la app**. Ni stores, ni Firebase, ni `vue-i18n`. Solo Vue, los íconos de Lucide y sus propios archivos. La única excepción es el selector de fechas, que depende de su librería de calendario y de `date-fns`.

Eso la obliga a recibir todo desde afuera. Y la hace probable por separado: hay una galería en `/dev/ui`, solo en desarrollo, que muestra cada componente con todos sus estados, en claro y en oscuro.

Hoy son una treintena de componentes, agrupados por familia:

- **Botones**: `GhButton`, `GhIconButton`.
- **Formularios**: `GhField`, `GhInput`, `GhTextarea`, `GhSelect`, `GhCheckbox`, `GhSwitch`, `GhChip`, `GhDatePicker`.
- **Visualización**: `GhBadge`, `GhAvatar`, `GhAvatarGroup`, `GhTooltip`, `GhProgress`, `GhSkeleton`, `GhDivider`.
- **Feedback**: `GhAlert`, `GhEmptyState`, `GhSpinner`.
- **Layout y navegación**: `GhCard`, `GhPageHeader`, `GhStatCard`, `GhTabs`, `GhMenu`.
- **Overlays y avisos**: `GhModal` (también como panel lateral), `GhConfirm`, un popover y los toasts.

## Los tokens son la única fuente de color

Todo el estilo sale de variables CSS con prefijo `--gh-`: superficies, texto, bordes, la marca esmeralda, los estados, radios, sombras, z-index y duración de las animaciones. Los componentes no tienen colores sueltos, solo `var(--gh-*)`.

```css
:root {
  --gh-surface: #ffffff;
  --gh-text: #0f172a;
  --gh-border: #e2e8f0;
  --gh-primary: #059669;
  --gh-danger: #dc2626;
  /* … */
}
```

El modo oscuro es la misma lista de variables con otros valores bajo `.dark`. Y como los tokens también están expuestos a Tailwind, las vistas arman su layout con clases como `bg-gh-surface` o `text-gh-muted`, sin inventar grises nuevos.

Las variantes funcionan igual: un botón `danger` no trae su propio CSS, solo reasigna las variables locales del componente. Agregar un tono nuevo es definir variables, no duplicar estilos.

## El orden de las capas

Con Tailwind 4, un problema clásico es quién gana: el estilo del componente o la clase utilitaria que le pasas desde la vista. Lo resolví declarando el orden de capas en el archivo de tokens, que es lo primero que se carga:

```css
@layer theme, base, components, utilities;
```

Los estilos de la librería van en `components`. Así le ganan al reset de Tailwind, y una utilidad que la vista pone a propósito (un margen, un ancho) le gana al componente. Sin `!important`.

## Los textos tampoco vienen de la app

Los componentes ponen algunos textos por su cuenta: el «Cerrar» de un modal, el «Cargando» de un spinner, los botones por defecto de una confirmación, el idioma del calendario. Como la librería no puede importar `vue-i18n`, tiene su propio pequeño sistema: valores en español por defecto y una función para sobrescribirlos.

La app los conecta una sola vez, en `App.vue`, con un getter. Así, cambiar de idioma se refleja en vivo en todos los componentes:

```ts
provideGhMessages(() => ({
  cancel: t('common.cancel'),
  close: t('ui.close'),
  dateLocale: locale.value === 'en' ? enUS : es,
}))
```

Y si una vista pasa el texto explícito como prop, siempre gana.

## La accesibilidad, en la librería

Lo mejor de centralizar es que la accesibilidad se resuelve una vez. `GhIconButton` exige un `aria-label`: sin él, el botón no tiene nombre. Los campos dentro de `GhField` se enlazan solos con su etiqueta y su mensaje de error. Todos los controles tienen foco visible, y las animaciones respetan `prefers-reduced-motion`. Antes, cada modal decidía si cerraba con Esc o si atrapaba el foco. Ahora todos usan `GhModal`.

## La migración

Una vez lista la librería, migré la app entera: layout, autenticación, modales y todas las vistas. Fue un cambio grande (más de cien archivos), y lo aproveché para rediseñar lo que más lo necesitaba: el dashboard de la mañana, el Gantt con arrastre, el tablero con orden manual y el detalle de la tarea con su bandeja de archivos.

Hoy, de esos 26 fondos oscuros hechos a mano queda uno fuera de la librería. Los modales viejos que todavía se importan en algún lugar son envoltorios finos sobre `GhConfirm` y `GhDatePicker`, marcados como legado para no usarlos en código nuevo.

## Lo que me llevo

- Una librería interna vale la pena cuando la app tiene muchas pantallas que crecieron por separado. Antes de eso, es prematura.
- La regla más útil fue «la librería no conoce la app». Obliga a que cada componente sea genérico y se pueda ver aislado.
- Si los colores salen solo de tokens, el modo oscuro y los cambios de marca son cambiar valores, no buscar hexadecimales.
- Declarar el orden de las capas CSS ahorra la guerra de especificidad entre componentes y utilidades.
- La accesibilidad centralizada se hace una vez y la heredan todas las pantallas.
