import type { IPlatformService } from './interfaces';

class PlatformService implements IPlatformService {
  private readonly platformOverride?: string;

  constructor(platformOverride?: string) {
    this.platformOverride = platformOverride;
  }

  public isMac = (): boolean => {
    if (typeof this.platformOverride === 'string') {
      return /mac/i.test(this.platformOverride);
    }
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    return /mac/i.test(userAgent);
  };

  public getModifierLabel = (modifier: 'ctrl' | 'alt' | 'shift' | 'meta'): string => {
    const mac = this.isMac();
    switch (modifier) {
      case 'ctrl':
        return mac ? '⌃' : 'Ctrl';
      case 'alt':
        return mac ? '⌥' : 'Alt';
      case 'shift':
        return mac ? '⇧' : 'Shift';
      case 'meta':
        return mac ? '⌘' : 'Win';
    }
  };

  public formatKeyCombo = (combo: string): string => {
    if (!combo) {
      return '';
    }

    const trimmed = combo.trim();
    if (trimmed === '+') {
      return '+';
    }

    const parts = trimmed.split('+').map((p) => p.trim().toLowerCase());
    const isMac = this.isMac();

    const formattedTokens: string[] = [];

    parts.forEach((token) => {
      if (token === 'ctrl' || token === 'meta' || token === 'cmd') {
        formattedTokens.push(isMac ? '⌘' : 'Ctrl');
      } else if (token === 'alt') {
        formattedTokens.push(isMac ? '⌥' : 'Alt');
      } else if (token === 'shift') {
        formattedTokens.push(isMac ? '⇧' : 'Shift');
      } else if (token === 'escape' || token === 'esc') {
        formattedTokens.push('Esc');
      } else if (token === 'enter') {
        formattedTokens.push('Enter');
      } else if (token === 'arrowup' || token === 'up') {
        formattedTokens.push('Up');
      } else if (token === 'arrowdown' || token === 'down') {
        formattedTokens.push('Down');
      } else if (token === 'arrowleft' || token === 'left') {
        formattedTokens.push('Left');
      } else if (token === 'arrowright' || token === 'right') {
        formattedTokens.push('Right');
      } else if (token.length === 1) {
        formattedTokens.push(token.toUpperCase());
      } else if (token.length > 0) {
        formattedTokens.push(token.charAt(0).toUpperCase() + token.slice(1));
      }
    });

    const separator = isMac ? ' ' : ' + ';
    return formattedTokens.join(separator);
  };
}

export { PlatformService };
