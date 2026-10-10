<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[120] flex items-start justify-center bg-ink-950/75 px-4 pt-[12vh] backdrop-blur-sm"
        @mousedown.self="close"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="t('nav.search')"
          class="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-card"
          @keydown="onKeydown"
        >
          <div class="flex items-center gap-3 border-b border-white/[0.07] px-4">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="text-sm text-white/55" />
            <input
              ref="input"
              v-model="query"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              :aria-expanded="results.length > 0"
              aria-controls="cmdk-list"
              :aria-activedescendant="results.length ? `cmdk-${activeIndex}` : undefined"
              :placeholder="t('palette.placeholder')"
              class="h-14 w-full bg-transparent text-base text-white sm:text-[15px] placeholder:text-white/50 focus:outline-none"
              autocomplete="off"
              spellcheck="false"
            />
            <kbd class="hidden rounded-md border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white/55 sm:block">Esc</kbd>
          </div>

          <ul id="cmdk-list" role="listbox" class="max-h-[50vh] overflow-y-auto p-2">
            <template v-for="(group, gi) in grouped" :key="group.name">
              <li role="presentation" class="px-3 pb-1.5 pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/50" :class="gi === 0 ? 'pt-1.5' : ''">
                {{ group.name }}
              </li>
              <li
                v-for="item in group.items"
                :id="`cmdk-${item.index}`"
                :key="item.label"
                role="option"
                :aria-selected="item.index === activeIndex"
                class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
                :class="item.index === activeIndex ? 'bg-accent/15 text-white' : 'text-white/75'"
                @mousemove="activeIndex = item.index"
                @click="run(item)"
              >
                <font-awesome-icon :icon="item.icon" class="w-4 text-xs" :class="item.index === activeIndex ? 'text-accent-light' : 'text-white/50'" />
                <span class="flex-1 truncate">{{ item.label }}</span>
                <span v-if="item.hint" class="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">{{ item.hint }}</span>
              </li>
            </template>
            <li v-if="!results.length" role="presentation" class="px-3 py-8 text-center text-sm text-white/55">
              {{ t("palette.empty", { q: query }) }}
            </li>
          </ul>

          <div class="flex items-center gap-4 border-t border-white/[0.07] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
            <span><kbd>↑↓</kbd> {{ t("palette.move") }}</span>
            <span><kbd>↵</kbd> {{ t("palette.open") }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { profile } from "@/data/profile";
import { getProjects } from "@/data/localized";
import { t } from "@/i18n";

const props = defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["close"]);

const router = useRouter();
const input = ref(null);
const query = ref("");
const activeIndex = ref(0);
let opener = null;

// Las palabras clave mezclan español e inglés: se encuentra igual en
// cualquiera de los dos idiomas.
const section = (label, hash, icon = "hashtag", keywords = "") => ({
  group: t("palette.groups.sections"), label, keywords: `${hash.slice(1)} ${keywords}`, icon: ["fas", icon],
  run: () => router.push({ name: "home", hash }),
});

const items = computed(() => [
  ...getProjects()
    .filter((p) => p.status !== "Práctica")
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      group: t("palette.groups.cases"),
      label: p.title,
      hint: p.category,
      keywords: (p.tags || []).join(" "),
      icon: ["fas", "briefcase"],
      run: () => router.push({ name: "project", params: { slug: p.slug } }),
    })),
  section(t("nav.work"), "#trabajo", "hashtag", "trabajo work casos cases"),
  section(t("palette.workHow"), "#proceso", "hashtag", "proceso process metodología"),
  section(t("nav.about"), "#about", "hashtag", "sobre mí about bio formación education experiencia"),
  section(t("nav.stack"), "#stack", "hashtag", "tecnologías technologies skills herramientas tools"),
  section(t("nav.contact"), "#contact", "paper-plane", "contacto contact email whatsapp hablemos"),
  { group: t("palette.groups.sections"), label: t("nav.designSystem"), keywords: "tokens design system sistema componentes components", icon: ["fas", "layer-group"], run: () => router.push({ name: "design-system" }) },
  { group: t("palette.groups.sections"), label: t("nav.lab"), keywords: "lab experimentos experiments microinteracciones micro-interactions", icon: ["fas", "bolt"], run: () => router.push({ name: "lab" }) },
  { group: t("palette.groups.sections"), label: t("palette.allProjects"), keywords: "proyectos projects", icon: ["fas", "folder-open"], run: () => router.push({ name: "projects" }) },
  {
    group: t("palette.groups.actions"), label: t("palette.copyEmail"), hint: profile.email, icon: ["fas", "copy"],
    run: () => navigator.clipboard.writeText(profile.email).then(() => toast.success(t("palette.copied"))),
  },
  { group: t("palette.groups.actions"), label: t("common.downloadCv"), keywords: "cv curriculum resume", icon: ["fas", "file-arrow-down"], run: () => window.open(profile.cvUrl, "_blank", "noopener") },
  { group: t("palette.groups.actions"), label: "LinkedIn", icon: ["fab", "linkedin"], run: () => window.open(profile.socials.linkedin, "_blank", "noopener") },
  { group: t("palette.groups.actions"), label: "GitHub", icon: ["fab", "github"], run: () => window.open(profile.socials.github, "_blank", "noopener") },
  { group: t("palette.groups.actions"), label: "WhatsApp", icon: ["fab", "whatsapp"], run: () => window.open(profile.socials.whatsapp, "_blank", "noopener") },
]);

// Búsqueda sin tildes ni mayúsculas.
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const results = computed(() => {
  const q = norm(query.value.trim());
  const list = q ? items.value.filter((i) => norm(`${i.label} ${i.hint ?? ""} ${i.group} ${i.keywords ?? ""}`).includes(q)) : items.value;
  return list.map((item, index) => ({ ...item, index }));
});

const grouped = computed(() => {
  const groups = [];
  results.value.forEach((item) => {
    let g = groups.find((x) => x.name === item.group);
    if (!g) groups.push((g = { name: item.group, items: [] }));
    g.items.push(item);
  });
  return groups;
});

watch(query, () => (activeIndex.value = 0));

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      opener = document.activeElement;
      query.value = "";
      activeIndex.value = 0;
      document.documentElement.style.overflow = "hidden";
      nextTick(() => input.value?.focus());
    } else {
      document.documentElement.style.overflow = "";
      opener?.focus?.();
    }
  },
  // La primera vez el componente se monta ya abierto (carga diferida).
  { immediate: true }
);

const close = () => emit("close");

const run = (item) => {
  close();
  nextTick(() => item.run());
};

const scrollActive = () =>
  nextTick(() => document.getElementById(`cmdk-${activeIndex.value}`)?.scrollIntoView({ block: "nearest" }));

const onKeydown = (e) => {
  const n = results.value.length;
  if (e.key === "Escape") {
    e.preventDefault();
    close();
  } else if (e.key === "ArrowDown" && n) {
    e.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % n;
    scrollActive();
  } else if (e.key === "ArrowUp" && n) {
    e.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + n) % n;
    scrollActive();
  } else if (e.key === "Enter" && n) {
    e.preventDefault();
    run(results.value[activeIndex.value]);
  } else if (e.key === "Tab") {
    // El foco se queda en el input: la lista se recorre con flechas.
    e.preventDefault();
  }
};
</script>
