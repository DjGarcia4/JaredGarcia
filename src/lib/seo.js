// Título y metas por ruta. resolveMeta() es pura: la usan el navegador
// (applyRouteMeta, al navegar) y el prerender del build, que escribe las
// mismas metas en el HTML estático de cada ruta para LinkedIn, WhatsApp y
// Google.
import { profile } from "@/data/profile";
import { getCertificates, getProjects } from "@/data/localized";
import { getPost } from "@/lib/blog";
import { locale, t } from "@/i18n";

const SITE_NAME = profile.name;
const SITE_URL = import.meta.env.VITE_SITE_URL || "";

const postJsonLd = (p, url) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: p.title,
  description: p.description,
  datePublished: p.date,
  dateModified: p.updated || p.date,
  inLanguage: p.lang,
  keywords: p.tags.join(", "),
  url,
  ...(p.cover && SITE_URL ? { image: new URL(p.cover, SITE_URL).href } : {}),
  author: { "@type": "Person", name: profile.name, url: SITE_URL || undefined },
});

const personJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.roles.join(" & "),
  url: SITE_URL || undefined,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressCountry: "HN" },
  sameAs: [profile.socials.github, profile.socials.linkedin],
});

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
  if (route.name === "post") {
    const p = getPost(route.params.slug);
    if (p) {
      return {
        title: `${p.title} · ${SITE_NAME}`,
        description: p.description,
        image: p.cover,
        type: "article",
        jsonLd: postJsonLd(p, `${SITE_URL}/blog/${p.slug}`),
      };
    }
  }
  if (route.name === "blog") {
    return { title: `${t("seo.blogTitle")} · ${SITE_NAME}`, description: t("seo.blogDescription") };
  }
  if (route.name === "not-found") {
    return { title: `${t("seo.notFoundTitle")} · ${SITE_NAME}`, description: DEFAULT_DESCRIPTION };
  }
  if (route.name === "lab") {
    return { title: `${t("seo.labTitle")} · ${SITE_NAME}`, description: t("seo.labDescription") };
  }
  if (route.name === "design-system") {
    return { title: `${t("seo.dsTitle")} · ${SITE_NAME}`, description: t("seo.dsDescription") };
  }
  if (route.name === "projects") {
    return { title: `${t("seo.projectsTitle")} · ${SITE_NAME}`, description: t("seo.projectsDescription") };
  }
  if (route.name === "home") {
    return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, jsonLd: personJsonLd() };
  }
  return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
};

// { title, description, type, ogLocale, url, image, jsonLd }. url e image
// son absolutas solo si hay VITE_SITE_URL.
export const resolveMeta = (route) => {
  const { title, description, image, type = "website", jsonLd = null } = resolve(route);
  return {
    title,
    description,
    type,
    ogLocale: locale.value === "en" ? "en_US" : "es_HN",
    url: SITE_URL ? new URL(route.path, SITE_URL).href : null,
    image: SITE_URL ? new URL(image || "/og.png", SITE_URL).href : null,
    jsonLd,
  };
};

// ── Navegador ────────────────────────────────────────────────────
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

const setJsonLd = (data) => {
  let script = document.getElementById("ld-route");
  if (!data) return script?.remove();
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "ld-route";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

export const applyRouteMeta = (route) => {
  const meta = resolveMeta(route);
  document.title = meta.title;
  setMeta('meta[name="description"]', "content", meta.description);
  setMeta('meta[property="og:title"]', "content", meta.title);
  setMeta('meta[property="og:description"]', "content", meta.description);
  setMeta('meta[name="twitter:title"]', "content", meta.title);
  setMeta('meta[name="twitter:description"]', "content", meta.description);
  setMeta('meta[property="og:locale"]', "content", meta.ogLocale);
  setMeta('meta[property="og:type"]', "content", meta.type);
  if (meta.url) {
    setMeta('meta[property="og:url"]', "content", meta.url);
    setCanonical(meta.url);
  }
  if (meta.image) {
    setMeta('meta[property="og:image"]', "content", meta.image);
    setMeta('meta[name="twitter:image"]', "content", meta.image);
  }
  setJsonLd(meta.jsonLd);
};
