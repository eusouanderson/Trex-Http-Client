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
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <div
        v-if="isVisible && (label || shortcutKey)"
        role="tooltip"
        class="absolute z-50 pointer-events-none flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-mono font-medium bg-stone-900/90 dark:bg-stone-950/90 text-stone-300 border border-stone-700/60 shadow-md backdrop-blur-sm select-none"
        :class="positionClass"
      >
        <span v-if="label" class="font-sans text-stone-200 mr-0.5">{{ label }}</span>
        <kbd v-if="shortcutKey" class="font-mono">
          {{ shortcutKey }}
        </kbd>
      </div>
    </transition>
  </div>
</template>

