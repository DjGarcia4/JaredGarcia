<template>
  <section class="container-content overflow-hidden py-20 md:py-28">
    <div
      class="reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
    >
      <div>
        <p class="eyebrow mb-3">
          <span class="h-px w-6 bg-accent-light"></span>
          Testimonios
        </p>
        <h2 class="text-3xl font-bold tracking-tight md:text-5xl">
          Lo que dicen de mi trabajo
        </h2>
      </div>

      <div class="flex gap-3">
        <button
          type="button"
          aria-label="Anterior"
          @click="scroll(-1)"
          class="link-icon"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
        </button>
        <button
          type="button"
          aria-label="Siguiente"
          @click="scroll(1)"
          class="link-icon"
        >
          <font-awesome-icon :icon="['fas', 'arrow-right']" />
        </button>
      </div>
    </div>

    <div
      ref="scroller"
      class="no-scrollbar reveal mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
    >
      <article
        v-for="review in reviews.reviewsCollection"
        :key="review.id"
        v-glow
        class="surface flex w-[300px] shrink-0 snap-start flex-col p-6 md:w-[360px]"
      >
        <font-awesome-icon
          :icon="['fas', 'quote-left']"
          class="text-2xl text-accent/40"
        />
        <p class="mt-4 flex-1 text-sm leading-relaxed text-white/70">
          {{ review.review }}
        </p>

        <div class="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
          <img
            :src="review.image"
            :alt="review.name"
            class="h-11 w-11 rounded-full border border-white/10 object-cover"
          />
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-white">
              {{ review.name }}
            </p>
            <p class="truncate text-xs text-white/45">{{ review.role }}</p>
          </div>
          <div class="ml-auto flex gap-0.5">
            <font-awesome-icon
              v-for="i in review.rating"
              :key="i"
              :icon="['fas', 'star']"
              class="text-xs text-accent-light"
            />
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useReviewsStore } from "@/stores/reviews";

const reviews = useReviewsStore();
const scroller = ref(null);

const scroll = (dir) => {
  scroller.value?.scrollBy({ left: dir * 360, behavior: "smooth" });
};
</script>
