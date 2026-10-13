import { describe, it, expect, beforeEach } from 'vitest';
import { useSettings } from '../use-settings';

describe('useSettings', () => {
  beforeEach(() => {
    const { resetSettings, closeSettings } = useSettings();
    resetSettings();
    closeSettings();
  });

  it('should toggle settings modal open state', () => {
    const { isOpen, openSettings, closeSettings } = useSettings();
    expect(isOpen.value).toBe(false);

    openSettings();
    expect(isOpen.value).toBe(true);

    closeSettings();
    expect(isOpen.value).toBe(false);
  });

  it('should update and reset client settings reactively', () => {
    const { settings, updateSettings, resetSettings } = useSettings();

    updateSettings({ theme: 'pterodactyl-midnight', orientation: 'vertical' });
    expect(settings.value.theme).toBe('pterodactyl-midnight');
    expect(settings.value.orientation).toBe('vertical');

    resetSettings();
    expect(settings.value.theme).toBe('dino');
    expect(settings.value.orientation).toBe('horizontal');
  });

  it('should update meta theme-color tag when theme changes', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', '#141311');
    document.head.appendChild(meta);

    const { updateSettings, resetSettings } = useSettings();
    updateSettings({ theme: 'raptor-dracula' });
    expect(meta.getAttribute('content')).toBe('#1e1d27');

    resetSettings();
    expect(meta.getAttribute('content')).toBe('#141311');

    meta.remove();
  });

  it('should not throw when updating theme if document is undefined', () => {
    const { updateSettings } = useSettings();
    const originalDoc = globalThis.document;
    delete (globalThis as unknown as { document?: unknown }).document;
    
    expect(() => {
      updateSettings({ theme: 'pterodactyl-midnight' });
    }).not.toThrow();
    
    globalThis.document = originalDoc;
  });

  it('should add and remove custom themes and update meta tag accordingly', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', '#141311');
    document.head.appendChild(meta);

    const { settings, addCustomTheme, removeCustomTheme, updateSettings } = useSettings();

    const dummyCustom = {
      id: 'custom-aqua',
      name: 'Aqua Marine',
      icon: '🌊',
      description: 'Aqua theme',
      previewColors: ['#001122'],
      colors: {
        surfaceGround: '#001122',
        surfacePanel: '#002233',
        surfaceCard: '#003344',
        surfaceBorder: '#004455',
        surfaceHover: '#005566',
        accent: '#00e5ff',
        accentLight: '#80f2ff',
        accentBorder: '#00b4cc',
      },
      jsonTheme: {
        backgroundColor: '#001122',
        keyColor: '#00e5ff',
        stringColor: '#fcd34d',
        numberColor: '#60a5fa',
        booleanColor: '#f87171',
        nullColor: '#938d82',
        bracketColor: '#cdbca4',
      },
    };

    addCustomTheme(dummyCustom);
    expect(settings.value.customThemes).toHaveLength(1);

    updateSettings({ theme: 'custom-aqua' });
    expect(settings.value.theme).toBe('custom-aqua');
    expect(meta.getAttribute('content')).toBe('#001122');

    removeCustomTheme('custom-aqua');
    expect(settings.value.customThemes).toHaveLength(0);
    expect(settings.value.theme).toBe('dino');
    expect(meta.getAttribute('content')).toBe('#141311');

    updateSettings({ theme: 'unknown-nonexistent-theme' });
    expect(meta.getAttribute('content')).toBe('#141311');

    meta.remove();
  });
});

