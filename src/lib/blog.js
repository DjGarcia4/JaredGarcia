// Artículos del blog según el idioma activo. Los metadatos vienen de
// virtual:blog (plugins/blog.js); el cuerpo de cada artículo es un chunk
// aparte que se descarga recién al abrirlo. Usar dentro de computed() para
// que reaccione al cambio de idioma.
import { posts } from "virtual:blog";
import { locale } from "@/i18n";

const bodies = import.meta.glob("/src/content/blog/*/*.md", { import: "default" });

// Un artículo por slug: la versión en el idioma activo o, si no está
// traducido, la que exista (marcada con fallback: true).
export const getPosts = () => {
  const lang = locale.value;
  const bySlug = new Map();
  for (const p of posts) {
    const prev = bySlug.get(p.slug);
    if (!prev || (p.lang === lang && prev.lang !== lang)) bySlug.set(p.slug, p);
  }
  return [...bySlug.values()]
    .map((p) => ({ ...p, fallback: p.lang !== lang }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
};

export const getPost = (slug) => getPosts().find((p) => p.slug === slug) ?? null;

export const getTags = () =>
  [...new Set(getPosts().flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b));

export const postsForProject = (projectSlug) =>
  getPosts().filter((p) => p.projects.includes(projectSlug));

export const loadBody = async (post) => {
  const load = bodies[`/src/content/blog/${post.lang}/${post.slug}.md`];
  return load ? load() : { html: "", toc: [] };
};

// Fechas AAAA-MM-DD sin corrimiento de zona horaria.
export const formatDate = (date, lang = locale.value) =>
  new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-HN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
