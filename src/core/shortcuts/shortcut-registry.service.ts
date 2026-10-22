import type {
  IPlatformService,
  IShortcutMatcherService,
  IShortcutRegistryService,
  ShortcutCategory,
  ShortcutConflict,
  ShortcutDefinition,
} from './interfaces';

class ShortcutRegistryService implements IShortcutRegistryService {
  private readonly matcher: IShortcutMatcherService;
  private readonly platform: IPlatformService;
  private readonly shortcuts = new Map<string, ShortcutDefinition>();
  private readonly customCombos = new Map<string, string>();
  private readonly runningShortcuts = new Set<string>();

  constructor(matcher: IShortcutMatcherService, platform: IPlatformService) {
    this.matcher = matcher;
    this.platform = platform;
  }

  public register = (shortcut: ShortcutDefinition): void => {
    this.shortcuts.set(shortcut.id, shortcut);
  };

  public unregister = (id: string): void => {
    this.shortcuts.delete(id);
    this.customCombos.delete(id);
    this.runningShortcuts.delete(id);
  };

  public get = (id: string): ShortcutDefinition | undefined => {
    return this.shortcuts.get(id);
  };

  public getAll = (_revision?: number): ShortcutDefinition[] => {
    return Array.from(this.shortcuts.values());
  };

  public getByCategory = (category: ShortcutCategory): ShortcutDefinition[] => {
    return this.getAll().filter((s) => s.category === category);
  };

  public setCustomCombo = (id: string, combo: string): void => {
    const normalized = this.matcher.normalizeCombo(combo);
    this.customCombos.set(id, normalized);
  };

  public resetCustomCombo = (id: string): void => {
    this.customCombos.delete(id);
  };

  public resetAll = (): void => {
    this.customCombos.clear();
  };

  public getActiveCombo = (shortcut: ShortcutDefinition): string => {
    const custom = this.customCombos.get(shortcut.id);
    if (typeof custom === 'string' && custom.length > 0) {
      return custom;
    }
    return shortcut.defaultKeyCombo;
  };

  public findConflicts = (id: string, candidateCombo: string): ShortcutConflict[] => {
    const normalizedCandidate = this.matcher.normalizeCombo(candidateCombo);
    const conflicts: ShortcutConflict[] = [];

    this.shortcuts.forEach((shortcut) => {
      if (shortcut.id === id) {
        return;
      }
      const active = this.matcher.normalizeCombo(this.getActiveCombo(shortcut));
      if (active === normalizedCandidate) {
        conflicts.push({
          shortcutId: id,
          conflictingShortcutId: shortcut.id,
          conflictingName: shortcut.name,
          keyCombo: candidateCombo,
        });
      }
    });

    return conflicts;
  };

  public handleKeyEvent = (event: KeyboardEvent): boolean => {
    if (this.matcher.isEventComposing(event)) {
      return false;
    }

    const isMac = this.platform.isMac();
    const isTargetInput = this.matcher.isInputTarget(event.target);

    for (const shortcut of this.shortcuts.values()) {
      if (shortcut.isEnabled !== undefined && !shortcut.isEnabled()) {
        continue;
      }

      if (isTargetInput && shortcut.allowInInputs !== true) {
        continue;
      }

      const activeCombo = this.getActiveCombo(shortcut);
      if (!this.matcher.matches(event, activeCombo, isMac)) {
        continue;
      }

      if (this.runningShortcuts.has(shortcut.id)) {
        return false;
      }

      event.preventDefault();

      const result = shortcut.action();
      if (result instanceof Promise) {
        this.runningShortcuts.add(shortcut.id);
        void result.finally(() => {
          this.runningShortcuts.delete(shortcut.id);
        });
      }

      return true;
    }

    return false;
  };

  public getCustomCombos = (): Record<string, string> => {
    const result: Record<string, string> = {};
    this.customCombos.forEach((combo, id) => {
      result[id] = combo;
    });
    return result;
  };

  public loadCustomCombos = (combos: Record<string, string>): void => {
    Object.entries(combos).forEach(([id, combo]) => {
      this.setCustomCombo(id, combo);
    });
  };
}

export { ShortcutRegistryService };
