import { describe, expect, it } from 'vitest';
import { PlatformService } from '../platform.service';

describe('PlatformService', () => {
  it('identifies non-Mac environment by default in jsdom and handles undefined navigator', () => {
    const defaultService = new PlatformService();
    expect(typeof defaultService.isMac()).toBe('boolean');

    const globalRef = globalThis as { navigator?: unknown };
    const originalNav = globalRef.navigator;
    delete globalRef.navigator;
    const noNavService = new PlatformService();
    expect(noNavService.isMac()).toBe(false);
    globalRef.navigator = originalNav;

    const service = new PlatformService('Linux x86_64');
    expect(service.isMac()).toBe(false);
  });

  it('identifies Mac environment when platform string contains Mac', () => {
    const service = new PlatformService('MacIntel');
    expect(service.isMac()).toBe(true);
  });

  it('formats modifier labels according to platform', () => {
    const winService = new PlatformService('Win32');
    expect(winService.getModifierLabel('ctrl')).toBe('Ctrl');
    expect(winService.getModifierLabel('alt')).toBe('Alt');
    expect(winService.getModifierLabel('shift')).toBe('Shift');
    expect(winService.getModifierLabel('meta')).toBe('Win');

    const macService = new PlatformService('MacIntel');
    expect(macService.getModifierLabel('ctrl')).toBe('⌃');
    expect(macService.getModifierLabel('alt')).toBe('⌥');
    expect(macService.getModifierLabel('shift')).toBe('⇧');
    expect(macService.getModifierLabel('meta')).toBe('⌘');
  });

  it('formats simple and combined key combinations for Windows/Linux', () => {
    const service = new PlatformService('Linux');
    expect(service.formatKeyCombo('ctrl+enter')).toBe('Ctrl + Enter');
    expect(service.formatKeyCombo('ctrl+shift+p')).toBe('Ctrl + Shift + P');
    expect(service.formatKeyCombo('ctrl+alt+right')).toBe('Ctrl + Alt + Right');
    expect(service.formatKeyCombo('escape')).toBe('Esc');
    expect(service.formatKeyCombo('esc')).toBe('Esc');
    expect(service.formatKeyCombo('ctrl+up')).toBe('Ctrl + Up');
    expect(service.formatKeyCombo('ctrl+down')).toBe('Ctrl + Down');
    expect(service.formatKeyCombo('ctrl+left')).toBe('Ctrl + Left');
    expect(service.formatKeyCombo('ctrl+arrowup')).toBe('Ctrl + Up');
    expect(service.formatKeyCombo('ctrl+arrowdown')).toBe('Ctrl + Down');
    expect(service.formatKeyCombo('ctrl+arrowleft')).toBe('Ctrl + Left');
    expect(service.formatKeyCombo('ctrl+home')).toBe('Ctrl + Home');
  });

  it('formats key combinations for Mac replacing ctrl or meta with command symbol', () => {
    const service = new PlatformService('MacIntel');
    expect(service.formatKeyCombo('ctrl+enter')).toBe('⌘ Enter');
    expect(service.formatKeyCombo('ctrl+shift+p')).toBe('⌘ ⇧ P');
    expect(service.formatKeyCombo('ctrl+alt+right')).toBe('⌘ ⌥ Right');
    expect(service.formatKeyCombo('escape')).toBe('Esc');
  });

  it('falls back gracefully on empty string or unrecognized keys', () => {
    const service = new PlatformService('Linux');
    expect(service.formatKeyCombo('')).toBe('');
    expect(service.formatKeyCombo('+')).toBe('+');
  });
});
