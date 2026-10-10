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
          <span class="block text-xs uppercase tracking-wider text-white/55">
            Email
          </span>
          <span class="block truncate text-sm font-medium text-white">
            {{ profile.email }}
          </span>
        </span>
        <font-awesome-icon
          :icon="['fas', copied ? 'check' : 'copy']"
          class="ml-auto shrink-0 text-white/55"
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
      </div>

      <!-- QR de WhatsApp (SVG dinámico, mismo URL que el link) -->
      <div class="surface mt-6 flex items-center gap-4 p-4">
        <a
          :href="profile.socials.whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir chat de WhatsApp con mensaje precargado"
          class="group relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white p-2 transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_0_3px_rgba(74,222,128,0.12)]"
        >
          <QrcodeVue
            :value="profile.socials.whatsapp"
            :size="200"
            level="M"
            render-as="svg"
            background="#ffffff"
            foreground="#0b1410"
            class="h-full w-full"
          />
        </a>
        <div class="min-w-0">
          <span class="block text-xs uppercase tracking-wider text-white/55">
            WhatsApp
          </span>
          <p class="mt-1 text-sm leading-relaxed text-white/60">
            Escaneá el código o tocá la imagen para abrir el chat con un
            mensaje listo.
          </p>
        </div>
      </div>
    </div>

    <!-- Formulario: validación propia (novalidate) para mostrar errores en
         español, inline y anunciados a lectores de pantalla. -->
    <form
      ref="formEl"
      novalidate
      @submit.prevent="sendEmail"
      class="space-y-4"
    >
      <div v-for="field in fields" :key="field.name">
        <label
          :for="`${uid}-${field.name}`"
          class="mb-1.5 block text-sm font-medium text-white/70"
        >
          {{ field.label }}
        </label>
        <component
          :is="field.textarea ? 'textarea' : 'input'"
          :id="`${uid}-${field.name}`"
          :value="values[field.name]"
          :name="field.name"
          :type="field.textarea ? undefined : field.type"
          :rows="field.textarea ? 5 : undefined"
          :autocomplete="field.autocomplete"
          :placeholder="field.placeholder"
          :aria-invalid="errors[field.name] ? 'true' : 'false'"
          :aria-describedby="errors[field.name] ? `${uid}-${field.name}-error` : undefined"
          class="field"
          :class="[
            field.textarea && 'resize-none',
            errors[field.name] && '!border-red-400/70 focus:!ring-red-400/30',
          ]"
          @blur="touch(field.name)"
          @input="onInput(field.name, $event)"
        />
        <p
          v-if="errors[field.name]"
          :id="`${uid}-${field.name}-error`"
          class="mt-1.5 flex items-center gap-1.5 text-sm text-red-300"
        >
          <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="text-xs" />
          {{ errors[field.name] }}
        </p>
      </div>

      <button
        type="submit"
        class="btn-primary w-full"
        :disabled="sending"
        :aria-busy="sending"
      >
        <template v-if="sending">
          <ThinkingOrb
            state="breathing"
            :size="20"
            color="#0F172A"
            label="Enviando mensaje"
          />
          Enviando…
        </template>
        <template v-else>
          Enviar mensaje
          <font-awesome-icon :icon="['fas', 'paper-plane']" />
        </template>
      </button>
    </form>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import QrcodeVue from "qrcode.vue";
import emailjs from "@emailjs/browser";

import { toast } from "vue-sonner";

import ThinkingOrb from "@/components/ThinkingOrb.vue";

import { profile } from "@/data/profile";
import { useModalStore } from "@/stores/modal";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

emailjs.init("IlTVG1X5-tzzsmG1i");

const modal = useModalStore();

const copied = ref(false);
const sending = ref(false);

// Prefijo único por instancia: el form vive en la home y también en el modal.
const uid = `contact-${Math.random().toString(36).slice(2, 8)}`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// `name` coincide con las variables del template de EmailJS.
const fields = [
  {
    name: "fullname",
    label: "Nombre completo",
    type: "text",
    autocomplete: "name",
    placeholder: "Tu nombre",
    check: (v) =>
      !v ? "Contame cómo te llamás." : v.length < 3 ? "El nombre es muy corto." : "",
  },
  {
    name: "email",
    label: "Correo electrónico",
    type: "email",
    autocomplete: "email",
    placeholder: "ejemplo@correo.com",
    check: (v) =>
      !v
        ? "Necesito tu correo para responderte."
        : !EMAIL_RE.test(v)
          ? "Revisá el correo, parece incompleto."
          : "",
  },
  {
    name: "message",
    label: "Mensaje",
    textarea: true,
    autocomplete: "off",
    placeholder: "Contame sobre tu proyecto…",
    check: (v) =>
      !v
        ? "Escribí un mensaje."
        : v.length < 10
          ? "Contame un poco más (mínimo 10 caracteres)."
          : "",
  },
];

const values = reactive({ fullname: "", email: "", message: "" });
const errors = reactive({ fullname: "", email: "", message: "" });
const touched = reactive({ fullname: false, email: false, message: false });

const validate = (name) => {
  const field = fields.find((f) => f.name === name);
  errors[name] = field.check(values[name].trim());
  return !errors[name];
};

// v-model no aplica a <component :is="input">: se compila como v-model de
// componente. Por eso el binding es manual.
const onInput = (name, e) => {
  values[name] = e.target.value;
  if (touched[name]) validate(name);
};

const touch = (name) => {
  touched[name] = true;
  validate(name);
};

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
  fields.forEach((f) => (touched[f.name] = true));
  const invalid = fields.filter((f) => !validate(f.name));
  if (invalid.length) {
    document.getElementById(`${uid}-${invalid[0].name}`)?.focus();
    return;
  }

  sending.value = true;
  emailjs
    .sendForm("default_service", "template_s4cxryd", formEl.value)
    .then(() => {
      toast.success("¡Mensaje enviado!", {
        description: "Gracias por escribir, te respondo muy pronto.",
      });
      modal.handleModal(false);
      fields.forEach((f) => {
        values[f.name] = "";
        errors[f.name] = "";
        touched[f.name] = false;
      });
    })
    .catch((err) => {
      console.error(err);
      toast.error("Algo salió mal", {
        description: "No se pudo enviar el mensaje. Intentá de nuevo o escribime por WhatsApp.",
      });
    })
    .finally(() => {
      sending.value = false;
    });
}
</script>
