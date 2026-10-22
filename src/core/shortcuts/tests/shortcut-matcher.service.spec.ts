import { describe, expect, it } from 'vitest';
import { ShortcutMatcherService } from '../shortcut-matcher.service';

describe('ShortcutMatcherService', () => {
  const matcher = new ShortcutMatcherService();

  it('parses combinations into boolean flags and lowercase key', () => {
    const parsed = matcher.parseCombo('Ctrl + Shift + P');
    expect(parsed).toEqual({
      ctrl: true,
      alt: false,
      shift: true,
      meta: false,
      key: 'p',
    });
  });

  it('parses cmd or command as meta flag', () => {
    const parsed = matcher.parseCombo('cmd+alt+enter');
    expect(parsed).toEqual({
      ctrl: false,
      alt: true,
      shift: false,
      meta: true,
      key: 'enter',
    });
  });

  it('normalizes combination tokens into canonical order', () => {
    expect(matcher.normalizeCombo('Shift + Ctrl + P')).toBe('ctrl+shift+p');
    expect(matcher.normalizeCombo('Alt + Cmd + Right')).toBe('alt+meta+arrowright');
    expect(matcher.normalizeCombo('Alt + Left')).toBe('alt+arrowleft');
    expect(matcher.normalizeCombo('Alt + ArrowLeft')).toBe('alt+arrowleft');
    expect(matcher.normalizeCombo('Alt + Up')).toBe('alt+arrowup');
    expect(matcher.normalizeCombo('Alt + ArrowUp')).toBe('alt+arrowup');
    expect(matcher.normalizeCombo('Alt + Down')).toBe('alt+arrowdown');
    expect(matcher.normalizeCombo('Alt + ArrowDown')).toBe('alt+arrowdown');
    expect(matcher.normalizeCombo('ESC')).toBe('escape');
    expect(matcher.normalizeCombo('ESCAPE')).toBe('escape');
    expect(matcher.normalizeCombo('')).toBe('');
  });

  it('matches keyboard event with exact modifiers and key on non-Mac', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false,
    });
    expect(matcher.matches(event, 'ctrl+enter', false)).toBe(true);
    expect(matcher.matches(event, 'ctrl+shift+enter', false)).toBe(false);
    expect(matcher.matches(event, 'ctrl+alt+enter', false)).toBe(false);
    expect(matcher.matches(event, 'ctrl+space', false)).toBe(false);

    const winNoCtrlEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
    });
    expect(matcher.matches(winNoCtrlEvent, 'ctrl+enter', false)).toBe(false);

    const winMetaEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: true,
    });
    expect(matcher.matches(winMetaEvent, 'ctrl+enter', false)).toBe(false);
  });

  it('matches metaKey as ctrl equivalent on Mac when combo specifies ctrl or meta', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'p',
      ctrlKey: false,
      altKey: false,
      shiftKey: true,
      metaKey: true,
    });
    expect(matcher.matches(event, 'ctrl+shift+p', true)).toBe(true);
    expect(matcher.matches(event, 'meta+shift+p', true)).toBe(true);

    const macCtrlEvent = new KeyboardEvent('keydown', {
      key: 'p',
      ctrlKey: true,
      altKey: false,
      shiftKey: true,
      metaKey: false,
    });
    expect(matcher.matches(macCtrlEvent, 'meta+shift+p', true)).toBe(true);

    const macMismatchEvent = new KeyboardEvent('keydown', {
      key: 'p',
      ctrlKey: false,
      altKey: false,
      shiftKey: true,
      metaKey: false,
    });
    expect(matcher.matches(macMismatchEvent, 'ctrl+shift+p', true)).toBe(false);
  });

  it('matches arrow keys correctly regardless of casing', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      ctrlKey: true,
      altKey: true,
    });
    expect(matcher.matches(event, 'ctrl+alt+right', false)).toBe(true);
  });

  it('detects input targets correctly', () => {
    const input = document.createElement('input');
    input.type = 'text';
    expect(matcher.isInputTarget(input)).toBe(true);

    const textarea = document.createElement('textarea');
    expect(matcher.isInputTarget(textarea)).toBe(true);

    const select = document.createElement('select');
    expect(matcher.isInputTarget(select)).toBe(true);

    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    expect(matcher.isInputTarget(editable)).toBe(true);

    const cmEditor = document.createElement('div');
    cmEditor.className = 'cm-content';
    expect(matcher.isInputTarget(cmEditor)).toBe(true);

    const button = document.createElement('button');
    expect(matcher.isInputTarget(button)).toBe(false);

    expect(matcher.isInputTarget(null)).toBe(false);
  });

  it('detects text composition events (IME)', () => {
    const normalEvent = new KeyboardEvent('keydown', { key: 'a' });
    expect(matcher.isEventComposing(normalEvent)).toBe(false);

    const composingEvent = new KeyboardEvent('keydown', {
      key: 'Process',
    });
    Object.defineProperty(composingEvent, 'isComposing', { value: true });
    expect(matcher.isEventComposing(composingEvent)).toBe(true);
  });
});
