<template>
  <!-- Forzamos remount al cambiar de project (slug) para que las
       animaciones GSAP corran de nuevo. -->
  <div :key="project?.slug || 'not-found'">
    <div
      v-if="project"
      ref="root"
      class="container-content max-w-content py-12 md:py-16 lg:py-20"
    >
      <!-- Top bar: back + contador editorial -->
      <div
        class="mb-10 flex items-center justify-between gap-4 md:mb-14"
      >
        <button
          type="button"
          @click="router.back()"
          class="group inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-accent-light"
        >
          <font-awesome-icon
            :icon="['fas', 'arrow-left']"
            class="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Volver
        </button>

        <p
          class="hidden font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white/35 md:flex md:items-center md:gap-3"
        >
          <span>Proyecto</span>
          <span class="h-px w-6 bg-white/15"></span>
          <span class="text-white/70">
            {{ String(currentNumber).padStart(2, "0") }}
          </span>
          <span class="text-white/35">/</span>
          <span>{{ String(totalCount).padStart(2, "0") }}</span>
        </p>
      </div>

      <!-- Hero layout: meta sidebar + main -->
      <div class="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
        <!-- Sidebar (sticky en desktop) -->
        <aside class="meta-sidebar lg:sticky lg:top-28 lg:self-start">
          <!-- Número editorial gigante decorativo -->
          <div class="proj-number-wrap overflow-hidden">
            <p
              class="proj-number block font-display text-[88px] font-bold leading-[0.85] tracking-tight text-white/[0.06] md:text-[120px]"
            >
              {{ String(currentNumber).padStart(2, "0") }}
            </p>
          </div>

          <!-- Hairline accent -->
          <div class="meta-item mt-8 h-px w-12 bg-accent"></div>

          <!-- Meta list editorial -->
          <dl class="mt-8 space-y-6">
            <div class="meta-item">
              <dt
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                Cliente
              </dt>
              <dd class="mt-2 flex items-center gap-2.5 text-white">
                <font-awesome-icon
                  :icon="['fas', 'briefcase']"
                  class="text-sm text-accent-light"
                />
                <span class="text-base font-semibold">
                  {{ project.team || "Proyecto propio" }}
                </span>
              </dd>
            </div>

            <div class="meta-item">
              <dt
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                Rol
              </dt>
              <dd class="mt-2 flex items-center gap-2.5 text-white/85">
                <font-awesome-icon
                  :icon="['fas', 'user-gear']"
                  class="text-sm text-white/40"
                />
                <span class="text-sm">{{ project.role }}</span>
              </dd>
            </div>

            <div class="meta-item">
              <dt
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                Año
              </dt>
              <dd class="mt-2 font-display text-2xl font-bold text-white">
                {{ project.year }}
              </dd>
            </div>

            <div v-if="project.status" class="meta-item">
              <dt
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                Estado
              </dt>
              <dd class="mt-2">
                <span
                  class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                  :class="statusStyle(project.status)"
                >
                  <span class="relative flex h-1.5 w-1.5">
                    <span
                      class="absolute inline-flex h-full w-full animate-glow-pulse rounded-full bg-current opacity-75"
                    ></span>
                    <span
                      class="relative inline-flex h-1.5 w-1.5 rounded-full bg-current"
                    ></span>
                  </span>
                  {{ project.status }}
                </span>
              </dd>
            </div>

            <div v-if="project.duration" class="meta-item">
              <dt
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                Duración
              </dt>
              <dd class="mt-2 flex items-center gap-2.5 text-white/85">
                <font-awesome-icon
                  :icon="['fas', 'clock']"
                  class="text-sm text-white/40"
                />
                <span class="text-sm">{{ project.duration }}</span>
              </dd>
            </div>

            <div class="meta-item">
              <dt
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                Categoría
              </dt>
              <dd class="mt-2 text-sm text-white/75">
                {{ project.category }}
              </dd>
            </div>
          </dl>

          <!-- Mini hairline + CTA -->
          <div class="meta-item mt-8 h-px w-12 bg-white/15"></div>

          <RouterLink
            :to="{ name: 'home', hash: '#contact' }"
            class="meta-item mt-6 inline-flex items-center gap-2 text-sm text-white/65 transition-colors duration-300 hover:text-accent-light"
          >
            Hablemos sobre esto
            <font-awesome-icon
              :icon="['fas', 'arrow-right']"
              class="text-[11px] transition-transform duration-300 group-hover:translate-x-1"
            />
          </RouterLink>
        </aside>

        <!-- Main content -->
        <div class="main-content">
          <!-- Eyebrow -->
          <p
            class="proj-eyebrow flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
          >
            <span class="h-px w-8 bg-accent"></span>
            {{ project.category }} · Caso completo
          </p>

          <!-- Title con clipPath reveal -->
          <div class="proj-title-wrap mt-5 overflow-hidden md:mt-6">
            <h1
              class="proj-title font-display text-4xl font-bold leading-[1.02] tracking-tight text-white md:text-[56px] lg:text-[64px]"
            >
              {{ project.title }}
            </h1>
          </div>

          <!-- Decorative meta strip bajo el título -->
          <div
            class="proj-strip mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/55 md:mt-10"
          >
            <span class="flex items-center gap-2">
              <font-awesome-icon
                :icon="['fas', 'briefcase']"
                class="text-xs text-white/35"
              />
              {{ project.team || "Proyecto propio" }}
            </span>
            <span class="hidden h-px w-6 bg-white/15 sm:block"></span>
            <span class="flex items-center gap-2">
              <font-awesome-icon
                :icon="['fas', 'calendar']"
                class="text-xs text-white/35"
              />
              {{ project.year }}
            </span>
            <span
              v-if="project.status"
              class="hidden h-px w-6 bg-white/15 sm:block"
            ></span>
            <span
              v-if="project.status"
              class="flex items-center gap-2 font-semibold text-accent-light"
            >
              <span
                class="h-1.5 w-1.5 animate-glow-pulse rounded-full bg-accent"
              ></span>
              {{ project.status }}
            </span>
            <span
              v-if="project.featured"
              class="hidden h-px w-6 bg-white/15 sm:block"
            ></span>
            <span
              v-if="project.featured"
              class="flex items-center gap-2 text-accent-light"
            >
              <font-awesome-icon :icon="['fas', 'star']" class="text-xs" />
              Destacado
            </span>
          </div>

          <!-- Summary (lead, antes de la cover) -->
          <p
            class="proj-summary mt-10 max-w-2xl text-lg leading-[1.6] text-white/70 md:mt-12 md:text-xl"
          >
            {{ project.summary }}
          </p>

          <!-- Cover image / fallback editorial -->
          <div
            ref="coverWrap"
            class="proj-cover relative mt-12 overflow-hidden rounded-3xl border border-white/[0.08] md:mt-16"
          >
            <img
              v-if="project.images?.cover"
              :src="project.images.cover"
              :alt="project.title"
              class="aspect-video w-full object-cover"
            />
            <div
              v-else
              class="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-gradient-to-br from-ink-900 via-ink-850 to-ink-900"
            >
              <!-- Glow ambient para el fallback -->
              <div
                class="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-accent/[0.15] blur-3xl"
              ></div>
              <div
                class="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-accent/[0.08] blur-3xl"
              ></div>
              <!-- Grid pattern decorativo -->
              <div
                class="pointer-events-none absolute inset-0 opacity-[0.04]"
                style="
                  background-image:
                    linear-gradient(to right, white 1px, transparent 1px),
                    linear-gradient(to bottom, white 1px, transparent 1px);
                  background-size: 48px 48px;
                "
              ></div>
              <div class="relative px-6 text-center">
                <p
                  class="flex items-center justify-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-accent-light"
                >
                  <span class="h-px w-6 bg-accent"></span>
                  Visual preview
                  <span class="h-px w-6 bg-accent"></span>
                </p>
                <p
                  class="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white/30 md:text-5xl"
                >
                  {{ project.title }}
                </p>
              </div>
            </div>
          </div>

          <!-- Description con drop cap editorial -->
          <section ref="aboutSection" class="proj-description mt-16 md:mt-20">
            <p
              class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
            >
              <span class="h-px w-8 bg-accent"></span>
              Sobre el proyecto
            </p>
            <p
              class="proj-description-text mt-6 max-w-3xl text-base leading-[1.8] text-white/75 md:text-lg"
            >
              {{ project.description }}
            </p>
          </section>

          <!-- Stack técnico -->
          <section
            v-if="project.techStack?.length"
            ref="stackSection"
            class="mt-16 md:mt-20"
          >
            <header class="mb-6 flex items-center justify-between gap-4">
              <p
                class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
              >
                <span class="h-px w-8 bg-accent"></span>
                Stack técnico
              </p>
              <span
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/35"
              >
                {{ project.techStack.length }}
                {{ project.techStack.length === 1 ? "tech" : "techs" }}
              </span>
            </header>

            <ul class="tech-grid grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              <li
                v-for="tech in project.techStack"
                :key="tech"
                class="tech-card group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 transition-all duration-300 hover:border-accent/30 hover:bg-accent/[0.04]"
              >
                <span
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] transition-all duration-300 group-hover:scale-110 group-hover:border-accent/30"
                >
                  <img
                    :src="`/img/skills/${tech}.svg`"
                    :alt="tech"
                    class="h-4 w-4"
                  />
                </span>
                <span
                  class="text-sm font-medium capitalize text-white/80 transition-colors duration-300 group-hover:text-white"
                >
                  {{ tech }}
                </span>
              </li>
            </ul>
          </section>

          <!-- Funcionalidades destacadas -->
          <section
            v-if="project.features?.length"
            ref="featuresSection"
            class="mt-16 md:mt-20"
          >
            <header class="mb-6 flex items-center justify-between gap-4">
              <p
                class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
              >
                <span class="h-px w-8 bg-accent"></span>
                Funcionalidades destacadas
              </p>
              <span
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/35"
              >
                {{ String(project.features.length).padStart(2, "0") }} items
              </span>
            </header>

            <ul class="features-grid grid gap-3 sm:grid-cols-2">
              <li
                v-for="(feature, i) in project.features"
                :key="i"
                class="feature-card group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-300 hover:border-accent/30 hover:bg-accent/[0.03] md:p-6"
              >
                <span
                  class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 transition-colors duration-300 group-hover:text-accent-light"
                >
                  {{ String(i + 1).padStart(2, "0") }}
                </span>
                <p
                  class="text-sm leading-relaxed text-white/75 transition-colors duration-300 group-hover:text-white md:text-base"
                >
                  {{ feature }}
                </p>
              </li>
            </ul>
          </section>

          <!-- Gallery: capturas adicionales del producto -->
          <section
            v-if="project.images?.gallery?.length"
            ref="gallerySection"
            class="mt-16 md:mt-24"
          >
            <header class="mb-8 flex items-center justify-between gap-4 md:mb-10">
              <p
                class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
              >
                <span class="h-px w-8 bg-accent"></span>
                Pantallas
              </p>
              <span
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/35"
              >
                {{ String(project.images.gallery.length).padStart(2, "0") }}
                {{ project.images.gallery.length === 1 ? "vista" : "vistas" }}
                · Click para ampliar
              </span>
            </header>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <figure
                v-for="(img, i) in project.images.gallery"
                :key="img"
                :class="[
                  'gallery-item group relative cursor-zoom-in overflow-hidden rounded-3xl border border-white/[0.08] transition-all duration-500 hover:border-accent/30',
                  galleryItemSpan(i, project.images.gallery.length),
                ]"
                @click="openLightbox(i)"
              >
                <img
                  :src="img"
                  :alt="`${project.title} — vista ${i + 1}`"
                  loading="lazy"
                  class="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <!-- Hover overlay con icono -->
                <div
                  class="pointer-events-none absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/55 via-black/10 to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:p-6"
                >
                  <span
                    class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/85"
                  >
                    Vista {{ String(i + 1).padStart(2, "0") }}
                  </span>
                  <span
                    class="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md"
                  >
                    <font-awesome-icon
                      :icon="['fas', 'up-right-and-down-left-from-center']"
                      class="text-[11px]"
                    />
                  </span>
                </div>
              </figure>
            </div>
          </section>

          <!-- Vista móvil: mockup centrado con ambient glow -->
          <section
            v-if="project.images?.mobile"
            ref="mobileSection"
            class="mt-16 md:mt-24"
          >
            <header class="mb-10 flex items-center justify-between gap-4">
              <p
                class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
              >
                <span class="h-px w-8 bg-accent"></span>
                Vista móvil
              </p>
            </header>

            <div
              class="relative flex justify-center overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-ink-900 via-ink-850 to-ink-900 py-14 md:py-20"
            >
              <!-- Ambient glow + grid -->
              <div
                class="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/[0.10] blur-3xl"
              ></div>
              <div
                class="pointer-events-none absolute -bottom-24 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-accent/[0.05] blur-3xl"
              ></div>
              <div
                class="pointer-events-none absolute inset-0 opacity-[0.04]"
                style="
                  background-image:
                    linear-gradient(to right, white 1px, transparent 1px),
                    linear-gradient(to bottom, white 1px, transparent 1px);
                  background-size: 48px 48px;
                "
              ></div>

              <div
                ref="mobileFrame"
                class="mobile-frame relative w-[260px] overflow-hidden rounded-[2.25rem] border border-white/[0.12] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.55)] md:w-[300px]"
              >
                <img
                  :src="project.images.mobile"
                  :alt="`${project.title} — vista móvil`"
                  loading="lazy"
                  class="block w-full"
                />
              </div>
            </div>
          </section>

          <!-- Tags -->
          <section
            v-if="project.tags?.length"
            ref="tagsSection"
            class="mt-14 md:mt-16"
          >
            <p
              class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
            >
              <span class="h-px w-8 bg-accent"></span>
              Tags
            </p>
            <div class="mt-5 flex flex-wrap gap-x-4 gap-y-2">
              <span
                v-for="tag in project.tags"
                :key="tag"
                class="tag-item font-mono text-sm text-white/40 transition-colors duration-300 hover:text-accent-light"
              >
                #{{ tag }}
              </span>
            </div>
          </section>

          <!-- Enlaces externos -->
          <section
            v-if="project.liveUrl || project.repoUrl"
            ref="linksSection"
            class="mt-14 border-t border-white/[0.06] pt-10 md:mt-16"
          >
            <p
              class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
            >
              <span class="h-px w-8 bg-accent"></span>
              Enlaces
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
              <a
                v-if="project.liveUrl"
                :href="project.liveUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary"
              >
                Ver sitio en vivo
                <font-awesome-icon
                  :icon="['fas', 'arrow-up-right-from-square']"
                />
              </a>
              <a
                v-if="project.repoUrl"
                :href="project.repoUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-ghost"
              >
                <font-awesome-icon :icon="['fab', 'github']" />
                Ver código
              </a>
            </div>
          </section>

          <!-- CTA section -->
          <section ref="ctaSection" class="proj-cta mt-16 md:mt-24">
            <div
              class="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-ink-900 via-ink-900 to-ink-850 p-8 md:p-14"
            >
              <!-- Glow ambient -->
              <div
                class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/[0.12] blur-3xl"
              ></div>
              <div
                class="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/[0.06] blur-3xl"
              ></div>

              <div class="relative">
                <p
                  class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
                >
                  <span class="h-px w-8 bg-accent"></span>
                  Próximo paso
                </p>
                <h2
                  class="mt-5 font-display text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl lg:text-[36px]"
                >
                  ¿Querés algo así para tu producto?
                </h2>
                <p
                  class="mt-4 max-w-xl text-base leading-relaxed text-white/65 md:text-lg"
                >
                  Hablemos sobre cómo puedo ayudarte a llevar tu idea a
                  producción con la misma calidad y stack que ves acá.
                </p>

                <div class="mt-9 flex flex-wrap items-center gap-3">
                  <RouterLink
                    :to="{ name: 'home', hash: '#contact' }"
                    class="btn-primary"
                  >
                    Hablemos
                    <font-awesome-icon :icon="['fas', 'arrow-right']" />
                  </RouterLink>
                  <RouterLink :to="{ name: 'projects' }" class="btn-ghost">
                    Ver más proyectos
                  </RouterLink>
                </div>
              </div>
            </div>
          </section>

          <!-- Nav prev/next -->
          <nav
            v-if="prevProject || nextProject"
            ref="navSection"
            class="proj-nav mt-12 grid gap-3 sm:grid-cols-2 md:mt-16"
          >
            <RouterLink
              v-if="prevProject"
              :to="`/project/${prevProject.slug}`"
              class="nav-link group flex flex-col gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.04]"
            >
              <p
                class="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                <font-awesome-icon
                  :icon="['fas', 'arrow-left']"
                  class="text-[9px] transition-transform duration-300 group-hover:-translate-x-1"
                />
                Anterior
              </p>
              <p
                class="font-display text-sm font-semibold leading-snug text-white/80 transition-colors duration-300 group-hover:text-accent-light md:text-base"
              >
                {{ prevProject.title }}
              </p>
            </RouterLink>
            <div v-else></div>

            <RouterLink
              v-if="nextProject"
              :to="`/project/${nextProject.slug}`"
              class="nav-link group flex flex-col gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.04] sm:items-end sm:text-right"
            >
              <p
                class="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                Siguiente
                <font-awesome-icon
                  :icon="['fas', 'arrow-right']"
                  class="text-[9px] transition-transform duration-300 group-hover:translate-x-1"
                />
              </p>
              <p
                class="font-display text-sm font-semibold leading-snug text-white/80 transition-colors duration-300 group-hover:text-accent-light md:text-base"
              >
                {{ nextProject.title }}
              </p>
            </RouterLink>
          </nav>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div
      v-else
      class="container-content flex flex-col items-center gap-4 py-32 text-center"
    >
      <font-awesome-icon
        :icon="['fas', 'folder-open']"
        class="text-4xl text-white/20"
      />
      <p class="text-white/55">No se encontró el proyecto.</p>
      <RouterLink :to="{ name: 'projects' }" class="btn-ghost">
        Volver a proyectos
      </RouterLink>
    </div>

    <!-- ─── LIGHTBOX (gallery viewer + carousel) ─────────────────────── -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxOpen && project?.images?.gallery?.length"
          class="lightbox fixed inset-0 z-[100] flex flex-col bg-black/85 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          @click.self="closeLightbox"
        >
          <!-- Top bar: counter + close -->
          <div
            class="flex items-center justify-between px-5 py-5 md:px-10 md:py-7"
          >
            <p
              class="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white/65"
            >
              <span class="text-accent-light">
                {{ String(lightboxIndex + 1).padStart(2, "0") }}
              </span>
              <span class="mx-2 text-white/25">/</span>
              <span>
                {{
                  String(project.images.gallery.length).padStart(2, "0")
                }}
              </span>
              <span class="ml-3 hidden text-white/35 sm:inline">
                · {{ project.title }}
              </span>
            </p>
            <button
              type="button"
              @click="closeLightbox"
              aria-label="Cerrar"
              class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/80 transition-all duration-300 hover:border-accent/50 hover:bg-accent/10 hover:text-accent-light"
            >
              <font-awesome-icon
                :icon="['fas', 'xmark']"
                class="text-base transition-transform duration-300 group-hover:rotate-90"
              />
            </button>
          </div>

          <!-- Main viewer -->
          <div
            class="relative flex flex-1 items-center justify-center px-5 pb-2 md:px-10"
            @click.self="closeLightbox"
          >
            <!-- Prev button -->
            <button
              v-if="project.images.gallery.length > 1"
              type="button"
              @click.stop="prevImage"
              aria-label="Anterior"
              class="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-all duration-300 hover:border-accent/50 hover:bg-accent/10 hover:text-accent-light md:left-8 md:h-12 md:w-12"
            >
              <font-awesome-icon
                :icon="['fas', 'chevron-left']"
                class="text-sm md:text-base"
              />
            </button>

            <!-- Image -->
            <Transition name="lightbox-image" mode="out-in">
              <img
                :key="project.images.gallery[lightboxIndex]"
                :src="project.images.gallery[lightboxIndex]"
                :alt="`${project.title} — vista ${lightboxIndex + 1}`"
                class="max-h-full max-w-full rounded-2xl border border-white/[0.08] object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
                style="max-height: calc(100vh - 240px)"
                @click.stop
              />
            </Transition>

            <!-- Next button -->
            <button
              v-if="project.images.gallery.length > 1"
              type="button"
              @click.stop="nextImage"
              aria-label="Siguiente"
              class="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-all duration-300 hover:border-accent/50 hover:bg-accent/10 hover:text-accent-light md:right-8 md:h-12 md:w-12"
            >
              <font-awesome-icon
                :icon="['fas', 'chevron-right']"
                class="text-sm md:text-base"
              />
            </button>
          </div>

          <!-- Thumbnails carousel -->
          <div
            v-if="project.images.gallery.length > 1"
            class="overflow-x-auto px-5 py-5 md:px-10 md:py-6"
          >
            <div class="mx-auto flex w-fit max-w-full gap-3">
              <button
                v-for="(img, i) in project.images.gallery"
                :key="img"
                type="button"
                @click.stop="lightboxIndex = i"
                :aria-label="`Ver vista ${i + 1}`"
                :class="[
                  'group relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border transition-all duration-300 md:h-20 md:w-36',
                  i === lightboxIndex
                    ? 'border-accent shadow-[0_0_0_3px_rgba(74,222,128,0.18)]'
                    : 'border-white/10 opacity-55 hover:border-white/30 hover:opacity-100',
                ]"
              >
                <img
                  :src="img"
                  :alt="`Thumbnail vista ${i + 1}`"
                  class="h-full w-full object-cover"
                />
                <span
                  v-if="i === lightboxIndex"
                  class="absolute inset-x-0 bottom-0 h-0.5 bg-accent"
                ></span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useProjects } from "@/stores/projects";
