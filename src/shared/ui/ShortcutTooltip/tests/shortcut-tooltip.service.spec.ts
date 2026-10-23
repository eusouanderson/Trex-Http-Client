import { describe, expect, it, vi } from 'vitest';
import type {
  IPlatformService,
  IShortcutRegistryService,
  ShortcutDefinition,
} from '../../../../core/shortcuts/interfaces';
import {
  ShortcutTooltipService,
  shortcutTooltipService,
} from '../shortcut-tooltip.service';

describe('ShortcutTooltipService', () => {
  const mockShortcut: ShortcutDefinition = {
    id: 'test-action',
    name: 'Ação de Teste',
    description: 'Descrição de teste',
    category: 'requests',
    defaultKeyCombo: 'ctrl+enter',
    action: vi.fn(),
  };

  const createMockRegistry = (
    shortcut?: ShortcutDefinition,
    activeCombo = 'ctrl+enter',
  ): IShortcutRegistryService => {
    return {
      register: vi.fn(),
      unregister: vi.fn(),
      get: (id: string) => (id === mockShortcut.id ? shortcut : undefined),
      getAll: () => (shortcut ? [shortcut] : []),
      getByCategory: () => [],
      setCustomCombo: vi.fn(),
      resetCustomCombo: vi.fn(),
      resetAll: vi.fn(),
      getActiveCombo: () => activeCombo,
      findConflicts: () => [],
      handleKeyEvent: () => false,
      getCustomCombos: () => ({}),
      loadCustomCombos: vi.fn(),
    };
  };

  const createMockPlatform = (formatted = 'Ctrl + Enter'): IPlatformService => {
    return {
      isMac: () => false,
      formatKeyCombo: () => formatted,
      getModifierLabel: () => 'Ctrl',
    };
  };

  describe('getPositionClass', () => {
    it('returns correct class for bottom position', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(),
        createMockPlatform(),
      );
      expect(service.getPositionClass('bottom')).toBe(
        'top-full left-1/2 -translate-x-1/2 mt-1.5',
      );
    });

    it('returns correct class for left position', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(),
        createMockPlatform(),
      );
      expect(service.getPositionClass('left')).toBe(
        'right-full top-1/2 -translate-y-1/2 mr-1.5',
      );
    });

    it('returns correct class for right position', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(),
        createMockPlatform(),
      );
      expect(service.getPositionClass('right')).toBe(
        'left-full top-1/2 -translate-y-1/2 ml-1.5',
      );
    });

    it('returns default class for top position', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(),
        createMockPlatform(),
      );
      expect(service.getPositionClass('top')).toBe(
        'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
      );
    });

    it('returns default class when position is undefined', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(),
        createMockPlatform(),
      );
      expect(service.getPositionClass(undefined)).toBe(
        'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
      );
    });
  });

  describe('resolveTooltipContent', () => {
    it('resolves name and formatted combo when shortcut exists and text is omitted', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(mockShortcut),
        createMockPlatform('Ctrl + Enter'),
      );
      const result = service.resolveTooltipContent({
        shortcutId: 'test-action',
      });

      expect(result).toEqual({
        label: 'Ação de Teste',
        shortcutKey: 'Ctrl + Enter',
      });
    });

    it('prefers explicit text override when provided with valid shortcut', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(mockShortcut),
        createMockPlatform('Ctrl + Enter'),
      );
      const result = service.resolveTooltipContent({
        shortcutId: 'test-action',
        text: 'Texto Customizado',
      });

      expect(result).toEqual({
        label: 'Texto Customizado',
        shortcutKey: 'Ctrl + Enter',
      });
    });

    it('returns empty shortcutKey when shortcut is not found in registry', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(undefined),
        createMockPlatform(),
      );
      const result = service.resolveTooltipContent({
        shortcutId: 'unknown-id',
        text: 'Apenas Texto',
      });

      expect(result).toEqual({
        label: 'Apenas Texto',
        shortcutKey: '',
      });
    });

    it('resolves text only when shortcutId is not provided', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(),
        createMockPlatform(),
      );
      const result = service.resolveTooltipContent({
        text: 'Apenas Label',
      });

      expect(result).toEqual({
        label: 'Apenas Label',
        shortcutKey: '',
      });
    });

    it('returns empty values when both text and shortcutId are omitted', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(),
        createMockPlatform(),
      );
      const result = service.resolveTooltipContent({});

      expect(result).toEqual({
        label: '',
        shortcutKey: '',
      });
    });

    it('uses singleton instance with default dependencies', () => {
      expect(shortcutTooltipService).toBeInstanceOf(ShortcutTooltipService);
      const pos = shortcutTooltipService.getPositionClass();
      expect(pos).toBe('bottom-full left-1/2 -translate-x-1/2 mb-1.5');
    });
  });
});

