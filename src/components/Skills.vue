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
import { gsap, prefersReducedMotion } from "@/lib/gsap";

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
    // IntersectionObserver nativo en vez de ScrollTrigger. Bypass total al
    // sistema de refresh que causaba interferencias con el pin de Services
    // arriba y el sticky stack de StackedProjects. Una vez que el grid entra,
    // observer.disconnect() — la animación corre independiente del scroll.
    // Sin filter blur (expensive + glitches en algunos browsers); solo
    // opacity + y + scale.
    const animate = (grid, opts) => {
      if (!grid?.children.length) return;
      const items = Array.from(grid.children);

      gsap.set(items, { opacity: 0, y: opts.y, scale: opts.scale });

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            gsap.to(items, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: opts.duration,
              stagger: opts.stagger,
              ease: "power3.out",
              overwrite: true,
              clearProps: "transform,opacity",
            });
            observer.disconnect();
          }
        },
        { threshold: 0.05, rootMargin: "0px 0px -5% 0px" }
      );

      observer.observe(grid);
    };

    animate(featuredGrid.value, {
      y: 28,
      scale: 0.97,
      duration: 0.55,
      stagger: 0.08,
    });

    animate(restGrid.value, {
      y: 16,
      scale: 0.95,
      duration: 0.4,
      stagger: 0.035,
    });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>