import { statusStyle } from "@/lib/status";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const route = useRoute();
const router = useRouter();
const projectsStore = useProjects();

const project = computed(() =>
  projectsStore.projectsCollection.find((p) => p.slug === route.params.slug)
);

const projectIndex = computed(() => {
  if (!project.value) return -1;
  return projectsStore.projectsCollection.findIndex(
    (p) => p.slug === project.value.slug
  );
});

const currentNumber = computed(() => projectIndex.value + 1);
const totalCount = computed(() => projectsStore.projectsCollection.length);

const prevProject = computed(() => {
  const i = projectIndex.value;
  return i > 0 ? projectsStore.projectsCollection[i - 1] : null;
});

const nextProject = computed(() => {
  const i = projectIndex.value;
  return i >= 0 && i < projectsStore.projectsCollection.length - 1
    ? projectsStore.projectsCollection[i + 1]
    : null;
});

const root = ref(null);
const coverWrap = ref(null);
const aboutSection = ref(null);
const stackSection = ref(null);
const featuresSection = ref(null);
const gallerySection = ref(null);
const mobileSection = ref(null);
const mobileFrame = ref(null);
const tagsSection = ref(null);
const linksSection = ref(null);
const ctaSection = ref(null);
const navSection = ref(null);

let ctx;

