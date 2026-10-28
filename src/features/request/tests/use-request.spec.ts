import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCollections } from '../../collections';
import { useRequest } from '../use-request';
import { RequestValidatorService } from '../request-validator.service';

describe('useRequest', () => {
  beforeEach(() => {
    const { tabs, createTab, closeTab } = useRequest();
    while (tabs.value.length > 0) {
      const first = tabs.value[0];
      if (!first) {
        break;
      }
      closeTab(first.id);
    }
    createTab({ name: 'Initial Tab' });
  });

  it('should allow closing the only open tab down to zero tabs', () => {
    const { tabs, activeTab, activeTabId, closeTab } = useRequest();

    expect(tabs.value.length).toBe(1);
    const onlyTabId = tabs.value[0]?.id ?? '';

    closeTab(onlyTabId);

    expect(tabs.value.length).toBe(0);
    expect(activeTabId.value).toBe('');
    expect(activeTab.value).toBeNull();
  });

  it('should create new tab and set as active when zero tabs exist', () => {
    const { tabs, activeTab, activeTabId, closeTab, createTab } = useRequest();

    const onlyTabId = tabs.value[0]?.id ?? '';
    closeTab(onlyTabId);
    expect(tabs.value.length).toBe(0);

    const newTab = createTab({ name: 'Novo T-Rex' });
    expect(tabs.value.length).toBe(1);
    expect(activeTabId.value).toBe(newTab.id);
    expect(activeTab.value?.name).toBe('Novo T-Rex');
  });

  it('should reorder tabs correctly', () => {
    const { tabs, createTab, reorderTabs } = useRequest();

    const tabA = tabs.value[0];
    expect(tabA).toBeDefined();
    if (!tabA) {
      return;
    }
    const tabB = createTab({ name: 'Tab B' });
    const tabC = createTab({ name: 'Tab C' });

    expect(tabs.value.map((t) => t.id)).toEqual([tabA.id, tabB.id, tabC.id]);

    reorderTabs([tabC, tabA, tabB]);

    expect(tabs.value.map((t) => t.id)).toEqual([tabC.id, tabA.id, tabB.id]);
  });

  it('should rename existing tab by id', () => {
    const { tabs, renameTab } = useRequest();

    const tab = tabs.value[0];
    expect(tab).toBeDefined();
    if (!tab) {
      return;
    }

    renameTab(tab.id, 'Spinosaurus Request');
    expect(tab.name).toBe('Spinosaurus Request');
  });

  it('should synchronize active tab updates with collection item', () => {
    const { setActiveTab, updateActiveTab, openTab } = useRequest();
    const { collections } = useCollections();

    const targetItem = collections.value[0]?.items[0];
    expect(targetItem).toBeDefined();
    if (!targetItem) {
      return;
    }

    openTab({
      id: targetItem.id,
      name: targetItem.name,
      method: targetItem.method ?? 'GET',
      url: targetItem.url ?? '',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      isDirty: false,
    });

    setActiveTab(targetItem.id);
    updateActiveTab({ method: 'POST', status: 200 });

    const updatedCol = collections.value[0];
    const updatedItem = updatedCol?.items.find((i) => i.id === targetItem.id);
    expect(updatedItem?.method).toBe('POST');
    expect(updatedItem?.status).toBe(200);
  });

  it('should add and remove query params and headers', () => {
    const { activeTab, addParam, removeParam, addHeader, removeHeader } = useRequest();

    addParam();
    expect(activeTab.value?.params).toHaveLength(1);
    const paramId = activeTab.value?.params[0]?.id ?? '';
    removeParam(paramId);
    expect(activeTab.value?.params).toHaveLength(0);

    addHeader();
    expect(activeTab.value?.headers).toHaveLength(1);
    const headerId = activeTab.value?.headers[0]?.id ?? '';
    removeHeader(headerId);
    expect(activeTab.value?.headers).toHaveLength(0);
  });

  it('should execute sendRequest with environment interpolation and update result', async () => {
    const { activeTab, updateActiveTab, sendRequest, executionResult, isLoading } = useRequest();
    const { createEnvironment, setActiveEnvironment, updateEnvironment } = (await import('../../environments')).useEnvironments();

    const env = createEnvironment('InterpolationEnv');
    env.variables.push(
      { id: 'v1', key: 'env_val', value: 'dino', enabled: true },
      { id: 'v2', key: 'api_key', value: 'secret', enabled: true },
    );
    updateEnvironment(env);
    setActiveEnvironment(env.id);

    updateActiveTab({
      url: 'https://jsonplaceholder.typicode.com/todos/1',
      method: 'GET',
      params: [{ id: 'p1', key: 'query', value: '{{env_val}}', enabled: true }],
      headers: [{ id: 'h1', key: 'X-Key', value: '{{api_key}}', enabled: true }],
    });

    const promise = sendRequest();
    expect(isLoading.value).toBe(true);
    await promise;

    expect(isLoading.value).toBe(false);
    expect(executionResult.value).not.toBeNull();
    expect(activeTab.value?.status).toBe(executionResult.value?.status);

    const { collections } = useCollections();
    const existingColId = collections.value[0]?.id;
    if (existingColId !== undefined && existingColId.length > 0) {
      updateActiveTab({ collectionId: existingColId });
      await sendRequest();
    }

    updateActiveTab({ collectionId: 'non-existing-col-xyz' });
    await sendRequest();
  });

  it('should safely handle operations when no active tab exists and support reordering tabs', async () => {
    const { tabs, closeTab, addParam, removeParam, addHeader, removeHeader, sendRequest, reorderTabs } = useRequest();

    removeParam('non-existent-param-id');
    removeHeader('non-existent-header-id');

    reorderTabs([...tabs.value]);
    expect(tabs.value.length).toBeGreaterThan(0);

    while (tabs.value.length > 0) {
      const first = tabs.value[0];
      if (!first) break;
      closeTab(first.id);
    }

    addParam();
    removeParam('missing');
    addHeader();
    removeHeader('missing');
    await sendRequest();
  });

  it('should update active tab name and ignore updates when target tab is missing', () => {
    const { updateActiveTab, activeTab, setActiveTab } = useRequest();

    updateActiveTab({ name: 'Nome Atualizado Dino' });
    expect(activeTab.value?.name).toBe('Nome Atualizado Dino');

    setActiveTab('tab-nao-existente');
    expect(() => {
      updateActiveTab({ name: 'Outro' });
    }).not.toThrow();
  });

  it('should persist auth in collection item and keep auth isolated per tab', () => {
    const { createTab, setActiveTab, updateActiveTab, tabs } = useRequest();
    const { collections } = useCollections();

    const targetItem = collections.value[0]?.items[0];
    expect(targetItem).toBeDefined();
    if (!targetItem) {
      return;
    }

    const tab1 = createTab({
      id: targetItem.id,
      name: 'Req 1',
      auth: { type: 'none' },
    });
    setActiveTab(tab1.id);
    updateActiveTab({
      auth: { type: 'bearer', token: 'secret-bearer-tab1', prefix: 'Bearer', enabled: true },
    });

    const updatedCol = collections.value[0];
    const updatedItem = updatedCol?.items.find((i) => i.id === targetItem.id);
    expect(updatedItem?.auth?.type).toBe('bearer');

    const tab2 = createTab({
      id: 'tab-distinct-2',
      name: 'Req 2',
      auth: { type: 'none' },
    });
    setActiveTab(tab2.id);

    const foundTab1 = tabs.value.find((t) => t.id === tab1.id);
    const foundTab2 = tabs.value.find((t) => t.id === tab2.id);

    expect(foundTab1?.auth?.type).toBe('bearer');
    expect(foundTab2?.auth?.type).toBe('none');
  });

  it('should execute testScript and update environment variables after sendRequest', async () => {
    const { updateActiveTab, sendRequest, executionResult } = useRequest();
    const { createEnvironment, setActiveEnvironment, activeEnvironment } = (await import('../../environments')).useEnvironments();

    const env = createEnvironment('TestEnv');
    setActiveEnvironment(env.id);

    const testScript = `
      pm.test("Status deve ser 200", () => {
        pm.response.to.have.status(200);
      });
      pm.test("Salvar variavel de teste", () => {
        pm.environment.set("auth_token", "jwt-12345");
      });
    `;

    updateActiveTab({
      testScript,
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'GET',
    });

    await sendRequest();

    expect(executionResult.value?.testResults).toBeDefined();
    expect(executionResult.value?.testResults?.totalPassed).toBe(2);
    expect(executionResult.value?.testResults?.results[0]?.passed).toBe(true);
    expect(activeEnvironment.value?.variables.find((v) => v.key === 'auth_token')?.value).toBe('jwt-12345');
  });

  it('should inject existing active environment variables into testScript execution', async () => {
    const { updateActiveTab, sendRequest, executionResult } = useRequest();
    const { createEnvironment, setActiveEnvironment, updateEnvironment } = (await import('../../environments')).useEnvironments();

    const env = createEnvironment('ExistingVarsEnv');
    env.variables.push({ id: 'v1', key: 'api_host', value: 'trex.dev', enabled: true });
    env.variables.push({ id: 'v2', key: 'disabled_key', value: 'ignore', enabled: false });
    updateEnvironment(env);
    setActiveEnvironment(env.id);

    const testScript = `
      pm.test("Ler variavel existente", () => {
        pm.expect(pm.environment.get("api_host")).to.equal("trex.dev");
        pm.expect(pm.environment.get("disabled_key")).to.be.undefined;
      });
    `;

    updateActiveTab({
      testScript,
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'GET',
    });

    await sendRequest();

    expect(executionResult.value?.testResults?.totalPassed).toBe(1);
  });

  it('should persist headers and params in collection item on updateActiveTab', () => {
    const { createTab, setActiveTab, updateActiveTab } = useRequest();
    const { collections } = useCollections();

    const targetItem = collections.value[0]?.items[0];
    expect(targetItem).toBeDefined();
    if (!targetItem) {
      return;
    }

    const tab = createTab({
      id: targetItem.id,
      name: 'Req Headers Params',
    });
    setActiveTab(tab.id);

    updateActiveTab({
      headers: [
        { id: 'h1', key: 'X-Trex-Id', value: '42', enabled: true },
        { id: 'h2', key: '   ', value: 'ignore', enabled: true },
      ],
      params: [
        { id: 'p1', key: 'page', value: '5', enabled: true },
        { id: 'p2', key: '', value: 'ignore', enabled: true },
      ],
    });

    const updatedCol = collections.value[0];
    const updatedItem = updatedCol?.items.find((i) => i.id === targetItem.id);
    expect(updatedItem?.headers).toEqual({ 'X-Trex-Id': '42' });
    expect(updatedItem?.params).toEqual({ page: '5' });
  });

  it('should prevent request dispatch and record validation issues when request is invalid', async () => {
    const { updateActiveTab, sendRequest, executionResult, validationIssues } = useRequest();

    updateActiveTab({
      url: '',
      method: 'GET',
    });

    await sendRequest();

    expect(validationIssues.value.length).toBeGreaterThan(0);
    expect(validationIssues.value[0]?.code).toBe('URL_EMPTY');
    expect(executionResult.value?.status).toBe(0);
    expect(executionResult.value?.statusText).toBe('Validation Error');
    expect(executionResult.value?.validationIssues).toEqual(validationIssues.value);
  });

  it('should clear validation issues on clearValidationIssues', async () => {
    const { updateActiveTab, sendRequest, validationIssues, clearValidationIssues } = useRequest();

    updateActiveTab({
      url: '   ',
      method: 'GET',
    });

    await sendRequest();
    expect(validationIssues.value.length).toBeGreaterThan(0);

    clearValidationIssues();
    expect(validationIssues.value).toHaveLength(0);
  });

  it('should use fallback error message when validation fails with empty issues list', async () => {
    const { sendRequest, executionResult, validationIssues } = useRequest();
    vi.spyOn(RequestValidatorService.prototype, 'validate').mockReturnValueOnce({
      isValid: false,
      issues: [],
    });

    await sendRequest();
    expect(validationIssues.value).toHaveLength(0);
    expect(executionResult.value?.error).toBe('Erro de validação preventiva');
  });

  it('should maintain separate execution results and state per tab when switching tabs', async () => {
    const { createTab, setActiveTab, updateActiveTab, sendRequest, executionResult, closeTab, tabs } = useRequest();

    const tab1 = tabs.value[0];
    expect(tab1).toBeDefined();
    if (!tab1) {
      return;
    }

    setActiveTab(tab1.id);
    updateActiveTab({
      url: 'https://eusouanderson.github.io/Trex-Http-Client/get?diet=Carnívoro',
      method: 'GET',
    });
    await sendRequest();
    const result1 = executionResult.value;
    expect(result1).not.toBeNull();
    expect(result1?.status).toBe(200);

    const tab2 = createTab({
      url: 'https://eusouanderson.github.io/Trex-Http-Client/get?diet=Herbívoro',
      method: 'GET',
    });
    expect(executionResult.value).toBeNull();

    await sendRequest();
    const result2 = executionResult.value;
    expect(result2).not.toBeNull();
    expect(result2?.status).toBe(200);

    setActiveTab(tab1.id);
    expect(executionResult.value).toBe(result1);

    setActiveTab(tab2.id);
    expect(executionResult.value).toBe(result2);

    closeTab(tab2.id);
    expect(executionResult.value).toBe(result1);
  });

  it('should return null or default values for computed properties when tabs are empty', () => {
    const { tabs, closeTab, executionResult, validationIssues, isLoading, clearValidationIssues, setValidationIssues } = useRequest();

    while (tabs.value.length > 0) {
      const firstTab = tabs.value[0];
      if (firstTab) {
        closeTab(firstTab.id);
      }
    }

    expect(executionResult.value).toBeNull();
    expect(validationIssues.value).toHaveLength(0);
    expect(isLoading.value).toBe(false);

    clearValidationIssues('');
    setValidationIssues([], '');
  });

  it('should expose executionResultsByTab and getExecutionResultByTabId', async () => {
    const { createTab, sendRequest, executionResultsByTab, getExecutionResultByTabId } = useRequest();

    const tab = createTab({
      url: 'https://eusouanderson.github.io/Trex-Http-Client/get',
      method: 'GET',
    });

    expect(getExecutionResultByTabId(tab.id)).toBeNull();

    await sendRequest();

    const retrieved = getExecutionResultByTabId(tab.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.status).toBe(200);
    expect(executionResultsByTab.value[tab.id]?.status).toBe(200);
  });
});
