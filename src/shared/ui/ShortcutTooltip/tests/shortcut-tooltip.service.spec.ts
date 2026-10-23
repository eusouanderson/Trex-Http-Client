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

  const mockRect = {
    top: 100,
    bottom: 130,
    left: 200,
    right: 260,
    width: 60,
    height: 30,
    x: 200,
    y: 100,
    toJSON: () => ({}),
  } as DOMRect;

  describe('calculateTooltipStyle', () => {
    it('returns zero position when rect is null', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(),
        createMockPlatform(),
      );
      expect(service.calculateTooltipStyle(null, 'top')).toEqual({
        top: '0px',
        left: '0px',
        transform: 'none',
      });
    });

    it('returns correct style for bottom position', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(),
        createMockPlatform(),
      );
      expect(service.calculateTooltipStyle(mockRect, 'bottom')).toEqual({
        top: '136px',
        left: '230px',
        transform: 'translate(-50%, 0)',
      });
    });

    it('returns correct style for left position', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(),
        createMockPlatform(),
      );
      expect(service.calculateTooltipStyle(mockRect, 'left')).toEqual({
        top: '115px',
        left: '194px',
        transform: 'translate(-100%, -50%)',
      });
    });

    it('returns correct style for right position', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(),
        createMockPlatform(),
      );
      expect(service.calculateTooltipStyle(mockRect, 'right')).toEqual({
        top: '115px',
        left: '266px',
        transform: 'translate(0, -50%)',
      });
    });

    it('returns default style for top position', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(),
        createMockPlatform(),
      );
      expect(service.calculateTooltipStyle(mockRect, 'top')).toEqual({
        top: '94px',
        left: '230px',
        transform: 'translate(-50%, -100%)',
      });
    });

    it('returns default style when position is undefined', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(),
        createMockPlatform(),
      );
      expect(service.calculateTooltipStyle(mockRect, undefined)).toEqual({
        top: '94px',
        left: '230px',
        transform: 'translate(-50%, -100%)',
      });
    });

    it('uses singleton instance with default dependencies', () => {
      expect(shortcutTooltipService).toBeInstanceOf(ShortcutTooltipService);
      const style = shortcutTooltipService.calculateTooltipStyle(mockRect);
      expect(style.top).toBe('94px');
    });
  });

  describe('resolveTooltipContent', () => {
    it('resolves formatted combo and empty label when shortcut exists and text is omitted', () => {
      const service = new ShortcutTooltipService(
        createMockRegistry(mockShortcut),
        createMockPlatform('Ctrl + Enter'),
      );
      const result = service.resolveTooltipContent({
        shortcutId: 'test-action',
      });

      expect(result).toEqual({
        label: '',
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
  });
});
