import { computed, ref, watch } from 'vue';
import { platformService, shortcutRegistryService } from '../../core/shortcuts';
import type { ShortcutConflict, ShortcutDefinition } from '../../core/shortcuts/interfaces';
import { useCollections } from '../collections';
import { useRequest } from '../request';
import { useSettings } from '../settings';
import type { SettingsTab } from '../settings/SettingsModal/interfaces';
import type { ShortcutItemViewModel, UseShortcutsReturn } from './interfaces';

const isCommandPaletteOpenState = ref<boolean>(false);
const searchQueryState = ref<string>('');
const shortcutsRevision = ref<number>(0);
let isListenerAttached = false;
let isInitialized = false;

const BUILTIN_THEMES = [
  'dino',
  'trex-monokai',
  'raptor-dracula',
  'pterodactyl-midnight',
  'triceratops-amber',
  'brachiosaurus-light',
];

const openSettingsToTab = (tab: SettingsTab): void => {
  const { openSettings } = useSettings();
  openSettings();
  const event = new CustomEvent('trex:open-settings-tab', { detail: { tab } });
  window.dispatchEvent(event);
};

const registerDefaultShortcuts = (): void => {
  if (isInitialized) {
    return;
  }
  isInitialized = true;

  const defaults: ShortcutDefinition[] = [
    {
      id: 'open-command-palette',
      name: 'Paleta de Comandos',
      description: 'Pesquisar e executar qualquer comando por teclado',
      category: 'general',
      defaultKeyCombo: 'ctrl+shift+p',
      allowInInputs: false,
      action: () => {
        isCommandPaletteOpenState.value = true;
      },
    },
    {
      id: 'open-shortcuts-help',
      name: 'Ajuda de Atalhos',
      description: 'Abrir a tela de consulta e personalização de atalhos',
      category: 'general',
      defaultKeyCombo: 'ctrl+/',
      allowInInputs: false,
      action: () => {
        openSettingsToTab('shortcuts');
      },
    },
    {
      id: 'open-settings',
      name: 'Configurações',
      description: 'Abrir o painel de configurações do Trex',
      category: 'settings',
      defaultKeyCombo: 'ctrl+,',
      allowInInputs: false,
      action: () => {
        openSettingsToTab('general');
      },
    },
    {
      id: 'toggle-theme',
      name: 'Alternar Tema',
      description: 'Alternar dinamicamente entre os temas visuais do Trex',
      category: 'general',
      defaultKeyCombo: 'ctrl+shift+l',
      allowInInputs: false,
      action: () => {
        const { settings, updateSettings } = useSettings();
        const currentIdx = BUILTIN_THEMES.indexOf(settings.value.theme);
        const nextIdx = (currentIdx + 1) % BUILTIN_THEMES.length;
        updateSettings({ theme: BUILTIN_THEMES[nextIdx] });
      },
    },
    {
      id: 'toggle-sidebar',
      name: 'Alternar Barra Lateral',
      description: 'Exibir ou ocultar a barra lateral de collections',
      category: 'general',
      defaultKeyCombo: 'ctrl+b',
      allowInInputs: false,
      action: () => {
        const toggleBtn = document.querySelector<HTMLButtonElement>(
          'button[aria-label="Alternar Barra Lateral"]',
        );
        if (toggleBtn) {
          toggleBtn.click();
        }
      },
    },
    {
      id: 'focus-search',
      name: 'Buscar Collections',
      description: 'Focar o campo de busca e filtro de collections',
      category: 'navigation',
      defaultKeyCombo: 'ctrl+k',
      allowInInputs: false,
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[aria-label="Filtrar requisições"]',
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
    },
    {
      id: 'focus-url',
      name: 'Focar Campo de URL',
      description: 'Focar o campo da URL da requisição ativa',
      category: 'requests',
      defaultKeyCombo: 'ctrl+l',
      allowInInputs: false,
      action: () => {
        const urlInput = document.querySelector<HTMLInputElement>(
          'input[aria-label="URL da requisição"]',
        );
        if (urlInput) {
          urlInput.focus();
          urlInput.select();
        }
      },
    },
    {
      id: 'send-request',
      name: 'Enviar Requisição',
      description: 'Disparar a execução da requisição HTTP ativa',
      category: 'requests',
      defaultKeyCombo: 'ctrl+enter',
      allowInInputs: true,
      action: async () => {
        const { sendRequest, isLoading } = useRequest();
        if (!isLoading.value) {
          await sendRequest();
        }
      },
    },
    {
      id: 'cancel-request',
      name: 'Fechar / Cancelar',
      description: 'Fechar a paleta de comandos ou modais abertos',
      category: 'general',
      defaultKeyCombo: 'escape',
      allowInInputs: true,
      action: () => {
        if (isCommandPaletteOpenState.value) {
          isCommandPaletteOpenState.value = false;
        }
      },
    },
    {
      id: 'duplicate-tab',
      name: 'Duplicar Requisição',
      description: 'Criar uma cópia da requisição ativa em uma nova aba',
      category: 'requests',
      defaultKeyCombo: 'ctrl+shift+d',
      allowInInputs: false,
      action: () => {
        const { activeTab, createTab } = useRequest();
        if (activeTab.value) {
          createTab({
            name: `${activeTab.value.name} (Cópia)`,
            method: activeTab.value.method,
            url: activeTab.value.url,
            params: activeTab.value.params.map((p) => ({ ...p, id: `p-${Date.now().toString()}-${Math.random().toString(36).slice(2, 6)}` })),
            headers: activeTab.value.headers.map((h) => ({ ...h, id: `h-${Date.now().toString()}-${Math.random().toString(36).slice(2, 6)}` })),
            bodyType: activeTab.value.bodyType,
            body: activeTab.value.body,
            auth: activeTab.value.auth,
            testScript: activeTab.value.testScript,
          });
        }
      },
    },
    {
      id: 'save-request',
      name: 'Salvar Alterações',
      description: 'Salvar as alterações da requisição ativa',
      category: 'requests',
      defaultKeyCombo: 'ctrl+s',
      allowInInputs: true,
      action: () => {
        const { activeTab, updateActiveTab } = useRequest();
        if (activeTab.value) {
          updateActiveTab({ isDirty: false });
        }
      },
    },
    {
      id: 'format-body',
      name: 'Formatar JSON Body',
      description: 'Formatar e identar o payload JSON do corpo da requisição',
      category: 'requests',
      defaultKeyCombo: 'ctrl+shift+f',
      allowInInputs: true,
      action: () => {
        const { activeTab, updateActiveTab } = useRequest();
        if (activeTab.value && activeTab.value.body.trim().length > 0) {
          try {
            const parsed: unknown = JSON.parse(activeTab.value.body);
            updateActiveTab({ body: JSON.stringify(parsed, null, 2) });
          } catch {
            return;
          }
        }
      },
    },
    {
      id: 'new-tab',
      name: 'Nova Requisição',
      description: 'Criar uma nova aba de requisição em branco',
      category: 'tabs',
      defaultKeyCombo: 'ctrl+alt+n',
      allowInInputs: false,
      action: () => {
        const { createTab } = useRequest();
        createTab();
      },
    },
    {
      id: 'next-tab',
      name: 'Próxima Aba',
      description: 'Navegar para a próxima aba aberta',
      category: 'tabs',
      defaultKeyCombo: 'ctrl+alt+arrowright',
      allowInInputs: false,
      action: () => {
        const { tabs, activeTabId, setActiveTab } = useRequest();
        if (tabs.value.length > 1) {
          const idx = tabs.value.findIndex((t) => t.id === activeTabId.value);
          const nextIdx = (idx + 1) % tabs.value.length;
          const nextTab = tabs.value[nextIdx];
          if (nextTab) {
            setActiveTab(nextTab.id);
          }
        }
      },
    },
    {
      id: 'prev-tab',
      name: 'Aba Anterior',
      description: 'Navegar para a aba aberta anterior',
      category: 'tabs',
      defaultKeyCombo: 'ctrl+alt+arrowleft',
      allowInInputs: false,
      action: () => {
        const { tabs, activeTabId, setActiveTab } = useRequest();
        if (tabs.value.length > 1) {
          const idx = tabs.value.findIndex((t) => t.id === activeTabId.value);
          const prevIdx = (idx - 1 + tabs.value.length) % tabs.value.length;
          const prevTab = tabs.value[prevIdx];
          if (prevTab) {
            setActiveTab(prevTab.id);
          }
        }
      },
    },
    {
      id: 'close-tab',
      name: 'Fechar Aba Atual',
      description: 'Fechar a aba de requisição ativa no momento',
      category: 'tabs',
      defaultKeyCombo: 'ctrl+alt+w',
      allowInInputs: false,
      action: () => {
        const { tabs, activeTabId, closeTab } = useRequest();
        if (tabs.value.length > 0 && activeTabId.value) {
          closeTab(activeTabId.value);
        }
      },
    },
    {
      id: 'close-all-tabs',
      name: 'Fechar Todas as Abas',
      description: 'Fechar todas as abas de requisição abertas',
      category: 'tabs',
      defaultKeyCombo: 'ctrl+shift+w',
      allowInInputs: false,
      action: () => {
        const { tabs, closeTab } = useRequest();
        const tabIds = tabs.value.map((t) => t.id);
        tabIds.forEach((id) => { closeTab(id); });
      },
    },
    {
      id: 'new-collection',
      name: 'Nova Collection',
      description: 'Criar uma nova collection para organizar requisições',
      category: 'collections',
      defaultKeyCombo: 'ctrl+shift+c',
      allowInInputs: false,
      action: () => {
        const { createCollection } = useCollections();
        const name = `Collection ${Date.now().toString().slice(-4)}`;
        createCollection(name);
      },
    },
    {
      id: 'open-env-manager',
      name: 'Gerenciar Ambientes',
      description: 'Abrir a modal de gerenciamento de ambientes e variáveis',
      category: 'environments',
      defaultKeyCombo: 'ctrl+alt+e',
      allowInInputs: false,
      action: () => {
        const event = new CustomEvent('trex:open-environment-manager');
        window.dispatchEvent(event);
      },
    },
    {
      id: 'toggle-orientation',
      name: 'Alternar Orientação',
      description: 'Alternar a orientação dos painéis entre horizontal e vertical',
      category: 'settings',
      defaultKeyCombo: 'ctrl+shift+o',
      allowInInputs: false,
      action: () => {
        const { settings, updateSettings } = useSettings();
        const next = settings.value.orientation === 'horizontal' ? 'vertical' : 'horizontal';
        updateSettings({ orientation: next });
      },
    },
    {
      id: 'toggle-density',
      name: 'Alternar Densidade Visual',
      description: 'Alternar o espaçamento entre modo confortável e compacto',
      category: 'settings',
      defaultKeyCombo: 'ctrl+shift+u',
      allowInInputs: false,
      action: () => {
        const { settings, updateSettings } = useSettings();
        const next = settings.value.density === 'comfortable' ? 'compact' : 'comfortable';
        updateSettings({ density: next });
      },
    },
  ];

  defaults.forEach((def) => { shortcutRegistryService.register(def); });
};

