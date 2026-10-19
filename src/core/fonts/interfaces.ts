type FontCategory = 'sans' | 'mono';

interface FontOption {
  id: string;
  name: string;
  label: string;
  category: FontCategory;
  cssValue: string;
  description: string;
}

interface IFontService {
  getAvailableFonts(): FontOption[];
  getFontById(id: string): FontOption;
  getFontCssValue(id: string): string;
  applyFont(id: string, target?: HTMLElement): void;
}

export type { FontCategory, FontOption, IFontService };

