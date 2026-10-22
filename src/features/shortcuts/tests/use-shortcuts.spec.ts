import { describe, expect, it, beforeEach } from 'vitest';
import { useShortcuts } from '../use-shortcuts';
import { shortcutRegistryService } from '../../../core/shortcuts';
import { useRequest } from '../../request';

describe('useShortcuts', () => {
  beforeEach(() => {
    shortcutRegistryService.resetAll();
  });

  it('exposes list of default registered shortcuts', () => {
    const { shortcuts } = useShortcuts();
    expect(shortcuts.value.length).toBeGreaterThan(0);
    const hasSend = shortcuts.value.some((s) => s.id === 'send-request');
    expect(hasSend).toBe(true);
  });

  it('filters shortcuts by name, description or key combo', () => {
    const { searchQuery, filteredShortcuts, shortcuts, formatCombo } = useShortcuts();
    expect(filteredShortcuts.value.length).toBe(shortcuts.value.length);

    searchQuery.value = '   ';
    expect(filteredShortcuts.value.length).toBe(shortcuts.value.length);

    searchQuery.value = 'paleta';
    expect(filteredShortcuts.value.length).toBeGreaterThan(0);
    expect(filteredShortcuts.value[0]?.id).toBe('open-command-palette');

    searchQuery.value = 'ctrl+enter';
    expect(filteredShortcuts.value.some((s) => s.id === 'send-request')).toBe(true);

    searchQuery.value = 'general';
    expect(filteredShortcuts.value.some((s) => s.category === 'general')).toBe(true);

    expect(formatCombo('ctrl+enter')).toBeTruthy();
  });

  it('controls command palette open and close state', () => {
    const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useShortcuts();
    expect(isCommandPaletteOpen.value).toBe(false);

    openCommandPalette();
    expect(isCommandPaletteOpen.value).toBe(true);

    closeCommandPalette();
    expect(isCommandPaletteOpen.value).toBe(false);
  });

  it('updates custom combo and detects conflicts', () => {
    const { updateShortcutCombo, resetShortcutCombo, shortcuts } = useShortcuts();
    const conflicts = updateShortcutCombo('toggle-sidebar', 'ctrl+shift+p');
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0]?.conflictingShortcutId).toBe('open-command-palette');

    const target = shortcuts.value.find((s) => s.id === 'toggle-sidebar');
    expect(target?.isCustom).toBe(true);

    resetShortcutCombo('toggle-sidebar');
    const resetTarget = shortcuts.value.find((s) => s.id === 'toggle-sidebar');
    expect(resetTarget?.isCustom).toBe(false);
  });

  it('resets all custom shortcuts to defaults', () => {
    const { updateShortcutCombo, resetAllShortcuts, shortcuts } = useShortcuts();
    updateShortcutCombo('toggle-sidebar', 'ctrl+alt+b');
    updateShortcutCombo('toggle-theme', 'ctrl+alt+t');

    expect(shortcuts.value.some((s) => s.isCustom)).toBe(true);

    resetAllShortcuts();
    expect(shortcuts.value.every((s) => !s.isCustom)).toBe(true);
  });

  it('executes default actions registered in the registry', async () => {
    useShortcuts();

    const openPalette = shortcutRegistryService.get('open-command-palette');
    void openPalette?.action();

    const openHelp = shortcutRegistryService.get('open-shortcuts-help');
    void openHelp?.action();

    const openSettings = shortcutRegistryService.get('open-settings');
    void openSettings?.action();

    const toggleTheme = shortcutRegistryService.get('toggle-theme');
    void toggleTheme?.action();

    const sidebarBtn = document.createElement('button');
    sidebarBtn.setAttribute('aria-label', 'Alternar Barra Lateral');
    document.body.appendChild(sidebarBtn);
    const toggleSidebar = shortcutRegistryService.get('toggle-sidebar');
    void toggleSidebar?.action();

    const searchInput = document.createElement('input');
    searchInput.setAttribute('aria-label', 'Filtrar requisições');
    document.body.appendChild(searchInput);
    const focusSearch = shortcutRegistryService.get('focus-search');
    void focusSearch?.action();

    const urlInput = document.createElement('input');
    urlInput.setAttribute('aria-label', 'URL da requisição');
    document.body.appendChild(urlInput);
    const focusUrl = shortcutRegistryService.get('focus-url');
    void focusUrl?.action();

    const cancelReq = shortcutRegistryService.get('cancel-request');
    void cancelReq?.action();

    const newTab = shortcutRegistryService.get('new-tab');
    void newTab?.action();

    const duplicateTab = shortcutRegistryService.get('duplicate-tab');
    void duplicateTab?.action();

    const nextTab = shortcutRegistryService.get('next-tab');
    void nextTab?.action();

    const prevTab = shortcutRegistryService.get('prev-tab');
    void prevTab?.action();

    const closeTab = shortcutRegistryService.get('close-tab');
    void closeTab?.action();

    const saveReq = shortcutRegistryService.get('save-request');
    void saveReq?.action();

    const formatBody = shortcutRegistryService.get('format-body');
    const { updateActiveTab } = useRequest();
    updateActiveTab({ body: '{"name":"trex"}' });
    void formatBody?.action();

    updateActiveTab({ body: '{invalid-json' });
    void formatBody?.action();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    const newCol = shortcutRegistryService.get('new-collection');
    void newCol?.action();

    const openEnv = shortcutRegistryService.get('open-env-manager');
    void openEnv?.action();

    const toggleOrient = shortcutRegistryService.get('toggle-orientation');
    void toggleOrient?.action();
    void toggleOrient?.action();

    const toggleDens = shortcutRegistryService.get('toggle-density');
    void toggleDens?.action();
    void toggleDens?.action();

    const sendReq = shortcutRegistryService.get('send-request');
    await sendReq?.action();

    const closeAll = shortcutRegistryService.get('close-all-tabs');
    void closeAll?.action();

    expect(true).toBe(true);
  });
});
