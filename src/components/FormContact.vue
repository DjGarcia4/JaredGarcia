<template>
  <div class="flex flex-col md:flex-row items-center gap-10 md:gap-20">
    <!-- Columna izquierda -->
    <div
      class="flex flex-col items-center md:w-1/2 text-center md:text-left space-y-5"
    >
      <h1
        data-aos="fade-right"
        class="text-3xl md:text-5xl font-semibold text-white"
      >
        ¡Espero que trabajemos
        <span class="text-gradient-animated font-bold">Juntos</span>!
      </h1>

      <div data-aos="zoom-in">
        <img
          src="/img/memojis/callme.png"
          alt="Image Memoji Home"
          class="w-32 h-32 md:w-[290px] md:h-72"
        />
      </div>

      <p data-aos="fade-up" class="text-xl lg:text-2xl text-gray-400">
        denisjared286@gmail.com
      </p>

      <div data-aos="fade-right">
        <ButtonMain class="flex items-center gap-3" @click="copyEmail">
          <font-awesome-icon icon="copy" /> {{ buttonText }}
        </ButtonMain>
      </div>
    </div>

    <!-- Columna derecha -->
    <div data-aos="fade-left" class="w-full md:w-1/2">
      <form id="emailForm" @submit.prevent="sendEmail" class="space-y-6 w-full">
        <div class="flex flex-col">
          <label for="fullname" class="text-white mb-1 text-sm font-medium"
            >Tu Nombre Completo</label
          >
          <input
            type="text"
            name="fullname"
            id="fullname"
            class="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 backdrop-blur-md placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ingresa tu nombre"
            required
            minlength="3"
          />
        </div>

        <div class="flex flex-col">
          <label for="email" class="text-white mb-1 text-sm font-medium"
            >Tu Correo Electrónico</label
          >
          <input
            type="email"
            name="email"
            id="email"
            class="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 backdrop-blur-md placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="ejemplo@correo.com"
            required
          />
        </div>

        <div class="flex flex-col">
          <label for="message" class="text-white mb-1 text-sm font-medium"
            >Tu Mensaje</label
          >
          <textarea
            name="message"
            id="message"
            rows="5"
            class="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 backdrop-blur-md placeholder:text-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Escribe tu mensaje aquí..."
            required
            minlength="10"
          ></textarea>
        </div>

        <div class="w-full flex justify-center">
          <button
            type="submit"
            class="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold transition-all shadow-md"
          >
            {{ buttonTextSend }}
            <font-awesome-icon icon="paper-plane" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

import ButtonMain from "./ButtonMain.vue";

import { useModalStore } from "@/stores/modal";
import { useToast } from "vue-toast-notification";
import emailjs from "@emailjs/browser";

emailjs.init("IlTVG1X5-tzzsmG1i");
const modal = useModalStore();
const $toast = useToast();
const isCopyingEmail = ref(false);
const buttonText = ref("Copiar Email");
const buttonTextSend = ref("Enviar");

function copyEmail() {
  const email = "denisjared286@gmail.com";
  navigator.clipboard
    .writeText(email)
    .then(() => {
      isCopyingEmail.value = true;
      buttonText.value = "Email Copied!";
      $toast.success("Copied to clipboard!", { position: "top" });
      setTimeout(() => {
        isCopyingEmail.value = false;
        buttonText.value = "Copy Email";
      }, 2000); // Cambiar de vuelta al texto original después de 2 segundos
    })
    .catch((err) => {
      console.error("Error al copiar el email: ", err);
    });
}

function sendEmail() {
  buttonTextSend.value = "Enviando...";
  const serviceID = "default_service";
  const templateID = "template_s4cxryd";
  const form = document.getElementById("emailForm");
  const button = document.getElementById("submitButton");

  emailjs
    .sendForm(serviceID, templateID, form)
    .then(() => {
      $toast.success("¡Correo enviado! ¡Gracias por tu mensaje!", {
        duration: 3000,
        position: "top",
      });
      modal.handleModal(false);
      buttonTextSend.value = "Enviar";
      form.reset();
    })
    .catch((err) => {
      button.textContent = "Enviar correo";
      console.log(err);
      $toast.error("Ups... algo salió mal. Intenta más tarde.", {
        duration: 3000,
        position: "top",
      });
    });
}
</script>
