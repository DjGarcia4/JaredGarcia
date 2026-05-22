<template>
  <div ref="root" class="grid gap-10 md:grid-cols-2 md:gap-14">
    <!-- Info de contacto -->
    <div ref="leftCol" class="contact-left flex flex-col">
      <div class="contact-title-wrap overflow-hidden">
        <h3
          class="contact-title font-display text-2xl font-bold leading-tight text-white md:text-3xl"
        >
          ¿Tenés un proyecto en mente?
        </h3>
      </div>
      <p class="mt-3 text-white/55">
        Escribime y conversemos. Respondo todos los mensajes.
      </p>

      <button
        type="button"
        @click="copyEmail"
        class="surface surface-hover mt-8 flex items-center gap-3 p-4 text-left"
      >
        <span
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent-light"
        >
          <font-awesome-icon :icon="['fas', 'envelope']" />
        </span>
        <span class="min-w-0">
          <span class="block text-xs uppercase tracking-wider text-white/40">
            Email
          </span>
          <span class="block truncate text-sm font-medium text-white">
            {{ profile.email }}
          </span>
        </span>
        <font-awesome-icon
          :icon="['fas', copied ? 'check' : 'copy']"
          class="ml-auto shrink-0 text-white/40"
        />
      </button>

      <div class="mt-4 flex gap-3">
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
          :href="profile.socials.whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          class="link-icon"
        >
          <font-awesome-icon :icon="['fab', 'whatsapp']" />
        </a>
        <a
          :href="profile.socials.instagram"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          class="link-icon"
        >
          <font-awesome-icon :icon="['fab', 'instagram']" />
        </a>
      </div>

      <!-- QR de WhatsApp -->
      <div class="surface mt-6 flex items-center gap-4 p-4">
        <a
          :href="profile.socials.whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir chat de WhatsApp"
          class="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:border-accent/40"
        >
          <img
            v-if="profile.whatsappQr"
            :src="profile.whatsappQr"
            alt="Código QR de WhatsApp"
            class="h-full w-full object-contain"
          />
          <span
            v-else
            class="flex flex-col items-center gap-1.5 text-white/30"
          >
            <font-awesome-icon :icon="['fas', 'qrcode']" class="text-3xl" />
            <span class="text-[10px] uppercase tracking-wider">QR</span>
          </span>
        </a>
        <div class="min-w-0">
          <span class="block text-xs uppercase tracking-wider text-white/40">
            WhatsApp
          </span>
          <p class="mt-1 text-sm leading-relaxed text-white/60">
            Escaneá el código y escribime directo por WhatsApp.
          </p>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <form
      id="emailForm"
      ref="formEl"
      @submit.prevent="sendEmail"
      class="space-y-4"
    >
      <div>
        <label for="fullname" class="mb-1.5 block text-sm font-medium text-white/70">
          Nombre completo
        </label>
        <input
          type="text"
          name="fullname"
          id="fullname"
          required
          minlength="3"
          placeholder="Tu nombre"
          class="field"
        />
      </div>

      <div>
        <label for="email" class="mb-1.5 block text-sm font-medium text-white/70">
          Correo electrónico
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          placeholder="ejemplo@correo.com"
          class="field"
        />
      </div>

      <div>
        <label for="message" class="mb-1.5 block text-sm font-medium text-white/70">
          Mensaje
        </label>
        <textarea
          name="message"
          id="message"
          rows="5"
          required
          minlength="10"
          placeholder="Contame sobre tu proyecto..."
          class="field resize-none"
        ></textarea>
      </div>

      <button type="submit" class="btn-primary w-full" :disabled="sending">
        {{ sending ? "Enviando..." : "Enviar mensaje" }}
        <font-awesome-icon :icon="['fas', 'paper-plane']" />
      </button>
    </form>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import emailjs from "@emailjs/browser";

import { toast } from "vue-sonner";

import { profile } from "@/data/profile";
import { useModalStore } from "@/stores/modal";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

emailjs.init("IlTVG1X5-tzzsmG1i");

const modal = useModalStore();

const copied = ref(false);
const sending = ref(false);

const root = ref(null);
const leftCol = ref(null);
const formEl = ref(null);

let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;
  if (!root.value || !leftCol.value || !formEl.value) return;

  ctx = gsap.context(() => {
    const leftChildren = Array.from(leftCol.value.children);
    const formChildren = Array.from(formEl.value.children);
    // Primer hijo del lado izq: wrapper del título (overflow-hidden).
    // Segundo: párrafo. Resto: cards (email, socials, QR).
    const [titleWrap, subtitle, ...leftCards] = leftChildren;
    const title = titleWrap.querySelector(".contact-title");

    // Estado inicial:
    //  - title: clipPath cortado 100% desde arriba (oculto) + yPercent leve
    //    para que al revelarse "suba" como en StackedProjects.
    //  - subtitle: fade + y desde abajo
    //  - cards izq: slide-in desde la izquierda
    //  - fields form: slide-in desde la derecha
    gsap.set(title, {
      clipPath: "inset(100% 0 0 0)",
      yPercent: 8,
    });
    gsap.set(subtitle, { opacity: 0, y: 24 });
    gsap.set(leftCards, { opacity: 0, x: -28, scale: 0.98 });
    gsap.set(formChildren, { opacity: 0, x: 28, scale: 0.98 });

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Header: el título se revela con clipPath (persiana subiendo) y el
        // párrafo entra por debajo con fade.
        tl.to(
          title,
          {
            clipPath: "inset(0% 0 0 0)",
            yPercent: 0,
            duration: 0.85,
            ease: "expo.out",
          },
          0
        ).to(
          subtitle,
          { opacity: 1, y: 0, duration: 0.5 },
          "<0.18"
        );

        // Cards izquierda: stagger desde la izquierda
        tl.to(
          leftCards,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.08,
            clearProps: "transform,opacity",
          },
          "<0.15"
        );

        // Form fields: stagger desde la derecha, EN PARALELO con left cards
        tl.to(
          formChildren,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.08,
            clearProps: "transform,opacity",
          },
          "<"
        );

        observer.disconnect();
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(root.value);
  }, root.value);
});

onUnmounted(() => ctx?.revert());

function copyEmail() {
  navigator.clipboard
    .writeText(profile.email)
    .then(() => {
      copied.value = true;
      toast.success("Email copiado", {
        description: "Pegalo donde quieras y escribime.",
      });
      setTimeout(() => (copied.value = false), 2000);
    })
    .catch((err) => console.error("Error al copiar el email:", err));
}

function sendEmail() {
  sending.value = true;
  const form = document.getElementById("emailForm");

  emailjs
    .sendForm("default_service", "template_s4cxryd", form)
    .then(() => {
      toast.success("¡Mensaje enviado!", {
        description: "Gracias por escribir, te respondo muy pronto.",
      });
      modal.handleModal(false);
      form.reset();
    })
    .catch((err) => {
      console.error(err);
      toast.error("Algo salió mal", {
        description: "No se pudo enviar el mensaje. Intentá de nuevo.",
      });
    })
    .finally(() => {
      sending.value = false;
    });
}
</script>
