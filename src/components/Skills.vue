<template>
  <section ref="root" class="container-content py-20 md:py-28">
    <TitleSection eyebrow="Stack">
      Tecnologías que domino
    </TitleSection>

    <!-- Featured: top 3 más usadas (bento) -->
    <div
      v-if="featured.length"
      ref="featuredGrid"
      class="grid gap-4 sm:gap-5 lg:grid-cols-3"
    >
      <FeaturedSkill
        v-for="(skill, i) in featured"
        :key="skill.name"
        :skill="skill"
        :rank="i + 1"
      />
    </div>

    <!-- Resto: grid uniforme -->
    <div
      v-if="rest.length"
      ref="restGrid"
      class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 sm:mt-5 md:grid-cols-6 md:gap-4"
    >
      <Skill v-for="skill in rest" :key="skill.name" :skill="skill" />
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import TitleSection from "@/components/TitleSection.vue";
import Skill from "@/components/Skill.vue";
import FeaturedSkill from "@/components/FeaturedSkill.vue";
import { skills } from "@/data/skills";
import { projects } from "@/data/projects";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

// Calcular uso real desde projects.techStack y partir en featured (top 3) + resto.
const skillsWithUsage = computed(() => {
  return skills
    .map((s) => ({
      ...s,
      usage: projects.filter((p) => (p.techStack || []).includes(s.image))
        .length,
    }))
    .sort((a, b) => b.usage - a.usage);
});

const featured = computed(() => skillsWithUsage.value.slice(0, 3));
const rest = computed(() =>
  // El resto va ordenado alfabéticamente para que no parezca un ranking continuo.
  skillsWithUsage.value.slice(3).sort((a, b) => a.name.localeCompare(b.name))
);

const root = ref(null);
const featuredGrid = ref(null);
const restGrid = ref(null);

let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    // Featured: stagger más amplio (entrada protagonista).
    if (featuredGrid.value?.children.length) {
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.out" },
      });
      tl.from(featuredGrid.value.children, {
        opacity: 0,
        y: 50,
        scale: 0.95,
        filter: "blur(8px)",
        duration: 0.95,
        stagger: 0.15,
      });
      ScrollTrigger.create({
        trigger: featuredGrid.value,
        start: "top 82%",
        onEnter: () => tl.restart(),
        onEnterBack: () => tl.restart(),
      });
    }

    // Resto: stagger fino (entrada de soporte).
    if (restGrid.value?.children.length) {
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.out" },
      });
      tl.from(restGrid.value.children, {
        opacity: 0,
        y: 24,
        scale: 0.92,
        filter: "blur(4px)",
        duration: 0.6,
        stagger: 0.035,
      });
      ScrollTrigger.create({
        trigger: restGrid.value,
        start: "top 88%",
        onEnter: () => tl.restart(),
        onEnterBack: () => tl.restart(),
      });
    }
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>
