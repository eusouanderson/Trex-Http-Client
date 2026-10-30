import type { Locator, Page } from '@playwright/test';

class SettingsPage {
  private readonly modal: Locator;
  private readonly closeButton: Locator;

  public constructor(page: Page) {
    this.modal = page.locator('h2:has-text("Configurações do T-Rex")').locator('xpath=ancestor::div[contains(@class, "fixed")]');
    this.closeButton = this.modal.locator('button:has-text("✕")');
  }

  public isVisible = async (): Promise<boolean> => {
    return await this.modal.isVisible();
  };

  public close = async (): Promise<void> => {
    await this.closeButton.click();
  };

  public selectTab = async (tabName: 'Layout' | 'Ambientes' | 'Tema Jurássico' | 'Editor JSON' | 'Rede & HTTP' | 'Atalhos'): Promise<void> => {
    const tabBtn = this.modal.locator(`nav button:has-text("${tabName}")`);
    await tabBtn.click();
  };

  public selectTheme = async (themeName: string): Promise<void> => {
    await this.selectTab('Tema Jurássico');
    const themeBtn = this.modal.locator(`button:has-text("${themeName}")`);
    await themeBtn.click();
  };

  public selectFont = async (fontLabel: string): Promise<void> => {
    await this.selectTab('Layout');
    const fontBtn = this.modal.locator(`button:has-text("${fontLabel}")`);
    await fontBtn.click();
  };
}

export { SettingsPage };

