import { describe, expect, it, vi } from 'vitest';
import { ShortcutRegistryService } from '../shortcut-registry.service';
import { ShortcutMatcherService } from '../shortcut-matcher.service';
import { PlatformService } from '../platform.service';
import type { ShortcutDefinition } from '../interfaces';

describe('ShortcutRegistryService', () => {
  const createService = (platform?: string): ShortcutRegistryService => {
    const matcher = new ShortcutMatcherService();
    const platformService = new PlatformService(platform ?? 'Linux');
    return new ShortcutRegistryService(matcher, platformService);
  };

  it('registers and retrieves shortcuts by id and category', () => {
    const registry = createService();
    const shortcut: ShortcutDefinition = {
      id: 'test-1',
      name: 'Test Action',
      description: 'Does something',
      category: 'general',
      defaultKeyCombo: 'ctrl+k',
      action: vi.fn(),
    };

    registry.register(shortcut);
    expect(registry.get('test-1')).toBe(shortcut);
    expect(registry.getAll()).toHaveLength(1);
    expect(registry.getByCategory('general')).toHaveLength(1);
    expect(registry.getByCategory('requests')).toHaveLength(0);

    registry.unregister('test-1');
    expect(registry.get('test-1')).toBeUndefined();
  });

  it('manages custom key combinations and resets them', () => {
    const registry = createService();
    const shortcut: ShortcutDefinition = {
      id: 'test-custom',
      name: 'Custom',
      description: 'Custom combo test',
      category: 'settings',
      defaultKeyCombo: 'ctrl+,',
      action: vi.fn(),
    };

    registry.register(shortcut);
    expect(registry.getActiveCombo(shortcut)).toBe('ctrl+,');

    registry.setCustomCombo('test-custom', 'alt+s');
    expect(registry.getActiveCombo(shortcut)).toBe('alt+s');
    expect(registry.getCustomCombos()).toEqual({ 'test-custom': 'alt+s' });

    registry.resetCustomCombo('test-custom');
    expect(registry.getActiveCombo(shortcut)).toBe('ctrl+,');
    expect(registry.getCustomCombos()).toEqual({});

    registry.setCustomCombo('test-custom', 'ctrl+shift+k');
    expect(registry.getCustomCombos()).toEqual({ 'test-custom': 'ctrl+shift+k' });
    registry.resetAll();
    expect(registry.getCustomCombos()).toEqual({});
    expect(registry.getActiveCombo(shortcut)).toBe('ctrl+,');
  });

  it('detects conflicts when assigning an already used combination', () => {
    const registry = createService();
    registry.register({
      id: 'action-a',
      name: 'A',
      description: 'First',
      category: 'general',
      defaultKeyCombo: 'ctrl+p',
      action: vi.fn(),
    });
    registry.register({
      id: 'action-b',
      name: 'B',
      description: 'Second',
      category: 'general',
      defaultKeyCombo: 'ctrl+shift+p',
      action: vi.fn(),
    });

    const conflicts = registry.findConflicts('action-b', 'ctrl+p');
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.conflictingShortcutId).toBe('action-a');
    expect(conflicts[0]?.conflictingName).toBe('A');
  });

  it('executes matching action and calls preventDefault on event', () => {
    const registry = createService();
    const actionSpy = vi.fn();
    registry.register({
      id: 'other',
      name: 'Other',
      description: 'Other action',
      category: 'general',
      defaultKeyCombo: 'ctrl+k',
      action: vi.fn(),
    });
    registry.register({
      id: 'send',
      name: 'Send',
      description: 'Send req',
      category: 'requests',
      defaultKeyCombo: 'ctrl+enter',
      allowInInputs: true,
      action: actionSpy,
    });

    registry.loadCustomCombos({ other: 'ctrl+alt+k' });
    expect(registry.getCustomCombos()).toEqual({ other: 'ctrl+alt+k' });

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      ctrlKey: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    const handled = registry.handleKeyEvent(event);
    expect(handled).toBe(true);
    expect(actionSpy).toHaveBeenCalledOnce();
    expect(preventDefaultSpy).toHaveBeenCalledOnce();
  });

  it('blocks shortcuts from firing when typing inside an input unless allowInInputs is set', () => {
    const registry = createService();
    const globalAction = vi.fn();
    registry.register({
      id: 'new-req',
      name: 'New Request',
      description: 'Creates new tab',
      category: 'tabs',
      defaultKeyCombo: 'ctrl+n',
      allowInInputs: false,
      action: globalAction,
    });

    const input = document.createElement('input');
    const event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
    });
    Object.defineProperty(event, 'target', { value: input });

    const handled = registry.handleKeyEvent(event);
    expect(handled).toBe(false);
    expect(globalAction).not.toHaveBeenCalled();
  });

  it('ignores events during text composition (IME)', () => {
    const registry = createService();
    const action = vi.fn();
    registry.register({
      id: 'ime-test',
      name: 'IME',
      description: 'IME check',
      category: 'general',
      defaultKeyCombo: 'ctrl+k',
      action,
    });

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });
    Object.defineProperty(event, 'isComposing', { value: true });

    expect(registry.handleKeyEvent(event)).toBe(false);
    expect(action).not.toHaveBeenCalled();
  });

  it('skips shortcuts when isEnabled returns false', () => {
    const registry = createService();
    const action = vi.fn();
    registry.register({
      id: 'disabled-action',
      name: 'Disabled',
      description: 'Disabled check',
      category: 'general',
      defaultKeyCombo: 'ctrl+d',
      isEnabled: () => false,
      action,
    });

    const event = new KeyboardEvent('keydown', {
      key: 'd',
      ctrlKey: true,
    });
    expect(registry.handleKeyEvent(event)).toBe(false);
    expect(action).not.toHaveBeenCalled();
  });

  it('prevents concurrent executions of an ongoing async action', async () => {
    const registry = createService();
    let finishPromise: () => void = () => undefined;
    const asyncAction = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishPromise = resolve;
        }),
    );

    registry.register({
      id: 'async-task',
      name: 'Async',
      description: 'Async test',
      category: 'requests',
      defaultKeyCombo: 'ctrl+enter',
      action: asyncAction,
    });

    const event1 = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true });
    const event2 = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true });

    expect(registry.handleKeyEvent(event1)).toBe(true);
    expect(registry.handleKeyEvent(event2)).toBe(false);
    expect(asyncAction).toHaveBeenCalledTimes(1);

    finishPromise();
    await Promise.resolve();

    const event3 = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true });
    expect(registry.handleKeyEvent(event3)).toBe(true);
    expect(asyncAction).toHaveBeenCalledTimes(2);
  });
});
