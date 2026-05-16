<template>
  <div class="grid gap-10 md:grid-cols-2 md:gap-14">
    <!-- Info de contacto -->
    <div class="reveal flex flex-col">
      <h3 class="font-display text-2xl font-bold text-white md:text-3xl">
        ¿Tenés un proyecto en mente?
      </h3>
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
      @submit.prevent="sendEmail"
      class="reveal space-y-4"
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
import { ref } from "vue";
import emailjs from "@emailjs/browser";

import { toast } from "vue-sonner";

import { profile } from "@/data/profile";
import { useModalStore } from "@/stores/modal";

emailjs.init("IlTVG1X5-tzzsmG1i");

const modal = useModalStore();

const copied = ref(false);
const sending = ref(false);

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
