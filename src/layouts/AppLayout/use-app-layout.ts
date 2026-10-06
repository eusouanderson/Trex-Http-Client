import { ref, type Ref } from 'vue';
import { useCollections } from '../../features/collections';
import type { CollectionItem } from '../../features/collections/interfaces';
import { useRequest } from '../../features/request';
import { useSettings } from '../../features/settings';
import type { SidebarTab } from './interfaces';

const isSidebarOpenState = ref<boolean>(true);
const activeSidebarTabState = ref<SidebarTab>('collections');

interface UseAppLayoutReturn {
  isSidebarOpen: typeof isSidebarOpenState;
  activeSidebarTab: typeof activeSidebarTabState;
  isSettingsOpen: ReturnType<typeof useSettings>['isOpen'];
  settings: ReturnType<typeof useSettings>['settings'];
  tabs: ReturnType<typeof useRequest>['tabs'];
  activeTabId: ReturnType<typeof useRequest>['activeTabId'];
  executionResult: ReturnType<typeof useRequest>['executionResult'];
  isLoading: ReturnType<typeof useRequest>['isLoading'];
  toggleSidebar: () => void;
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
}

const useAppLayout = (): UseAppLayoutReturn => {
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
  const { selectItem } = useCollections();

  const toggleSidebar = (): void => {
    isSidebarOpenState.value = !isSidebarOpenState.value;
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

    openTab({
      id: item.id,
      name: item.name,
      method: item.method ?? 'GET',
      url: item.url ?? 'https://jsonplaceholder.typicode.com/posts',
      params: paramsList,
      headers: headersList,
      bodyType: hasBody ? 'json' : 'none',
      body: item.body ?? '',
      isDirty: false,
    });
  };

  const isEnvManagerOpen = ref(false);
  const openEnvironmentManager = (): void => { isEnvManagerOpen.value = true; };
  const closeEnvironmentManager = (): void => { isEnvManagerOpen.value = false; };

  return {
    isSidebarOpen: isSidebarOpenState,
    activeSidebarTab: activeSidebarTabState,
    isSettingsOpen,
    settings,
    tabs,
    activeTabId,
    executionResult,
    isLoading,
    toggleSidebar,
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
  };
};

export { useAppLayout };
