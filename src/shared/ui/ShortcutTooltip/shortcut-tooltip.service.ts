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
  TooltipPositionStyle,
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

  public readonly calculateTooltipStyle = (
    rect: DOMRect | null,
    position?: ShortcutTooltipPosition,
  ): TooltipPositionStyle => {
    if (rect === null) {
      return {
        top: '0px',
        left: '0px',
        transform: 'none',
      };
    }

    if (position === 'bottom') {
      return {
        top: `${(rect.bottom + 6).toString()}px`,
        left: `${(rect.left + rect.width / 2).toString()}px`,
        transform: 'translate(-50%, 0)',
      };
    }

    if (position === 'left') {
      return {
        top: `${(rect.top + rect.height / 2).toString()}px`,
        left: `${(rect.left - 6).toString()}px`,
        transform: 'translate(-100%, -50%)',
      };
    }

    if (position === 'right') {
      return {
        top: `${(rect.top + rect.height / 2).toString()}px`,
        left: `${(rect.right + 6).toString()}px`,
        transform: 'translate(0, -50%)',
      };
    }

    return {
      top: `${(rect.top - 6).toString()}px`,
      left: `${(rect.left + rect.width / 2).toString()}px`,
      transform: 'translate(-50%, -100%)',
    };
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
