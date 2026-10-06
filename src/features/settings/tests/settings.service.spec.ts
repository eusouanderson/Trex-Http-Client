import { describe, it, expect, beforeEach } from 'vitest';
import type { ClientSettings } from '../interfaces';
import { SettingsService } from '../settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    service = new SettingsService();
  });

  it('should initialize with default settings', () => {
    const settings = service.getSettings();

    expect(settings.theme).toBe('dino');
    expect(settings.orientation).toBe('horizontal');
    expect(settings.density).toBe('comfortable');
    expect(settings.defaultTimeout).toBe(10000);
    expect(settings.defaultRetryAttempts).toBe(0);
    expect(settings.followRedirects).toBe(true);
    expect(settings.globalHeaders).toEqual({});
  });

  it('should update partial settings correctly', () => {
    const updated = service.updateSettings({
      theme: 'trex-monokai',
      defaultTimeout: 5000,
      defaultRetryAttempts: 3,
    });

    expect(updated.theme).toBe('trex-monokai');
    expect(updated.defaultTimeout).toBe(5000);
    expect(updated.defaultRetryAttempts).toBe(3);
    expect(updated.orientation).toBe('horizontal');
  });

  it('should reset settings back to initial defaults', () => {
    service.updateSettings({
      theme: 'raptor-dracula',
      orientation: 'vertical',
    });

    const reset = service.resetSettings();

    expect(reset.theme).toBe('dino');
    expect(reset.orientation).toBe('horizontal');
  });

  it('should initialize and update jsonTheme colors and preset', () => {
    const initial = service.getSettings();
    expect(initial.jsonTheme).toBeDefined();
    expect(initial.jsonTheme.preset).toBe('dino');
    expect(initial.jsonTheme.backgroundColor).toBe('#141311');

    const updated = service.updateSettings({
      jsonTheme: {
        ...initial.jsonTheme,
        preset: 'trex-monokai',
        backgroundColor: '#23221c',
        keyColor: '#fb7185',
      },
    });

    expect(updated.jsonTheme.preset).toBe('trex-monokai');
    expect(updated.jsonTheme.backgroundColor).toBe('#23221c');
    expect(updated.jsonTheme.keyColor).toBe('#fb7185');
  });

  it('should delegate to repository when provided', () => {
    const savedList: ClientSettings[] = [];
    let wasReset = false;
    const mockRepo = {
      load: () => Promise.resolve(),
      getSettings: () => ({
        theme: 'raptor-dracula' as const,
        orientation: 'vertical' as const,
        density: 'compact' as const,
        defaultTimeout: 5000,
        defaultRetryAttempts: 2,
        followRedirects: false,
        globalHeaders: {},
        jsonTheme: {
          preset: 'raptor-dracula' as const,
          backgroundColor: '#1e1d27',
          keyColor: '#f472b6',
          stringColor: '#fde047',
          numberColor: '#a78bfa',
          booleanColor: '#4ade80',
          nullColor: '#64748b',
          bracketColor: '#e2e8f0',
        },
      }),
      save: (s: ClientSettings) => {
        savedList.push(s);
      },
      reset: () => {
        wasReset = true;
        return {
          theme: 'dino' as const,
          orientation: 'horizontal' as const,
          density: 'comfortable' as const,
          defaultTimeout: 10000,
          defaultRetryAttempts: 0,
          followRedirects: true,
          globalHeaders: {},
          jsonTheme: {
            preset: 'dino' as const,
            backgroundColor: '#141311',
            keyColor: '#86efac',
            stringColor: '#fcd34d',
            numberColor: '#60a5fa',
            booleanColor: '#f87171',
            nullColor: '#938d82',
            bracketColor: '#cdbca4',
          },
        };
      },
    };

    const repoService = new SettingsService(undefined, mockRepo);
    expect(repoService.getSettings().theme).toBe('raptor-dracula');

    const updated = repoService.updateSettings({ theme: 'pterodactyl-midnight' });
    expect(updated.theme).toBe('pterodactyl-midnight');
    expect(savedList[0]?.theme).toBe('pterodactyl-midnight');

    const res = repoService.resetSettings();
    expect(wasReset).toBe(true);
    expect(res.theme).toBe('dino');
  });
});
