import type { CustomTheme, CustomThemeColors } from './interfaces';

class ThemeStyleService {
  public readonly hexToRgb = (input: string): string => {
    const trimmed = input.trim();
    if (/^\d+\s+\d+\s+\d+$/.test(trimmed)) {
      return trimmed;
    }

    const rgbMatch = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(trimmed);
    if (
      rgbMatch !== null &&
      typeof rgbMatch[1] === 'string' &&
      typeof rgbMatch[2] === 'string' &&
      typeof rgbMatch[3] === 'string'
    ) {
      return `${rgbMatch[1]} ${rgbMatch[2]} ${rgbMatch[3]}`;
    }

    let hex = trimmed.replace('#', '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }

    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return `${r.toString()} ${g.toString()} ${b.toString()}`;
      }
    }

    return '20 19 17';
  };

  public readonly colorsToCssVariables = (
    colors: CustomThemeColors,
  ): Record<string, string> => {
    return {
      '--color-surface-ground-rgb': this.hexToRgb(colors.surfaceGround),
      '--color-surface-panel-rgb': this.hexToRgb(colors.surfacePanel),
      '--color-surface-card-rgb': this.hexToRgb(colors.surfaceCard),
      '--color-surface-border-rgb': this.hexToRgb(colors.surfaceBorder),
      '--color-surface-hover-rgb': this.hexToRgb(colors.surfaceHover),
      '--color-accent-rgb': this.hexToRgb(colors.accent),
      '--color-accent-light-rgb': this.hexToRgb(colors.accentLight),
      '--color-accent-border-rgb': this.hexToRgb(colors.accentBorder),
    };
  };

  public readonly getThemeStyle = (
    customTheme: CustomTheme,
  ): Record<string, string> => {
    return this.colorsToCssVariables(customTheme.colors);
  };
}

export { ThemeStyleService };

