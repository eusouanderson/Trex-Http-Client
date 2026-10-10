import { describe, it, expect } from 'vitest';
import { SettingsEntity, JSON_THEME_PRESETS } from '../settings.entity';
import type { CustomTheme } from '../interfaces';

describe('SettingsEntity', () => {
  const dummyCustomTheme: CustomTheme = {
    id: 'custom-trex',
    name: 'Custom TRex',
    icon: '🦖',
    description: 'Custom theme description',
    previewColors: ['#111111', '#222222'],
    colors: {
      surfaceGround: '#111111',
      surfacePanel: '#222222',
      surfaceCard: '#333333',
      surfaceBorder: '#444444',
      surfaceHover: '#555555',
      accent: '#666666',
      accentLight: '#777777',
      accentBorder: '#888888',
    },
    jsonTheme: {
      backgroundColor: '#111111',
      keyColor: '#666666',
      stringColor: '#fcd34d',
      numberColor: '#60a5fa',
      booleanColor: '#f87171',
      nullColor: '#938d82',
      bracketColor: '#cdbca4',
    },
  };

  it('should initialize with default settings when no initial values provided', () => {
    const entity = new SettingsEntity();
    expect(entity.value.theme).toBe('dino');
    expect(entity.value.orientation).toBe('horizontal');
    expect(entity.value.jsonTheme.preset).toBe('dino');
    expect(entity.value.customThemes).toEqual([]);
  });

  it('should merge partial initial settings and jsonTheme', () => {
    const entity = new SettingsEntity({
      theme: 'triceratops-amber',
      jsonTheme: {
        preset: 'triceratops-amber',
        keyColor: '#ff0000',
        backgroundColor: '#000000',
        stringColor: '#00ff00',
        numberColor: '#0000ff',
        booleanColor: '#ffff00',
        nullColor: '#ffffff',
        bracketColor: '#aaaaaa',
      },
      customThemes: [dummyCustomTheme],
    });

    expect(entity.value.theme).toBe('triceratops-amber');
    expect(entity.value.jsonTheme.keyColor).toBe('#ff0000');
    expect(entity.value.customThemes).toHaveLength(1);
  });

  it('should update settings with and without partial jsonTheme', () => {
    const entity = new SettingsEntity();

    entity.update({ orientation: 'vertical' });
    expect(entity.value.orientation).toBe('vertical');

    entity.update({
      jsonTheme: {
        preset: 'raptor-dracula',
        ...JSON_THEME_PRESETS['raptor-dracula'],
      },
    });
    expect(entity.value.jsonTheme.preset).toBe('raptor-dracula');
    expect(entity.value.jsonTheme.keyColor).toBe(JSON_THEME_PRESETS['raptor-dracula'].keyColor);
  });

  it('should reset settings to default', () => {
    const entity = new SettingsEntity({ theme: 'pterodactyl-midnight' });
    expect(entity.value.theme).toBe('pterodactyl-midnight');

    entity.reset();
    expect(entity.value.theme).toBe('dino');
    expect(entity.value.customThemes).toEqual([]);
  });

  it('should add, get and remove custom theme correctly', () => {
    const entity = new SettingsEntity();

    entity.addCustomTheme(dummyCustomTheme);
    expect(entity.value.customThemes).toHaveLength(1);
    expect(entity.getCustomTheme('custom-trex')).toEqual(dummyCustomTheme);

    const updatedCustom = { ...dummyCustomTheme, name: 'Renamed TRex' };
    entity.addCustomTheme(updatedCustom);
    expect(entity.value.customThemes).toHaveLength(1);
    expect(entity.getCustomTheme('custom-trex')?.name).toBe('Renamed TRex');

    entity.update({ theme: 'custom-trex' });
    expect(entity.value.theme).toBe('custom-trex');

    entity.removeCustomTheme('custom-trex');
    expect(entity.value.customThemes).toHaveLength(0);
    expect(entity.value.theme).toBe('dino');
    expect(entity.getCustomTheme('custom-trex')).toBeUndefined();
  });
});
