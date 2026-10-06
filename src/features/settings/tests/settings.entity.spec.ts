import { describe, it, expect } from 'vitest';
import { SettingsEntity, JSON_THEME_PRESETS } from '../settings.entity';

describe('SettingsEntity', () => {
  it('should initialize with default settings when no initial values provided', () => {
    const entity = new SettingsEntity();
    expect(entity.value.theme).toBe('dino');
    expect(entity.value.orientation).toBe('horizontal');
    expect(entity.value.jsonTheme.preset).toBe('dino');
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
    });

    expect(entity.value.theme).toBe('triceratops-amber');
    expect(entity.value.jsonTheme.keyColor).toBe('#ff0000');
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
  });
});

