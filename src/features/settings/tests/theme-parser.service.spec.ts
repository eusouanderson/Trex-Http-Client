import { describe, it, expect } from 'vitest';
import { ThemeParserService } from '../theme-parser.service';

describe('ThemeParserService', () => {
  const service = new ThemeParserService();

  const validThemeJson = JSON.stringify({
    id: 'spino-neon',
    name: 'Spinosaurus Neon',
    icon: '🐊',
    description: 'Um tema verde neon aquatico',
    previewColors: ['#0b1219', '#121e29', '#00f0ff'],
    colors: {
      surfaceGround: '#0b1219',
      surfacePanel: '#121e29',
      surfaceCard: '#1a2a3a',
      surfaceBorder: '#263f57',
      surfaceHover: '#335474',
      accent: '#00f0ff',
      accentLight: '#70f7ff',
      accentBorder: '#00bcd4',
    },
    jsonTheme: {
      backgroundColor: '#0b1219',
      keyColor: '#00f0ff',
      stringColor: '#39ff14',
      numberColor: '#ff007f',
      booleanColor: '#ffb700',
      nullColor: '#708a9e',
      bracketColor: '#e0f7fa',
    },
  });

  it('should parse a complete valid theme JSON', () => {
    const theme = service.parse(validThemeJson);

    expect(theme.id).toBe('spino-neon');
    expect(theme.name).toBe('Spinosaurus Neon');
    expect(theme.icon).toBe('🐊');
    expect(theme.description).toBe('Um tema verde neon aquatico');
    expect(theme.previewColors).toEqual(['#0b1219', '#121e29', '#00f0ff']);
    expect(theme.colors.accent).toBe('#00f0ff');
    expect(theme.jsonTheme.keyColor).toBe('#00f0ff');
  });

  it('should parse minimal theme JSON and auto-generate defaults', () => {
    const minimalJson = JSON.stringify({
      name: 'Ankylosaurus Slate',
      colors: {
        surfaceGround: '#101418',
        surfacePanel: '#181e24',
        surfaceCard: '#222a32',
        surfaceBorder: '#323e4a',
        surfaceHover: '#425262',
        accent: '#94a3b8',
        accentLight: '#cbd5e1',
        accentBorder: '#64748b',
      },
    });

    const theme = service.parse(minimalJson);

    expect(theme.id).toContain('ankylosaurus-slate');
    expect(theme.name).toBe('Ankylosaurus Slate');
    expect(theme.icon).toBe('🎨');
    expect(theme.previewColors.length).toBeGreaterThanOrEqual(3);
    expect(theme.jsonTheme.backgroundColor).toBe('#101418');
  });

  it('should throw error when raw JSON syntax is invalid', () => {
    expect(() => service.parse('not-json')).toThrow();
  });

  it('should throw error when name is missing or empty', () => {
    const invalidJson = JSON.stringify({
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

    expect(() => service.parse(invalidJson)).toThrow();
  });

  it('should throw error when colors object is missing or incomplete', () => {
    const incompleteColorsJson = JSON.stringify({
      name: 'Missing Colors',
      colors: {
        surfaceGround: '#000',
      },
    });

    expect(() => service.parse(incompleteColorsJson)).toThrow();
  });

  it('should generate a template that can be parsed without errors', () => {
    const template = service.generateTemplate();
    expect(typeof template).toBe('string');

    const parsed = service.parse(template);
    expect(parsed.name).toBeDefined();
    expect(parsed.colors.surfaceGround).toBeDefined();
    expect(parsed.colors.accent).toBeDefined();
  });
});

