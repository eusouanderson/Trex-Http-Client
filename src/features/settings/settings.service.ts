import type { IFontService } from '../../core/fonts';
import type {
  ClientSettings,
  CustomTheme,
  ISettingsService,
  ILocalSettingsRepository,
} from './interfaces';
import { SettingsEntity } from './settings.entity';

class SettingsService implements ISettingsService {
  private readonly entity: SettingsEntity;

  constructor(
    initial?: Partial<ClientSettings>,
    private readonly repository?: ILocalSettingsRepository,
    private readonly fontService?: IFontService,
  ) {
    const fromRepo = repository ? repository.getSettings() : undefined;
    this.entity = new SettingsEntity(initial ?? fromRepo);
    if (this.fontService) {
      this.fontService.applyFont(this.entity.value.fontFamily);
    }
  }

  public readonly getSettings = (): ClientSettings => {
    if (this.repository) {
      return this.repository.getSettings();
    }
    return this.entity.value;
  };

  public readonly updateSettings = (
    partial: Partial<ClientSettings>,
  ): ClientSettings => {
    let result: ClientSettings;
    if (this.repository) {
      const current = this.repository.getSettings();
      const updated = new SettingsEntity(current).update(partial);
      this.repository.save(updated);
      this.entity.update(partial);
      result = updated;
    } else {
      result = this.entity.update(partial);
    }
    if (this.fontService && typeof partial.fontFamily === 'string') {
      this.fontService.applyFont(partial.fontFamily);
    }
    return result;
  };

  public readonly resetSettings = (): ClientSettings => {
    let result: ClientSettings;
    if (this.repository) {
      const defaulted = this.repository.reset();
      this.entity.reset();
      result = defaulted;
    } else {
      result = this.entity.reset();
    }
    if (this.fontService) {
      this.fontService.applyFont(result.fontFamily);
    }
    return result;
  };

  public readonly addCustomTheme = (theme: CustomTheme): ClientSettings => {
    if (this.repository) {
      const current = this.repository.getSettings();
      const updated = new SettingsEntity(current).addCustomTheme(theme);
      this.repository.save(updated);
      this.entity.addCustomTheme(theme);
      return updated;
    }
    return this.entity.addCustomTheme(theme);
  };

  public readonly removeCustomTheme = (themeId: string): ClientSettings => {
    if (this.repository) {
      const current = this.repository.getSettings();
      const updated = new SettingsEntity(current).removeCustomTheme(themeId);
      this.repository.save(updated);
      this.entity.removeCustomTheme(themeId);
      return updated;
    }
    return this.entity.removeCustomTheme(themeId);
  };

  public readonly getCustomTheme = (
    themeId: string,
  ): CustomTheme | undefined => {
    if (this.repository) {
      return new SettingsEntity(this.repository.getSettings()).getCustomTheme(
        themeId,
      );
    }
    return this.entity.getCustomTheme(themeId);
  };
}

export { SettingsService };
