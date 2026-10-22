<script setup lang="ts">
import { usePwaUpdateNotification } from './use-pwa-update-notification';

defineOptions({ name: 'PwaUpdateNotification' });

const { shouldShow, isUpdating, applyUpdate, dismissUpdate } = usePwaUpdateNotification();
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-4 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-4 opacity-0"
  >
    <div
      v-if="shouldShow"
      data-testid="pwa-update-notification"
      role="alert"
      aria-live="polite"
      class="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-80 p-4 bg-surface-panel border border-surface-border rounded-xl shadow-2xl flex flex-col gap-3 font-sans text-bone-100 select-none animate-in fade-in"
    >
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-dino-500/10 border border-dino-500/30 flex items-center justify-center shrink-0 text-dino-400 mt-0.5">
          <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-bone-100 tracking-tight">Nova versão disponível</h4>
          <p class="text-[11px] text-fossil-400 mt-0.5 leading-relaxed">
            Uma atualização do Trex está pronta para ser instalada.
          </p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-1 border-t border-surface-border/50">
        <button
          type="button"
          data-testid="pwa-update-dismiss-btn"
          class="px-3 py-1.5 text-xs font-medium text-fossil-400 hover:text-bone-100 hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
          @click="dismissUpdate"
        >
          Depois
        </button>

        <button
          type="button"
          data-testid="pwa-update-now-btn"
          :disabled="isUpdating"
          class="px-3 py-1.5 text-xs font-bold bg-dino-500 hover:bg-dino-600 disabled:opacity-50 text-surface-ground rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-dino-500/20 cursor-pointer disabled:cursor-not-allowed"
          @click="applyUpdate"
        >
          <svg v-if="isUpdating" class="w-3.5 h-3.5 animate-spin fill-none stroke-current" stroke-width="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
            <path stroke-linecap="round" d="M12 2a10 10 0 0110 10" />
          </svg>
          <span>{{ isUpdating ? 'Atualizando...' : 'Atualizar agora' }}</span>
        </button>
      </div>
    </div>
  </transition>
</template>
