import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { ThemeParserService } from '../../theme-parser.service';
import { useSettingsModal } from '../use-settings-modal';

describe('useSettingsModal', () => {
  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  beforeEach(() => {
    const modal = useSettingsModal();
    modal.resetAll();
    modal.setTab('general');
  });

  it('should switch active tabs correctly', () => {
    const modal = useSettingsModal();

    expect(modal.activeTab.value).toBe('general');
    modal.setTab('theme');
    expect(modal.activeTab.value).toBe('theme');
    modal.setTab('network');
    expect(modal.activeTab.value).toBe('network');
  });

  it('should update theme and synchronize json theme presets', () => {
    const modal = useSettingsModal();

    modal.setTheme('trex-monokai');
    expect(modal.settings.value.theme).toBe('trex-monokai');
    expect(modal.settings.value.jsonTheme.preset).toBe('trex-monokai');
    expect(modal.settings.value.jsonTheme.backgroundColor).toBe('#23221c');

    modal.setOrientation('vertical');
    expect(modal.settings.value.orientation).toBe('vertical');

    modal.setDensity('compact');
    expect(modal.settings.value.density).toBe('compact');
  });

  it('should update network settings', () => {
    const modal = useSettingsModal();

    modal.setTimeoutValue(8000);
    expect(modal.settings.value.defaultTimeout).toBe(8000);

    modal.setRetryAttempts(2);
    expect(modal.settings.value.defaultRetryAttempts).toBe(2);

    const initialFollow = modal.settings.value.followRedirects;
    modal.toggleFollowRedirects();
    expect(modal.settings.value.followRedirects).toBe(!initialFollow);
  });

  it('should update json theme presets and custom colors', () => {
    const modal = useSettingsModal();

    modal.setTab('json');
    expect(modal.activeTab.value).toBe('json');

    modal.setJsonPreset('trex-monokai');
    expect(modal.settings.value.jsonTheme.preset).toBe('trex-monokai');
    expect(modal.settings.value.jsonTheme.backgroundColor).toBe('#23221c');

    modal.setJsonColor('backgroundColor', '#000000');
    expect(modal.settings.value.jsonTheme.preset).toBe('custom');
    expect(modal.settings.value.jsonTheme.backgroundColor).toBe('#000000');

    modal.setJsonPreset('custom');
    expect(modal.settings.value.jsonTheme.preset).toBe('custom');

    modal.close();
  });

  it('should import a valid custom theme and select it', () => {
    const modal = useSettingsModal();

    const validJson = JSON.stringify({
      id: 'custom-jurassic-green',
      name: 'Jurassic Neon Green',
      icon: '🦖',
      description: 'Green custom theme',
      colors: {
        surfaceGround: '#0c1a10',
        surfacePanel: '#14291a',
        surfaceCard: '#1d3824',
        surfaceBorder: '#27472f',
        surfaceHover: '#33573c',
        accent: '#22c55e',
        accentLight: '#4ade80',
        accentBorder: '#16a34a',
      },
      jsonTheme: {
        backgroundColor: '#0c1a10',
        keyColor: '#22c55e',
        stringColor: '#facc15',
        numberColor: '#60a5fa',
        booleanColor: '#f87171',
        nullColor: '#938d82',
        bracketColor: '#cdbca4',
      },
    });

    const result = modal.importCustomTheme(validJson);
    expect(result.success).toBe(true);
    expect(modal.settings.value.customThemes).toHaveLength(1);
    expect(modal.settings.value.theme).toBe('custom-jurassic-green');
    expect(modal.settings.value.jsonTheme.backgroundColor).toBe('#0c1a10');
    expect(modal.customThemes.value).toHaveLength(1);
    expect(modal.jurassicThemes.value.some((t) => t.id === 'custom-jurassic-green')).toBe(true);
  });

  it('should fail importing invalid JSON theme and set error', () => {
    const modal = useSettingsModal();

    const result = modal.importCustomTheme('invalid-json');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(modal.customThemeError.value).toBeDefined();
  });

  it('should delete a custom theme and revert active theme if deleted', () => {
    const modal = useSettingsModal();

    const validJson = JSON.stringify({
      id: 'theme-to-delete',
      name: 'Delete Me',
      colors: {
        surfaceGround: '#000',
        surfacePanel: '#111',
        surfaceCard: '#222',
        surfaceBorder: '#333',
        surfaceHover: '#444',
        accent: '#555',
        accentLight: '#666',
        accentBorder: '#777',
      },
    });

    modal.importCustomTheme(validJson);
    expect(modal.settings.value.theme).toBe('theme-to-delete');

    modal.deleteCustomTheme('theme-to-delete');
    expect(modal.settings.value.customThemes).toHaveLength(0);
    expect(modal.settings.value.theme).toBe('dino');
  });

  it('should trigger theme template download without errors', () => {
    const modal = useSettingsModal();
    const createObjectURL = vi.fn().mockReturnValue('blob:test');
    const revokeObjectURL = vi.fn();
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = revokeObjectURL;
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      return undefined;
    });

    expect(() => { modal.downloadThemeTemplate(); }).not.toThrow();
    clickSpy.mockRestore();

    const originalCreate = window.URL.createObjectURL.bind(window.URL);
    // @ts-expect-error test undefined createObjectURL
    delete window.URL.createObjectURL;
    expect(() => { modal.downloadThemeTemplate(); }).not.toThrow();
    window.URL.createObjectURL = originalCreate;
  });

  it('should handle custom theme without jsonTheme using fallback colors', () => {
    const modal = useSettingsModal();
    const minimalJson = JSON.stringify({
      id: 'minimal-custom',
      name: 'Minimal',
      colors: {
        surfaceGround: '#111',
        surfacePanel: '#222',
        surfaceCard: '#333',
        surfaceBorder: '#444',
        surfaceHover: '#555',
        accent: '#666',
        accentLight: '#777',
        accentBorder: '#888',
      },
    });

    modal.importCustomTheme(minimalJson);
    modal.setTheme('minimal-custom');
    expect(modal.settings.value.jsonTheme.backgroundColor).toBe('#111');
    expect(modal.settings.value.jsonTheme.keyColor).toBe('#666');
    expect(modal.settings.value.jsonTheme.stringColor).toBe('#fcd34d');
    expect(modal.settings.value.jsonTheme.numberColor).toBe('#60a5fa');
    expect(modal.settings.value.jsonTheme.booleanColor).toBe('#f87171');
    expect(modal.settings.value.jsonTheme.nullColor).toBe('#938d82');
    expect(modal.settings.value.jsonTheme.bracketColor).toBe('#cdbca4');
  });

  it('should handle non-Error exceptions in importCustomTheme', () => {
    const modal = useSettingsModal();
    const spy = vi.spyOn(ThemeParserService.prototype, 'parse').mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'string error';
    });

    const result = modal.importCustomTheme('{');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Falha ao processar o arquivo JSON de tema.');
    spy.mockRestore();
  });
});


