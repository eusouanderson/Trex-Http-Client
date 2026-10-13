<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes';
import { VueDraggable } from 'vue-draggable-plus';
import CollectionTree from '../../features/collections/CollectionTree/index.vue';
import { EnvironmentManagerModal, EnvironmentSelector } from '../../features/environments';
import RequestBuilder from '../../features/request/RequestBuilder/index.vue';
import ResponseViewer from '../../features/response/ResponseViewer/index.vue';
import SettingsModal from '../../features/settings/SettingsModal/index.vue';
import { TrexLogo } from '../../shared/ui/TrexLogo';
import { useAppLayout } from './use-app-layout';

const {
  isSidebarOpen,
  settings,
  customThemeStyles,
  tabs,
  activeTabId,
  executionResult,
  isLoading,
  toggleSidebar,
  openSettings,
  selectTab,
  closeTab,
  handleSelectItem,
  isEnvironmentManagerOpen,
  openEnvironmentManager,
  closeEnvironmentManager,
} = useAppLayout();
</script>

<template>
  <div
    class="h-screen w-screen flex flex-col bg-surface-ground text-bone-100 overflow-hidden font-sans select-none"
    :class="`theme-${settings.theme}`"
    :style="customThemeStyles"
  >
    <header class="h-11 border-b border-surface-border bg-surface-panel flex items-center justify-between px-2 shrink-0 z-20 gap-2">
      <div class="flex items-center gap-2 shrink-0">
        <div class="flex items-center gap-1.5 cursor-pointer">
          <trex-logo size="sm" />
          <div class="hidden sm:block">
            <span class="font-black text-xs tracking-wider text-bone-100 uppercase">T-Rex</span>
            <span class="text-[9px] text-dino-400 font-semibold block leading-none">HTTP</span>
          </div>
        </div>

        <button
          type="button"
          title="Alternar Barra Lateral"
          class="p-1.5 text-fossil-400 hover:text-bone-100 hover:bg-surface-hover rounded-lg transition-colors text-xs"
          @click="toggleSidebar"
        >
          ☰
        </button>
      </div>

      <div class="flex-1 min-w-0 h-full flex items-center overflow-hidden">
        <vue-draggable
          v-model="tabs"
          :animation="150"
          item-key="id"
          class="flex-1 min-w-0 h-full flex items-end -space-x-1 overflow-hidden pt-1"
        >
          <div
            v-for="tab in tabs"
            :key="tab.id"
            class="group relative flex-1 min-w-[40px] max-w-[200px] h-8 flex items-center justify-between px-2.5 rounded-t-lg border-t border-x transition-all duration-150 cursor-pointer"
            :class="activeTabId === tab.id
              ? 'bg-surface-ground border-surface-border text-bone-100 font-semibold z-10 shadow-sm border-b-2 border-b-dino-400'
              : 'bg-surface-panel/70 border-surface-border/50 text-fossil-400 hover:bg-surface-hover/60 hover:text-bone-200 border-b border-b-surface-border z-0 hover:z-5'"
            @click="selectTab(tab.id)"
          >
            <div class="flex items-center gap-1.5 truncate min-w-0 flex-1 mr-1">
              <span
                class="text-[10px] font-black shrink-0 tracking-tight"
                :class="{
                  'text-dino-400': tab.method === 'GET',
                  'text-amber-400': tab.method === 'POST',
                  'text-blue-400': tab.method === 'PUT',
                  'text-magma-400': tab.method === 'DELETE',
                  'text-purple-400': tab.method === 'PATCH',
                }"
              >
                {{ tab.method }}
              </span>
              <span class="truncate text-xs">{{ tab.name }}</span>
            </div>

            <button
              type="button"
              title="Fechar aba"
              class="w-3.5 h-3.5 shrink-0 flex items-center justify-center rounded hover:bg-surface-border text-[9px] text-fossil-500 hover:text-bone-100 opacity-60 group-hover:opacity-100 transition-opacity"
              @click.stop="closeTab(tab.id)"
            >
              ✕
            </button>
          </div>
        </vue-draggable>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <environment-selector @open-manager="openEnvironmentManager" />
      
        <div class="hidden md:flex items-center gap-1.5 px-2 py-1 bg-surface-ground border border-surface-border rounded-lg text-[11px] text-fossil-300 font-mono">
          <span class="w-1.5 h-1.5 rounded-full bg-dino-400 animate-pulse"></span>
          <span>Pronto</span>
        </div>

        <button
          type="button"
          title="Configurações (Engrenagem)"
          class="p-1.5 text-fossil-300 hover:text-dino-300 hover:bg-surface-hover border border-surface-border rounded-lg transition-colors flex items-center justify-center text-xs cursor-pointer"
          @click="openSettings"
        >
          ⚙️
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <splitpanes class="flex-1" :horizontal="false">
        <pane
          v-if="isSidebarOpen"
          size="22"
          min-size="15"
          max-size="40"
          class="bg-surface-panel"
        >
          <collection-tree @select-item="handleSelectItem" />
        </pane>

        <pane size="78" class="flex flex-col bg-surface-ground overflow-hidden">
          <splitpanes
            class="flex-1"
            :horizontal="settings.orientation === 'vertical'"
          >
            <pane size="55" min-size="25">
              <request-builder />
            </pane>
            <pane size="45" min-size="20">
              <response-viewer :result="executionResult" :loading="isLoading" />
            </pane>
          </splitpanes>
        </pane>
      </splitpanes>
    </div>

    <settings-modal />
    <environment-manager-modal :is-open="isEnvironmentManagerOpen" @close="closeEnvironmentManager" />
  </div>
</template>


