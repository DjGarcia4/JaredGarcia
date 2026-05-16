<template>
  <TransitionRoot as="template" :show="modal.showModal">
    <Dialog as="div" class="relative z-50" @close="modal.handleModal(false)">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-ink-950/80 backdrop-blur-sm"></div>
      </TransitionChild>

      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-6"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-6 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-6 sm:scale-95"
          >
            <DialogPanel
              class="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-850 p-6 shadow-card md:p-8"
            >
              <button
                type="button"
                @click="modal.handleModal(false)"
                aria-label="Cerrar"
                class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/50 transition-all hover:border-red-500/40 hover:text-red-400"
              >
                <font-awesome-icon :icon="['fas', 'xmark']" />
              </button>

              <FormContact />
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";

import { useModalStore } from "@/stores/modal";
import FormContact from "@/components/FormContact.vue";

const modal = useModalStore();
</script>
