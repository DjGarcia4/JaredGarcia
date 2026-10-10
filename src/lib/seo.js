// Título y metas por ruta. Ojo: LinkedIn, WhatsApp y Slack no ejecutan JS,
// así que para ellos valen las metas estáticas de index.html; esto mejora
// las pestañas del navegador, el historial y lo que indexa Google.
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { certificates } from "@/data/certificates";

const SITE_NAME = profile.name;
const DEFAULT_TITLE = `${profile.name} — Frontend Developer & UI/UX Designer`;
const DEFAULT_DESCRIPTION =
  "Frontend Developer & UI/UX Designer en Honduras. Diseño la experiencia y la construyo hasta producción: Vue, TypeScript, SaaS y sistemas de diseño.";

const setMeta = (selector, attr, value) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const [, key, name] = selector.match(/\[(name|property)="([^"]+)"\]/);
    el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const setCanonical = (url) => {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = url;
};

const resolve = (route) => {
  if (route.name === "project") {
    const p = projects.find((x) => x.slug === route.params.slug);
    if (p) return { title: `${p.title} · ${SITE_NAME}`, description: p.summary };
  }
  if (route.name === "certificate") {
    const c = certificates.find((x) => x.slug === route.params.slug);
    if (c) return { title: `${c.title} · ${SITE_NAME}`, description: `Certificación de ${c.issuer}.` };
  }
  if (route.name === "projects") {
    return {
      title: `Proyectos · ${SITE_NAME}`,
      description: "Casos de estudio y proyectos: SaaS, plataformas, sitios y herramientas que diseñé y construí.",
    };
  }
  return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
};

export const applyRouteMeta = (route) => {
  const { title, description } = resolve(route);
  document.title = title;
  setMeta('meta[name="description"]', "content", description);
  setMeta('meta[property="og:title"]', "content", title);
  setMeta('meta[property="og:description"]', "content", description);
  setMeta('meta[name="twitter:title"]', "content", title);
  setMeta('meta[name="twitter:description"]', "content", description);

  const base = import.meta.env.VITE_SITE_URL;
  if (base) {
    const url = new URL(route.path, base).href;
    setMeta('meta[property="og:url"]', "content", url);
    setCanonical(url);
  }
};
