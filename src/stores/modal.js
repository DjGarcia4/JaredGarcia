import { ref } from "vue";
import { defineStore } from "pinia";

export const useModalStore = defineStore("modal", () => {
  const showModal = ref(false);
  function handleModal(state) {
    showModal.value = state;
  }

  return { showModal, handleModal };
});
