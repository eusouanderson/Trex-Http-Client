<script setup lang="ts">

import { CodeEditor } from '../../../shared/editor/CodeEditor';
import { TestResultsViewer } from '../TestResultsViewer';
import type { ResponseViewerProps } from './interfaces';
import { useResponseViewer } from './use-response-viewer';

defineProps<ResponseViewerProps>();

const {
  activeTab,
  setTab,
  formatBytes,
  formatDuration,
  getStatusColor,
  formatResponseData,
  logoSrc,
} = useResponseViewer();
</script>

<template>
  <div class="h-full flex flex-col bg-surface-panel overflow-hidden select-text">
    <div
      v-if="result"
      class="response-meta-bar p-3 border-b border-surface-border bg-surface-ground/30 flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <span
          class="px-2.5 py-1 text-xs font-black rounded-md border flex items-center gap-1.5"
          :class="getStatusColor(result.status)"
        >
          <span>●</span>
          <span>{{ result.status }} {{ result.statusText }}</span>
        </span>

        <span class="text-xs text-fossil-400 font-mono">
          ⏱ {{ formatDuration(result.durationMs) }}
        </span>

        <span class="text-xs text-fossil-400 font-mono">
          📦 {{ formatBytes(result.sizeBytes) }}
        </span>
      </div>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="px-2.5 py-1 text-xs font-semibold rounded-md transition-colors"
          :class="activeTab === 'body' ? 'bg-surface-border text-bone-100' : 'text-fossil-400 hover:text-bone-200'"
          @click="setTab('body')"
        >
          Corpo
        </button>
        <button
          type="button"
          class="px-2.5 py-1 text-xs font-semibold rounded-md transition-colors"
          :class="activeTab === 'headers' ? 'bg-surface-border text-bone-100' : 'text-fossil-400 hover:text-bone-200'"
          @click="setTab('headers')"
        >
          Headers ({{ Object.keys(result.headers).length }})
        </button>
        <button
          type="button"
          class="px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1"
          :class="activeTab === 'tests' ? 'bg-surface-border text-bone-100' : 'text-fossil-400 hover:text-bone-200'"
          @click="setTab('tests')"
        >
          <span>Testes</span>
          <span
            v-if="result.testResults && result.testResults.results.length > 0"
            class="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
            :class="result.testResults.totalFailed > 0 ? 'bg-magma-500/30 text-magma-300' : 'bg-dino-500/30 text-dino-300'"
          >
            {{ result.testResults.totalPassed }}/{{ result.testResults.results.length }}
          </span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
      <div class="w-12 h-12 rounded-full border-2 border-dino-500/20 border-t-dino-400 animate-spin flex items-center justify-center">
        <img :src="logoSrc" alt="T-Rex" class="w-8 h-8 object-contain" />
      </div>
      <p class="text-xs font-semibold text-dino-300 animate-pulse">Aguardando resposta do T-Rex...</p>
    </div>

    <div v-else-if="!result" class="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div class="w-20 h-20 rounded-2xl bg-surface-ground border border-surface-border flex items-center justify-center">
        <img :src="logoSrc" alt="T-Rex" class="w-16 h-16 object-contain" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-bone-200">Pronto para disparar</h3>
        <p class="text-xs text-fossil-400 mt-1 max-w-xs">
          Configure sua URL, parâmetros ou headers e clique em "Enviar" para inspecionar os dados.
        </p>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto p-4">
      <div v-if="activeTab === 'body'" class="h-full">
        <div
          v-if="result.error"
          class="p-4 bg-magma-500/10 border border-magma-500/30 rounded-lg text-xs text-magma-300 space-y-2 font-mono"
        >
          <div class="font-bold">⚠️ Erro na Requisição:</div>
          <div>{{ result.error }}</div>
          <div
            v-if="result.validationIssues && result.validationIssues.length > 0"
            class="pt-2 border-t border-magma-500/20 space-y-1.5 font-sans"
            data-testid="validation-issues-list"
          >
            <div
              v-for="issue in result.validationIssues"
              :key="issue.code"
              class="bg-magma-500/5 p-2 rounded border border-magma-500/20 text-xs"
            >
              <div class="font-semibold text-magma-200">
                {{ issue.message }}
              </div>
              <div class="text-fossil-300 text-[11px] mt-0.5">
                💡 {{ issue.remediation }}
              </div>
            </div>
          </div>
        </div>

        <code-editor
          v-else
          :model-value="formatResponseData(result.data)"
          :read-only="true"
        />
      </div>

      <div v-if="activeTab === 'headers'" class="space-y-2">
        <div class="border border-surface-border rounded-lg overflow-hidden bg-surface-ground/30">
          <div
            v-for="(val, key) in result.headers"
            :key="key"
            class="flex items-center justify-between border-b border-surface-border last:border-b-0 px-3 py-2 text-xs font-mono"
          >
            <span class="text-dino-400 font-semibold">{{ key }}</span>
            <span class="text-bone-200 truncate max-w-md">{{ val }}</span>
          </div>

          <div
            v-if="Object.keys(result.headers).length === 0"
            class="p-4 text-center text-xs text-fossil-500"
          >
            Nenhum header retornado pela resposta.
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'tests'" class="h-full">
        <test-results-viewer :report="result.testResults" />
      </div>
    </div>
  </div>
</template>


