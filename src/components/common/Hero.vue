<template>
  <div
    class="bg-red flex flex-col lg:flex-row justify-center items-center space-y-5 md:space-y-0 md:space-x-14"
  >
    <div class="tracking-in-expand text-center lg:text-left">
      <p class="text-2xl md:text-3xl text-white">Hola, mi nombre es</p>
      <p class="text-3xl md:text-5xl text-white font-bold">Jared Garcia</p>
      <p class="text-2xl md:text-3xl text-white">
        Soy
        <span class="text-3xl md:text-5xl font-bold text-gradient-animated">
          Frontend Developer</span
        >
      </p>
      <div class="flex flex-row justify-center my-5 space-x-5 items-center">
        <ButtonMain @click="scrollToContact" class="heartbeat">
          Contactame
        </ButtonMain>
        <a
          href="https://drive.google.com/file/d/1GNi77TQDAXmsa0jGcdN3a_QELK-lA0ty/view?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          class="border-2 py-2 px-4 rounded-lg text-sm md:text-2xl text-white hover:border-none hover:bg-green-500 hover:text-white transition-all hover:scale-110"
        >
          CV
        </a>
      </div>
      <div
        class="space-x-5 flex justify-center mt-5 text-white text-3xl md:text-4xl"
      >
        <a
          href="https://github.com/DjGarcia4"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:bg-green-700 hover:scale-110 transition-all rounded-lg py-1 px-2"
        >
          <font-awesome-icon :icon="['fab', 'github']" />
        </a>
        <a
          href="https://www.linkedin.com/in/jared-garcia-739255243/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:bg-green-700 hover:scale-110 transition-all rounded-lg py-1 px-2"
        >
          <font-awesome-icon :icon="['fab', 'linkedin']" />
        </a>
        <a
          href="mailto:denisjared286@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:bg-green-700 hover:scale-110 transition-all rounded-lg py-1 px-2"
        >
          <font-awesome-icon :icon="['fas', 'envelope']" />
        </a>
      </div>
    </div>
    <div data-aos="fade-left">
      <img
        src="/img/memojis/hello.png"
        alt="Image Memoji Home"
        class="w-40 h-40 md:w-[301px] md:h-80"
      />
    </div>
  </div>
  <div data-aos="fade-up" class="mx-8 py-5 md:py-14 flex justify-center">
    <p class="text-center text-2xl md:text-3xl text-white md:w-8/12">
      Mi <span class="font-bold text-white">objetivo</span> es utilizar de forma
      óptima mis <span class="font-bold text-white">conocimientos</span> y
      <span class="font-bold text-white">experiencia</span> para alcanzar los
      <span class="font-bold text-green-500">objetivos</span> y
      <span class="font-bold text-green-500">metas</span> de su
      <span class="font-bold text-green-500">institución</span> con
      <span class="font-bold text-green-500">calidad</span>,
      <span class="font-bold text-green-500">eficiencia</span> y
      <span class="font-bold text-green-500">confiabilidad</span>, maximizando
      así mi <span class="font-bold text-white">desempeño</span>.
    </p>
  </div>
</template>

<script setup>
import ButtonMain from "@/components/ButtonMain.vue";
const scrollToContact = () => {
  const contactSection = document.getElementById("contact");
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: "smooth" });
  }
};
</script>

<style scoped></style>
