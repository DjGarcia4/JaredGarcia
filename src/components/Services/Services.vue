<template>
  <section class="container-content py-20 md:py-28">
    <TitleSection eyebrow="Servicios">
      Lo que ofrezco
    </TitleSection>

    <div v-stagger class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <ServiceCard
        v-for="(service, index) in services"
        :key="index"
        :service="service"
        :index="index"
      />
    </div>
  </section>
</template>

<script setup>
import TitleSection from "@/components/TitleSection.vue";
import ServiceCard from "@/components/Services/ServiceCard.vue";

const services = [
  {
    title: "Desarrollo Web Fullstack",
    description:
      "Aplicaciones web completas con Vue 3 y React: frontend, backend con Node y Firebase, listas para producción.",
    icon: "code",
  },
  {
    title: "Aplicaciones Móviles",
    description:
      "Apps para iOS y Android con React Native, integradas con APIs, GraphQL y servicios cloud.",
    icon: "mobile-screen",
  },
  {
    title: "Plataformas SaaS Multi-tenant",
    description:
      "Arquitecturas escalables con datos aislados por cliente, control de acceso por roles y autenticación multifactor.",
    icon: "layer-group",
  },
  {
    title: "Paneles Administrativos",
    description:
      "Dashboards a medida con CRUD, filtros, reportes y sincronización de datos en tiempo real.",
    icon: "chart-line",
  },
  {
    title: "Diseño UI/UX",
    description:
      "Prototipado en Figma, sistemas de diseño y experiencias de usuario fluidas con carácter.",
    icon: "paint-brush",
  },
  {
    title: "Despliegue & DevOps",
    description:
      "Contenedores con Docker, integración continua, configuración de dominios y hosting.",
    icon: "cloud-arrow-up",
  },
];
</script>
