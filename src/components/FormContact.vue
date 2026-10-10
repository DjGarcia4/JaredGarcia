<template>
  <div ref="root" class="grid gap-10 md:grid-cols-2 md:gap-14">
    <!-- Info de contacto -->
    <div ref="leftCol" class="contact-left flex flex-col">
      <div class="contact-title-wrap overflow-hidden">
        <h3
          class="contact-title font-display text-2xl font-bold leading-tight text-white md:text-3xl"
        >
          {{ t("contact.title") }}
        </h3>
      </div>
      <p class="mt-3 text-white/55">
        {{ t("contact.lead") }}
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
            {{ t("contact.email") }}
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
          :aria-label="t('contact.whatsappAria')"
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
            {{ t("contact.whatsappLead") }}
          </p>
        </div>
      </div>
    </div>

    <!-- Formulario: validación propia (novalidate) para mostrar errores en
         español, inline y anunciados a lectores de pantalla. -->
    <form
      ref="formEl"
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      novalidate
      @submit.prevent="sendEmail"
      class="space-y-4"
    >
      <!-- Netlify Forms: nombre del formulario + campo trampa para bots
           (invisible para personas y lectores de pantalla). -->
      <input type="hidden" name="form-name" value="contact" />
      <p class="hidden" aria-hidden="true">
        <label>No completar: <input v-model="botField" name="bot-field" tabindex="-1" autocomplete="off" /></label>
      </p>
      <div v-for="field in fields" :key="field.name">
        <label
          :for="`${uid}-${field.name}`"
          class="mb-1.5 block text-sm font-medium text-white/70"
        >
          {{ t(`contact.fields.${field.name}.label`) }}
        </label>
        <component
          :is="field.textarea ? 'textarea' : 'input'"
          :id="`${uid}-${field.name}`"
          :value="values[field.name]"
          :name="field.name"
          :type="field.textarea ? undefined : field.type"
          :rows="field.textarea ? 5 : undefined"
          :autocomplete="field.autocomplete"
          :placeholder="t(`contact.fields.${field.name}.placeholder`)"
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
          {{ t(`contact.fields.${field.name}.${errors[field.name]}`) }}
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
            :label="t('contact.sendingAria')"
          />
          {{ t("contact.sending") }}
        </template>
        <template v-else>
          {{ t("contact.send") }}
          <font-awesome-icon :icon="['fas', 'paper-plane']" />
        </template>
      </button>
    </form>
  </div>
</template>

<script setup>
import { defineAsyncComponent, onMounted, onUnmounted, reactive, ref } from "vue";
// El QR no hace falta para el primer render: se carga aparte.
const QrcodeVue = defineAsyncComponent(() => import("qrcode.vue"));

import { toast } from "vue-sonner";

import ThinkingOrb from "@/components/ThinkingOrb.vue";
import { locale, t } from "@/i18n";

import { profile } from "@/data/profile";
import { useModalStore } from "@/stores/modal";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const modal = useModalStore();

const copied = ref(false);
const sending = ref(false);

// Prefijo único por instancia: el form vive en la home y también en el modal.
const uid = `contact-${Math.random().toString(36).slice(2, 8)}`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// `name` coincide con las variables del template de EmailJS.
// Los mensajes de error se guardan como código (empty | short | invalid)
// y se traducen al mostrarlos, así cambian si se cambia el idioma.
const fields = [
  {
    name: "fullname",
    type: "text",
    autocomplete: "name",
    check: (v) => (!v ? "empty" : v.length < 3 ? "short" : ""),
  },
  {
    name: "email",
    type: "email",
    autocomplete: "email",
    check: (v) => (!v ? "empty" : !EMAIL_RE.test(v) ? "invalid" : ""),
  },
  {
    name: "message",
    textarea: true,
    autocomplete: "off",
    check: (v) => (!v ? "empty" : v.length < 10 ? "short" : ""),
  },
];

const botField = ref("");
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
      toast.success(t("contact.copied"), {
        description: t("contact.copiedDesc"),
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

  // Bots que completan el campo trampa: se finge éxito y no se envía.
  if (botField.value) return;

  // Netlify Forms: POST url-encoded a la raíz, con form-name. Netlify lo
  // guarda y lo reenvía por email (Site → Forms → notifications).
  sending.value = true;
  const body = new URLSearchParams({
    "form-name": "contact",
    fullname: values.fullname.trim(),
    email: values.email.trim(),
    message: values.message.trim(),
    lang: locale.value,
  });
  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Netlify Forms: ${res.status}`);
    })
    .then(() => {
      toast.success(t("contact.sent"), {
        description: t("contact.sentDesc"),
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
      toast.error(t("contact.error"), {
        description: t("contact.errorDesc"),
      });
    })
    .finally(() => {
      sending.value = false;
    });
}
</script>
