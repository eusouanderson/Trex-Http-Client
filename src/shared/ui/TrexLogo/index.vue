<script setup lang="ts">
import type { TrexLogoProps } from './interfaces';
import { useTrexLogo } from './use-trex-logo';

const props = withDefaults(defineProps<TrexLogoProps>(), {
  size: 'sm',
});

defineOptions({ name: 'TrexLogo' });

const { logoSrc, containerClasses, innerClasses } = useTrexLogo(props);
</script>

<template>
  <div
    class="relative inline-flex items-center justify-center overflow-hidden rounded-lg shadow-sm shrink-0 animate-border-pulse"
    :class="containerClasses"
  >
    <div class="absolute inset-0 bg-gradient-to-tr from-dino-500 via-dino-300 to-amber-400 animate-spin-slow opacity-90"></div>
    <div
      class="relative z-10 flex items-center justify-center w-full h-full shadow-inner bg-bone-50"
      :class="innerClasses"
    >
      <img :src="logoSrc" alt="T-Rex" class="object-contain w-full h-full drop-shadow-sm" />
    </div>
  </div>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg) scale(1.5);
  }
  to {
    transform: rotate(360deg) scale(1.5);
  }
}

.animate-border-pulse {
  animation: border-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes border-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.2);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.4);
  }
}
</style>