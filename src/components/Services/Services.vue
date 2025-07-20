<template>
  <section class="p-10 px-4 md:px-0 max-w-7xl mx-auto space-y-16">
    <TitleSection>Lo que ofrezco como desarrollador y diseñador</TitleSection>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
      <ServiceCard
        v-for="(service, index) in services"
        :key="index"
        :service="service"
      />
    </div>
  </section>
</template>

<script setup>
import TitleSection from "@/components/TitleSection.vue";
import ServiceCard from "@/components/Services/ServiceCard.vue";

const services = [
  {
    title: "Desarrollo Web",
    description:
      "Diseño y desarrollo de sitios web modernos, responsivos y optimizados para cualquier dispositivo.",
    icon: "code",
  },
  {
    title: "Aplicaciones Móviles",
    description:
      "Construcción de apps para iOS y Android usando React Native, Firebase y más.",
    icon: "mobile-alt",
  },
  {
    title: "Paneles Administrativos",
    description:
      "Creación de dashboards personalizados con autenticación, CRUD, filtros y más.",
    icon: "chart-line",
  },
  {
    title: "Integraciones con Firebase",
    description:
      "Autenticación, Firestore, almacenamiento de archivos, notificaciones push y más.",
    icon: "fire",
  },
  {
    title: "Diseño UI/UX",
    description:
      "Prototipado en Figma, experiencia de usuario fluida y visual atractivo.",
    icon: "paint-brush",
  },
  {
    title: "Despliegue y Hosting",
    description:
      "Deploy de proyectos en Vercel, Netlify, Balena, y conexión a dominios personalizados.",
    icon: "cloud-upload-alt",
  },
];
</script>
