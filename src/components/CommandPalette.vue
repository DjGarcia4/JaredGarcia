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
          aria-label="Buscar y navegar"
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
              placeholder="Buscar casos, secciones o acciones…"
              class="h-14 w-full bg-transparent text-[15px] text-white placeholder:text-white/50 focus:outline-none"
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
              Nada coincide con “{{ query }}”.
            </li>
          </ul>

          <div class="flex items-center gap-4 border-t border-white/[0.07] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
            <span><kbd>↑↓</kbd> moverse</span>
            <span><kbd>↵</kbd> abrir</span>
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
import { projects } from "@/data/projects";

const props = defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["close"]);

const router = useRouter();
const input = ref(null);
const query = ref("");
const activeIndex = ref(0);
let opener = null;

const section = (label, hash, icon = "hashtag", keywords = "") => ({
  group: "Secciones", label, keywords: `${hash.slice(1)} ${keywords}`, icon: ["fas", icon],
  run: () => router.push({ name: "home", hash }),
});

const items = [
  ...projects
    .filter((p) => p.status !== "Práctica")
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      group: "Casos",
      label: p.title,
      hint: p.category,
      keywords: (p.tags || []).join(" "),
      icon: ["fas", "briefcase"],
      run: () => router.push({ name: "project", params: { slug: p.slug } }),
    })),
  section("Trabajo", "#trabajo"),
  section("Cómo trabajo", "#proceso", "hashtag", "metodología"),
  section("Sobre mí", "#about", "hashtag", "bio formación experiencia"),
  section("Stack", "#stack", "hashtag", "tecnologías skills herramientas"),
  section("Contacto", "#contact", "paper-plane", "email whatsapp hablemos"),
  { group: "Secciones", label: "Sistema de diseño", keywords: "tokens design system componentes", icon: ["fas", "layer-group"], run: () => router.push({ name: "design-system" }) },
  { group: "Secciones", label: "Todos los proyectos", icon: ["fas", "folder-open"], run: () => router.push({ name: "projects" }) },
  {
    group: "Acciones", label: "Copiar email", hint: profile.email, icon: ["fas", "copy"],
    run: () => navigator.clipboard.writeText(profile.email).then(() => toast.success("Email copiado")),
  },
  { group: "Acciones", label: "Descargar CV", keywords: "curriculum resume", icon: ["fas", "file-arrow-down"], run: () => window.open(profile.cvUrl, "_blank", "noopener") },
  { group: "Acciones", label: "LinkedIn", icon: ["fab", "linkedin"], run: () => window.open(profile.socials.linkedin, "_blank", "noopener") },
  { group: "Acciones", label: "GitHub", icon: ["fab", "github"], run: () => window.open(profile.socials.github, "_blank", "noopener") },
  { group: "Acciones", label: "WhatsApp", icon: ["fab", "whatsapp"], run: () => window.open(profile.socials.whatsapp, "_blank", "noopener") },
];

// Búsqueda sin tildes ni mayúsculas.
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const results = computed(() => {
  const q = norm(query.value.trim());
  const list = q ? items.filter((i) => norm(`${i.label} ${i.hint ?? ""} ${i.group} ${i.keywords ?? ""}`).includes(q)) : items;
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
