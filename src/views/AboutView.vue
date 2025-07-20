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

    <div class="mx-8 pt-5 md:pt-10 md:mx-16">
      <TitleSection>¿Quién soy?</TitleSection>

      <div
        class="flex gap-6 flex-col md:flex-row md:mx-auto justify-center items-center mt-10"
      >
        <!-- Texto -->
        <div data-aos="fade-right" class="text-left md:w-10/12 space-y-6">
          <p class="text-[18px] md:text-2xl text-white leading-relaxed">
            Soy
            <span class="font-bold text-green-400"
              >Ingeniero en Ciencias de la Computación</span
            >
            y me apasiona crear experiencias digitales que impacten. Tengo
            experiencia sólida en
            <span class="font-bold text-green-400"
              >desarrollo web frontend</span
            >
            y me encanta enfrentar desafíos creativos que me reten a subir de
            nivel constantemente.
          </p>

          <div
            class="grid sm:grid-cols-2 gap-4 text-white/90 text-[16px] md:text-lg"
          >
            <div
              class="bg-white/10 p-4 rounded-xl border border-white/10 hover:border-white/25 transition-all"
            >
              <h4 class="font-bold text-white mb-1 flex items-center gap-2">
                🤝 Trabajo en equipo
              </h4>
              <p>
                Me gusta colaborar, aprender de otros y sumar al proyecto como
                un jugador comprometido.
              </p>
            </div>

            <div
              class="bg-white/10 p-4 rounded-xl border border-white/10 hover:border-white/25 transition-all"
            >
              <h4 class="font-bold text-white mb-1 flex items-center gap-2">
                🧠 Resolución de problemas
              </h4>
              <p>
                Disfruto encontrar soluciones creativas, eficientes y que
                realmente funcionen.
              </p>
            </div>

            <div
              class="bg-white/10 p-4 rounded-xl border border-white/10 hover:border-white/25 transition-all"
            >
              <h4 class="font-bold text-white mb-1 flex items-center gap-2">
                🎯 Compromiso con la calidad
              </h4>
              <p>
                Cada detalle cuenta. Me enfoco en que todo funcione bien, se vea
                bien y sea confiable.
              </p>
            </div>

            <div
              class="bg-white/10 p-4 rounded-xl border border-white/10 hover:border-white/25 transition-all"
            >
              <h4 class="font-bold text-white mb-1 flex items-center gap-2">
                🚀 Ganas de crecer
              </h4>
              <p>
                Siempre estoy buscando aprender algo nuevo, mejorar mis skills y
                asumir nuevos retos.
              </p>
            </div>
          </div>
        </div>

        <!-- Imagen -->
        <div data-aos="fade-left" class="flex justify-center">
          <img
            src="/img/memojis/like.png"
            alt="Imagen Memoji Sobre Mí"
            class="w-44 h-44 md:w-72 md:h-72 drop-shadow-xl"
          />
        </div>
      </div>
      <Skills />

      <!-- <TitleSection>Mis Habilidades Personales</TitleSection>

      <PersonalSkills /> -->

      <TitleSection>Mi camino de aprendizaje</TitleSection>
      <Certifications />
      <div
        class="flex gap-6 flex-col md:flex-row items-center md:items-start mt-10"
      >
        <!-- Imagen Memoji -->
        <div data-aos="fade-right" class="flex justify-center md:justify-start">
          <img
            src="/img/memojis/secret.png"
            alt="Imagen Memoji Inicio"
            class="w-36 h-44 md:w-60 md:h-72 drop-shadow-xl"
          />
        </div>

        <!-- Contenido -->
        <div data-aos="fade-left" class="text-left md:w-10/12 space-y-6">
          <TitleSection>Más allá del código...</TitleSection>

          <p class="text-[18px] md:text-2xl text-white leading-relaxed">
            Porque no todo es escribir líneas de código, también disfruto un
            montón de cosas que me recargan las pilas:
          </p>

          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white/90 text-[16px] md:text-lg"
          >
            <!-- Videojuegos -->
            <div
              class="bg-white/10 p-4 rounded-xl border border-white/10 hover:border-white/25 transition-all"
            >
              <h4 class="font-bold text-white mb-1 flex items-center gap-2">
                🎮 FIFA Competitivo
              </h4>
              <p>
                Me encanta meterle nivel, mejorar jugadas y ganar con clase (o
                gritos, depende).
              </p>
            </div>

            <!-- Lectura -->
            <div
              class="bg-white/10 p-4 rounded-xl border border-white/10 hover:border-white/25 transition-all"
            >
              <h4 class="font-bold text-white mb-1 flex items-center gap-2">
                📚 Libros que inspiran
              </h4>
              <p>
                Desde novelas hasta libros de crecimiento personal, siempre ando
                buscando qué aprender.
              </p>
            </div>

            <!-- Deportes -->
            <div
              class="bg-white/10 p-4 rounded-xl border border-white/10 hover:border-white/25 transition-all"
            >
              <h4 class="font-bold text-white mb-1 flex items-center gap-2">
                🏐 Fútbol, volley y basket
              </h4>
              <p>
                Jugar y competir me mantiene activo, centrado y con mente clara
                para volver al código.
              </p>
            </div>

            <!-- Juegos de mesa -->
            <div
              class="bg-white/10 p-4 rounded-xl border border-white/10 hover:border-white/25 transition-all"
            >
              <h4 class="font-bold text-white mb-1 flex items-center gap-2">
                🎲 Juegos de mesa
              </h4>
              <p>
                Una buena partida de Monopoly y se arma la estrategia con risas
                de por medio.
              </p>
            </div>
          </div>
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
