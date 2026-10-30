import type { Locator, Page } from '@playwright/test';

class CommandPalettePage {
  private readonly page: Page;
  private readonly dialog: Locator;
  private readonly searchInput: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('div[aria-label="Paleta de Comandos"]');
    this.searchInput = page.locator('input[aria-label="Buscar comando"]');
  }

  public openViaShortcut = async (): Promise<void> => {
    await this.page.keyboard.press('Control+Shift+P');
    await this.dialog.waitFor({ state: 'visible' });
  };

  public isVisible = async (): Promise<boolean> => {
    return await this.dialog.isVisible();
  };

  public searchCommand = async (query: string): Promise<void> => {
    await this.searchInput.fill(query);
  };

  public selectCommand = async (commandTitle: string): Promise<void> => {
    const item = this.dialog.locator(`button:has-text("${commandTitle}")`);
    await item.click();
  };

  public closeViaEscape = async (): Promise<void> => {
    await this.page.keyboard.press('Escape');
    await this.dialog.waitFor({ state: 'hidden' });
  };
}

export { CommandPalettePage };

