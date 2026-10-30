import type { Locator, Page } from '@playwright/test';

class CollectionRunnerPage {
  private readonly page: Page;
  private readonly modal: Locator;
  private readonly startButton: Locator;
  private readonly stopButton: Locator;
  private readonly closeButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('h2:has-text("Executar Coleção:")').locator('xpath=ancestor::div[contains(@class, "fixed")]');
    this.startButton = this.modal.locator('button:has-text("Iniciar Execução"), button:has-text("Executar Novamente")');
    this.stopButton = this.modal.locator('button:has-text("Parar")');
    this.closeButton = this.modal.locator('button[aria-label="Fechar modal de execução de coleção"]');
  }

  public isVisible = async (): Promise<boolean> => {
    return await this.modal.isVisible();
  };

  public startRun = async (): Promise<void> => {
    await this.startButton.click();
  };

  public stopRun = async (): Promise<void> => {
    await this.stopButton.click();
  };

  public close = async (): Promise<void> => {
    await this.closeButton.click();
  };

  public waitForCompletion = async (): Promise<void> => {
    const completionIndicator = this.page.locator('span:has-text("Execução concluída!")');
    await completionIndicator.waitFor({ state: 'visible', timeout: 15000 });
  };

  public getPassedCount = async (): Promise<string> => {
    const passed = this.modal.locator('span:has-text("passaram")');
    return await passed.innerText();
  };
}

export { CollectionRunnerPage };

