<template>
  <TransitionRoot as="template" :show="modal.showModal">
    <Dialog as="div" class="relative z-10">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        />
      </TransitionChild>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-xl bg-white px-4 pt-2 text-left shadow-xl transition-all sm:my-8 sm:w-full md:w-[1000px] sm:p-6"
            >
              <div class="w-full flex justify-end">
                <button
                  type="button"
                  @click="modal.handleModal(false)"
                  class="flex items-center p-1 rounded-lg text-sm md:text-2xl text-gray-400 hover:border-none hover:bg-red-500 hover:font-bold hover:text-white transition-all justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="icon icon-tabler icons-tabler-outline icon-tabler-x w-8 md:w-16 h-8 md:h-15"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="p-2">
                <div class="flex flex-col md:flex-row items-center">
                  <div class="flex flex-col items-center md:w-1/2">
                    <h1
                      class="text-2xl md:text-5xl font-bold text-gray-600 text-center"
                    >
                      I look forward to working
                      <span class="text-green-500">together</span>!
                    </h1>

                    <img
                      src="/img/memojis/callme.png"
                      alt="Image Memoji Home"
                      class="w-32 h-32 md:w-[290px] md:h-72 mt-5"
                    />
                    <p class="text-xl md:text-3xl text-gray-400 my-3">
                      denisjared286@gmail.com
                    </p>
                    <ButtonMain
                      class="flex items-center gap-3"
                      @click="copyEmail"
                      ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="icon icon-tabler icons-tabler-outline icon-tabler-copy"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path
                          d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"
                        />
                        <path
                          d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"
                        /></svg
                      >{{ buttonText }}
                    </ButtonMain>
                  </div>
                  <div class="md:w-1/2">
                    <form
                      id="emailForm"
                      @submit.prevent="sendEmail"
                      class="my-4 space-y-1 md:space-y-4"
                    >
                      <div class="flex flex-col">
                        <label
                          for="fullname"
                          class="text-lg md:text-xl text-gray-500 font-medium"
                          >Your Full Name</label
                        >
                        <input
                          type="text"
                          name="fullname"
                          id="fullname"
                          class="border h-10 md:h-15 bg-gray-200 p-2 rounded-lg"
                          required
                          min="3"
                        />
                      </div>
                      <div class="flex flex-col">
                        <label
                          for="email"
                          class="text-lg md:text-xl text-gray-500 font-medium"
                          >Your Email</label
                        >
                        <input
                          type="email"
                          name="email"
                          id="email"
                          class="border h-10 md:h-15 bg-gray-200 p-2 rounded-lg"
                          required
                        />
                      </div>
                      <div class="flex flex-col">
                        <label
                          for="message"
                          class="text-lg md:text-xl text-gray-500 font-medium"
                          >Your Message</label
                        >
                        <textarea
                          name="message"
                          id="message"
                          cols="30"
                          rows="5"
                          class="border bg-gray-200 p-2 rounded-lg"
                          required
                          min="10"
                        ></textarea>
                      </div>
                      <div class="w-full flex justify-center mt-2">
                        <button
                          class="flex items-center border-2 py-2 px-4 rounded-lg text-sm md:text-2xl text-gray-400 hover:border-none hover:bg-green-500 hover:font-bold hover:text-white transition-all w-full justify-center gap-5"
                          type="submit"
                        >
                          {{ buttonTextSend }}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="icon icon-tabler icons-tabler-outline icon-tabler-send-2"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path
                              d="M4.698 4.034l16.302 7.966l-16.302 7.966a.503 .503 0 0 1 -.546 -.124a.555 .555 0 0 1 -.12 -.568l2.468 -7.274l-2.468 -7.274a.555 .555 0 0 1 .12 -.568a.503 .503 0 0 1 .546 -.124z"
                            />
                            <path d="M6.5 12h14.5" />
                          </svg>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import ButtonMain from "./ButtonMain.vue";
import { useModalStore } from "@/stores/modal";
import { useToast } from "vue-toast-notification";

import emailjs from "@emailjs/browser";

emailjs.init("IlTVG1X5-tzzsmG1i");
const modal = useModalStore();
const $toast = useToast();
const isCopyingEmail = ref(false);
const buttonText = ref("Copy Email");
const buttonTextSend = ref("Send ");

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
  buttonTextSend.value = "Sending...";
  const serviceID = "default_service";
  const templateID = "template_s4cxryd";
  const form = document.getElementById("emailForm");
  const button = document.getElementById("submitButton");

  emailjs
    .sendForm(serviceID, templateID, form)
    .then(() => {
      $toast.success("Email sent! Thanks for your Message!", {
        duration: 3000,
        position: "top",
      });
      modal.handleModal(false);
      buttonTextSend.value = "Send ";
    })
    .catch((err) => {
      button.textContent = "Send Email";
      alert(JSON.stringify(err));
      $toast.error("Oops... something went  wrong.", {
        duration: 3000,
        position: "top",
      });
    });
}
</script>
