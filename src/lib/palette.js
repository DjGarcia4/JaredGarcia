// Estado compartido de la paleta de comandos (⌘K / Ctrl+K).
import { ref } from "vue";

export const paletteOpen = ref(false);
export const paletteUsed = ref(false);

export const openPalette = () => {
  paletteUsed.value = true;
  paletteOpen.value = true;
};

export const closePalette = () => {
  paletteOpen.value = false;
};

export const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
