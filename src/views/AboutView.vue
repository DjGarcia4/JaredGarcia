<template>
  <div class="flex flex-col overflow-hidden">
    <div class="flex justify-center items-center md:w-5/6 mx-5 md:mx-auto">
      <div
        data-aos="fade-right"
        class="text-center md:text-left md:w-7/12 space-y-3 w-1/2"
      >
        <p class="text-1xl md:text-3xl text-white">
          <span class="text-white font-bold">¡Hola!</span> Si llegaste hasta
          aquí...
        </p>
        <p class="text-2xl md:text-3xl text-white hidden md:block">
          ¡Qué bueno tenerte por aquí! En esta sección podés conocer un poco más
          sobre mí y mi pasión por la programación.
        </p>

        <p class="text-2xl md:text-2 3xl text-white">
          <span class="text-2xl md:text-5xl text-green-500 font-bold"
            >¡Disfrutá la lectura!</span
          >
        </p>
      </div>
      <div data-aos="fade-left" class="w-1/2 md:w-auto">
        <img
          src="/img/memojis/party.png"
          alt="Imagen Memoji Inicio"
          class="w-44 h-44 md:w-80 md:h-80"
        />
      </div>
    </div>
    <div
      class="flex gap-2 md:gap-14 flex-col md:flex-row justify-center items-center md:w-5/6 mx-5 md:mx-auto"
    >
      <div data-aos="fade-right">
        <img
          src="/img/memojis/greeting.png"
          alt="Imagen Memoji Inicio"
          class="w-36 h-48 md:w-72 md:h-96"
        />
      </div>
      <div
        data-aos="fade-left"
        class="text-center md:text-left md:w-7/12 space-y-1"
      >
        <p class="text-1xl md:text-3xl text-white">
          Bueno, me presento de nuevo...
        </p>
        <p class="text-1xl md:text-3xl text-white">Hola, mi nombre es</p>
        <p class="text-2xl md:text-5xl text-white font-bold">Jared Garcia</p>
        <p class="text-1xl md:text-3xl text-white">
          Soy
          <span class="text-2xl md:text-5xl text-green-500 font-bold"
            >Desarrollador Frontend</span
          >
        </p>
      </div>
    </div>
    <div class="mx-8 pt-5 md:pt-10 md:mx-16">
      <TitleSection>Sobre Mí</TitleSection>
      <div
        class="flex gap-5 flex-col md:flex-row md:mx-auto justify-center items-center"
      >
        <div data-aos="fade-right" class="text-left md:w-10/12 space-y-3">
          <p class="text-[20px] md:text-3xl text-white">
            Soy un
            <span class="font-bold"
              >ingeniero en ciencias de la computación</span
            >
            apasionado, con experiencia en
            <span class="font-bold">desarrollo web</span>. Me encantan los
            desafíos creativos y
            <span class="font-bold">siempre busco expandir mis habilidades</span
            >. Me considero un <span class="font-bold">jugador en equipo</span>,
            con gran capacidad de
            <span class="font-bold">resolución de problemas</span>, y enfocado
            en ofrecer <span class="font-bold">calidad</span> y
            <span class="font-bold">confiabilidad</span> en cada proyecto.
          </p>
        </div>
        <div data-aos="fade-left" class="flex justify-center">
          <img
            src="/img/memojis/like.png"
            alt="Imagen Memoji Inicio"
            class="w-44 h-44 md:w-72 md:h-72"
          />
        </div>
      </div>
      <Skills />

      <TitleSection>Mis Habilidades Personales</TitleSection>

      <PersonalSkills />

      <TitleSection>Mis Certificados</TitleSection>
      <Certifications />
      <div class="flex gap-5 flex-col mx-0 md:flex-row md:mx-auto mt-5">
        <div data-aos="fade-right" class="flex justify-center">
          <img
            src="/img/memojis/secret.png"
            alt="Imagen Memoji Inicio"
            class="w-36 h-44 md:w-60 md:h-72"
          />
        </div>
        <div data-aos="fade-left" class="text-left md:w-10/12 space-y-3">
          <TitleSection>Y alejándome un poco del trabajo...</TitleSection>
          <p class="text-[20px] md:text-3xl text-white">
            Me apasionan los videojuegos, especialmente FIFA, donde disfruto
            competir y mejorar mis habilidades. También me gusta mucho la
            lectura, donde encuentro inspiración y aprendizaje en una gran
            variedad de géneros. Además, amo practicar deportes como fútbol,
            voleibol y baloncesto, que me mantienen activo y en forma.
            Finalmente, disfruto muchísimo los juegos de mesa, siendo Monopoly
            uno de mis favoritos, ya que combina estrategia y diversión en una
            experiencia única.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import TitleSection from "@/components/TitleSection.vue";
import Skills from "@/components/Skills.vue";
import PersonalSkills from "@/components/PersonalSkills.vue";
import Certifications from "@/components/Certifications.vue";

onMounted(() => {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 10);
});
</script>
