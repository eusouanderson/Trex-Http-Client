import { describe, it, expect } from 'vitest';
import { ThemeStyleService } from '../theme-style.service';
import type { CustomThemeColors } from '../interfaces';

describe('ThemeStyleService', () => {
  const service = new ThemeStyleService();

  const colors: CustomThemeColors = {
    surfaceGround: '#141311',
    surfacePanel: '#1c1a17',
    surfaceCard: '#24211d',
    surfaceBorder: '#3f3b35',
    surfaceHover: '#4a453d',
    accent: '#22c55e',
    accentLight: '#4ade80',
    accentBorder: '#16a34a',
  };

  it('should convert hex colors to css variables with space-separated rgb values', () => {
    const vars = service.colorsToCssVariables(colors);

    expect(vars['--color-surface-ground-rgb']).toBe('20 19 17');
    expect(vars['--color-surface-panel-rgb']).toBe('28 26 23');
    expect(vars['--color-accent-rgb']).toBe('34 197 94');
  });

  it('should convert 3-digit hex colors properly', () => {
    const rgb = service.hexToRgb('#fff');
    expect(rgb).toBe('255 255 255');
  });

  it('should parse rgb() format properly', () => {
    const rgb = service.hexToRgb('rgb(10, 20, 30)');
    expect(rgb).toBe('10 20 30');
  });

  it('should retain space-separated values as-is', () => {
    const rgb = service.hexToRgb('15 25 35');
    expect(rgb).toBe('15 25 35');
  });

  it('should return default rgb on invalid format', () => {
    const rgb = service.hexToRgb('not-a-color');
    expect(rgb).toBe('20 19 17');
  });

  it('should return complete style object from a custom theme', () => {
    const style = service.getThemeStyle({
      id: 'custom-1',
      name: 'Test',
      icon: '🎨',
      description: 'Test theme',
      previewColors: ['#141311'],
      colors,
      jsonTheme: {
        backgroundColor: '#141311',
        keyColor: '#22c55e',
        stringColor: '#fcd34d',
        numberColor: '#60a5fa',
        booleanColor: '#f87171',
        nullColor: '#938d82',
        bracketColor: '#cdbca4',
      },
    });

    expect(style['--color-surface-ground-rgb']).toBe('20 19 17');
    expect(style['--color-accent-rgb']).toBe('34 197 94');
  });
});

