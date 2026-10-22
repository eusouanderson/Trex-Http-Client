import type { IShortcutMatcherService, ParsedKeyCombo } from './interfaces';

class ShortcutMatcherService implements IShortcutMatcherService {
  public parseCombo = (combo: string): ParsedKeyCombo => {
    const tokens = combo
      .toLowerCase()
      .split('+')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    let ctrl = false;
    let alt = false;
    let shift = false;
    let meta = false;
    let key = '';

    tokens.forEach((token) => {
      if (token === 'ctrl' || token === 'control') {
        ctrl = true;
      } else if (token === 'alt' || token === 'option') {
        alt = true;
      } else if (token === 'shift') {
        shift = true;
      } else if (token === 'meta' || token === 'cmd' || token === 'command' || token === 'win') {
        meta = true;
      } else {
        key = this.normalizeKeyToken(token);
      }
    });

    return { ctrl, alt, shift, meta, key };
  };

  public normalizeCombo = (combo: string): string => {
    const trimmed = combo.trim();
    if (!trimmed) {
      return '';
    }
    const parsed = this.parseCombo(trimmed);
    const parts: string[] = [];
    if (parsed.ctrl) parts.push('ctrl');
    if (parsed.alt) parts.push('alt');
    if (parsed.shift) parts.push('shift');
    if (parsed.meta) parts.push('meta');
    if (parsed.key) parts.push(parsed.key);
    return parts.join('+');
  };

  public matches = (event: KeyboardEvent, combo: string, isMac = false): boolean => {
    const parsed = this.parseCombo(combo);
    const eventKey = this.normalizeKeyToken(event.key);

    const parsedKey = parsed.key.toLowerCase();
    if (eventKey !== parsedKey) {
      return false;
    }

    if (parsed.shift !== event.shiftKey) {
      return false;
    }

    if (parsed.alt !== event.altKey) {
      return false;
    }

    if (isMac) {
      const expectedPrimary = parsed.ctrl || parsed.meta;
      const actualPrimary = event.metaKey || event.ctrlKey;
      if (expectedPrimary !== actualPrimary) {
        return false;
      }
    } else {
      if (parsed.ctrl !== event.ctrlKey) {
        return false;
      }
      if (parsed.meta !== event.metaKey) {
        return false;
      }
    }

    return true;
  };

  public isInputTarget = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) {
      return false;
    }

    const tagName = target.tagName.toLowerCase();
    if (tagName === 'textarea' || tagName === 'select') {
      return true;
    }

    if (tagName === 'input') {
      const inputType = (target as HTMLInputElement).type.toLowerCase();
      const nonTextTypes = ['button', 'checkbox', 'radio', 'submit', 'reset', 'range', 'color'];
      return !nonTextTypes.includes(inputType);
    }

    const rawContentEditable = target.getAttribute('contenteditable');
    const propContentEditable = (target).contentEditable;
    if (
      target.isContentEditable ||
      propContentEditable === 'true' ||
      rawContentEditable === 'true' ||
      rawContentEditable === '' ||
      rawContentEditable === 'plaintext-only'
    ) {
      return true;
    }

    if (target.closest('.cm-editor') !== null || target.closest('.cm-content') !== null) {
      return true;
    }

    return false;
  };

  public isEventComposing = (event: KeyboardEvent): boolean => {
    return event.isComposing || event.key === 'Process';
  };

  private normalizeKeyToken = (rawToken: string): string => {
    const lower = rawToken.toLowerCase().trim();
    if (lower === 'arrowright' || lower === 'right') return 'arrowright';
    if (lower === 'arrowleft' || lower === 'left') return 'arrowleft';
    if (lower === 'arrowup' || lower === 'up') return 'arrowup';
    if (lower === 'arrowdown' || lower === 'down') return 'arrowdown';
    if (lower === 'esc' || lower === 'escape') return 'escape';
    return lower;
  };
}

export { ShortcutMatcherService };
