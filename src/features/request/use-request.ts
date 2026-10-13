import type { ComputedRef } from 'vue';
import { computed, ref } from 'vue';
import { useCollections } from '../collections';
import type { Collection, CollectionItem } from '../collections/interfaces';
import type { ExecutionResult, KeyValuePair, RequestTab } from './interfaces';
import { RequestRunnerService } from './request-runner.service';
import { useEnvironments } from '../environments';
import { createDefaultAuthRegistry } from '../../core/security';
import { VariableResolverService } from '../../core/variables';
import { RequestPreparationService } from './request-preparation.service';

import { ScriptSandboxService } from '../../core/scripts';

const defaultTab: RequestTab = {
  id: 'req-dino-1',
  name: 'Listar Dinossauros',
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/posts',
  params: [{ id: 'p1', key: 'limit', value: '10', enabled: true }],
  headers: [{ id: 'h1', key: 'Accept', value: 'application/json', enabled: true }],
  bodyType: 'none',
  body: '',
  auth: { type: 'none' },
  testScript: '',
  isDirty: false,
};

const tabsState = ref<RequestTab[]>([defaultTab]);
const activeTabIdState = ref<string>(defaultTab.id);
const executionResultState = ref<ExecutionResult | null>(null);
const isLoadingState = ref<boolean>(false);
const requestRunner = new RequestRunnerService();
const authRegistry = createDefaultAuthRegistry();
const variableResolver = new VariableResolverService();
const requestPreparationService = new RequestPreparationService(authRegistry, variableResolver);
const scriptSandboxService = new ScriptSandboxService();

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
      auth: { type: 'none' },
      testScript: '',
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
    if (patch.auth !== undefined) {
      collectionPatch.auth = patch.auth;
    }
    if (patch.testScript !== undefined) {
      collectionPatch.testScript = patch.testScript;
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
      const { activeEnvironment } = useEnvironments();
      const { collections } = useCollections();

      const activeEnv = activeEnvironment.value;
      let parentCollection: Collection | null = null;
      if (activeTab.value.collectionId !== undefined && activeTab.value.collectionId.length > 0) {
        parentCollection = collections.value.find((c) => c.id === activeTab.value?.collectionId) ?? null;
      }

      const prepared = await requestPreparationService.prepare(activeTab.value, {
        environment: activeEnv,
        collection: parentCollection,
      });

      const result = await requestRunner.execute(activeTab.value, timeoutMs, prepared);

      if (
        activeTab.value.testScript !== undefined &&
        activeTab.value.testScript.trim().length > 0
      ) {
        const envVarsRecord: Record<string, string> = {};
        if (activeEnv) {
          activeEnv.variables.forEach((v) => {
            if (v.enabled) {
              envVarsRecord[v.key] = v.value;
            }
          });
        }

        const testReport = await scriptSandboxService.execute(activeTab.value.testScript, {
          response: {
            status: result.status,
            statusText: result.statusText,
            headers: result.headers,
            data: result.data,
            durationMs: result.durationMs,
          },
          environmentVariables: envVarsRecord,
        });

        result.testResults = testReport;

        if (testReport.environmentMutations.length > 0) {
          const { setVariable } = useEnvironments();
          testReport.environmentMutations.forEach((m) => {
            setVariable(m.key, m.value);
          });
        }
      }

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
