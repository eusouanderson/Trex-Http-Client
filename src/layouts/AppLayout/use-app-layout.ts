import type { ComputedRef, Ref } from 'vue';
import { computed, ref } from 'vue';
import { useCollections } from '../../features/collections';
import type { CollectionItem } from '../../features/collections/interfaces';
import { useRequest } from '../../features/request';
import { useSettings } from '../../features/settings';
import { useShortcuts } from '../../features/shortcuts';
import { ThemeStyleService } from '../../features/settings/theme-style.service';
import type { LayoutStage, SidebarTab } from './interfaces';

const layoutStageState = ref<LayoutStage>('full');
const activeSidebarTabState = ref<SidebarTab>('collections');
const themeStyleService = new ThemeStyleService();

const resetLayoutStage = (): void => {
  layoutStageState.value = 'full';
};

interface UseAppLayoutReturn {
  isSidebarOpen: ComputedRef<boolean>;
  isRequestBuilderOpen: ComputedRef<boolean>;
  layoutStage: ComputedRef<LayoutStage>;
  sidebarPanelClass: ComputedRef<string>;
  mainContainerClass: ComputedRef<string>;
  innerPanelClass: ComputedRef<string>;
  activeSidebarTab: typeof activeSidebarTabState;
  isSettingsOpen: ReturnType<typeof useSettings>['isOpen'];
  settings: ReturnType<typeof useSettings>['settings'];
  customThemeStyles: ComputedRef<Record<string, string>>;
  tabs: ReturnType<typeof useRequest>['tabs'];
  activeTabId: ReturnType<typeof useRequest>['activeTabId'];
  executionResult: ReturnType<typeof useRequest>['executionResult'];
  isLoading: ReturnType<typeof useRequest>['isLoading'];
  toggleSidebar: () => void;
  setLayoutStage: (stage: LayoutStage) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  openSettings: () => void;
  closeSettings: () => void;
  selectTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  addNewTab: () => void;
  handleSelectItem: (item: CollectionItem) => void;
  isEnvironmentManagerOpen: Ref<boolean>;
  openEnvironmentManager: () => void;
  closeEnvironmentManager: () => void;
  isCommandPaletteOpen: Ref<boolean>;
  closeCommandPalette: () => void;
}

const useAppLayout = (): UseAppLayoutReturn => {
  const { isCommandPaletteOpen, closeCommandPalette } = useShortcuts();
  const { settings, isOpen: isSettingsOpen, openSettings, closeSettings } =
    useSettings();
  const {
    tabs,
    activeTabId,
    executionResult,
    isLoading,
    openTab,
    closeTab,
    setActiveTab,
    createTab,
  } = useRequest();
  const { collections, selectItem } = useCollections();

  const isSidebarOpen = computed<boolean>(() => layoutStageState.value === 'full');
  const isRequestBuilderOpen = computed<boolean>(
    () => layoutStageState.value !== 'focus',
  );
  const layoutStage = computed<LayoutStage>(() => layoutStageState.value);

  const customThemeStyles = computed<Record<string, string>>(() => {
    const current = settings.value.customThemes.find(
      (t) => t.id === settings.value.theme,
    );
    if (!current) {
      return {};
    }
    return themeStyleService.getThemeStyle(current);
  });

  const sidebarPanelClass = computed<string>(() => {
    return settings.value.panelLayout === 'separated'
      ? 'rounded-lg border border-surface-border bg-surface-panel overflow-hidden shadow-sm'
      : 'bg-surface-panel';
  });

  const mainContainerClass = computed<string>(() => {
    return settings.value.panelLayout === 'separated' ? 'bg-transparent' : 'bg-surface-ground';
  });

  const innerPanelClass = computed<string>(() => {
    return settings.value.panelLayout === 'separated'
      ? 'rounded-lg border border-surface-border bg-surface-panel overflow-hidden shadow-sm'
      : '';
  });

  const toggleSidebar = (): void => {
    if (layoutStageState.value === 'full') {
      layoutStageState.value = 'compact';
    } else if (layoutStageState.value === 'compact') {
      layoutStageState.value = 'focus';
    } else {
      layoutStageState.value = 'full';
    }
  };

  const setLayoutStage = (stage: LayoutStage): void => {
    layoutStageState.value = stage;
  };

  const setSidebarTab = (tab: SidebarTab): void => {
    activeSidebarTabState.value = tab;
  };

  const selectTab = (tabId: string): void => {
    setActiveTab(tabId);
    selectItem(tabId);
  };

  const handleCloseTab = (tabId: string): void => {
    closeTab(tabId);
    if (activeTabId.value.length > 0) {
      selectItem(activeTabId.value);
    } else {
      selectItem(null);
    }
  };

  const addNewTab = (): void => {
    createTab();
  };

  const handleSelectItem = (item: CollectionItem): void => {
    selectItem(item.id);
    const existing = tabs.value.find((t) => t.id === item.id);
    if (existing) {
      setActiveTab(existing.id);
      return;
    }

    const headersList =
      item.headers !== undefined
        ? Object.entries(item.headers).map(([key, value], idx) => ({
            id: `h-${idx.toString()}`,
            key,
            value,
            enabled: true,
          }))
        : [];

    const paramsList =
      item.params !== undefined
        ? Object.entries(item.params).map(([key, value], idx) => ({
            id: `p-${idx.toString()}`,
            key,
            value,
            enabled: true,
          }))
        : [];

    const hasBody = item.body !== undefined && item.body.length > 0;
    const parentCol = collections.value.find((c) =>
      c.items.some((i) => i.id === item.id),
    );

    openTab({
      id: item.id,
      collectionId: parentCol?.id,
      name: item.name,
      method: item.method ?? 'GET',
      url: item.url ?? 'https://eusouanderson.github.io/Trex-Http-Client/get',
      params: paramsList,
      headers: headersList,
      bodyType: hasBody ? 'json' : 'none',
      body: item.body ?? '',
      auth: item.auth ? { ...item.auth } : { type: 'none' },
      testScript: item.testScript ?? '',
      isDirty: false,
    });
  };

  const isEnvManagerOpen = ref(false);
  const openEnvironmentManager = (): void => {
    isEnvManagerOpen.value = true;
  };
  const closeEnvironmentManager = (): void => {
    isEnvManagerOpen.value = false;
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('trex:open-environment-manager', () => {
      isEnvManagerOpen.value = true;
    });
  }

  return {
    isSidebarOpen,
    isRequestBuilderOpen,
    layoutStage,
    sidebarPanelClass,
    mainContainerClass,
    innerPanelClass,
    activeSidebarTab: activeSidebarTabState,
    isSettingsOpen,
    settings,
    customThemeStyles,
    tabs,
    activeTabId,
    executionResult,
    isLoading,
    toggleSidebar,
    setLayoutStage,
    setSidebarTab,
    openSettings,
    closeSettings,
    selectTab,
    closeTab: handleCloseTab,
    addNewTab,
    handleSelectItem,
    isEnvironmentManagerOpen: isEnvManagerOpen,
    openEnvironmentManager,
    closeEnvironmentManager,
    isCommandPaletteOpen,
    closeCommandPalette,
  };
};

export { useAppLayout, resetLayoutStage };
