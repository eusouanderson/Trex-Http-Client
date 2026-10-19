import { describe, it, expect } from 'vitest';
import { ThemeStyleService } from '../theme-style.service';
import type { CustomThemeColors } from '../interfaces';

describe('ThemeStyleService', () => {
  const service = new ThemeStyleService();

  const darkColors: CustomThemeColors = {
    surfaceGround: '#141311',
    surfacePanel: '#1c1a17',
    surfaceCard: '#24211d',
    surfaceBorder: '#3f3b35',
    surfaceHover: '#4a453d',
    accent: '#22c55e',
    accentLight: '#4ade80',
    accentBorder: '#16a34a',
  };

  const lightColors: CustomThemeColors = {
    surfaceGround: '#ffffff',
    surfacePanel: '#f1f5f9',
    surfaceCard: '#ffffff',
    surfaceBorder: '#e2e8f0',
    surfaceHover: '#cbd5e1',
    accent: '#0ea5e9',
    accentLight: '#38bdf8',
    accentBorder: '#0284c7',
  };

  it('should convert hex colors to css variables with space-separated rgb values', () => {
    const vars = service.colorsToCssVariables(darkColors);

    expect(vars['--color-surface-ground-rgb']).toBe('20 19 17');
    expect(vars['--color-surface-panel-rgb']).toBe('28 26 23');
    expect(vars['--color-accent-rgb']).toBe('34 197 94');
    expect(vars['--color-text-main-rgb']).toBe('250 248 245');
    expect(vars['--color-text-muted-rgb']).toBe('179 175 166');
  });

  it('should generate dark text variables automatically when background is light', () => {
    const vars = service.colorsToCssVariables(lightColors);

    expect(vars['--color-surface-ground-rgb']).toBe('255 255 255');
    expect(vars['--color-text-main-rgb']).toBe('15 23 42');
    expect(vars['--color-text-muted-rgb']).toBe('100 116 139');
  });

  it('should respect explicit textMain and textMuted colors when provided', () => {
    const customTextColors: CustomThemeColors = {
      ...darkColors,
      textMain: '#ff0000',
      textMuted: '#00ff00',
    };

    const vars = service.colorsToCssVariables(customTextColors);

    expect(vars['--color-text-main-rgb']).toBe('255 0 0');
    expect(vars['--color-text-muted-rgb']).toBe('0 255 0');
  });

  it('should identify light and dark colors correctly with isLightColor', () => {
    expect(service.isLightColor('#ffffff')).toBe(true);
    expect(service.isLightColor('#f8fafc')).toBe(true);
    expect(service.isLightColor('rgb(250, 250, 250)')).toBe(true);
    expect(service.isLightColor('#141311')).toBe(false);
    expect(service.isLightColor('#000000')).toBe(false);
    expect(service.isLightColor('rgb(10, 10, 10)')).toBe(false);
    expect(service.isLightColor('invalid-color')).toBe(false);
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
      colors: darkColors,
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
    expect(style['--color-text-main-rgb']).toBe('250 248 245');
  });
});
