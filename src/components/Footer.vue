<template>
  <footer class="mt-24 border-t border-white/[0.06]">
    <div
      class="container-content flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p class="font-display text-lg font-semibold text-white">
          {{ profile.name }}
        </p>
        <p class="mt-1 text-sm text-white/45">
          {{ profile.roles.join(" & ") }}
        </p>
      </div>

      <div class="flex gap-3">
        <a
          :href="profile.socials.github"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          class="link-icon"
        >
          <font-awesome-icon :icon="['fab', 'github']" />
        </a>
        <a
          :href="profile.socials.linkedin"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          class="link-icon"
        >
          <font-awesome-icon :icon="['fab', 'linkedin']" />
        </a>
        <a
          :href="`mailto:${profile.email}`"
          aria-label="Email"
          class="link-icon"
        >
          <font-awesome-icon :icon="['fas', 'envelope']" />
        </a>
      </div>

      <p class="text-xs text-white/35">
        © {{ year }} {{ profile.name }} · Vue + Tailwind
      </p>
    </div>
  </footer>
</template>

<script setup>
import { profile } from "@/data/profile";

const year = new Date().getFullYear();
</script>
