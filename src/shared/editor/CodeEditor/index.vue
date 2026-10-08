<script setup lang="ts">
import { Codemirror } from 'vue-codemirror';
import type { CodeEditorEmits, CodeEditorProps } from './interfaces';
import { useCodeEditor } from './use-code-editor';

const props = withDefaults(defineProps<CodeEditorProps>(), {
  showSearch: true,
});
const emit = defineEmits<CodeEditorEmits>();

const {
  code,
  extensions,
  showSearch,
  showCopy,
  isCopied,
  copyCode,
  handleUpdate,
  handleChange,
  handleReady,
  openSearch,
  logoSrc,
} = useCodeEditor(props, emit);
</script>

<template>
  <div class="relative w-full h-full overflow-hidden border rounded-lg select-text border-surface-border bg-surface-ground group">
    <div class="absolute top-1.5 right-2 z-10 flex items-center gap-1.5 opacity-60 hover:opacity-100 group-hover:opacity-100 transition-opacity">
      <button
        v-if="showSearch"
        type="button"
        title="Buscar no editor (Ctrl+F)"
        class="p-1.5 rounded bg-surface-panel/80 hover:bg-surface-hover text-fossil-300 hover:text-bone-100 border border-surface-border transition-colors text-xs flex items-center gap-1 shadow-sm backdrop-blur-sm"
        @click="openSearch"
      >
        <span>🔍</span>
        <span class="hidden sm:inline text-[10px] font-mono">Ctrl+F</span>
      </button>

      <button
        v-if="showCopy"
        type="button"
        :title="isCopied ? 'Copiado!' : 'Copiar código'"
        class="p-1.5 rounded bg-surface-panel/80 border border-surface-border transition-colors text-xs flex items-center gap-1 shadow-sm backdrop-blur-sm"
        :class="isCopied ? 'text-dino-400 border-dino-500/50' : 'text-fossil-300 hover:text-bone-100 hover:bg-surface-hover'"
        @click="copyCode"
      >
        <span>{{ isCopied ? '✓' : '📋' }}</span>
        <span class="hidden sm:inline text-[10px] font-mono">{{ isCopied ? 'Copiado' : 'Copiar' }}</span>
      </button>
    </div>
    <codemirror
      :model-value="code"
      :extensions="extensions"
      :placeholder="placeholder"
      :tab-size="2"
      :indent-with-tab="true"
      class="w-full h-full font-mono text-xs"
      @ready="handleReady"
      @update:model-value="handleUpdate"
      @change="handleChange"
    />
      <img
        v-if="!code.trim()"
        :src="logoSrc"
        alt="T-Rex"
        class="absolute top-1/2 left-1/2 z-[1] w-64 h-64 max-w-[80%] max-h-[80%] -translate-x-1/2 -translate-y-1/2 object-contain opacity-40 pointer-events-none select-none"
      />
  </div>
</template>
