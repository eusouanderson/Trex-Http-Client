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

const {
  triggerRef,
  isVisible,
  label,
  shortcutKey,
  tooltipStyle,
  show,
  hide,
} = useShortcutTooltip(props);

const setTriggerRef = (el: unknown): void => {
  triggerRef.value = el as HTMLElement | null;
};
</script>

<template>
  <div
    :ref="setTriggerRef"
    class="relative inline-flex"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />
    <teleport to="body">
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
          class="fixed z-[9999] pointer-events-none flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-mono font-medium bg-stone-900/90 dark:bg-stone-950/90 text-stone-300 border border-stone-700/60 shadow-md backdrop-blur-sm select-none"
          :style="tooltipStyle"
        >
          <span v-if="label" class="font-sans text-stone-200 mr-0.5">{{ label }}</span>
          <kbd v-if="shortcutKey" class="font-mono">
            {{ shortcutKey }}
          </kbd>
        </div>
      </transition>
    </teleport>
  </div>
</template>
