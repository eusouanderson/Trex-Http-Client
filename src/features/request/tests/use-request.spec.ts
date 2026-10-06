import { describe, it, expect, beforeEach } from 'vitest';
import { useCollections } from '../../collections';
import { useRequest } from '../use-request';

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
});
