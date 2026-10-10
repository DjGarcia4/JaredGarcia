<template>
  <div ref="root" class="grid gap-5 lg:grid-cols-3">
    <section
      v-for="col in stack"
      :key="col.group"
      class="stack-col surface p-7"
      :aria-labelledby="`stack-${slug(col.group)}`"
    >
      <h3 :id="`stack-${slug(col.group)}`" class="text-xl font-bold">{{ col.group }}</h3>
      <p class="mt-2 text-sm leading-relaxed text-white/60">{{ col.summary }}</p>
      <ul class="mt-6 flex flex-wrap gap-2">
        <li
          v-for="item in col.items"
          :key="item.name"
          class="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/80"
        >
          <img
            v-if="item.icon"
            :src="`/img/skills/${item.icon}.svg`"
            alt=""
            width="16"
            height="16"
            loading="lazy"
            class="h-4 w-4"
          />
          {{ item.name }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { getStack } from "@/data/localized";
import { gsap, playOnEnter, prefersReducedMotion } from "@/lib/gsap";

const stack = computed(() => getStack());

const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[^\w]+/g, "-");

const root = ref(null);
let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;
  ctx = gsap.context(() => {
    const tl = gsap.timeline({ paused: true });
    tl.from(".stack-col", { opacity: 0, y: 24, duration: 0.6, stagger: 0.1, ease: "power3.out" });
    playOnEnter(tl, { trigger: root.value, start: "top 82%" });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>
