<script setup lang="ts">
import { CodeEditor } from '../../../shared/editor/CodeEditor';
import { TrexLogo } from '../../../shared/ui/TrexLogo';
import { useSettings } from '../use-settings';
import { useSettingsModal } from './use-settings-modal';

const { isOpen } = useSettings();
const appVersion = __APP_VERSION__;
const commitHash = __COMMIT_HASH__;
const {
  activeTab,
  settings,
  jurassicThemes,
  jsonPreviewCode,
  jsonColorFields,
  setTab,
  setTheme,
  setOrientation,
  setDensity,
  setTimeoutValue,
  setRetryAttempts,
  toggleFollowRedirects,
  setJsonColor,
  resetAll,
  close,
} = useSettingsModal();
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    @click.self="close"
  >
    <div
      class="w-full max-w-3xl bg-surface-panel border border-surface-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
    >
      <header class="flex items-center justify-between px-6 py-4 border-b border-surface-border bg-surface-ground/50">
        <div class="flex items-center gap-2">
          <trex-logo size="sm" />
          <div>
            <h2 class="text-base font-semibold text-bone-100">Configurações do T-Rex</h2>
            <p class="text-xs text-fossil-400">Personalize seu ambiente, comportamento e HTTP client</p>
          </div>
        </div>
        <button
          type="button"
          class="p-1.5 text-fossil-400 hover:text-bone-100 hover:bg-surface-hover rounded-lg transition-colors"
          @click="close"
        >
          ✕
        </button>
      </header>

      <div class="flex flex-1 overflow-hidden">
        <nav class="w-48 p-3 space-y-1 border-r border-surface-border bg-surface-ground/30">
          <button
            type="button"
            class="flex items-center w-full gap-2 px-3 py-2 text-xs font-medium text-left transition-colors rounded-lg"
            :class="activeTab === 'general' ? 'bg-dino-500/20 text-dino-300 border border-dino-500/40' : 'text-fossil-300 hover:bg-surface-hover'"
            @click="setTab('general')"
          >
            <span>⚙️</span>
            <span>Geral & Layout</span>
          </button>
          <button
            type="button"
            class="flex items-center w-full gap-2 px-3 py-2 text-xs font-medium text-left transition-colors rounded-lg"
            :class="activeTab === 'theme' ? 'bg-dino-500/20 text-dino-300 border border-dino-500/40' : 'text-fossil-300 hover:bg-surface-hover'"
            @click="setTab('theme')"
          >
            <span>🎨</span>
            <span>Tema Jurássico</span>
          </button>
          <button
            type="button"
            class="flex items-center w-full gap-2 px-3 py-2 text-xs font-medium text-left transition-colors rounded-lg"
            :class="activeTab === 'json' ? 'bg-dino-500/20 text-dino-300 border border-dino-500/40' : 'text-fossil-300 hover:bg-surface-hover'"
            @click="setTab('json')"
          >
            <span>📜</span>
            <span>Editor JSON</span>
          </button>
          <button
            type="button"
            class="flex items-center w-full gap-2 px-3 py-2 text-xs font-medium text-left transition-colors rounded-lg"
            :class="activeTab === 'network' ? 'bg-dino-500/20 text-dino-300 border border-dino-500/40' : 'text-fossil-300 hover:bg-surface-hover'"
            @click="setTab('network')"
          >
            <span>🌐</span>
            <span>Rede & HTTP</span>
          </button>
        </nav>

        <section class="flex-1 p-6 space-y-6 overflow-y-auto">
          <div v-if="activeTab === 'general'" class="space-y-5">
            <div>
              <label class="block mb-2 text-xs font-semibold text-bone-200">Orientação dos Painéis</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 p-3 text-xs font-medium transition-all border rounded-lg"
                  :class="settings.orientation === 'horizontal' ? 'border-dino-400 bg-dino-500/10 text-dino-300' : 'border-surface-border text-fossil-300 hover:bg-surface-hover'"
                  @click="setOrientation('horizontal')"
                >
                  <span>↔️ Lado a Lado (Horizontal)</span>
                </button>
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 p-3 text-xs font-medium transition-all border rounded-lg"
                  :class="settings.orientation === 'vertical' ? 'border-dino-400 bg-dino-500/10 text-dino-300' : 'border-surface-border text-fossil-300 hover:bg-surface-hover'"
                  @click="setOrientation('vertical')"
                >
                  <span>↕️ Cima e Baixo (Vertical)</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block mb-2 text-xs font-semibold text-bone-200">Densidade Visual</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 p-3 text-xs font-medium transition-all border rounded-lg"
                  :class="settings.density === 'comfortable' ? 'border-dino-400 bg-dino-500/10 text-dino-300' : 'border-surface-border text-fossil-300 hover:bg-surface-hover'"
                  @click="setDensity('comfortable')"
                >
                  <span>🌿 Confortável</span>
                </button>
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 p-3 text-xs font-medium transition-all border rounded-lg"
                  :class="settings.density === 'compact' ? 'border-dino-400 bg-dino-500/10 text-dino-300' : 'border-surface-border text-fossil-300 hover:bg-surface-hover'"
                  @click="setDensity('compact')"
                >
                  <span>📐 Compacto</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'theme'" class="space-y-4">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-semibold text-bone-200">Temas Predefinidos Jurássicos</label>
              <span class="text-[11px] text-fossil-400">
                Tema ativo: <strong class="font-mono uppercase text-dino-400">{{ settings.theme }}</strong>
              </span>
            </div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                v-for="themeItem in jurassicThemes"
                :key="themeItem.id"
                type="button"
                class="p-3.5 rounded-xl border text-left transition-all flex items-start gap-3"
                :class="settings.theme === themeItem.id ? 'border-dino-400 bg-dino-500/10 shadow-sm' : 'border-surface-border hover:bg-surface-hover'"
                @click="setTheme(themeItem.id)"
              >
                <img
                  v-if="themeItem.icon.startsWith('logos/')"
                  :src="`/${themeItem.icon}`"
                  alt="T-Rex"
                  class="w-8 h-8 object-contain shrink-0"
                />
                <span v-else class="text-2xl shrink-0">{{ themeItem.icon }}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-bone-100">{{ themeItem.label }}</span>
                    <span
                      v-if="settings.theme === themeItem.id"
                      class="text-[10px] text-dino-400 font-semibold uppercase"
                    >
                      Ativo
                    </span>
                  </div>
                  <p class="text-[11px] text-fossil-400 mb-2 leading-relaxed">{{ themeItem.description }}</p>
                  <div class="flex items-center gap-1.5">
                    <span
                      v-for="color in themeItem.previewColors"
                      :key="color"
                      class="w-3.5 h-3.5 rounded-full border border-surface-border/50 shadow-inner"
                      :style="{ backgroundColor: color }"
                    ></span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div v-if="activeTab === 'network'" class="space-y-4">
            <div>
              <label class="block mb-1 text-xs font-semibold text-bone-200">Timeout Padrão (ms)</label>
              <input
                type="number"
                :value="settings.defaultTimeout"
                class="w-full px-3 py-2 text-xs border rounded-lg bg-surface-ground border-surface-border text-bone-100 focus:outline-none focus:border-dino-400"
                @input="setTimeoutValue(Number(($event.target as HTMLInputElement).value))"
              />
            </div>

            <div>
              <label class="block mb-1 text-xs font-semibold text-bone-200">Tentativas de Retry Padrão</label>
              <input
                type="number"
                :value="settings.defaultRetryAttempts"
                min="0"
                max="5"
                class="w-full px-3 py-2 text-xs border rounded-lg bg-surface-ground border-surface-border text-bone-100 focus:outline-none focus:border-dino-400"
                @input="setRetryAttempts(Number(($event.target as HTMLInputElement).value))"
              />
            </div>

            <div class="flex items-center justify-between pt-2">
              <div>
                <span class="block text-xs font-semibold text-bone-200">Seguir Redirecionamentos</span>
                <span class="text-[11px] text-fossil-400">Permite que o HTTP client siga códigos 3xx automaticamente</span>
              </div>
              <button
                type="button"
                class="w-10 h-5 rounded-full p-0.5 transition-colors"
                :class="settings.followRedirects ? 'bg-dino-500' : 'bg-surface-border'"
                @click="toggleFollowRedirects"
              >
                <div
                  class="w-4 h-4 transition-transform rounded-full bg-bone-100"
                  :class="settings.followRedirects ? 'translate-x-5' : 'translate-x-0'"
                ></div>
              </button>
            </div>
          </div>

          <div v-if="activeTab === 'json'" class="space-y-6">
          

            <div>
              <label class="block mb-2 text-xs font-semibold text-bone-200">Personalizar Cores de Sintaxe</label>
              <div class="grid grid-cols-1 gap-3 p-4 border sm:grid-cols-2 bg-surface-ground/40 rounded-xl border-surface-border">
                <div
                  v-for="field in jsonColorFields"
                  :key="field.key"
                  class="flex items-center justify-between gap-3 bg-surface-panel p-2.5 rounded-lg border border-surface-border"
                >
                  <div class="flex items-center min-w-0 gap-2">
                    <span
                      class="w-3.5 h-3.5 rounded-md border border-white/20 shrink-0 shadow-sm"
                      :style="{ backgroundColor: settings.jsonTheme[field.key] }"
                    ></span>
                    <span class="text-xs truncate text-bone-200">{{ field.label }}</span>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="text-[11px] font-mono text-fossil-400 uppercase">{{ settings.jsonTheme[field.key] }}</span>
                    <input
                      type="color"
                      :value="settings.jsonTheme[field.key]"
                      class="p-0 overflow-hidden bg-transparent border rounded cursor-pointer w-7 h-7 border-surface-border"
                      @input="setJsonColor(field.key, ($event.target as HTMLInputElement).value)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-xs font-semibold text-bone-200">Pré-visualização do Editor</label>
                <span class="text-[11px] text-fossil-400">Busca com destaque (Ctrl+F) e temas de cores</span>
              </div>
              <div class="h-56 overflow-hidden border shadow-lg border-surface-border rounded-xl">
                <code-editor
                  :model-value="jsonPreviewCode"
                  :read-only="false"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer class="flex items-center justify-between px-6 py-3 border-t border-surface-border bg-surface-ground/50">
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="text-xs transition-colors text-fossil-400 hover:text-magma-400"
            @click="resetAll"
          >
            Restaurar Padrões
          </button>
          <span class="text-xs text-fossil-500 font-mono">v{{ appVersion }} ({{ commitHash }})</span>
        </div>
        <button
          type="button"
          class="px-4 py-2 text-xs font-semibold transition-colors rounded-lg bg-dino-500 hover:bg-dino-600 text-surface-ground"
          @click="close"
        >
          Concluído
        </button>
      </footer>
    </div>
  </div>
</template>


