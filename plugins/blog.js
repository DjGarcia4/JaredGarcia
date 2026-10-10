// Blog en Markdown, resuelto en el build (cero JS extra en el navegador).
//
// Cada artículo es src/content/blog/<lang>/<slug>.md con frontmatter YAML:
//   title, description, date (AAAA-MM-DD)       → obligatorios
//   updated, tags[], cover, projects[], draft   → opcionales
// El mismo <slug> en es/ y en/ es el mismo artículo traducido.
//
// - `virtual:blog` exporta los metadatos de todos los artículos (sin cuerpo)
//   para listados, paleta ⌘K, SEO, etc.
// - Importar un .md devuelve { html, toc }: el cuerpo ya renderizado, con
//   código resaltado por Shiki. Cada artículo queda en su propio chunk.
// - En el build se generan rss.xml (es) y en/rss.xml (en).
// - draft: true → visible con `npm run dev`, fuera del build de producción.
import fs from "node:fs";
import path from "node:path";
import MarkdownIt from "markdown-it";
import { parse as parseYaml } from "yaml";
import { createHighlighter } from "shiki";

const LANGS = ["es", "en"];
const VIRTUAL_ID = "virtual:blog";
const RESOLVED_ID = "\0" + VIRTUAL_ID;
const SHIKI_THEME = "github-dark-default";

const UI = {
  es: { copy: "Copiar" },
  en: { copy: "Copy" },
};

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const escapeXml = (s) =>
  String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

const splitFrontmatter = (raw, file) => {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`[blog] ${file}: falta el frontmatter (--- ... ---).`);
  return { data: parseYaml(m[1]) || {}, body: m[2] };
};

const readingTime = (body) => {
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
};

