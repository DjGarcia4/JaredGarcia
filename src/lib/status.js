// Estilos del badge de estado de un proyecto.

const styles = {
  Producción: "border-accent/30 bg-accent/10 text-accent-light",
  "En desarrollo": "border-amber-400/30 bg-amber-400/10 text-amber-300",
  "En curso": "border-amber-400/30 bg-amber-400/10 text-amber-300",
  Concepto: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  Archivado: "border-white/15 bg-white/[0.05] text-white/45",
};

export const statusStyle = (status) =>
  styles[status] || styles.Archivado;
