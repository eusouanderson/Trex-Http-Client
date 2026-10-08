<script setup lang="ts">

import type { HttpMethod } from '../../../core/http/interfaces';
import { CodeEditor } from '../../../shared/editor/CodeEditor';
import type { RequestBuilderEmits, RequestBuilderProps } from './interfaces';
import { useRequestBuilder } from './use-request-builder';

defineProps<RequestBuilderProps>();
const emit = defineEmits<RequestBuilderEmits>();

const handleSent = (): void => {
  emit('sent');
};

const {
  activeCategory,
  activeTab,
  isLoading,
  setCategory,
  setMethod,
  setUrl,
  setBody,
  setBodyType,
  formatJsonBody,
  addParam,
  removeParam,
  addHeader,
  removeHeader,
  send,
  logoSrc,
} = useRequestBuilder(handleSent);
</script>

<template>
  <div v-if="activeTab" class="h-full flex flex-col bg-surface-panel overflow-hidden select-text">
    <div class="p-4 border-b border-surface-border bg-surface-ground/30">
      <div class="flex items-center gap-2">
        <select
          :value="activeTab.method"
          class="bg-surface-ground border border-surface-border text-xs font-black rounded-lg px-3 py-2.5 focus:outline-none focus:border-dino-400 cursor-pointer"
          :class="{
            'text-dino-400': activeTab.method === 'GET',
            'text-amber-400': activeTab.method === 'POST',
            'text-blue-400': activeTab.method === 'PUT',
            'text-magma-400': activeTab.method === 'DELETE',
            'text-purple-400': activeTab.method === 'PATCH',
          }"
          @change="setMethod(($event.target as HTMLSelectElement).value as HttpMethod)"
        >
          <option value="GET" class="bg-surface-panel text-dino-400 font-bold">GET</option>
          <option value="POST" class="bg-surface-panel text-amber-400 font-bold">POST</option>
          <option value="PUT" class="bg-surface-panel text-blue-400 font-bold">PUT</option>
          <option value="PATCH" class="bg-surface-panel text-purple-400 font-bold">PATCH</option>
          <option value="DELETE" class="bg-surface-panel text-magma-400 font-bold">DELETE</option>
          <option value="HEAD" class="bg-surface-panel text-bone-300 font-bold">HEAD</option>
          <option value="OPTIONS" class="bg-surface-panel text-fossil-400 font-bold">OPTIONS</option>
        </select>

        <input
          :value="activeTab.url"
          type="text"
          placeholder="https://api.dinossauro.dev/v1/fossils"
          class="flex-1 bg-surface-ground border border-surface-border rounded-lg px-3.5 py-2 text-xs text-bone-100 placeholder-fossil-500 focus:outline-none focus:border-dino-400 font-mono"
          @input="setUrl(($event.target as HTMLInputElement).value)"
          @keydown.enter="send()"
        />

        <button
          type="button"
          :disabled="isLoading"
          class="px-5 py-2 bg-dino-500 hover:bg-dino-600 disabled:opacity-50 text-surface-ground font-bold text-xs rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-dino-500/10 cursor-pointer"
          @click="send()"
        >
          <span v-if="isLoading" class="animate-spin text-sm">🔄</span>
          <img v-else :src="logoSrc" alt="T-Rex" class="w-4 h-4 object-contain" />
          <span>{{ isLoading ? 'Enviando...' : 'Enviar' }}</span>
        </button>
      </div>
    </div>

    <div class="flex items-center px-4 border-b border-surface-border bg-surface-ground/20">
      <button
        type="button"
        class="py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5"
        :class="activeCategory === 'params' ? 'border-dino-400 text-dino-300' : 'border-transparent text-fossil-400 hover:text-bone-200'"
        @click="setCategory('params')"
      >
        <span>Parâmetros</span>
        <span
          v-if="activeTab.params.length > 0"
          class="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-border text-fossil-300"
        >
          {{ activeTab.params.length }}
        </span>
      </button>

      <button
        type="button"
        class="py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5"
        :class="activeCategory === 'headers' ? 'border-dino-400 text-dino-300' : 'border-transparent text-fossil-400 hover:text-bone-200'"
        @click="setCategory('headers')"
      >
        <span>Headers</span>
        <span
          v-if="activeTab.headers.length > 0"
          class="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-border text-fossil-300"
        >
          {{ activeTab.headers.length }}
        </span>
      </button>

      <button
        type="button"
        class="py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5"
        :class="activeCategory === 'body' ? 'border-dino-400 text-dino-300' : 'border-transparent text-fossil-400 hover:text-bone-200'"
        @click="setCategory('body')"
      >
        <span>Corpo (Body)</span>
        <span
          v-if="activeTab.bodyType !== 'none'"
          class="w-1.5 h-1.5 rounded-full bg-dino-400"
        ></span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="activeCategory === 'params'" class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs text-fossil-400">Query Parameters da URL</span>
          <button
            type="button"
            class="text-xs text-dino-300 hover:text-dino-200 font-semibold"
            @click="addParam"
          >
            + Adicionar Parâmetro
          </button>
        </div>

        <div class="border border-surface-border rounded-lg overflow-hidden bg-surface-ground/30">
          <div
            v-for="param in activeTab.params"
            :key="param.id"
            class="flex items-center border-b border-surface-border last:border-b-0 p-1.5 gap-2"
          >
            <input
              v-model="param.enabled"
              type="checkbox"
              class="trex-checkbox ml-2"
            />
            <input
              v-model="param.key"
              type="text"
              placeholder="Chave"
              class="flex-1 bg-transparent border-0 px-2 py-1 text-xs text-bone-100 placeholder-fossil-600 focus:outline-none font-mono"
            />
            <input
              v-model="param.value"
              type="text"
              placeholder="Valor"
              class="flex-1 bg-transparent border-0 px-2 py-1 text-xs text-bone-100 placeholder-fossil-600 focus:outline-none font-mono"
            />
            <button
              type="button"
              class="px-2 text-xs text-fossil-500 hover:text-magma-400"
              @click="removeParam(param.id)"
            >
              ✕
            </button>
          </div>

          <div
            v-if="activeTab.params.length === 0"
            class="p-4 text-center text-xs text-fossil-500"
          >
            Nenhum query parameter adicionado.
          </div>
        </div>
      </div>

      <div v-if="activeCategory === 'headers'" class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs text-fossil-400">Headers da Requisição HTTP</span>
          <button
            type="button"
            class="text-xs text-dino-300 hover:text-dino-200 font-semibold"
            @click="addHeader"
          >
            + Adicionar Header
          </button>
        </div>

        <div class="border border-surface-border rounded-lg overflow-hidden bg-surface-ground/30">
          <div
            v-for="header in activeTab.headers"
            :key="header.id"
            class="flex items-center border-b border-surface-border last:border-b-0 p-1.5 gap-2"
          >
            <input
              v-model="header.enabled"
              type="checkbox"
              class="trex-checkbox ml-2"
            />
            <input
              v-model="header.key"
              type="text"
              placeholder="Nome do Header (ex: Authorization)"
              class="flex-1 bg-transparent border-0 px-2 py-1 text-xs text-bone-100 placeholder-fossil-600 focus:outline-none font-mono"
            />
            <input
              v-model="header.value"
              type="text"
              placeholder="Valor (ex: Bearer token)"
              class="flex-1 bg-transparent border-0 px-2 py-1 text-xs text-bone-100 placeholder-fossil-600 focus:outline-none font-mono"
            />
            <button
              type="button"
              class="px-2 text-xs text-fossil-500 hover:text-magma-400"
              @click="removeHeader(header.id)"
            >
              ✕
            </button>
          </div>

          <div
            v-if="activeTab.headers.length === 0"
            class="p-4 text-center text-xs text-fossil-500"
          >
            Nenhum header configurado.
          </div>
        </div>
      </div>

      <div v-if="activeCategory === 'body'" class="h-full flex flex-col space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xs text-fossil-400">Tipo de Conteúdo:</span>
            <div class="flex items-center gap-2">
              <label class="flex items-center gap-1.5 text-xs text-bone-200 cursor-pointer">
                <input
                  type="radio"
                  name="bodyType"
                  value="none"
                  :checked="activeTab.bodyType === 'none'"
                  @change="setBodyType('none')"
                />
                <span>Nenhum</span>
              </label>
              <label class="flex items-center gap-1.5 text-xs text-bone-200 cursor-pointer">
                <input
                  type="radio"
                  name="bodyType"
                  value="json"
                  :checked="activeTab.bodyType === 'json'"
                  @change="setBodyType('json')"
                />
                <span>JSON</span>
              </label>
              <label class="flex items-center gap-1.5 text-xs text-bone-200 cursor-pointer">
                <input
                  type="radio"
                  name="bodyType"
                  value="text"
                  :checked="activeTab.bodyType === 'text'"
                  @change="setBodyType('text')"
                />
                <span>Texto</span>
              </label>
            </div>
          </div>

          <button
            v-if="activeTab.bodyType === 'json'"
            type="button"
            class="px-2 py-1 text-xs bg-surface-border hover:bg-surface-hover text-bone-200 rounded transition-colors"
            @click="formatJsonBody"
          >
            ✨ Formatar JSON
          </button>
        </div>

        <div v-if="activeTab.bodyType !== 'none'" class="flex-1 flex flex-col min-h-[220px]">
          <code-editor
            :model-value="activeTab.body"
            placeholder="{&#10;  &quot;species&quot;: &quot;Tyrannosaurus Rex&quot;&#10;}"
            @update:model-value="setBody"
          />
        </div>

        <div
          v-else
          class="p-6 text-center text-xs text-fossil-500 border border-dashed border-surface-border rounded-lg"
        >
          Esta requisição não possui corpo (body).
        </div>
      </div>
    </div>
  </div>

  <div v-else class="h-full flex flex-col items-center justify-center bg-surface-panel p-8 text-center select-none">
    <div class="w-16 h-16 rounded-2xl bg-surface-ground border border-surface-border flex items-center justify-center mb-4 shadow-inner">
      <img :src="logoSrc" alt="T-Rex" class="w-12 h-12 object-contain" />
    </div>
    <h3 class="text-base font-bold text-bone-100 mb-1">Nenhuma requisição aberta</h3>
    <p class="text-xs text-fossil-400 max-w-sm leading-relaxed">
      Selecione ou crie uma requisição em uma coleção na barra lateral para começar a disparar chamadas HTTP.
    </p>
  </div>
</template>


