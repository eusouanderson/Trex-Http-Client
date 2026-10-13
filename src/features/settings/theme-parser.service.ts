import { z } from 'zod';
import type { CustomTheme, CustomThemeColors, CustomThemeJsonTheme } from './interfaces';

const customThemeColorsSchema = z.object({
  surfaceGround: z.string().min(1),
  surfacePanel: z.string().min(1),
  surfaceCard: z.string().min(1),
  surfaceBorder: z.string().min(1),
  surfaceHover: z.string().min(1),
  accent: z.string().min(1),
  accentLight: z.string().min(1),
  accentBorder: z.string().min(1),
});

const customThemeJsonThemeSchema = z.object({
  backgroundColor: z.string().min(1).optional(),
  keyColor: z.string().min(1).optional(),
  stringColor: z.string().min(1).optional(),
  numberColor: z.string().min(1).optional(),
  booleanColor: z.string().min(1).optional(),
  nullColor: z.string().min(1).optional(),
  bracketColor: z.string().min(1).optional(),
});

const customThemeUploadSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  icon: z.string().min(1).optional(),
  description: z.string().optional(),
  previewColors: z.array(z.string().min(1)).optional(),
  colors: customThemeColorsSchema,
  jsonTheme: customThemeJsonThemeSchema.optional(),
});

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const createDefaultJsonTheme = (colors: CustomThemeColors): CustomThemeJsonTheme => {
  return {
    backgroundColor: colors.surfaceGround,
    keyColor: colors.accent,
    stringColor: '#fcd34d',
    numberColor: '#60a5fa',
    booleanColor: '#f87171',
    nullColor: '#938d82',
    bracketColor: '#cdbca4',
  };
};

class ThemeParserService {
  public parse(rawJson: string): CustomTheme {
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawJson);
    } catch {
      throw new Error('Formato JSON inválido.');
    }


    const validated = customThemeUploadSchema.parse(parsedJson);

    const id = validated.id ?? `${slugify(validated.name)}-${Math.random().toString(36).slice(2, 7)}`;
    const icon = validated.icon ?? '🎨';
    const description = validated.description ?? 'Tema personalizado pelo usuário.';
    const previewColors =
      validated.previewColors && validated.previewColors.length > 0
        ? validated.previewColors
        : [
            validated.colors.surfaceGround,
            validated.colors.surfacePanel,
            validated.colors.accent,
            validated.colors.accentLight,
            validated.colors.surfaceBorder,
          ];

    const defaultJson = createDefaultJsonTheme(validated.colors);
    const jsonTheme: CustomThemeJsonTheme = {
      backgroundColor: validated.jsonTheme?.backgroundColor ?? defaultJson.backgroundColor,
      keyColor: validated.jsonTheme?.keyColor ?? defaultJson.keyColor,
      stringColor: validated.jsonTheme?.stringColor ?? defaultJson.stringColor,
      numberColor: validated.jsonTheme?.numberColor ?? defaultJson.numberColor,
      booleanColor: validated.jsonTheme?.booleanColor ?? defaultJson.booleanColor,
      nullColor: validated.jsonTheme?.nullColor ?? defaultJson.nullColor,
      bracketColor: validated.jsonTheme?.bracketColor ?? defaultJson.bracketColor,
    };

    return {
      id,
      name: validated.name,
      icon,
      description,
      previewColors,
      colors: validated.colors,
      jsonTheme,
    };
  };

  public readonly generateTemplate = (): string => {
    const template = {
      name: 'Espinossauro Neon',
      icon: '🐊',
      description: 'Tema jurássico personalizado com tons profundos e acentos neon.',
      previewColors: ['#0b1219', '#121e29', '#00f0ff', '#39ff14', '#ff007f'],
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
    };

    return JSON.stringify(template, null, 2);
  };
}

export { ThemeParserService, customThemeUploadSchema };

