export const skills = [
  { name: "React", image: "react" },
  { name: "Vue.js", image: "vue" },
  { name: "TypeScript", image: "ts" },
  { name: "JavaScript", image: "js" },
  { name: "Node.js", image: "node" },
  { name: "HTML", image: "html" },
  { name: "CSS", image: "css" },
  { name: "MongoDB", image: "mongo" },
  { name: "Git", image: "git" },
  { name: "GitHub", image: "github" },
  { name: "Firebase", image: "firebase" },
  { name: "Tailwind", image: "tailwind" },
  { name: "Figma", image: "figma" },
  { name: "Bootstrap", image: "bootstrap" },
  { name: "Vite", image: "vite" },
  { name: "Vuetify", image: "vuetify" },
  { name: "Pinia", image: "pinia" },
  { name: "Electron", image: "electron" },
  { name: "PrimeVue", image: "primevue" },
  { name: "Axios", image: "axios" },
  { name: "Docker", image: "docker" },
  { name: "Balena", image: "balena" },
];

// Nombre legible de una tecnología a partir de su clave (el nombre del SVG
// que usan los proyectos en techStack): "ts" → "TypeScript".
const NAMES = Object.fromEntries(skills.map((s) => [s.image, s.name]));
export const techName = (key) => NAMES[key] ?? key;
