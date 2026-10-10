// Título y metas por ruta. Ojo: LinkedIn, WhatsApp y Slack no ejecutan JS,
// así que para ellos valen las metas estáticas de index.html; esto mejora
// las pestañas del navegador, el historial y lo que indexa Google.
import { profile } from "@/data/profile";
import { getCertificates, getProjects } from "@/data/localized";
import { locale, t } from "@/i18n";

const SITE_NAME = profile.name;

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
  const DEFAULT_TITLE = t("seo.defaultTitle", { name: SITE_NAME });
  const DEFAULT_DESCRIPTION = t("seo.defaultDescription");
  if (route.name === "project") {
    const p = getProjects().find((x) => x.slug === route.params.slug);
    if (p) return { title: `${p.title} · ${SITE_NAME}`, description: p.summary };
  }
  if (route.name === "certificate") {
    const c = getCertificates().find((x) => x.slug === route.params.slug);
    if (c) return { title: `${c.title} · ${SITE_NAME}`, description: t("seo.certDescription", { issuer: c.issuer }) };
  }
  if (route.name === "not-found") {
    return { title: `${t("seo.notFoundTitle")} · ${SITE_NAME}`, description: DEFAULT_DESCRIPTION };
  }
  if (route.name === "design-system") {
    return { title: `${t("seo.dsTitle")} · ${SITE_NAME}`, description: t("seo.dsDescription") };
  }
  if (route.name === "projects") {
    return { title: `${t("seo.projectsTitle")} · ${SITE_NAME}`, description: t("seo.projectsDescription") };
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
  setMeta('meta[property="og:locale"]', "content", locale.value === "en" ? "en_US" : "es_HN");

  const base = import.meta.env.VITE_SITE_URL;
  if (base) {
    const url = new URL(route.path, base).href;
    setMeta('meta[property="og:url"]', "content", url);
    setCanonical(url);
  }
};
