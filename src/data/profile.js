// WhatsApp: número internacional sin + ni espacios, y mensaje
// que se precarga al abrir el chat. Se usa tanto para el link como
// para generar el QR dinámico — single source of truth.
const WHATSAPP_NUMBER = "50487854736";
const WHATSAPP_MESSAGE =
  "¡Hola Jared! Vi tu portafolio y me interesa hablar de un proyecto.";

export const profile = {
  name: "Jared Garcia",
  roles: ["Frontend Developer", "UX/UI Designer"],
  title: "Ingeniero en Ciencias de la Computación",
  email: "denisjared286@gmail.com",
  location: "Honduras",
  bio: "Me apasiona crear experiencias digitales que impacten. Tengo experiencia sólida en desarrollo web frontend y me encanta enfrentar desafíos creativos que me reten a subir de nivel constantemente.",
  cvUrl:
    "https://drive.google.com/file/d/1GNi77TQDAXmsa0jGcdN3a_QELK-lA0ty/view?usp=drive_link",
  socials: {
    github: "https://github.com/DjGarcia4",
    linkedin: "https://www.linkedin.com/in/jared-garcia-739255243/",
    whatsapp: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      WHATSAPP_MESSAGE
    )}`,
    // TODO: reemplazá con tu usuario real de Instagram.
    instagram: "https://instagram.com/tu_usuario",
  },
};
