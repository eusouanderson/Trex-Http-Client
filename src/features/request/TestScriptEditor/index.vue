<script setup lang="ts">
import { CodeEditor } from '../../../shared/editor/CodeEditor';
import type { TestScriptEditorEmits, TestScriptEditorProps } from './interfaces';
import { useTestScriptEditor } from './use-test-script-editor';

const props = defineProps<TestScriptEditorProps>();
const emit = defineEmits<TestScriptEditorEmits>();

const {
  script,
  snippets,
  handleScriptChange,
  applySnippet,
} = useTestScriptEditor(props, emit);
</script>

<template>
  <div class="flex flex-col h-full gap-4 md:flex-row">
    <div class="flex-1 flex flex-col min-h-[300px]">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-fossil-400">
          Escreva scripts JavaScript executados após receber a resposta (API <code>tx</code>).
        </span>
      </div>
      <div class="flex-1 overflow-hidden border rounded-lg border-surface-border bg-surface-ground">
        <code-editor
          :model-value="script"
          placeholder="// Exemplo de teste pós-resposta&#10;tx.test('Status deve ser 200', () => {&#10;  tx.response.to.have.status(200);&#10;});"
          @update:model-value="handleScriptChange"
        />
      </div>
    </div>

    <div class="flex flex-col w-full p-3 space-y-3 border rounded-lg md:w-64 border-surface-border bg-surface-ground/30">
      <div class="text-xs font-bold text-bone-200 flex items-center gap-1.5 border-b border-surface-border pb-2">
        <span>⚡</span>
        <span>Snippets Rápidos</span>
      </div>

      <div class="space-y-2 overflow-y-auto max-h-[320px]">
        <button
          v-for="item in snippets"
          :key="item.id"
          type="button"
          class="w-full p-2 text-left transition-colors border rounded-lg cursor-pointer border-surface-border bg-surface-panel hover:bg-surface-border/50 group"
          @click="applySnippet(item)"
        >
          <div class="text-xs font-bold text-dino-300 group-hover:text-dino-200">
            {{ item.title }}
          </div>
          <div class="text-[11px] text-fossil-400 mt-0.5 line-clamp-2">
            {{ item.description }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

