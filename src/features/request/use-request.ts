import type { ComputedRef } from 'vue';
import { computed, ref } from 'vue';
import { useCollections } from '../collections';
import type { CollectionItem } from '../collections/interfaces';
import type { ExecutionResult, KeyValuePair, RequestTab } from './interfaces';
import { RequestRunnerService } from './request-runner.service';
import { useEnvironments } from '../environments';

const defaultTab: RequestTab = {
  id: 'req-dino-1',
  name: 'Listar Dinossauros',
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/posts',
  params: [{ id: 'p1', key: 'limit', value: '10', enabled: true }],
  headers: [{ id: 'h1', key: 'Accept', value: 'application/json', enabled: true }],
  bodyType: 'none',
  body: '',
  isDirty: false,
};

const tabsState = ref<RequestTab[]>([defaultTab]);
const activeTabIdState = ref<string>(defaultTab.id);
const executionResultState = ref<ExecutionResult | null>(null);
const isLoadingState = ref<boolean>(false);
const requestRunner = new RequestRunnerService();

interface UseRequestReturn {
  tabs: typeof tabsState;
  activeTabId: typeof activeTabIdState;
  activeTab: ComputedRef<RequestTab | null>;
  executionResult: typeof executionResultState;
  isLoading: typeof isLoadingState;
  openTab: (tab: RequestTab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  createTab: (initial?: Partial<RequestTab>) => RequestTab;
  updateActiveTab: (patch: Partial<RequestTab>) => void;
  addParam: () => void;
  removeParam: (id: string) => void;
  addHeader: () => void;
  removeHeader: (id: string) => void;
  sendRequest: (timeoutMs?: number) => Promise<void>;
  reorderTabs: (newTabs: RequestTab[]) => void;
  renameTab: (tabId: string, name: string) => void;
}

const useRequest = (): UseRequestReturn => {
  const activeTab = computed<RequestTab | null>(() => {
    const found = tabsState.value.find((t) => t.id === activeTabIdState.value);
    return found ?? tabsState.value[0] ?? null;
  });

  const setActiveTab = (tabId: string): void => {
    activeTabIdState.value = tabId;
  };

  const openTab = (tab: RequestTab): void => {
    const existing = tabsState.value.find((t) => t.id === tab.id);
    if (!existing) {
      tabsState.value.push(tab);
    }
    activeTabIdState.value = tab.id;
  };

  const closeTab = (tabId: string): void => {
    const index = tabsState.value.findIndex((t) => t.id === tabId);
    if (index === -1) {
      return;
    }
    tabsState.value = tabsState.value.filter((t) => t.id !== tabId);

    if (tabsState.value.length === 0) {
      activeTabIdState.value = '';
      return;
    }

    if (activeTabIdState.value === tabId) {
      const nextIndex = Math.max(0, index - 1);
      const nextTab = tabsState.value[nextIndex];
      if (nextTab) {
        activeTabIdState.value = nextTab.id;
      }
    }
  };

  const createTab = (initial?: Partial<RequestTab>): RequestTab => {
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const newTab: RequestTab = {
      id: `tab-${Date.now().toString()}-${uniqueSuffix}`,
      name: 'Nova Requisição',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/todos/1',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
      ...initial,
    };
    tabsState.value.push(newTab);
    activeTabIdState.value = newTab.id;
    return newTab;
  };

  const updateActiveTab = (patch: Partial<RequestTab>): void => {
    const target = tabsState.value.find((t) => t.id === activeTabIdState.value);
    if (!target) {
      return;
    }
    Object.assign(target, patch, { isDirty: true });

    const collectionPatch: Partial<CollectionItem> = {};
    if (patch.method !== undefined) {
      collectionPatch.method = patch.method;
    }
    if (patch.url !== undefined) {
      collectionPatch.url = patch.url;
    }
    if (patch.body !== undefined) {
      collectionPatch.body = patch.body;
    }
    if (patch.name !== undefined) {
      collectionPatch.name = patch.name;
    }
    if (patch.status !== undefined) {
      collectionPatch.status = patch.status;
    }

    if (Object.keys(collectionPatch).length > 0) {
      const { updateItemById } = useCollections();
      updateItemById(target.id, collectionPatch);
    }
  };

  const addParam = (): void => {
    const current = activeTab.value;
    if (!current) {
      return;
    }
    const newParam: KeyValuePair = {
      id: `p-${Date.now().toString()}`,
      key: '',
      value: '',
      enabled: true,
    };
    updateActiveTab({ params: [...current.params, newParam] });
  };

  const removeParam = (id: string): void => {
    const current = activeTab.value;
    if (!current) {
      return;
    }
    updateActiveTab({
      params: current.params.filter((p) => p.id !== id),
    });
  };

  const addHeader = (): void => {
    const current = activeTab.value;
    if (!current) {
      return;
    }
    const newHeader: KeyValuePair = {
      id: `h-${Date.now().toString()}`,
      key: '',
      value: '',
      enabled: true,
    };
    updateActiveTab({ headers: [...current.headers, newHeader] });
  };

  const removeHeader = (id: string): void => {
    const current = activeTab.value;
    if (!current) {
      return;
    }
    updateActiveTab({
      headers: current.headers.filter((h) => h.id !== id),
    });
  };

  const sendRequest = async (timeoutMs?: number): Promise<void> => {
    if (!activeTab.value) {
      return;
    }
    isLoadingState.value = true;
    try {
      const { interpolate } = useEnvironments();
      
      const tabToExecute = { ...activeTab.value };
      tabToExecute.url = interpolate(tabToExecute.url);
      tabToExecute.body = interpolate(tabToExecute.body);
      
      tabToExecute.params = tabToExecute.params.map((p) => ({
        ...p,
        key: interpolate(p.key),
        value: interpolate(p.value),
      }));

      tabToExecute.headers = tabToExecute.headers.map((h) => ({
        ...h,
        key: interpolate(h.key),
        value: interpolate(h.value),
      }));

      const result = await requestRunner.execute(tabToExecute, timeoutMs);
      executionResultState.value = result;
      updateActiveTab({ status: result.status });
    } finally {
      isLoadingState.value = false;
    }
  };

  const reorderTabs = (newTabs: RequestTab[]): void => {
    tabsState.value = [...newTabs];
  };

  const renameTab = (tabId: string, name: string): void => {
    const tab = tabsState.value.find((t) => t.id === tabId);
    if (tab) {
      tab.name = name;
      const { updateItemById } = useCollections();
      updateItemById(tabId, { name });
    }
  };

  return {
    tabs: tabsState,
    activeTabId: activeTabIdState,
    activeTab,
    executionResult: executionResultState,
    isLoading: isLoadingState,
    openTab,
    closeTab,
    setActiveTab,
    createTab,
    updateActiveTab,
    addParam,
    removeParam,
    addHeader,
    removeHeader,
    sendRequest,
    reorderTabs,
    renameTab,
  };
};

export { useRequest };
