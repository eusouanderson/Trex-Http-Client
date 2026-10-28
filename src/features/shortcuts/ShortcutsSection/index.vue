<script setup lang="ts">
import { useShortcutsSection } from './use-shortcuts-section';

const {
  searchQuery,
  selectedCategory,
  categories,
  filteredShortcuts,
  recordingShortcutId,
  recordedCombo,
  conflictWarning,
  startRecording,
  stopRecording,
  handleRecordKeyDown,
  saveRecordedCombo,
  resetShortcut,
  resetAll,
} = useShortcutsSection();
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-border">
      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-bone-100">Atalhos de Teclado</h3>
        <p class="text-[11px] text-fossil-400">Consulte, execute e personalize combinações de teclas para todas as ações do Trex.</p>
      </div>

      <button
        type="button"
        class="px-2.5 py-1 text-xs font-semibold rounded-lg border border-surface-border bg-surface-ground hover:bg-surface-hover text-fossil-300 hover:text-bone-100 transition-colors self-start sm:self-auto cursor-pointer"
        @click="resetAll"
      >
        Restaurar Padrões
      </button>
    </div>

    <div
      v-if="conflictWarning"
      class="p-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs flex items-center justify-between"
    >
      <span>{{ conflictWarning }}</span>
      <button
        type="button"
        class="text-xs text-amber-200 hover:text-bone-100 font-bold ml-2 cursor-pointer"
        @click="conflictWarning = null"
      >
        ✕
      </button>
    </div>

    <div class="space-y-3">
      <div class="relative w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar atalho por nome, descrição ou tecla..."
          aria-label="Buscar atalho"
          class="w-full bg-surface-ground border border-surface-border rounded-lg pl-8 pr-3 py-2 text-xs text-bone-100 placeholder-fossil-500 focus:outline-none focus:border-dino-400 transition-colors"
        />
        <span class="absolute left-2.5 top-2.5 text-xs text-fossil-400">🔍</span>
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0"
          :class="selectedCategory === cat.id
            ? 'bg-dino-500 text-surface-ground font-bold'
            : 'bg-surface-ground border border-surface-border text-fossil-300 hover:bg-surface-hover hover:text-bone-100'"
          @click="selectedCategory = cat.id"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <div class="overflow-hidden border rounded-lg border-surface-border bg-surface-panel divide-y divide-surface-border/50 max-h-[50vh] overflow-y-auto">
      <div
        v-if="filteredShortcuts.length === 0"
        class="p-6 text-center text-xs text-fossil-400"
      >
        Nenhum atalho encontrado para o filtro aplicado.
      </div>

      <div
        v-for="item in filteredShortcuts"
        :key="item.id"
        class="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface-hover/30 transition-colors"
      >
        <div class="min-w-0 flex-1 pr-2">
          <div class="flex items-center gap-2 mb-0.5">
            <span class="text-xs font-semibold text-bone-100">{{ item.name }}</span>
            <span class="px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider rounded bg-surface-ground text-fossil-400 border border-surface-border">
              {{ item.category }}
            </span>
            <span
              v-if="item.isCustom"
              class="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-dino-500/20 text-dino-300 border border-dino-500/40"
            >
              Personalizado
            </span>
          </div>
          <p class="text-[11px] text-fossil-400 truncate">{{ item.description }}</p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <div v-if="recordingShortcutId === item.id" class="flex items-center gap-1.5 animate-pulse">
            <input
              type="text"
              readonly
              :value="recordedCombo ? recordedCombo : 'Pressione a nova combinação...'"
              class="px-2 py-1 text-xs font-mono rounded bg-dino-500/20 text-dino-300 border border-dino-500 focus:outline-none text-center min-w-[150px]"
              @keydown="handleRecordKeyDown"
            />
            <button
              type="button"
              class="px-2 py-1 text-xs font-semibold rounded bg-dino-500 text-surface-ground hover:bg-dino-600 transition-colors cursor-pointer"
              :disabled="!recordedCombo"
              @click="saveRecordedCombo"
            >
              Salvar
            </button>
            <button
              type="button"
              class="px-2 py-1 text-xs font-semibold rounded bg-surface-ground border border-surface-border text-fossil-300 hover:bg-surface-hover transition-colors cursor-pointer"
              @click="stopRecording"
            >
              Cancelar
            </button>
          </div>

          <div v-else class="flex items-center gap-2">
            <kbd class="px-2.5 py-1 text-xs font-mono font-medium rounded bg-surface-ground border border-surface-border text-bone-100 shadow-sm min-w-[70px] text-center">
              {{ item.formattedCombo }}
            </kbd>

            <button
              type="button"
              title="Personalizar atalho"
              class="px-2 py-1 text-xs font-medium rounded border border-surface-border bg-surface-ground hover:bg-surface-hover text-fossil-300 hover:text-bone-100 transition-colors cursor-pointer"
              @click="startRecording(item.id)"
            >
              Alterar
            </button>

            <button
              v-if="item.isCustom"
              type="button"
              title="Restaurar combinação padrão"
              class="px-2 py-1 text-xs font-medium rounded border border-surface-border/60 bg-surface-ground hover:bg-magma-500/20 text-fossil-400 hover:text-magma-300 transition-colors cursor-pointer"
              @click="resetShortcut(item.id)"
            >
              Restaurar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

