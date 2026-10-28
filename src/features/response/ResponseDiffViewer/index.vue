<script setup lang="ts">
import type { ResponseDiffViewerProps } from './interfaces';
import { useResponseDiffViewer } from './use-response-diff-viewer';

const props = defineProps<ResponseDiffViewerProps>();

const {
  targetTabId,
  viewMode,
  onlyDifferences,
  isSnapshotPinned,
  availableTargets,
  targetResult,
  diffResult,
  filteredLines,
  toggleViewMode,
  viewModeLabel,
  onlyDifferencesLabel,
  toggleOnlyDifferences,
  pinSnapshot,
  clearSnapshot,
  formatDurationDelta,
  formatSizeDelta,
  getLineNumber,
  getLineContent,
  getDiffSymbolLeft,
  getDiffSymbolRight,
  getUnifiedSymbol,
  getUnifiedContent,
  getLineClassLeft,
  getLineClassRight,
  getUnifiedClass,
} = useResponseDiffViewer(props);
</script>

<template>
  <div class="h-full flex flex-col bg-surface-panel overflow-hidden select-text text-xs">
    <div class="p-2.5 border-b border-surface-border bg-surface-ground/30 flex flex-wrap items-center justify-between gap-2 shrink-0">
      <div class="flex items-center gap-2">
        <span class="text-fossil-400 font-semibold shrink-0">Comparar com:</span>
        <select
          v-model="targetTabId"
          class="bg-surface-panel border border-surface-border rounded-md px-2.5 py-1 text-xs text-bone-100 focus:outline-none focus:border-dino-400 cursor-pointer min-w-[180px]"
        >
          <option value="">Selecione uma aba ou snapshot...</option>
          <option
            v-for="target in availableTargets"
            :key="target.id"
            :value="target.id"
          >
            [{{ target.method }}] {{ target.name }}
          </option>
        </select>

        <div v-if="isSnapshotPinned" class="flex items-center gap-1 bg-surface-ground px-2 py-0.5 rounded border border-surface-border">
          <span class="text-[11px] text-dino-300 font-semibold">Snapshot fixado 📌</span>
          <button
            type="button"
            data-testid="clear-snapshot-button"
            class="text-fossil-400 hover:text-magma-300 p-0.5"
            title="Limpar snapshot"
            @click="clearSnapshot"
          >
            ✕
          </button>
        </div>

        <button
          v-else
          type="button"
          data-testid="pin-snapshot-button"
          class="px-2.5 py-1 bg-surface-ground hover:bg-surface-hover border border-surface-border rounded-md text-bone-200 transition-colors flex items-center gap-1 font-semibold"
          title="Fixar a resposta atual para comparar com requisições futuras"
          @click="pinSnapshot"
        >
          <span>📌</span>
          <span>Fixar Snapshot</span>
        </button>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          data-testid="toggle-only-diff"
          class="px-2 py-1 rounded-md border text-[11px] font-semibold transition-colors"
          :class="onlyDifferences ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-surface-ground text-fossil-300 border-surface-border hover:text-bone-100'"
          @click="toggleOnlyDifferences"
        >
          {{ onlyDifferencesLabel }}
        </button>

        <button
          type="button"
          data-testid="toggle-view-mode"
          class="px-2 py-1 bg-surface-ground hover:bg-surface-hover border border-surface-border rounded-md text-[11px] text-bone-200 transition-colors font-semibold"
          @click="toggleViewMode"
        >
          {{ viewModeLabel }}
        </button>
      </div>
    </div>

    <div
      v-if="targetResult"
      class="px-3 py-1.5 border-b border-surface-border bg-surface-panel flex flex-wrap items-center justify-between gap-2 shrink-0 text-[11px] font-mono"
    >
      <div class="flex items-center gap-3">
        <span class="text-fossil-400 font-sans font-semibold">Métricas:</span>
        <span
          class="px-2 py-0.5 rounded border"
          :class="diffResult.meta.statusEqual ? 'text-dino-400 border-dino-500/30 bg-dino-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'"
        >
          Status: {{ diffResult.meta.statusLeft }} vs {{ diffResult.meta.statusRight }}
        </span>

        <span class="text-fossil-300">
          Tempo: {{ formatDurationDelta(diffResult.meta.durationDeltaMs) }}
        </span>

        <span class="text-fossil-300">
          Tamanho: {{ formatSizeDelta(diffResult.meta.sizeDeltaBytes) }}
        </span>
      </div>

      <div class="flex items-center gap-1.5">
        <span class="px-1.5 py-0.5 rounded bg-dino-500/10 text-dino-300 border border-dino-500/20">
          +{{ diffResult.summary.totalAdded }}
        </span>
        <span class="px-1.5 py-0.5 rounded bg-magma-500/10 text-magma-300 border border-magma-500/20">
          -{{ diffResult.summary.totalRemoved }}
        </span>
        <span class="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
          ~{{ diffResult.summary.totalModified }}
        </span>
      </div>
    </div>

    <div
      v-if="!targetResult"
      class="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-2 text-fossil-400"
    >
      <div class="w-12 h-12 rounded-xl bg-surface-ground border border-surface-border flex items-center justify-center text-xl">
        ⇄
      </div>
      <h3 class="text-xs font-semibold text-bone-200">Pronto para comparar respostas</h3>
      <p class="text-[11px] max-w-sm">
        Selecione uma outra aba que já tenha sido executada ou clique em "Fixar Snapshot" para guardar esta resposta e compará-la com execuções futuras.
      </p>
    </div>

    <div
      v-else
      data-testid="diff-container"
      class="flex-1 overflow-auto font-mono text-[11px] bg-surface-ground"
    >
      <div v-if="viewMode === 'split'" class="grid grid-cols-2 divide-x divide-surface-border min-w-full">
        <div class="p-1">
          <div class="sticky top-0 bg-surface-panel/90 backdrop-blur px-2 py-1 text-[10px] text-fossil-400 font-sans border-b border-surface-border uppercase tracking-wider">
            Atual (Referência)
          </div>
          <div
            v-for="(line, idx) in filteredLines"
            :key="`left-${idx}`"
            class="flex items-start px-2 py-0.5 hover:bg-surface-hover/30 leading-5"
            :class="getLineClassLeft(line.type)"
          >
            <span class="w-8 shrink-0 text-fossil-500 select-none text-right pr-2">
              {{ getLineNumber(line.lineNumberLeft) }}
            </span>
            <span class="select-none pr-1.5 text-fossil-400">
              {{ getDiffSymbolLeft(line.type) }}
            </span>
            <span class="whitespace-pre-wrap break-all flex-1">
              {{ getLineContent(line.contentLeft) }}
            </span>
          </div>
        </div>

        <div class="p-1">
          <div class="sticky top-0 bg-surface-panel/90 backdrop-blur px-2 py-1 text-[10px] text-fossil-400 font-sans border-b border-surface-border uppercase tracking-wider">
            Comparado
          </div>
          <div
            v-for="(line, idx) in filteredLines"
            :key="`right-${idx}`"
            class="flex items-start px-2 py-0.5 hover:bg-surface-hover/30 leading-5"
            :class="getLineClassRight(line.type)"
          >
            <span class="w-8 shrink-0 text-fossil-500 select-none text-right pr-2">
              {{ getLineNumber(line.lineNumberRight) }}
            </span>
            <span class="select-none pr-1.5 text-fossil-400">
              {{ getDiffSymbolRight(line.type) }}
            </span>
            <span class="whitespace-pre-wrap break-all flex-1">
              {{ getLineContent(line.contentRight) }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="p-2 space-y-0.5">
        <div
          v-for="(line, idx) in filteredLines"
          :key="`unified-${idx}`"
          class="flex items-start px-2 py-0.5 hover:bg-surface-hover/30 leading-5 rounded"
          :class="getUnifiedClass(line.type)"
        >
          <span class="w-7 shrink-0 text-fossil-500 select-none text-right pr-1">
            {{ getLineNumber(line.lineNumberLeft) }}
          </span>
          <span class="w-7 shrink-0 text-fossil-500 select-none text-right pr-2">
            {{ getLineNumber(line.lineNumberRight) }}
          </span>
          <span class="select-none pr-2 font-bold">
            {{ getUnifiedSymbol(line.type) }}
          </span>
          <span class="whitespace-pre-wrap break-all flex-1">
            {{ getUnifiedContent(line) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
