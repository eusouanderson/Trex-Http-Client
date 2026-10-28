import type { ComputedRef } from 'vue';
import { computed, ref } from 'vue';
import { useCollections } from '../collections';
import type { Collection, CollectionItem } from '../collections/interfaces';
import type { ExecutionResult, KeyValuePair, RequestTab, ValidationIssue } from './interfaces';
import { RequestRunnerService } from './request-runner.service';
import { RequestValidatorService } from './request-validator.service';
import { useEnvironments } from '../environments';
import { createDefaultAuthRegistry } from '../../core/security';
import { VariableResolverService } from '../../core/variables';
import { RequestPreparationService } from './request-preparation.service';

import { ScriptSandboxService } from '../../core/scripts';

const defaultTab: RequestTab = {
  id: 'req-dino-1',
  name: 'Listar Dinossauros',
  method: 'GET',
  url: 'https://eusouanderson.github.io/Trex-Http-Client/get',
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
const executionResultsByTabState = ref<Record<string, ExecutionResult | null>>({});
const validationIssuesByTabState = ref<Record<string, ValidationIssue[]>>({});
const loadingByTabState = ref<Record<string, boolean>>({});

const removeKey = <T>(record: Record<string, T>, targetKey: string): Record<string, T> => {
  const next: Record<string, T> = {};
  for (const key of Object.keys(record)) {
    if (key !== targetKey) {
      const val = record[key];
      if (val !== undefined) {
        next[key] = val;
      }
    }
  }
  return next;
};

const requestRunner = new RequestRunnerService();
const authRegistry = createDefaultAuthRegistry();
const variableResolver = new VariableResolverService();
const requestValidator = new RequestValidatorService(variableResolver);
const requestPreparationService = new RequestPreparationService(authRegistry, variableResolver);
const scriptSandboxService = new ScriptSandboxService();

interface UseRequestReturn {
  tabs: typeof tabsState;
  activeTabId: typeof activeTabIdState;
  activeTab: ComputedRef<RequestTab | null>;
  executionResult: ComputedRef<ExecutionResult | null>;
  validationIssues: ComputedRef<ValidationIssue[]>;
  isLoading: ComputedRef<boolean>;
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
  setValidationIssues: (issues: ValidationIssue[], tabId?: string) => void;
  clearValidationIssues: (tabId?: string) => void;
  reorderTabs: (newTabs: RequestTab[]) => void;
  renameTab: (tabId: string, name: string) => void;
}

const useRequest = (): UseRequestReturn => {
  const activeTab = computed<RequestTab | null>(() => {
    const found = tabsState.value.find((t) => t.id === activeTabIdState.value);
    return found ?? tabsState.value[0] ?? null;
  });

  const executionResult = computed<ExecutionResult | null>(() => {
    const targetId = activeTab.value?.id;
    if (typeof targetId === 'string' && targetId.length > 0) {
      return executionResultsByTabState.value[targetId] ?? null;
    }
    return null;
  });

  const validationIssues = computed<ValidationIssue[]>(() => {
    const targetId = activeTab.value?.id;
    if (typeof targetId === 'string' && targetId.length > 0) {
      return validationIssuesByTabState.value[targetId] ?? [];
    }
    return [];
  });

  const isLoading = computed<boolean>(() => {
    const targetId = activeTab.value?.id;
    if (typeof targetId === 'string' && targetId.length > 0) {
      return loadingByTabState.value[targetId] ?? false;
    }
    return false;
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

    executionResultsByTabState.value = removeKey(executionResultsByTabState.value, tabId);
    validationIssuesByTabState.value = removeKey(validationIssuesByTabState.value, tabId);
    loadingByTabState.value = removeKey(loadingByTabState.value, tabId);

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
      url: 'https://eusouanderson.github.io/Trex-Http-Client/get',
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
    if (patch.headers !== undefined) {
      const headersRecord: Record<string, string> = {};
      patch.headers.forEach((h) => {
        if (h.key.trim().length > 0) {
          headersRecord[h.key] = h.value;
        }
      });
      collectionPatch.headers = headersRecord;
    }
    if (patch.params !== undefined) {
      const paramsRecord: Record<string, string> = {};
      patch.params.forEach((p) => {
        if (p.key.trim().length > 0) {
          paramsRecord[p.key] = p.value;
        }
      });
      collectionPatch.params = paramsRecord;
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

  const setValidationIssues = (issues: ValidationIssue[], tabId?: string): void => {
    const targetId = typeof tabId === 'string' && tabId.length > 0 ? tabId : activeTab.value?.id;
    if (typeof targetId === 'string' && targetId.length > 0) {
      validationIssuesByTabState.value = {
        ...validationIssuesByTabState.value,
        [targetId]: [...issues],
      };
    }
  };

  const clearValidationIssues = (tabId?: string): void => {
    setValidationIssues([], tabId);
  };

  const sendRequest = async (timeoutMs?: number): Promise<void> => {
    const currentTab = activeTab.value;
    if (!currentTab) {
      return;
    }
    const tabId = currentTab.id;
    clearValidationIssues(tabId);
    loadingByTabState.value = {
      ...loadingByTabState.value,
      [tabId]: true,
    };
    try {
      const { activeEnvironment } = useEnvironments();
      const { collections } = useCollections();

      const activeEnv = activeEnvironment.value;
      let parentCollection: Collection | null = null;
      if (currentTab.collectionId !== undefined && currentTab.collectionId.length > 0) {
        parentCollection = collections.value.find((c) => c.id === currentTab.collectionId) ?? null;
      }

      const validationResult = requestValidator.validate(
        currentTab,
        {
          environment: activeEnv,
          collection: parentCollection,
        },
        timeoutMs,
      );

      if (!validationResult.isValid) {
        validationIssuesByTabState.value = {
          ...validationIssuesByTabState.value,
          [tabId]: validationResult.issues,
        };
        const primaryIssue = validationResult.issues[0];
        const errorMessage = primaryIssue ? primaryIssue.message : 'Erro de validação preventiva';
        executionResultsByTabState.value = {
          ...executionResultsByTabState.value,
          [tabId]: {
            status: 0,
            statusText: 'Validation Error',
            durationMs: 0,
            sizeBytes: 0,
            headers: {},
            data: null,
            error: errorMessage,
            validationIssues: validationResult.issues,
          },
        };
        return;
      }

      const prepared = await requestPreparationService.prepare(currentTab, {
        environment: activeEnv,
        collection: parentCollection,
      });

      const result = await requestRunner.execute(currentTab, timeoutMs, prepared);

      if (
        currentTab.testScript !== undefined &&
        currentTab.testScript.trim().length > 0
      ) {
        const envVarsRecord: Record<string, string> = {};
        if (activeEnv) {
          activeEnv.variables.forEach((v) => {
            if (v.enabled) {
              envVarsRecord[v.key] = v.value;
            }
          });
        }

        const testReport = await scriptSandboxService.execute(currentTab.testScript, {
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

      executionResultsByTabState.value = {
        ...executionResultsByTabState.value,
        [tabId]: result,
      };

      const tabInState = tabsState.value.find((t) => t.id === tabId);
      if (tabInState) {
        tabInState.status = result.status;
        const { updateItemById } = useCollections();
        updateItemById(tabId, { status: result.status });
      }
    } finally {
      loadingByTabState.value = {
        ...loadingByTabState.value,
        [tabId]: false,
      };
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
    executionResult,
    validationIssues,
    isLoading,
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
    setValidationIssues,
    clearValidationIssues,
    reorderTabs,
    renameTab,
  };
};

export { useRequest };