export default function blog({ dir = "src/content/blog", siteUrl = "", siteName = "" } = {}) {
  let root = process.cwd();
  let isBuild = false;
  let highlighter;
  const contentDir = () => path.resolve(root, dir);

  const listFiles = () =>
    LANGS.flatMap((lang) => {
      const d = path.join(contentDir(), lang);
      if (!fs.existsSync(d)) return [];
      return fs
        .readdirSync(d)
        .filter((f) => f.endsWith(".md"))
        .map((f) => ({ lang, slug: f.replace(/\.md$/, ""), file: path.join(d, f) }));
    });

  const readMeta = ({ lang, slug, file }) => {
    const { data, body } = splitFrontmatter(fs.readFileSync(file, "utf8"), file);
    for (const key of ["title", "description", "date"]) {
      if (!data[key]) throw new Error(`[blog] ${lang}/${slug}.md: falta "${key}" en el frontmatter.`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.date))) {
      throw new Error(`[blog] ${lang}/${slug}.md: "date" tiene que ser AAAA-MM-DD.`);
    }
    return {
      slug,
      lang,
      title: String(data.title),
      description: String(data.description),
      date: String(data.date),
      updated: data.updated ? String(data.updated) : null,
      tags: data.tags || [],
      cover: data.cover || null,
      projects: data.projects || [],
      draft: !!data.draft,
      readingTime: readingTime(body),
    };
  };

  const allPosts = () =>
    listFiles()
      .map(readMeta)
      .filter((p) => !(isBuild && p.draft))
      .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

  const isPostFile = (id) => {
    const rel = path.relative(contentDir(), id.split("?")[0]);
    return !rel.startsWith("..") && rel.endsWith(".md");
  };

  const getHighlighter = async (langs) => {
    highlighter ??= await createHighlighter({ themes: [SHIKI_THEME], langs: [] });
    const loaded = highlighter.getLoadedLanguages();
    for (const l of langs) {
      if (loaded.includes(l)) continue;
      try {
        await highlighter.loadLanguage(l);
      } catch {
        // Lenguaje desconocido para Shiki: se muestra como texto plano.
      }
    }
    return highlighter;
  };

  const render = async (body, lang) => {
    const fenceLangs = [...body.matchAll(/^```(\w[\w+-]*)/gm)].map((m) => m[1]);
    const hl = await getHighlighter(fenceLangs);
    const ui = UI[lang] || UI.es;
    const toc = [];

    const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

    // Código: resaltado con Shiki y envuelto con etiqueta + botón de copiar.
    md.renderer.rules.fence = (tokens, idx) => {
      const token = tokens[idx];
      const info = token.info.trim().split(/\s+/)[0] || "text";
      const known = hl.getLoadedLanguages().includes(info);
      const code = hl.codeToHtml(token.content.replace(/\n$/, ""), {
        lang: known ? info : "text",
        theme: SHIKI_THEME,
      });
      return (
        `<div class="code-block"><div class="code-head"><span>${md.utils.escapeHtml(info)}</span>` +
        `<button type="button" class="code-copy" data-copy>${ui.copy}</button></div>${code}</div>\n`
      );
    };

    // h2/h3 con id estable y ancla; se juntan para el índice.
    md.core.ruler.push("heading_ids", (state) => {
      const used = new Set();
      state.tokens.forEach((token, i) => {
        if (token.type !== "heading_open" || !["h2", "h3"].includes(token.tag)) return;
        const text = state.tokens[i + 1].children
          .filter((c) => c.type === "text" || c.type === "code_inline")
          .map((c) => c.content)
          .join("");
        let id = slugify(text) || "seccion";
        for (let n = 2; used.has(id); n++) id = `${slugify(text)}-${n}`;
        used.add(id);
        token.attrSet("id", id);
        toc.push({ id, text, level: Number(token.tag.slice(1)) });
      });
    });
    md.renderer.rules.heading_close = (tokens, idx) => {
      const open = tokens[idx - 2];
      const id = open.attrGet("id");
      const anchor = id
        ? ` <a class="heading-anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>`
        : "";
      return `${anchor}</${tokens[idx].tag}>\n`;
    };

    // Enlaces externos en otra pestaña.
    const defaultLink = md.renderer.rules.link_open || ((t, i, o, e, self) => self.renderToken(t, i, o));
    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
      const href = tokens[idx].attrGet("href") || "";
      if (/^https?:\/\//.test(href) && !(siteUrl && href.startsWith(siteUrl))) {
        tokens[idx].attrSet("target", "_blank");
        tokens[idx].attrSet("rel", "noopener noreferrer");
      }
      return defaultLink(tokens, idx, options, env, self);
    };

    // Imágenes diferidas.
    const defaultImage = md.renderer.rules.image;
    md.renderer.rules.image = (tokens, idx, options, env, self) => {
      tokens[idx].attrSet("loading", "lazy");
      tokens[idx].attrSet("decoding", "async");
      return defaultImage(tokens, idx, options, env, self);
    };

    const html = md.render(body);
    return { html, toc };
  };

  const rss = (posts, lang) => {
    const base = siteUrl.replace(/\/$/, "");
    const q = lang === "en" ? "?lang=en" : "";
    const items = posts
      .map((p) => {
        const url = `${base}/blog/${p.slug}${q}`;
        return [
          "    <item>",
          `      <title>${escapeXml(p.title)}</title>`,
          `      <link>${escapeXml(url)}</link>`,
          `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
          `      <description>${escapeXml(p.description)}</description>`,
          `      <pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>`,
          ...p.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
          "    </item>",
        ].join("\n");
      })
      .join("\n");
    const feedPath = lang === "en" ? "/en/rss.xml" : "/rss.xml";
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`Blog · ${siteName}`)}</title>
    <link>${escapeXml(`${base}/blog${q}`)}</link>
    <atom:link href="${escapeXml(base + feedPath)}" rel="self" type="application/rss+xml" />
    <description>${lang === "en" ? "Notes on frontend, design and building products." : "Notas sobre frontend, diseño y construir productos."}</description>
    <language>${lang === "en" ? "en" : "es"}</language>
${items}
  </channel>
</rss>
`;
  };

  return {
    name: "blog",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
      isBuild = config.command === "build";
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id === RESOLVED_ID) {
        // Que el dev server recargue el índice al cambiar cualquier .md.
        listFiles().forEach(({ file }) => this.addWatchFile(file));
        return `export const posts = ${JSON.stringify(allPosts())};`;
      }
    },
    async transform(code, id) {
      if (!isPostFile(id)) return;
      const { data, body } = splitFrontmatter(code, id);
      // Los borradores no llegan al build ni como chunk huérfano.
      if (isBuild && data.draft) return { code: `export default { html: "", toc: [] };`, map: null };
      const lang = path.basename(path.dirname(id));
      const out = await render(body, lang);
      return { code: `export default ${JSON.stringify(out)};`, map: null };
    },
    handleHotUpdate({ file, server }) {
      if (!isPostFile(file)) return;
      const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (mod) server.moduleGraph.invalidateModule(mod);
      server.ws.send({ type: "full-reload" });
    },
    generateBundle() {
      if (!siteUrl) return;
      const posts = allPosts();
      for (const lang of LANGS) {
        this.emitFile({
          type: "asset",
          fileName: lang === "en" ? "en/rss.xml" : "rss.xml",
          source: rss(posts.filter((p) => p.lang === lang), lang),
        });
      }
    },
    // Para el sitemap: slugs publicados (sin repetir idiomas).
    api: { slugs: () => [...new Set(allPosts().map((p) => p.slug))] },
  };
}
