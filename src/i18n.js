// i18n mínimo (ES/EN), sin dependencias: un ref con el idioma actual,
// t() para textos con interpolación ({name}) y tm() para mensajes que son
// listas u objetos. El idioma se elige así: ?lang=en|es en la URL →
// preferencia guardada → idioma del navegador (todo lo que no sea español
// abre en inglés, para que un reclutador de afuera lo vea en su idioma).
import { computed, ref } from "vue";
import es from "@/locales/es";

// El inglés (UI + contenido) es un chunk aparte: quien visita en español
// no lo descarga. loadLocale() lo trae antes de activar el idioma.
const messages = { es, en: null };
export const enContent = { data: null };
export const SUPPORTED = ["es", "en"];

const initial = () => {
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (SUPPORTED.includes(q)) {
      localStorage.setItem("lang", q);
      return q;
    }
    const saved = localStorage.getItem("lang");
    if (SUPPORTED.includes(saved)) return saved;
  } catch {
    // localStorage puede no estar disponible (modo privado, etc.)
  }
  return (navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en";
};

// Idioma pedido al arrancar; main.js llama a loadLocale() antes de montar.
export const initialLocale = typeof window === "undefined" ? "es" : initial();
export const locale = ref("es");

const lookup = (lang, path) =>
  path.split(".").reduce((node, key) => (node == null ? undefined : node[key]), messages[lang]);

export const tm = (path) => lookup(locale.value, path) ?? lookup("es", path);

export const t = (path, params) => {
  const msg = tm(path);
  if (typeof msg !== "string") return msg ?? path;
  return params ? msg.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`) : msg;
};

export const loadLocale = async (lang) => {
  if (lang === "en" && !messages.en) {
    const mod = await import("@/data/en/index");
    messages.en = mod.messages;
    enContent.data = mod;
  }
};

// persist: false en el arranque, para no guardar como preferencia lo que
// solo fue detección automática del navegador.
export const setLocale = async (lang, { persist = true } = {}) => {
  if (!SUPPORTED.includes(lang)) return;
  await loadLocale(lang);
  locale.value = lang;
  document.documentElement.lang = lang;
  if (!persist) return;
  try {
    localStorage.setItem("lang", lang);
  } catch {
    // ignore
  }
};


// Para componentes: const { t, tm, locale, isEn } = useI18n()
export const useI18n = () => ({ t, tm, locale, isEn: computed(() => locale.value === "en") });
