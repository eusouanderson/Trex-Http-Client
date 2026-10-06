import { describe, it, expect, beforeEach } from 'vitest';
import { useCollections } from '../../../features/collections';
import { useAppLayout } from '../use-app-layout';

describe('useAppLayout', () => {
  beforeEach(() => {
    const layout = useAppLayout();
    layout.setSidebarTab('collections');
  });

  it('should toggle sidebar open and closed', () => {
    const layout = useAppLayout();

    expect(layout.isSidebarOpen.value).toBe(true);
    layout.toggleSidebar();
    expect(layout.isSidebarOpen.value).toBe(false);
    layout.toggleSidebar();
    expect(layout.isSidebarOpen.value).toBe(true);
  });

  it('should switch sidebar tabs between collections and history', () => {
    const layout = useAppLayout();

    layout.setSidebarTab('history');
    expect(layout.activeSidebarTab.value).toBe('history');
    layout.setSidebarTab('collections');
    expect(layout.activeSidebarTab.value).toBe('collections');
  });

  it('should open settings when requested', () => {
    const layout = useAppLayout();

    layout.openSettings();
    expect(layout.isSettingsOpen.value).toBe(true);
    layout.closeSettings();
    expect(layout.isSettingsOpen.value).toBe(false);
  });

  it('should synchronize collection selectedItemId when selectTab is called', () => {
    const layout = useAppLayout();
    const { selectedItemId } = useCollections();

    layout.selectTab('req-dino-2');
    expect(layout.activeTabId.value).toBe('req-dino-2');
    expect(selectedItemId.value).toBe('req-dino-2');
  });

  it('should update collection selectedItemId when closing tab and clear when empty', () => {
    const layout = useAppLayout();
    const { selectedItemId } = useCollections();

    layout.selectTab('req-dino-2');
    expect(selectedItemId.value).toBe('req-dino-2');

    while (layout.tabs.value.length > 0) {
      const first = layout.tabs.value[0];
      if (!first) break;
      layout.closeTab(first.id);
    }

    expect(layout.activeTabId.value).toBe('');
    expect(selectedItemId.value).toBeNull();
  });

  it('should synchronize selectedItemId to remaining tab when one of multiple tabs is closed', () => {
    const layout = useAppLayout();
    const { selectedItemId } = useCollections();

    layout.addNewTab();
    layout.addNewTab();
    expect(layout.tabs.value.length).toBeGreaterThanOrEqual(2);

    const firstTab = layout.tabs.value[0];
    const secondTab = layout.tabs.value[1];
    expect(firstTab).toBeDefined();
    expect(secondTab).toBeDefined();

    if (firstTab && secondTab) {
      layout.selectTab(firstTab.id);
      expect(layout.activeTabId.value).toBe(firstTab.id);
      layout.closeTab(firstTab.id);
      expect(layout.activeTabId.value.length).toBeGreaterThan(0);
      expect(selectedItemId.value).toBe(layout.activeTabId.value);
    }
  });

  it('should handle adding new tab and toggling environment manager', () => {
    const layout = useAppLayout();

    layout.addNewTab();
    expect(layout.tabs.value.length).toBeGreaterThan(0);

    layout.openEnvironmentManager();
    expect(layout.isEnvironmentManagerOpen.value).toBe(true);

    layout.closeEnvironmentManager();
    expect(layout.isEnvironmentManagerOpen.value).toBe(false);
  });

  it('should handle item selection from collection tree for new and existing items', () => {
    const layout = useAppLayout();

    layout.handleSelectItem({
      id: 'custom-item-1',
      name: 'Custom Item 1',
      type: 'request',
      method: 'POST',
      url: 'https://api.dino.dev/items',
      headers: { 'X-Custom': 'val' },
      params: { page: '1' },
      body: '{"dino": true}',
    });

    expect(layout.tabs.value.some((t) => t.id === 'custom-item-1')).toBe(true);

    layout.handleSelectItem({
      id: 'custom-item-1',
      name: 'Custom Item 1',
      type: 'request',
    });

    layout.handleSelectItem({
      id: 'custom-item-2',
      name: 'Custom Item 2',
      type: 'request',
    });

    expect(layout.tabs.value.some((t) => t.id === 'custom-item-2')).toBe(true);
  });
});
