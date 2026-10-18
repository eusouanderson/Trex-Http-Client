<script setup lang="ts">
import type { ContextMenuProps, ContextMenuEmits } from './interfaces';
import { useContextMenu } from './use-context-menu';

const props = defineProps<ContextMenuProps>();
const emit = defineEmits<ContextMenuEmits>();

const { menuRef, menuStyle, handleSelect } = useContextMenu(props, emit);

const setMenuRef = (el: unknown): void => {
  menuRef.value = el as HTMLElement | null;
};
</script>

<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      :ref="setMenuRef"
      class="fixed z-50 min-w-[200px] bg-surface-panel border border-surface-border rounded-xl shadow-2xl py-1.5 overflow-hidden text-xs font-sans select-none backdrop-blur-md"
      :style="menuStyle"
      @contextmenu.prevent
    >
      <template v-for="item in items" :key="item.id">
        <div
          v-if="item.divider"
          class="my-1 border-t border-surface-border/60"
        />
        <button
          type="button"
          :disabled="item.disabled"
          class="w-full px-3 py-1.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
          :class="[
            item.disabled
              ? 'opacity-40 cursor-not-allowed'
              : item.danger
                ? 'text-magma-400 hover:bg-magma-500/10'
                : 'text-bone-200 hover:text-bone-100 hover:bg-surface-hover',
          ]"
          @click.stop="handleSelect(item)"
        >
          <div class="flex items-center gap-2 truncate">
            <span v-if="item.icon" class="text-xs shrink-0">{{ item.icon }}</span>
            <span class="truncate">{{ item.label }}</span>
          </div>
        </button>
      </template>
    </div>
  </teleport>
</template>

