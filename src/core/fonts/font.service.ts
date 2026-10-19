import type { FontOption, IFontService } from './interfaces';

const DEFAULT_SYSTEM_FONT: FontOption = {
  id: 'system',
  name: 'System Default',
  label: 'System Default',
  category: 'sans',
  cssValue: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  description: 'Fonte padrão nativa do sistema operacional',
};

const AVAILABLE_FONTS: FontOption[] = [
  DEFAULT_SYSTEM_FONT,
  {
    id: 'fira-code',
    name: 'Fira Code',
    label: 'Fira Code',
    category: 'mono',
    cssValue: "'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    description: 'Monospace moderna com ligaduras para programação',
  },
  {
    id: 'geist',
    name: 'Geist Sans',
    label: 'Geist Sans',
    category: 'sans',
    cssValue: "'Geist', ui-sans-serif, system-ui, -apple-system, sans-serif",
    description: 'Tipografia moderna e limpa da Vercel',
  },
  {
    id: 'geist-mono',
    name: 'Geist Mono',
    label: 'Geist Mono',
    category: 'mono',
    cssValue: "'Geist Mono', ui-monospace, monospace",
    description: 'Versão monospace elegante da Geist',
  },
  {
    id: 'cascadia-code',
    name: 'Cascadia Code',
    label: 'Cascadia Code',
    category: 'mono',
    cssValue: "'Cascadia Code', ui-monospace, monospace",
    description: 'Fonte de terminal moderna da Microsoft com ligaduras',
  },
  {
    id: 'hack',
    name: 'Hack',
    label: 'Hack',
    category: 'mono',
    cssValue: "'Hack', ui-monospace, monospace",
    description: 'Monospace focada em legibilidade e clareza de código',
  },
  {
    id: 'ibm-plex-sans',
    name: 'IBM Plex Sans',
    label: 'IBM Plex Sans',
    category: 'sans',
    cssValue: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
    description: 'Design corporativo e equilibrado da IBM',
  },
  {
    id: 'iosevka',
    name: 'Iosevka',
    label: 'Iosevka',
    category: 'mono',
    cssValue: "'Iosevka', ui-monospace, monospace",
    description: 'Monospace compacta e condensada',
  },
  {
    id: 'monaspace-neon',
    name: 'Monaspace Neon',
    label: 'Monaspace Neon',
    category: 'mono',
    cssValue: "'Monaspace Neon', ui-monospace, monospace",
    description: 'Fonte inovadora do GitHub para desenvolvedores',
  },
  {
    id: 'source-code-pro',
    name: 'Source Code Pro',
    label: 'Source Code Pro',
    category: 'mono',
    cssValue: "'Source Code Pro', ui-monospace, monospace",
    description: 'Clássica monospace de alta legibilidade da Adobe',
  },
];

class FontService implements IFontService {
  private readonly fonts: FontOption[];

  constructor(customFonts?: FontOption[]) {
    this.fonts = customFonts ?? AVAILABLE_FONTS;
  }

  public readonly getAvailableFonts = (): FontOption[] => {
    return [...this.fonts];
  };

  public readonly getFontById = (id: string): FontOption => {
    const found = this.fonts.find((f) => f.id === id);
    if (found) {
      return found;
    }
    const fallback = this.fonts.find((f) => f.id === 'system');
    if (fallback) {
      return fallback;
    }
    const first = this.fonts[0];
    if (first) {
      return first;
    }
    return DEFAULT_SYSTEM_FONT;
  };

  public readonly getFontCssValue = (id: string): string => {
    return this.getFontById(id).cssValue;
  };

  public readonly applyFont = (id: string, target?: HTMLElement): void => {
    const font = this.getFontById(id);
    const element =
      target ??
      (typeof document !== 'undefined' ? document.documentElement : undefined);
    if (element) {
      element.style.setProperty('--font-family-app', font.cssValue);
    }
  };
}

export { AVAILABLE_FONTS, DEFAULT_SYSTEM_FONT, FontService };
