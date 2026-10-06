<script setup lang="ts">
import type { EnvironmentManagerModalProps, EnvironmentManagerModalEmits } from './interfaces';
import { useEnvironmentManager } from './use-environment-manager';

defineProps<EnvironmentManagerModalProps>();
const emit = defineEmits<EnvironmentManagerModalEmits>();

const {
  environments,
  activeEnvironment,
  selectedEnvironment,
  selectEnvironment,
  handleCreateEnvironment,
  handleDeleteEnvironment,
  setAsActiveEnvironment,
  addVariable,
  removeVariable,
  updateVariable,
  updateEnvironmentName,
  isVariableVisible,
  toggleVariableVisibility,
  close,
} = useEnvironmentManager(() => {
  emit('close');
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-surface-panel border border-surface-border rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-surface-border bg-surface-ground">
        <div class="flex items-center gap-2">
          <span class="text-xl">🌍</span>
          <h2 class="text-lg font-bold text-bone-100">Gerenciar Ambientes</h2>
        </div>
        <button
          type="button"
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-fossil-400 hover:text-bone-100 transition-colors"
          @click="close"
        >
          ✕
        </button>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <div class="w-64 border-r border-surface-border bg-surface-ground/30 flex flex-col">
          <div class="p-4 border-b border-surface-border">
            <button
              type="button"
              class="w-full py-2 bg-dino-500 hover:bg-dino-600 text-surface-ground font-bold text-xs rounded-lg transition-colors cursor-pointer"
              @click="handleCreateEnvironment"
            >
              + Novo Ambiente
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-1">
            <button
              v-for="env in environments"
              :key="env.id"
              type="button"
              class="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between group cursor-pointer"
              :class="selectedEnvironment?.id === env.id ? 'bg-surface-hover text-dino-300' : 'text-bone-200 hover:bg-surface-hover/50'"
              @click="selectEnvironment(env.id)"
            >
              <div class="flex items-center gap-1.5 truncate min-w-0">
                <span class="truncate">{{ env.name }}</span>
                <span
                  v-if="activeEnvironment?.id === env.id"
                  class="text-[9px] px-1 py-0.2 bg-dino-500/20 text-dino-300 rounded border border-dino-500/30 font-bold shrink-0"
                >
                  ativo
                </span>
              </div>
              <span
                class="opacity-0 group-hover:opacity-100 text-magma-400 hover:text-magma-300 px-1 shrink-0"
                @click.stop="handleDeleteEnvironment(env.id)"
              >
                🗑
              </span>
            </button>
            <div v-if="environments.length === 0" class="p-4 text-center text-xs text-fossil-500">
              Nenhum ambiente criado.
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col bg-surface-panel overflow-hidden">
          <template v-if="selectedEnvironment">
            <div class="p-4 border-b border-surface-border bg-surface-ground/10 flex items-center justify-between gap-4">
              <input
                :value="selectedEnvironment.name"
                type="text"
                placeholder="Nome do Ambiente"
                class="bg-transparent border-b border-transparent hover:border-surface-border focus:border-dino-400 text-lg font-bold text-bone-100 focus:outline-none px-1 py-0.5 flex-1 min-w-0"
                @input="updateEnvironmentName(($event.target as HTMLInputElement).value)"
              />
              
              <div class="flex items-center gap-3 shrink-0">
                <button
                  v-if="activeEnvironment?.id !== selectedEnvironment.id"
                  type="button"
                  class="text-xs px-2.5 py-1.5 bg-surface-ground hover:bg-surface-hover border border-surface-border hover:border-dino-400 text-bone-200 hover:text-dino-300 rounded-lg font-medium transition-colors cursor-pointer"
                  @click="setAsActiveEnvironment(selectedEnvironment.id)"
                >
                  Definir como Ativo
                </button>
                <span
                  v-else
                  class="text-xs px-2.5 py-1.5 bg-dino-500/20 border border-dino-500/40 text-dino-300 rounded-lg font-semibold flex items-center gap-1"
                >
                  ✓ Ativo
                </span>

                <button
                  type="button"
                  class="text-xs px-3 py-1.5 bg-dino-500 hover:bg-dino-600 text-surface-ground font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  @click="addVariable"
                >
                  <span>+ Adicionar Variável</span>
                </button>
              </div>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4">
              <div class="border border-surface-border rounded-lg overflow-hidden bg-surface-ground/30">
                <div class="grid grid-cols-12 gap-2 p-2 border-b border-surface-border bg-surface-ground text-xs font-bold text-fossil-400">
                  <div class="col-span-1 text-center">✓</div>
                  <div class="col-span-4">Variável</div>
                  <div class="col-span-6">Valor</div>
                  <div class="col-span-1 text-center">Ações</div>
                </div>
                
                <div
                  v-for="v in selectedEnvironment.variables"
                  :key="v.id"
                  class="grid grid-cols-12 gap-2 p-2 border-b border-surface-border last:border-b-0 items-center"
                >
                  <div class="col-span-1 flex justify-center">
                    <input
                      :checked="v.enabled"
                      type="checkbox"
                      class="trex-checkbox cursor-pointer"
                      @change="updateVariable(v.id, 'enabled', ($event.target as HTMLInputElement).checked)"
                    />
                  </div>
                  <div class="col-span-4">
                    <input
                      :value="v.key"
                      type="text"
                      placeholder="minha_variavel"
                      class="w-full bg-transparent border border-transparent hover:border-surface-border focus:border-dino-400 rounded px-2 py-1 text-xs text-bone-100 placeholder-fossil-600 focus:outline-none font-mono"
                      @input="updateVariable(v.id, 'key', ($event.target as HTMLInputElement).value)"
                    />
                  </div>
                  <div class="col-span-6 flex items-center relative">
                    <input
                      :value="v.value"
                      :type="isVariableVisible(v.id) ? 'text' : 'password'"
                      placeholder="valor..."
                      class="w-full bg-transparent border border-transparent hover:border-surface-border focus:border-dino-400 rounded px-2 py-1 pr-7 text-xs text-bone-100 placeholder-fossil-600 focus:outline-none font-mono"
                      @input="updateVariable(v.id, 'value', ($event.target as HTMLInputElement).value)"
                    />
                    <button
                      type="button"
                      :title="isVariableVisible(v.id) ? 'Ocultar valor' : 'Mostrar valor'"
                      class="absolute right-1 text-xs text-fossil-400 hover:text-bone-100 p-1 cursor-pointer transition-colors"
                      @click="toggleVariableVisibility(v.id)"
                    >
                      <span v-if="isVariableVisible(v.id)">👁️</span>
                      <span v-else>🙈</span>
                    </button>
                  </div>
                  <div class="col-span-1 flex justify-center">
                    <button
                      type="button"
                      class="text-xs text-fossil-500 hover:text-magma-400 p-1 cursor-pointer"
                      @click="removeVariable(v.id)"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div v-if="selectedEnvironment.variables.length === 0" class="p-6 text-center text-xs text-fossil-500">
                  Nenhuma variável neste ambiente. Clique em "+ Adicionar Variável" para começar.
                </div>
              </div>
            </div>
          </template>
          
          <div v-else class="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div class="text-4xl mb-4">🌍</div>
              <h3 class="text-sm font-bold text-bone-100 mb-1">Selecione um Ambiente</h3>
              <p class="text-xs text-fossil-400">Crie ou selecione um ambiente na lateral para gerenciar suas variáveis.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
