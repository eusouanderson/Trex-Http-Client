<script setup lang="ts">
import type { TestResultsViewerProps } from './interfaces';
import { useTestResultsViewer } from './use-test-results-viewer';

const props = defineProps<TestResultsViewerProps>();

const {
  totalPassed,
  totalFailed,
  hasResults,
  results,
  mutations,
} = useTestResultsViewer(props);
</script>

<template>
  <div class="h-full flex flex-col space-y-4">
    <div v-if="!hasResults" class="p-8 text-center text-xs text-fossil-500 border border-dashed border-surface-border rounded-lg">
      Nenhum teste de resposta foi executado para esta requisição. Configure scripts na aba <strong>Testes</strong> do editor.
    </div>

    <div v-else class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="px-2.5 py-1 text-xs font-black rounded-md bg-dino-500/20 text-dino-300 border border-dino-500/30">
          ✓ PASSOU ({{ totalPassed }})
        </span>
        <span
          v-if="totalFailed > 0"
          class="px-2.5 py-1 text-xs font-black rounded-md bg-magma-500/20 text-magma-300 border border-magma-500/30"
        >
          ✕ FALHOU ({{ totalFailed }})
        </span>
      </div>

      <div class="space-y-2">
        <div
          v-for="(test, index) in results"
          :key="index"
          class="border rounded-lg p-3 bg-surface-ground/40 text-xs font-mono"
          :class="test.passed ? 'border-dino-500/30' : 'border-magma-500/30'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span :class="test.passed ? 'text-dino-400 font-bold' : 'text-magma-400 font-bold'">
                {{ test.passed ? '✓' : '✕' }}
              </span>
              <span class="font-semibold text-bone-100">{{ test.name }}</span>
            </div>
            <span class="text-fossil-500 text-[11px]">{{ test.durationMs }}ms</span>
          </div>

          <div
            v-if="!test.passed && test.error"
            class="mt-2 p-2 rounded bg-magma-500/10 text-magma-300 text-[11px] border border-magma-500/20"
          >
            {{ test.error }}
          </div>
        </div>
      </div>

      <div v-if="mutations.length > 0" class="border border-surface-border rounded-lg p-3 bg-surface-ground/30 space-y-2">
        <div class="text-xs font-bold text-bone-200 flex items-center gap-1.5 border-b border-surface-border pb-1.5">
          <span>🔄</span>
          <span>Variáveis de Ambiente Atualizadas</span>
        </div>
        <div class="space-y-1">
          <div
            v-for="(mut, idx) in mutations"
            :key="idx"
            class="flex items-center justify-between text-xs font-mono py-1 px-2 rounded bg-surface-panel"
          >
            <span class="text-dino-400 font-semibold">{{ mut.key }}</span>
            <span class="text-bone-200 truncate max-w-xs">{{ mut.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

