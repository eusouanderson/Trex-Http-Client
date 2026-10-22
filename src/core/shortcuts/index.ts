import { PlatformService } from './platform.service';
import { ShortcutMatcherService } from './shortcut-matcher.service';
import { ShortcutRegistryService } from './shortcut-registry.service';
import type {
  IPlatformService,
  IShortcutMatcherService,
  IShortcutRegistryService,
  ParsedKeyCombo,
  ShortcutCategory,
  ShortcutConflict,
  ShortcutDefinition,
} from './interfaces';

const platformService = new PlatformService();
const shortcutMatcherService = new ShortcutMatcherService();
const shortcutRegistryService = new ShortcutRegistryService(
  shortcutMatcherService,
  platformService,
);

export {
  PlatformService,
  ShortcutMatcherService,
  ShortcutRegistryService,
  platformService,
  shortcutMatcherService,
  shortcutRegistryService,
};

export type {
  IPlatformService,
  IShortcutMatcherService,
  IShortcutRegistryService,
  ParsedKeyCombo,
  ShortcutCategory,
  ShortcutConflict,
  ShortcutDefinition,
};