const setupGlobalListener = (): void => {
  if (isListenerAttached || typeof window === 'undefined') {
    return;
  }
  isListenerAttached = true;
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    shortcutRegistryService.handleKeyEvent(event);
  });
};

const useShortcuts = (): UseShortcutsReturn => {
  registerDefaultShortcuts();
  setupGlobalListener();

  const { settings, updateSettings } = useSettings();

  if (settings.value.customShortcuts) {
    shortcutRegistryService.loadCustomCombos(settings.value.customShortcuts);
  }

  watch(
    () => settings.value.customShortcuts,
    (combos) => {
      if (combos) {
        shortcutRegistryService.loadCustomCombos(combos);
      }
    },
    { deep: true },
  );

  const openCommandPalette = (): void => {
    isCommandPaletteOpenState.value = true;
  };

  const closeCommandPalette = (): void => {
    isCommandPaletteOpenState.value = false;
  };

  const shortcuts = computed<ShortcutItemViewModel[]>(() => {
    return shortcutRegistryService.getAll(shortcutsRevision.value).map((s) => {
      const activeCombo = shortcutRegistryService.getActiveCombo(s);
      return {
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        defaultCombo: s.defaultKeyCombo,
        activeCombo,
        formattedCombo: platformService.formatKeyCombo(activeCombo),
        isCustom: activeCombo !== s.defaultKeyCombo,
        allowInInputs: Boolean(s.allowInInputs),
      };
    });
  });

  const filteredShortcuts = computed<ShortcutItemViewModel[]>(() => {
    const q = searchQueryState.value.trim().toLowerCase();
    if (q.length === 0) {
      return shortcuts.value;
    }
    return shortcuts.value.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.activeCombo.toLowerCase().includes(q) ||
        s.formattedCombo.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  });

  const updateShortcutCombo = (id: string, newCombo: string): ShortcutConflict[] => {
    const conflicts = shortcutRegistryService.findConflicts(id, newCombo);
    shortcutRegistryService.setCustomCombo(id, newCombo);
    shortcutsRevision.value++;
    updateSettings({ customShortcuts: shortcutRegistryService.getCustomCombos() });
    return conflicts;
  };

  const resetShortcutCombo = (id: string): void => {
    shortcutRegistryService.resetCustomCombo(id);
    shortcutsRevision.value++;
    updateSettings({ customShortcuts: shortcutRegistryService.getCustomCombos() });
  };

  const resetAllShortcuts = (): void => {
    shortcutRegistryService.resetAll();
    shortcutsRevision.value++;
    updateSettings({ customShortcuts: {} });
  };

  const formatCombo = (combo: string): string => {
    return platformService.formatKeyCombo(combo);
  };

  return {
    shortcuts,
    searchQuery: searchQueryState,
    filteredShortcuts,
    isCommandPaletteOpen: isCommandPaletteOpenState,
    openCommandPalette,
    closeCommandPalette,
    updateShortcutCombo,
    resetShortcutCombo,
    resetAllShortcuts,
    formatCombo,
  };
};

export { useShortcuts };
