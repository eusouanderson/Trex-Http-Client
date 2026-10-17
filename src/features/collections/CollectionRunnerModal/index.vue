<script setup lang="ts">
import type { CollectionRunnerModalProps, CollectionRunnerModalEmits } from './interfaces';
import { useCollectionRunnerModal } from './use-collection-runner-modal';

const props = defineProps<CollectionRunnerModalProps>();
const emit = defineEmits<CollectionRunnerModalEmits>();

const {
  isRunning,
  isFinished,
  totalRequests,
  progressPercentage,
  passedCount,
  failedCount,
  totalDurationMs,
  itemsResults,
  startRun,
  stopRun,
  close,
} = useCollectionRunnerModal(props, () => {
  emit('close');
});
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none"
  >
    <div
      class="bg-surface-panel border border-surface-border rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden text-bone-100 font-sans"
    >
      <div class="flex items-center justify-between p-4 border-b border-surface-border bg-surface-ground">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">🚀</span>
          <div>
            <h2 class="text-sm font-bold text-bone-100 flex items-center gap-2">
              <span>Executar Coleção:</span>
              <span class="text-dino-400">{{ collection?.name }}</span>
            </h2>
            <span class="text-[11px] text-fossil-400">
              {{ totalRequests }} requisições no lote
            </span>
          </div>
        </div>
        <button
          type="button"
          title="Fechar"
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-fossil-400 hover:text-bone-100 transition-colors cursor-pointer text-xs"
          @click="close"
        >
          ✕
        </button>
      </div>

      <div class="p-4 border-b border-surface-border bg-surface-panel space-y-3">
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-4">
            <span class="text-fossil-300">
              Progresso:
              <strong class="text-bone-100 font-mono">{{ itemsResults.length }} / {{ totalRequests }}</strong>
            </span>
            <span class="text-dino-400 font-semibold">
              ✓ {{ passedCount }} passaram
            </span>
            <span v-if="failedCount > 0" class="text-magma-400 font-semibold">
              ✕ {{ failedCount }} falharam
            </span>
          </div>
          <div class="text-fossil-400 font-mono text-[11px]">
            Tempo: {{ totalDurationMs }} ms
          </div>
        </div>

        <div class="w-full bg-surface-ground h-2 rounded-full overflow-hidden border border-surface-border">
          <div
            class="h-full bg-dino-500 transition-all duration-300"
            :style="{ width: `${progressPercentage}%` }"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-2 bg-surface-ground/30">
        <div
          v-if="itemsResults.length === 0 && !isRunning"
          class="space-y-1.5"
        >
          <div class="text-xs text-fossil-400 mb-2">
            Lista de requisições prontas para execução:
          </div>
          <div
            v-for="(item, idx) in collection?.items.filter((i) => i.type === 'request')"
            :key="item.id"
            class="flex items-center justify-between px-3 py-2 bg-surface-panel/60 border border-surface-border/60 rounded-lg text-xs"
          >
            <div class="flex items-center gap-2 truncate">
              <span class="text-[10px] font-mono text-fossil-500 w-4">{{ idx + 1 }}.</span>
              <span
                class="text-[10px] font-black w-8 tracking-tight"
                :class="{
                  'text-dino-400': item.method === 'GET',
                  'text-amber-400': item.method === 'POST',
                  'text-blue-400': item.method === 'PUT',
                  'text-magma-400': item.method === 'DELETE',
                  'text-purple-400': item.method === 'PATCH',
                }"
              >
                {{ item.method ?? 'GET' }}
              </span>
              <span class="font-semibold text-bone-200 truncate">{{ item.name }}</span>
            </div>
            <span class="text-[11px] text-fossil-400 font-mono truncate max-w-[280px]">
              {{ item.url }}
            </span>
          </div>
        </div>

        <div
          v-for="(res, idx) in itemsResults"
          :key="res.itemId"
          class="p-3 bg-surface-panel border rounded-lg space-y-2 transition-all duration-150"
          :class="res.status && res.status >= 200 && res.status < 400 && res.error === undefined
            ? 'border-surface-border'
            : 'border-magma-500/40 bg-magma-500/5'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 truncate flex-1 min-w-0 mr-2">
              <span class="text-[10px] font-mono text-fossil-500 w-4">{{ idx + 1 }}.</span>
              <span
                class="text-[10px] font-black w-8 tracking-tight shrink-0"
                :class="{
                  'text-dino-400': res.method === 'GET',
                  'text-amber-400': res.method === 'POST',
                  'text-blue-400': res.method === 'PUT',
                  'text-magma-400': res.method === 'DELETE',
                  'text-purple-400': res.method === 'PATCH',
                }"
              >
                {{ res.method }}
              </span>
              <span class="font-semibold text-xs text-bone-100 truncate">{{ res.name }}</span>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span
                v-if="res.status"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono"
                :class="{
                  'text-dino-400 bg-dino-500/10': res.status >= 200 && res.status < 300,
                  'text-amber-400 bg-amber-500/10': res.status >= 300 && res.status < 400,
                  'text-magma-400 bg-magma-500/10': res.status >= 400 || res.status === 0,
                }"
              >
                {{ res.status }} {{ res.statusText }}
              </span>
              <span class="text-[10px] text-fossil-400 font-mono">
                {{ res.durationMs }} ms
              </span>
            </div>
          </div>

          <div v-if="res.error" class="text-[11px] text-magma-400 font-mono">
            ⚠ {{ res.error }}
          </div>

          <div v-if="res.tests.length > 0" class="pl-6 space-y-1 border-t border-surface-border/40 pt-1.5">
            <div
              v-for="t in res.tests"
              :key="t.name"
              class="flex items-center gap-2 text-[11px]"
              :class="t.passed ? 'text-dino-300' : 'text-magma-400 font-semibold'"
            >
              <span>{{ t.passed ? '✓' : '✕' }}</span>
              <span>{{ t.name }}</span>
              <span v-if="t.error" class="text-[10px] text-magma-500">({{ t.error }})</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between p-4 border-t border-surface-border bg-surface-ground">
        <div class="text-xs text-fossil-400">
          <span v-if="isRunning" class="text-dino-400 font-semibold animate-pulse">
            Executando requisições...
          </span>
          <span v-else-if="isFinished" class="text-bone-200">
            Execução concluída!
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="!isRunning"
            type="button"
            class="px-4 py-2 bg-dino-500 hover:bg-dino-600 text-surface-ground font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            @click="startRun"
          >
            <span>▶</span>
            <span>{{ isFinished ? 'Executar Novamente' : 'Iniciar Execução' }}</span>
          </button>
          <button
            v-else
            type="button"
            class="px-4 py-2 bg-magma-500 hover:bg-magma-600 text-bone-100 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            @click="stopRun"
          >
            <span>⏹</span>
            <span>Parar</span>
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-surface-panel hover:bg-surface-hover border border-surface-border rounded-lg text-xs text-bone-200 transition-colors cursor-pointer"
            @click="close"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

