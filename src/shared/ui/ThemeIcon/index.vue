<script setup lang="ts">
import type { ThemeIconProps } from './interfaces';
import { useThemeIcon } from './use-theme-icon';

const props = withDefaults(defineProps<ThemeIconProps>(), {
  size: 'md',
  alt: 'Theme icon',
});

defineOptions({ name: 'ThemeIcon' });

const { isImage, resolvedSrc, displayIcon, sizeClasses, iconSizeClasses } = useThemeIcon(props);
</script>

<template>
  <div
    class="inline-flex items-center justify-center rounded-lg overflow-hidden shrink-0 select-none bg-surface-card border border-surface-border/40 shadow-sm"
    :class="sizeClasses"
  >
    <img
      v-if="isImage"
      :src="resolvedSrc"
      :alt="props.alt"
      class="w-full h-full object-contain p-1"
    />
    <span v-else :class="iconSizeClasses">
      {{ displayIcon }}
    </span>
  </div>
</template>

