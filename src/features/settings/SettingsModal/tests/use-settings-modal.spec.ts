import { describe, it, expect, beforeEach, afterAll } from 'vitest';
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
});
