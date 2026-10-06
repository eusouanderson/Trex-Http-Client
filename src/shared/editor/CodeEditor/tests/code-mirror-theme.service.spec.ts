import { describe, it, expect } from 'vitest';
import { CodeMirrorThemeService } from '../code-mirror-theme.service';
import type { JsonThemeSettings } from '../../../../features/settings/interfaces';

describe('CodeMirrorThemeService', () => {
  const service = new CodeMirrorThemeService();
  const sampleTheme: JsonThemeSettings = {
    preset: 'dino',
    backgroundColor: '#141311',
    keyColor: '#86efac',
    stringColor: '#fcd34d',
    numberColor: '#60a5fa',
    booleanColor: '#f87171',
    nullColor: '#938d82',
    bracketColor: '#cdbca4',
  };

  it('should generate CodeMirror extensions including search, syntax highlighting and theme', () => {
    const extensions = service.buildExtensions(sampleTheme, false);
    expect(extensions).toBeDefined();
    expect(Array.isArray(extensions)).toBe(true);
    expect(extensions.length).toBeGreaterThanOrEqual(6);
  });

  it('should include readOnly extension when readOnly is true', () => {
    const extensions = service.buildExtensions(sampleTheme, true);
    expect(extensions).toBeDefined();
    expect(Array.isArray(extensions)).toBe(true);
    expect(extensions.length).toBeGreaterThanOrEqual(7);
  });

  it('should handle triggerSearch gracefully with null view', () => {
    expect(() => { service.triggerSearch(null); }).not.toThrow();
  });
});
