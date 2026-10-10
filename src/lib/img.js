// Variantes de las capturas de proyectos: cada imagen en
// /img/projects/<slug>/<name>.webp tiene <name>-800.webp y <name>-1600.webp
// (generadas desde el original, que queda para el lightbox).
const variant = (src, w) => src.replace(/\.webp$/, `-${w}.webp`);

export const projectSrcset = (src) =>
  src?.startsWith("/img/projects/") ? `${variant(src, 800)} 800w, ${variant(src, 1600)} 1600w` : undefined;

export const projectSrc = (src, w = 1600) =>
  src?.startsWith("/img/projects/") ? variant(src, w) : src;
