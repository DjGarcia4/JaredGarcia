// Stack agrupado por disciplina. Cada item aparece en al menos un proyecto
// del portafolio; `icon` es opcional (SVG en /public/img/skills/).

export const stack = [
  {
    group: "Diseño",
    summary: "De la idea al sistema: flujos, interfaces y componentes con todos sus estados.",
    items: [
      { name: "Figma", icon: "figma" },
      { name: "Prototipado" },
      { name: "Sistemas de diseño y tokens" },
      { name: "Accesibilidad (WCAG)" },
      { name: "Motion · GSAP" },
      { name: "UX writing" },
    ],
  },
  {
    group: "Frontend",
    summary: "Interfaces rápidas, accesibles y mantenibles, listas para producción.",
    items: [
      { name: "Vue 3", icon: "vue" },
      { name: "Nuxt" },
      { name: "TypeScript", icon: "ts" },
      { name: "React", icon: "react" },
      { name: "Tailwind CSS", icon: "tailwind" },
      { name: "Pinia", icon: "pinia" },
      { name: "Vite", icon: "vite" },
      { name: "PWA" },
    ],
  },
  {
    group: "Backend e infraestructura",
    summary: "Lo necesario para llevar un producto de punta a punta.",
    items: [
      { name: "Node.js", icon: "node" },
      { name: "Firebase", icon: "firebase" },
      { name: "PostgreSQL · Drizzle" },
      { name: "Docker", icon: "docker" },
      { name: "Caddy · Cloudflare R2" },
      { name: "BalenaOS (IoT)", icon: "balena" },
      { name: "Vitest · Playwright · axe" },
    ],
  },
];