// ─── LIGHTBOX STATE ────────────────────────────────────────────────────
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

function galleryItemSpan(i, total) {
  // Asimetría editorial: con 3 items, la primera ocupa full-width.
  // Con 1 item, también full-width. Con 2 ó 4, grilla pareja.
  if (total === 1) return "md:col-span-2";
  if (total === 3 && i === 0) return "md:col-span-2";
  return "";
}

function openLightbox(i) {
  lightboxIndex.value = i;
  lightboxOpen.value = true;
}

function closeLightbox() {
  lightboxOpen.value = false;
}

function nextImage() {
  const total = project.value?.images?.gallery?.length || 0;
  if (!total) return;
  lightboxIndex.value = (lightboxIndex.value + 1) % total;
}

function prevImage() {
  const total = project.value?.images?.gallery?.length || 0;
  if (!total) return;
  lightboxIndex.value = (lightboxIndex.value - 1 + total) % total;
}

function onKeydown(e) {
  if (!lightboxOpen.value) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowRight") nextImage();
  else if (e.key === "ArrowLeft") prevImage();
}

// Body scroll lock cuando el lightbox está abierto
watch(lightboxOpen, (open) => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = open ? "hidden" : "";
});

onMounted(() => {
  // Listener global de teclado para el lightbox (siempre activo)
  window.addEventListener("keydown", onKeydown);

  if (!project.value) return;
  // Scroll to top en cada nuevo proyecto (por si el router no lo hace)
  window.scrollTo({ top: 0, behavior: "instant" });

  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    // ── HERO ENTRANCE (al mount, no scroll-trigger) ────────────────────
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Número editorial decorativo: sube desde abajo como el wordmark del Hero
    tl.from(
      ".proj-number",
      {
        yPercent: 110,
        duration: 0.85,
        ease: "expo.out",
      },
      0
    );

    // Sidebar meta items: stagger desde la izquierda
    tl.from(
      ".meta-item",
      {
        opacity: 0,
        x: -16,
        duration: 0.55,
        stagger: 0.06,
        clearProps: "transform,opacity",
      },
      0.15
    );

    // Eyebrow del main
    tl.from(
      ".proj-eyebrow",
      {
        opacity: 0,
        x: -12,
        duration: 0.5,
        clearProps: "transform,opacity",
      },
      0.1
    );

    // Title con clipPath reveal
    tl.from(
      ".proj-title",
      {
        clipPath: "inset(100% 0 0 0)",
        yPercent: 6,
        duration: 0.9,
        ease: "expo.out",
      },
      0.15
    );

    // Strip meta debajo del título
    tl.from(
      ".proj-strip",
      {
        opacity: 0,
        y: 16,
        duration: 0.55,
        clearProps: "transform,opacity",
      },
      0.35
    );

    // Summary
    tl.from(
      ".proj-summary",
      {
        opacity: 0,
        y: 20,
        duration: 0.6,
        clearProps: "transform,opacity",
      },
      0.45
    );

    // Cover con scale + clip reveal
    if (coverWrap.value) {
      tl.from(
        coverWrap.value,
        {
          opacity: 0,
          y: 32,
          scale: 0.97,
          filter: "blur(6px)",
          duration: 0.85,
          clearProps: "transform,opacity,filter",
        },
        0.55
      );
    }

    // ── ABOUT SECTION (al scroll) ─────────────────────────────────────
    if (aboutSection.value) {
      gsap.set(aboutSection.value, { opacity: 0, y: 24 });

      const obs = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          gsap.to(aboutSection.value, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            clearProps: "transform,opacity",
          });
          obs.disconnect();
        },
        { threshold: 0.1 }
      );

      obs.observe(aboutSection.value);
    }

    // ── TECH STACK GRID (al scroll) ───────────────────────────────────
    if (stackSection.value) {
      const cards = stackSection.value.querySelectorAll(".tech-card");
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 18, scale: 0.96 });

        const obs = new IntersectionObserver(
          (entries) => {
            if (!entries[0].isIntersecting) return;
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.45,
              stagger: 0.035,
              ease: "power3.out",
              clearProps: "transform,opacity",
            });
            obs.disconnect();
          },
          { threshold: 0.05, rootMargin: "0px 0px -5% 0px" }
        );

        obs.observe(stackSection.value);
      }
    }

    // ── FEATURES GRID (al scroll) ─────────────────────────────────────
    if (featuresSection.value) {
      const cards = featuresSection.value.querySelectorAll(".feature-card");
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 24, scale: 0.97 });

        const obs = new IntersectionObserver(
          (entries) => {
            if (!entries[0].isIntersecting) return;
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.55,
              stagger: 0.06,
              ease: "power3.out",
              clearProps: "transform,opacity",
            });
            obs.disconnect();
          },
          { threshold: 0.05, rootMargin: "0px 0px -5% 0px" }
        );

        obs.observe(featuresSection.value);
      }
    }

    // ── GALLERY (al scroll, clipPath + blur cinematográfico) ──────────
    if (gallerySection.value) {
      const items = gallerySection.value.querySelectorAll(".gallery-item");
      if (items.length) {
        gsap.set(items, {
          opacity: 0,
          y: 32,
          scale: 0.97,
          clipPath: "inset(8% 4% 8% 4%)",
          filter: "blur(8px)",
        });

        const obs = new IntersectionObserver(
          (entries) => {
            if (!entries[0].isIntersecting) return;
            gsap.to(items, {
              opacity: 1,
              y: 0,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              filter: "blur(0px)",
              duration: 0.95,
              stagger: 0.12,
              ease: "expo.out",
              clearProps: "transform,opacity,filter,clipPath",
            });
            obs.disconnect();
          },
          { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
        );

        obs.observe(gallerySection.value);
      }
    }

    // ── MOBILE FRAME (al scroll, fade + scale + blur) ─────────────────
    if (mobileSection.value && mobileFrame.value) {
      gsap.set(mobileFrame.value, {
        opacity: 0,
        y: 28,
        scale: 0.92,
        filter: "blur(6px)",
      });

      const obs = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          gsap.to(mobileFrame.value, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.95,
            ease: "expo.out",
            clearProps: "transform,opacity,filter",
          });
          obs.disconnect();
        },
        { threshold: 0.15 }
      );

      obs.observe(mobileSection.value);
    }

    // ── TAGS + LINKS (al scroll, simple fade) ─────────────────────────
    [tagsSection.value, linksSection.value].forEach((section) => {
      if (!section) return;
      gsap.set(section, { opacity: 0, y: 18 });
      const obs = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          gsap.to(section, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power3.out",
            clearProps: "transform,opacity",
          });
          obs.disconnect();
        },
        { threshold: 0.15 }
      );
      obs.observe(section);
    });

    // ── CTA SECTION (al scroll) ────────────────────────────────────────
    if (ctaSection.value) {
      gsap.set(ctaSection.value, { opacity: 0, y: 32 });

      const obs = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          gsap.to(ctaSection.value, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power4.out",
            clearProps: "transform,opacity",
          });
          obs.disconnect();
        },
        { threshold: 0.1 }
      );

      obs.observe(ctaSection.value);
    }

    // ── NAV PREV/NEXT (al scroll) ──────────────────────────────────────
    if (navSection.value) {
      const links = navSection.value.querySelectorAll(".nav-link");
      if (links.length) {
        gsap.set(links, { opacity: 0, y: 20 });

        const obs = new IntersectionObserver(
          (entries) => {
            if (!entries[0].isIntersecting) return;
            gsap.to(links, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: "power3.out",
              clearProps: "transform,opacity",
            });
            obs.disconnect();
          },
          { threshold: 0.1 }
        );

        obs.observe(navSection.value);
      }
    }
  }, root.value);
});

