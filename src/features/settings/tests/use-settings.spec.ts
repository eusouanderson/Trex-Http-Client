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
});

