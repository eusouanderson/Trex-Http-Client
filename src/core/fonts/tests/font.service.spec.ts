import { beforeEach, describe, expect, it } from 'vitest';
import { AVAILABLE_FONTS, FontService } from '../index';
import type { FontOption } from '../interfaces';

describe('FontService', () => {
  let service: FontService;

  beforeEach(() => {
    service = new FontService();
  });

  it('should export AVAILABLE_FONTS from index and contain fonts', () => {
    expect(AVAILABLE_FONTS.length).toBeGreaterThanOrEqual(10);
  });

  it('should list all available fonts with correct metadata', () => {
    const fonts = service.getAvailableFonts();
    expect(fonts.length).toBeGreaterThanOrEqual(10);
    expect(fonts.some((f) => f.id === 'system')).toBe(true);
    expect(fonts.some((f) => f.id === 'fira-code')).toBe(true);
    expect(fonts.some((f) => f.id === 'geist')).toBe(true);
    expect(fonts.some((f) => f.id === 'geist-mono')).toBe(true);
    expect(fonts.some((f) => f.id === 'cascadia-code')).toBe(true);
    expect(fonts.some((f) => f.id === 'hack')).toBe(true);
    expect(fonts.some((f) => f.id === 'ibm-plex-sans')).toBe(true);
    expect(fonts.some((f) => f.id === 'iosevka')).toBe(true);
    expect(fonts.some((f) => f.id === 'monaspace-neon')).toBe(true);
    expect(fonts.some((f) => f.id === 'source-code-pro')).toBe(true);
  });

  it('should return system font by default when id is system', () => {
    const font = service.getFontById('system');
    expect(font.id).toBe('system');
    expect(font.category).toBe('sans');
  });

  it('should return specific font by id', () => {
    const fira = service.getFontById('fira-code');
    expect(fira.id).toBe('fira-code');
    expect(fira.category).toBe('mono');
    expect(fira.cssValue).toContain('Fira Code');
  });

  it('should fallback to system font when id is not recognized', () => {
    const unknown = service.getFontById('non-existent-font');
    expect(unknown.id).toBe('system');
  });

  it('should fallback to first font if system font is not present in custom fonts list', () => {
    const customList: FontOption[] = [
      {
        id: 'unique-mono',
        name: 'Unique Mono',
        label: 'Unique Mono',
        category: 'mono',
        cssValue: 'monospace',
        description: 'Custom font',
      },
    ];
    const customService = new FontService(customList);
    const result = customService.getFontById('non-existent');
    expect(result.id).toBe('unique-mono');
  });

  it('should fallback to default available font if custom fonts list is completely empty', () => {
    const emptyService = new FontService([]);
    const result = emptyService.getFontById('non-existent');
    expect(result.id).toBe('system');
  });

  it('should get css value directly for an existing font', () => {
    const css = service.getFontCssValue('geist');
    expect(css).toContain('Geist');
  });

  it('should get fallback css value for unknown font', () => {
    const css = service.getFontCssValue('unknown-font');
    const systemCss = service.getFontCssValue('system');
    expect(css).toBe(systemCss);
  });

  it('should apply font css variable to explicit target element', () => {
    const el = document.createElement('div');
    service.applyFont('cascadia-code', el);
    expect(el.style.getPropertyValue('--font-family-app')).toContain('Cascadia Code');
  });

  it('should apply font to document.documentElement when target is omitted', () => {
    service.applyFont('hack');
    expect(document.documentElement.style.getPropertyValue('--font-family-app')).toContain('Hack');
  });

  it('should handle missing document gracefully without throwing', () => {
    const originalDocument = globalThis.document;
    try {
      Object.defineProperty(globalThis, 'document', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      expect(() => {
        service.applyFont('iosevka');
      }).not.toThrow();
    } finally {
      Object.defineProperty(globalThis, 'document', {
        value: originalDocument,
        writable: true,
        configurable: true,
      });
    }
  });
});