onUnmounted(() => {
  ctx?.revert();
  window.removeEventListener("keydown", onKeydown);
  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
  }
});
</script>

<style scoped>
/* Drop cap editorial en la primera letra de la descripción. Tipografía
   display, color accent, sangría leve. Solo en pantallas md+ para que en
   mobile no compita con el flow de lectura compacto. */
@media (min-width: 768px) {
  .proj-description-text::first-letter {
    font-family: "Space Grotesk", "Inter", sans-serif;
    float: left;
    font-size: 4.5rem;
    line-height: 0.85;
    font-weight: 700;
    color: rgb(74 222 128);
    padding: 0.35rem 0.65rem 0 0;
  }
}

/* Lightbox entrance/exit: fade del overlay + scale del contenido */
.lightbox-enter-active,
.lightbox-leave-active {
  transition:
    opacity 0.28s ease,
    backdrop-filter 0.28s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
.lightbox-enter-active :deep(img),
.lightbox-leave-active :deep(img) {
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.32s ease;
}
.lightbox-enter-from :deep(img) {
  transform: scale(0.94);
  opacity: 0;
}

/* Crossfade entre imágenes del carrusel */
.lightbox-image-enter-active,
.lightbox-image-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.lightbox-image-enter-from {
  opacity: 0;
  transform: scale(0.97);
}
.lightbox-image-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
