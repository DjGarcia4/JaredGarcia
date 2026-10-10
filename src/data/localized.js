// Contenido según el idioma activo. Español es la fuente; en inglés se
// aplican los overrides de src/data/en (por id). Usar desde componentes
// dentro de computed() para que reaccione al cambio de idioma.
import { enContent, locale } from "@/i18n";
import { projects } from "@/data/projects";
import { cases } from "@/data/cases";
import { certificates } from "@/data/certificates";
import { stack } from "@/data/stack";
import { current } from "@/data/experience";
import { profile } from "@/data/profile";
// En inglés, enContent.data ya está cargado (setLocale lo garantiza).
const isEn = () => locale.value === "en" && !!enContent.data;
const en = () => enContent.data;

export const getProjects = () =>
  isEn() ? projects.map((p) => ({ ...p, ...(en().projectsEn[p.id] || {}) })) : projects;

export const getCase = (id) => (isEn() ? en().casesEn[id] ?? cases[id] : cases[id]);

export const getCertificates = () =>
  isEn() ? certificates.map((c) => ({ ...c, ...(en().certificatesEn[c.id] || {}) })) : certificates;

export const getStack = () => (isEn() ? en().stackEn : stack);

export const getCurrent = () => (isEn() ? { ...current, ...en().currentEn } : current);

export const getProfile = () => (isEn() ? { ...profile, ...en().profileEn } : profile);
