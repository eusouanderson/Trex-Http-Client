import type { Locator, Page } from '@playwright/test';

class ResponseDiffPage {
  private readonly page: Page;
  private readonly targetSelect: Locator;
  private readonly viewModeButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.targetSelect = page.locator('select:has-text("Selecione uma aba ou snapshot...")');
    this.viewModeButton = page.locator('button:has-text("Visualização:")');
  }

  public selectTargetTab = async (targetIndex: number): Promise<void> => {
    const options = this.targetSelect.locator('option');
    const value = await options.nth(targetIndex).getAttribute('value');
    if (typeof value === 'string' && value.length > 0) {
      await this.targetSelect.selectOption(value);
    }
  };

  public toggleViewMode = async (): Promise<void> => {
    if (await this.viewModeButton.isVisible()) {
      await this.viewModeButton.click();
    }
  };

  public isDiffTableVisible = async (): Promise<boolean> => {
    const metrics = this.page.locator('span:has-text("Métricas:")');
    return await metrics.isVisible();
  };
}

export { ResponseDiffPage };

