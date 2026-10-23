<script setup lang="ts">
import type { ShortcutTooltipProps } from './interfaces';
import { useShortcutTooltip } from './use-shortcut-tooltip';

const props = withDefaults(defineProps<ShortcutTooltipProps>(), {
  text: undefined,
  shortcutId: undefined,
  position: 'top',
  disabled: false,
  delayMs: 300,
});

const { isVisible, label, shortcutKey, positionClass, show, hide } =
  useShortcutTooltip(props);
</script>

<template>
  <div
    class="relative inline-flex"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isVisible && (label || shortcutKey)"
        role="tooltip"
        class="absolute z-50 pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-md bg-stone-900/95 dark:bg-stone-950/95 text-stone-100 px-2 py-1 text-xs font-sans shadow-lg border border-stone-700/60 backdrop-blur-sm"
        :class="positionClass"
      >
        <span v-if="label">{{ label }}</span>
        <kbd
          v-if="shortcutKey"
          class="rounded bg-stone-800/90 dark:bg-stone-800/90 px-1.5 py-0.5 text-[10px] font-mono font-medium text-stone-300 border border-stone-600/50 shadow-inner"
        >
          {{ shortcutKey }}
        </kbd>
      </div>
    </transition>
  </div>
</template>

