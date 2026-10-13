<template>
  <div class="overflow-hidden">
    <Hero />

    <section id="trabajo" class="container-content scroll-mt-24 py-20 md:py-28">
      <TitleSection :eyebrow="t('home.workEyebrow')">{{ t("home.workTitle") }}</TitleSection>
      <FeaturedCases :projects="featured" />
      <div class="mt-20 flex justify-center">
        <RouterLink :to="{ name: 'projects' }" class="btn-ghost">
          {{ t("home.allProjects") }}
          <font-awesome-icon :icon="['fas', 'arrow-right']" />
        </RouterLink>
      </div>
    </section>

    <section id="proceso" class="container-content scroll-mt-24 py-20 md:py-28">
      <TitleSection :eyebrow="t('home.processEyebrow')">{{ t("home.processTitle") }}</TitleSection>
      <Process />
    </section>

    <section id="about" class="container-content scroll-mt-24 py-20 md:py-28">
      <TitleSection :eyebrow="t('home.aboutEyebrow')">{{ t("home.aboutTitle") }}</TitleSection>
      <About />
    </section>

    <section v-if="latestPosts.length" id="blog" class="container-content scroll-mt-24 py-20 md:py-28">
      <TitleSection :eyebrow="t('home.blogEyebrow')">{{ t("home.blogTitle") }}</TitleSection>
      <p class="-mt-4 mb-10 max-w-2xl text-lg leading-relaxed text-white/65">{{ t("home.blogLead") }}</p>
      <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="post in latestPosts" :key="post.slug">
          <PostCard :post="post" />
        </li>
      </ul>
      <div class="mt-12 flex justify-center">
        <RouterLink :to="{ name: 'blog' }" class="btn-ghost">
          {{ t("home.allPosts") }}
          <font-awesome-icon :icon="['fas', 'arrow-right']" />
        </RouterLink>
      </div>
    </section>

    <section id="stack" class="container-content scroll-mt-24 py-20 md:py-28">
      <TitleSection :eyebrow="t('home.stackEyebrow')">{{ t("home.stackTitle") }}</TitleSection>
      <Stack />
    </section>


    <section id="contact" class="container-content scroll-mt-24 py-20 md:py-28">
      <TitleSection :eyebrow="t('home.contactEyebrow')">{{ t("home.contactTitle") }}</TitleSection>
      <FormContact />
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

import Hero from "@/components/common/Hero.vue";
import TitleSection from "@/components/TitleSection.vue";
import FeaturedCases from "@/components/FeaturedCases.vue";
import Process from "@/components/Process.vue";
import About from "@/components/About.vue";
import Stack from "@/components/Stack.vue";
import FormContact from "@/components/FormContact.vue";
import PostCard from "@/components/blog/PostCard.vue";

import { useProjects } from "@/stores/projects";
import { getPosts } from "@/lib/blog";
import { t } from "@/i18n";

const projects = useProjects();

// Los 4 primeros con línea de valor (headline), por orden.
const featured = computed(() =>
  projects.projectsCollection.filter((p) => p.featured && p.headline).slice(0, 4)
);

// Los borradores solo existen en dev: en la home no.
const latestPosts = computed(() => getPosts().filter((p) => !p.draft).slice(0, 3));
</script>
