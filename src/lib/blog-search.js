// Buscador del blog: sin tildes ni mayúsculas, todas las palabras tienen que
// aparecer (en cualquier campo) y el orden es por relevancia. El texto
// completo de los artículos (encabezados + cuerpo) llega aparte con
// loadSearchIndex(), recién cuando alguien empieza a buscar.
import { shallowRef } from "vue";

const LOADERS = {
  es: () => import("virtual:blog/search/es"),
  en: () => import("virtual:blog/search/en"),
};
const index = shallowRef(null);
const loaded = shallowRef([]);
const loading = new Map();

export const searchIndex = index;

// Carga el texto completo de los idiomas pedidos (el activo y, si hay
// artículos sin traducir en el listado, también el otro).
export const loadSearchIndex = (langs) =>
  Promise.all(
    langs.map((lang) => {
      if (!loading.has(lang) && LOADERS[lang]) {
        loading.set(
          lang,
          LOADERS[lang]().then((m) => {
            index.value = { ...index.value, ...m.index };
            loaded.value = [...loaded.value, lang];
          })
        );
      }
      return loading.get(lang);
    })
  );

export const isIndexReady = (langs) => langs.every((l) => loaded.value.includes(l));

const DIACRITICS = /[̀-ͯ]/g;
export const normalize = (s) => String(s ?? "").normalize("NFD").replace(DIACRITICS, "").toLowerCase();

export const terms = (q) => [...new Set(normalize(q).split(/[\s,]+/).filter((w) => w.length > 0))];

// Peso de cada campo; un acierto al inicio de una palabra suma el doble.
const WEIGHTS = { title: 12, tags: 7, project: 6, description: 4, headings: 3, body: 1 };

const fieldsOf = (post, projectTitle) => {
  const extra = index.value?.[`${post.lang}/${post.slug}`];
  return {
    title: normalize(post.title),
    tags: normalize(post.tags.join(" ")),
    project: normalize(`${projectTitle} ${post.projects.join(" ")}`),
    description: normalize(post.description),
    headings: normalize(extra?.h),
    body: normalize(extra?.b),
  };
};

const wordStart = (text, at) => at === 0 || /[^a-z0-9]/.test(text[at - 1]);

// Devuelve 0 si alguna palabra no aparece; si no, el puntaje.
export const scorePost = (post, words, projectTitle = "") => {
  if (!words.length) return 1;
  const f = fieldsOf(post, projectTitle);
  let total = 0;
  for (const w of words) {
    let best = 0;
    for (const [key, weight] of Object.entries(WEIGHTS)) {
      const text = f[key];
      const at = text.indexOf(w);
      if (at === -1) continue;
      let s = weight * (wordStart(text, at) ? 2 : 1);
      if (key === "body") s += Math.min(4, text.split(w).length - 2) * 0.5;
      best = Math.max(best, s);
    }
    if (!best) return 0;
    total += best;
  }
  return total;
};

// Texto normalizado con el índice original de cada carácter, para marcar
// coincidencias sin importar tildes.
const mapped = (text) => {
  let norm = "";
  const pos = [];
  for (let i = 0; i < text.length; i++) {
    const n = normalize(text[i]);
    for (let k = 0; k < n.length; k++) pos.push(i);
    norm += n;
  }
  return { norm, pos };
};

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// HTML seguro con las coincidencias envueltas en <mark>.
export const highlight = (text, words) => {
  text = String(text ?? "");
  if (!words.length || !text) return escapeHtml(text);
  const { norm, pos } = mapped(text);
  const ranges = [];
  for (const w of words) {
    for (let at = norm.indexOf(w); at !== -1; at = norm.indexOf(w, at + w.length)) {
      ranges.push([pos[at], pos[at + w.length - 1] + 1]);
    }
  }
  if (!ranges.length) return escapeHtml(text);
  ranges.sort((a, b) => a[0] - b[0]);
  let out = "";
  let last = 0;
  for (const [a, b] of ranges) {
    if (b <= last) continue;
    const start = Math.max(a, last);
    out += escapeHtml(text.slice(last, start)) + "<mark>" + escapeHtml(text.slice(start, b)) + "</mark>";
    last = b;
  }
  return out + escapeHtml(text.slice(last));
};

// Fragmento del cuerpo alrededor de la primera coincidencia, cuando la
// búsqueda no se ve ya en el título o el resumen.
export const snippetFor = (post, words, radius = 90) => {
  if (!words.length) return null;
  const seen = normalize(`${post.title} ${post.description}`);
  if (words.every((w) => seen.includes(w))) return null;
  const extra = index.value?.[`${post.lang}/${post.slug}`];
  for (const text of [extra?.h, extra?.b]) {
    if (!text) continue;
    const { norm, pos } = mapped(text);
    const hit = words.map((w) => norm.indexOf(w)).filter((i) => i !== -1).sort((a, b) => a - b)[0];
    if (hit === undefined) continue;
    const at = pos[hit];
    let start = Math.max(0, at - radius);
    let end = Math.min(text.length, at + radius * 1.6);
    if (start > 0) start = text.indexOf(" ", start) + 1 || start;
    if (end < text.length) end = text.lastIndexOf(" ", end) > at ? text.lastIndexOf(" ", end) : end;
    return (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
  }
  return null;
};
