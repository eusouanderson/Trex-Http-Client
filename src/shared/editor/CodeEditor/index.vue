<script setup lang="ts">
import { Codemirror } from 'vue-codemirror';
import type { CodeEditorProps, CodeEditorEmits } from './interfaces';
import { useCodeEditor } from './use-code-editor';

const props = withDefaults(defineProps<CodeEditorProps>(), {
  showSearch: true,
});
const emit = defineEmits<CodeEditorEmits>();

const {
  code,
  extensions,
  showSearch,
  handleUpdate,
  handleChange,
  handleReady,
  openSearch,
} = useCodeEditor(props, emit);
</script>

<template>
  <div class="relative h-full w-full rounded-lg overflow-hidden border border-surface-border bg-surface-ground group">
    <button
      v-if="showSearch"
      type="button"
      title="Buscar no editor (Ctrl+F)"
      class="absolute top-1.5 right-2 z-10 p-1.5 rounded bg-surface-panel/80 hover:bg-surface-hover text-fossil-300 hover:text-bone-100 border border-surface-border transition-colors text-xs flex items-center gap-1 shadow-sm backdrop-blur-sm opacity-60 hover:opacity-100 group-hover:opacity-100"
      @click="openSearch"
    >
      <span>🔍</span>
      <span class="hidden sm:inline text-[10px] font-mono">Ctrl+F</span>
    </button>
    <codemirror
      :model-value="code"
      :extensions="extensions"
      :disabled="readOnly"
      :placeholder="placeholder"
      :tab-size="2"
      :indent-with-tab="true"
      class="h-full w-full text-xs font-mono"
      @ready="handleReady"
      @update:model-value="handleUpdate"
      @change="handleChange"
    />
  </div>
</template>
