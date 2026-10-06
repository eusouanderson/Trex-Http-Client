<script setup lang="ts">
import type { EnvironmentSelectorEmits } from './interfaces';
import { useEnvironmentSelector } from './use-environment-selector';

const emit = defineEmits<EnvironmentSelectorEmits>();

const { environments, activeEnvironment, handleSelectEnvironment, openManager } =
  useEnvironmentSelector(() => {
    emit('openManager');
  });

const onSelectChange = (event: Event): void => {
  const select = event.target as HTMLSelectElement;
  const val = select.value;
  if (val === 'manage') {
    select.value = activeEnvironment.value?.id ?? 'none';
    openManager();
    return;
  }
  handleSelectEnvironment(val);
};
</script>

<template>
  <div class="flex items-center gap-1.5">
    <select
      :value="activeEnvironment?.id ?? 'none'"
      class="bg-surface-ground border border-surface-border text-xs text-bone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-dino-400 cursor-pointer w-44 truncate"
      @change="onSelectChange"
    >
      <option value="none" class="bg-surface-panel font-bold text-fossil-400">Sem Ambiente</option>
      <optgroup label="Ambientes" class="bg-surface-panel font-bold text-dino-300">
        <option
          v-for="env in environments"
          :key="env.id"
          :value="env.id"
          class="bg-surface-panel text-bone-100 font-normal"
        >
          {{ env.name }}
        </option>
      </optgroup>
      <optgroup label="Configurações" class="bg-surface-panel font-bold text-amber-400">
        <option value="manage" class="bg-surface-panel text-amber-400 font-bold">⚙️ Gerenciar Ambientes</option>
      </optgroup>
    </select>

    <button
      type="button"
      title="Gerenciar Ambientes (Variáveis)"
      class="p-1.5 text-fossil-300 hover:text-dino-300 hover:bg-surface-hover border border-surface-border rounded-lg transition-colors flex items-center justify-center text-xs cursor-pointer"
      @click="openManager"
    >
      🌍
    </button>
  </div>
</template>
