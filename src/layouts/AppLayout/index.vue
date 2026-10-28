<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes';
import { VueDraggable } from 'vue-draggable-plus';
import CollectionTree from '../../features/collections/CollectionTree/index.vue';
import { EnvironmentManagerModal, EnvironmentSelector } from '../../features/environments';
import RequestBuilder from '../../features/request/RequestBuilder/index.vue';
import ResponseViewer from '../../features/response/ResponseViewer/index.vue';
import SettingsModal from '../../features/settings/SettingsModal/index.vue';
import { PwaUpdateNotification } from '../../features/pwa';
import { CommandPalette } from '../../features/shortcuts';
import { TrexLogo } from '../../shared/ui/TrexLogo';
import { ShortcutTooltip } from '../../shared/ui/ShortcutTooltip';
import { useAppLayout } from './use-app-layout';

const {
  isSidebarOpen,
  isRequestBuilderOpen,
  sidebarPanelClass,
  mainContainerClass,
  innerPanelClass,
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
  isCommandPaletteOpen,
  closeCommandPalette,
} = useAppLayout();
</script>

<template>
  <div
    class="flex flex-col w-screen h-screen overflow-hidden font-sans select-none bg-surface-ground text-bone-100"
    :class="[`theme-${settings.theme}`, `density-${settings.density}`]"
    :style="customThemeStyles"
  >
    <header class="z-20 flex items-center justify-between gap-2 px-2 border-b h-11 border-surface-border bg-surface-panel shrink-0">
      <div class="flex items-center gap-2 shrink-0">
        <div class="flex items-center gap-1.5 cursor-pointer">
          <trex-logo size="sm" :randomize="true" />
          <div class="hidden sm:block">
            <span class="text-xs font-black tracking-wider uppercase text-bone-100">T-Rex</span>
            <span class="text-[9px] text-dino-400 font-semibold block leading-none">HTTP</span>
          </div>
        </div>

        <shortcut-tooltip shortcut-id="toggle-sidebar" position="bottom">
          <button
            type="button"
            title="Alternar Barra Lateral"
            aria-label="Alternar Barra Lateral"
            class="p-1.5 text-fossil-400 hover:text-bone-100 hover:bg-surface-hover rounded-lg transition-colors text-xs"
            @click="toggleSidebar"
          >
            ☰
          </button>
        </shortcut-tooltip>
      </div>

      <div class="flex items-center flex-1 h-full min-w-0 overflow-hidden">
        <vue-draggable
          v-model="tabs"
          :animation="150"
          item-key="id"
          class="flex items-end flex-1 h-full min-w-0 pt-1 -space-x-1 overflow-hidden"
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
              <span class="text-xs truncate">{{ tab.name }}</span>
            </div>

            <shortcut-tooltip shortcut-id="close-tab" position="bottom">
              <button
                type="button"
                title="Fechar aba"
                aria-label="Fechar aba"
                class="w-3.5 h-3.5 shrink-0 flex items-center justify-center rounded hover:bg-surface-border text-[9px] text-fossil-500 hover:text-bone-100 opacity-60 group-hover:opacity-100 transition-opacity"
                @click.stop="closeTab(tab.id)"
              >
                ✕
              </button>
            </shortcut-tooltip>
          </div>
        </vue-draggable>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <environment-selector @open-manager="openEnvironmentManager" />

        <shortcut-tooltip shortcut-id="open-settings" position="bottom">
          <button
            type="button"
            title="Configurações (Engrenagem)"
            aria-label="Configurações"
            class="p-1.5 text-fossil-300 hover:text-dino-300 hover:bg-surface-hover border border-surface-border rounded-lg transition-colors flex items-center justify-center text-xs cursor-pointer"
            @click="openSettings"
          >
            ⚙️
          </button>
        </shortcut-tooltip>
      </div>
    </header>

    <div
      class="flex flex-1 overflow-hidden trex-workspace-area"
      :class="{
        'p-1 gap-1 bg-surface-ground': settings.panelLayout === 'separated',
      }"
    >
      <splitpanes
        class="flex-1"
        :class="{ 'splitpanes--separated': settings.panelLayout === 'separated' }"
        :horizontal="false"
      >
        <pane
          v-if="isSidebarOpen"
          size="22"
          min-size="15"
          max-size="40"
          :class="sidebarPanelClass"
        >
          <collection-tree @select-item="handleSelectItem" />
        </pane>

        <pane
          size="78"
          class="flex flex-col overflow-hidden"
          :class="mainContainerClass"
        >
          <splitpanes
            v-if="isRequestBuilderOpen"
            class="flex-1"
            :class="{ 'splitpanes--separated': settings.panelLayout === 'separated' }"
            :horizontal="settings.orientation === 'vertical'"
          >
            <pane
              size="55"
              min-size="25"
              :class="innerPanelClass"
            >
              <request-builder />
            </pane>
            <pane
              size="45"
              min-size="20"
              :class="innerPanelClass"
            >
              <response-viewer :result="executionResult" :loading="isLoading" :active-tab-id="activeTabId" />
            </pane>
          </splitpanes>

          <div
            v-else
            class="flex-1 flex flex-col overflow-hidden"
            :class="innerPanelClass"
          >
            <response-viewer :result="executionResult" :loading="isLoading" :active-tab-id="activeTabId" />
          </div>
        </pane>
      </splitpanes>
    </div>

    <settings-modal @open-environment-manager="openEnvironmentManager" />
    <environment-manager-modal :is-open="isEnvironmentManagerOpen" @close="closeEnvironmentManager" />
    <command-palette :is-open="isCommandPaletteOpen" @close="closeCommandPalette" />
    <pwa-update-notification />
  </div>
</template>


