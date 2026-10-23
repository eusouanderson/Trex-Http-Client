import {
  platformService,
  shortcutRegistryService,
} from '../../../core/shortcuts';
import type {
  IPlatformService,
  IShortcutRegistryService,
} from '../../../core/shortcuts/interfaces';
import type {
  IShortcutTooltipService,
  ShortcutTooltipContent,
  ShortcutTooltipPosition,
  ShortcutTooltipProps,
} from './interfaces';

class ShortcutTooltipService implements IShortcutTooltipService {
  private readonly registry: IShortcutRegistryService;
  private readonly platform: IPlatformService;

  constructor(
    registry: IShortcutRegistryService = shortcutRegistryService,
    platform: IPlatformService = platformService,
  ) {
    this.registry = registry;
    this.platform = platform;
  }

  public readonly getPositionClass = (
    position?: ShortcutTooltipPosition,
  ): string => {
    if (position === 'bottom') {
      return 'top-full left-1/2 -translate-x-1/2 mt-1.5';
    }
    if (position === 'left') {
      return 'right-full top-1/2 -translate-y-1/2 mr-1.5';
    }
    if (position === 'right') {
      return 'left-full top-1/2 -translate-y-1/2 ml-1.5';
    }
    return 'bottom-full left-1/2 -translate-x-1/2 mb-1.5';
  };

  public readonly resolveTooltipContent = (
    props: ShortcutTooltipProps,
  ): ShortcutTooltipContent => {
    const shortcut =
      props.shortcutId !== undefined && props.shortcutId.length > 0
        ? this.registry.get(props.shortcutId)
        : undefined;

    const label = props.text ?? '';
    let shortcutKey = '';

    if (shortcut !== undefined) {
      const combo = this.registry.getActiveCombo(shortcut);
      shortcutKey = this.platform.formatKeyCombo(combo);
    }

    return { label, shortcutKey };
  };
}

const shortcutTooltipService = new ShortcutTooltipService();

export { ShortcutTooltipService, shortcutTooltipService };

