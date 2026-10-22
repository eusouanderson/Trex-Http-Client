<script setup lang="ts">
import { useCommandPalette } from './use-command-palette';
import type { CommandPaletteProps, CommandPaletteEmits } from './interfaces';

const props = defineProps<CommandPaletteProps>();
const emit = defineEmits<CommandPaletteEmits>();

const {
  searchQuery,
  filteredCommands,
  selectedIndex,
  executeItem,
  close,
  handleKeydown,
} = useCommandPalette({ emit });
</script>

<template>
  <div
    v-if="props.isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-surface-ground/70 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-label="Paleta de Comandos"
    @click.self="close"
  >
    <div
      class="w-full max-w-xl overflow-hidden border rounded-xl shadow-2xl border-surface-border bg-surface-panel flex flex-col max-h-[70vh] animate-in fade-in zoom-in-95 duration-100"
    >
      <div class="flex items-center gap-2 px-4 py-3 border-b border-surface-border bg-surface-ground/30">
        <span class="text-fossil-400 text-sm">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Digite um comando ou atalho..."
          aria-label="Buscar comando"
          autofocus
          class="flex-1 bg-transparent text-sm text-bone-100 placeholder-fossil-500 focus:outline-none"
          @keydown="handleKeydown"
        />
        <kbd class="px-1.5 py-0.5 text-[10px] font-mono text-fossil-400 bg-surface-ground border border-surface-border rounded">
          ESC
        </kbd>
      </div>

      <div class="flex-1 overflow-y-auto p-1 divide-y divide-surface-border/30">
        <div
          v-if="filteredCommands.length === 0"
          class="px-4 py-8 text-center text-xs text-fossil-400"
        >
          Nenhum comando correspondente encontrado
        </div>

        <button
          v-for="(cmd, idx) in filteredCommands"
          :key="cmd.id"
          type="button"
          class="flex items-center justify-between w-full px-3 py-2 text-left rounded-lg transition-colors cursor-pointer"
          :class="idx === selectedIndex ? 'bg-dino-500/20 text-dino-300 border border-dino-500/40' : 'text-bone-200 hover:bg-surface-hover/70'"
          @click="executeItem(cmd)"
        >
          <div class="flex flex-col min-w-0 pr-2">
            <span class="text-xs font-semibold truncate">{{ cmd.title }}</span>
            <span class="text-[11px] text-fossil-400 truncate">{{ cmd.description }}</span>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <span class="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-surface-ground/80 text-fossil-400 border border-surface-border">
              {{ cmd.category }}
            </span>
            <kbd class="px-2 py-0.5 text-xs font-mono font-medium rounded bg-surface-ground border border-surface-border text-bone-100">
              {{ cmd.formattedShortcut }}
            </kbd>
          </div>
        </button>
      </div>

      <div class="px-4 py-2 text-[11px] text-fossil-400 border-t border-surface-border bg-surface-ground/20 flex items-center justify-between">
        <span>↑↓ para navegar</span>
        <span>Enter para executar</span>
      </div>
    </div>
  </div>
</template>
