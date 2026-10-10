// Prerender: después de `vite build` (cliente) y `vite build --ssr`
// (dist-ssr), escribe el HTML de cada ruta con su contenido ya renderizado
// y sus propias metas. El navegador hidrata ese HTML en vez de armar la
// página de cero, y LinkedIn/WhatsApp/Google ven el contenido y las metas
// reales de cada página.
//
//   dist/index.html, dist/blog.html, dist/blog/<slug>.html…
//   (<ruta>.html y no <ruta>/index.html: Netlify sirve /blog desde blog.html
//   tal cual, mientras que con una carpeta redirige a /blog/.)
//   dist/app.html → la SPA vacía, para rutas que no existen (404).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const read = (file) => fs.readFileSync(path.join(dist, file), "utf8");

const template = read("index.html");
const ssrManifest = JSON.parse(read(".vite/ssr-manifest.json"));
const { render, listRoutes } = await import(pathToFileURL(path.join(root, "dist-ssr/entry-server.js")).href);

const escapeAttr = (s) =>
  String(s).replace(/[&"<>]/g, (c) => ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" })[c]);
// JSON dentro de <script>: sin "</script>" ni "<!--" posibles.
const inlineJson = (data) => JSON.stringify(data).replace(/</g, "\\u003c");

const assets = fs.readdirSync(path.join(dist, "assets"));
const asset = (re) => {
  const file = assets.find((f) => re.test(f));
  if (!file) throw new Error(`[prerender] no se encontró ${re} en dist/assets`);
  return `/assets/${file}`;
};

// Fuentes del primer paint: el texto (Inter 400) y los títulos (Space
// Grotesk 700). El resto se descarga cuando se usa.
const fontPreloads = [asset(/^inter-latin-400-normal-.*\.woff2$/), asset(/^space-grotesk-latin-700-normal-.*\.woff2$/)]
  .map((href) => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`)
  .join("\n    ");

// El HTML está en español. Si quien entra va a ver el sitio en inglés
// (?lang=en, preferencia guardada o idioma del navegador; la misma regla
// que src/i18n.js), se oculta hasta que la app monte en inglés, en vez de
// mostrar el español y cambiarlo de golpe. También se adelanta la descarga
// del chunk con los textos en inglés.
const enChunk = (ssrManifest["src/data/en/index.js"] || []).find((f) => f.endsWith(".js"));
const langScript = `<style>.i18n-pending #app{visibility:hidden}</style>
    <script>(function(){var l="es";try{var q=new URLSearchParams(location.search).get("lang"),s=localStorage.getItem("lang");l=q==="en"||q==="es"?q:s==="en"||s==="es"?s:null}catch(e){}if(!l)l=(navigator.language||"es").toLowerCase().indexOf("es")===0?"es":"en";if(l!=="es"){document.documentElement.classList.add("i18n-pending");${
  enChunk ? `var p=document.createElement("link");p.rel="modulepreload";p.href="${enChunk}";document.head.appendChild(p);` : ""
}}})()</script>`;

// JS y CSS de los componentes que usó la ruta (p. ej. el chunk del blog y
// su CSS), para que lleguen con el HTML y no después.
const preloadLinks = (modules) => {
  const seen = new Set();
  const links = [];
  for (const id of modules) {
    for (const file of ssrManifest[id] || []) {
      if (seen.has(file) || template.includes(file)) continue;
      seen.add(file);
      if (file.endsWith(".js")) links.push(`<link rel="modulepreload" crossorigin href="${file}">`);
      else if (file.endsWith(".css")) links.push(`<link rel="stylesheet" crossorigin href="${file}">`);
    }
  }
  return links.join("\n    ");
};

const headTags = (meta) => {
  const tags = [
    `<title>${escapeAttr(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}">`,
    `<meta property="og:type" content="${meta.type}">`,
    `<meta property="og:site_name" content="Jared Garcia">`,
    `<meta property="og:locale" content="es_HN">`,
    `<meta property="og:locale:alternate" content="en_US">`,
    `<meta property="og:title" content="${escapeAttr(meta.title)}">`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}">`,
  ];
  if (meta.url) {
    tags.push(
      `<meta property="og:url" content="${meta.url}">`,
      `<link rel="canonical" href="${meta.url}">`
    );
  }
  if (meta.image) {
    tags.push(
      `<meta property="og:image" content="${meta.image}">`,
      `<meta name="twitter:image" content="${meta.image}">`
    );
    if (meta.image.endsWith("/og.png")) {
      tags.push(
        `<meta property="og:image:width" content="1200">`,
        `<meta property="og:image:height" content="630">`,
        `<meta property="og:image:alt" content="${escapeAttr(meta.title)}">`
      );
    }
  }
  if (meta.jsonLd) tags.push(`<script type="application/ld+json" id="ld-route">${inlineJson(meta.jsonLd)}</script>`);
  return tags.join("\n    ");
};

// Las metas genéricas del template se reemplazan por las de cada ruta.
const baseHead = template
  .replace(/\s*<title>[\s\S]*?<\/title>/, "")
  .replace(/\s*<!--\s*Open Graph[\s\S]*?-->/, "")
  .replace(/\s*<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"[\s\S]*?\/>/g, "");

if (/og:|twitter:|<title>/.test(baseHead.split("</head>")[0])) {
  throw new Error("[prerender] quedaron metas del template sin reemplazar: revisá index.html.");
}

const routes = listRoutes();
for (const url of routes) {
  const { html, meta, state, modules, teleports } = await render(url);
  const stateScript = Object.keys(state).length ? `<script>window.__SSR_STATE__=${inlineJson(state)}</script>` : "";
  const page = baseHead
    .replace(
      "</head>",
      `  ${headTags(meta)}\n    ${fontPreloads}\n    ${preloadLinks(modules)}\n    ${langScript}\n  </head>`
    )
    // Sin espacios entre <body> y los teleports: Vue los busca como primer hijo.
    .replace(/<body>\s*/, `<body>${teleports}`)
    .replace('<div id="app"></div>', `<div id="app" data-prerendered>${html}</div>${stateScript}`);

  const out = url === "/" ? path.join(dist, "index.html") : path.join(dist, `${url}.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page);
}

// SPA vacía para todo lo demás (404 y rutas que no se prerenderizan).
fs.writeFileSync(path.join(dist, "app.html"), template);
const redirects = path.join(dist, "_redirects");
fs.writeFileSync(redirects, fs.readFileSync(redirects, "utf8").replace("/index.html", "/app.html"));

console.log(`[prerender] ${routes.length} rutas → dist/`);
