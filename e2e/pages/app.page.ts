import type { Locator, Page } from '@playwright/test';

class AppPage {
  private readonly page: Page;
  private readonly sidebarToggleButton: Locator;
  private readonly settingsButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.sidebarToggleButton = page.locator('button[aria-label="Alternar Barra Lateral"]');
    this.settingsButton = page.locator('button[aria-label="Configurações"]');
  }

  public goto = async (): Promise<void> => {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  };

  public clearStorage = async (): Promise<void> => {
    await this.page.evaluate(async (): Promise<void> => {
      const dbs = await window.indexedDB.databases();
      for (const db of dbs) {
        if (typeof db.name === 'string' && db.name.length > 0) {
          window.indexedDB.deleteDatabase(db.name);
        }
      }
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  };

  public toggleSidebar = async (): Promise<void> => {
    await this.sidebarToggleButton.click();
  };

  public openSettings = async (): Promise<void> => {
    await this.settingsButton.click();
  };

  public getTabs = (): Locator => {
    return this.page.locator('header div[class*="group relative"]');
  };

  public selectTabByName = async (name: string): Promise<void> => {
    const tab = this.page.locator(`header div[class*="group relative"]:has-text("${name}")`);
    await tab.click();
  };

  public closeTabByIndex = async (index: number): Promise<void> => {
    const closeButtons = this.page.locator('header button[aria-label="Fechar aba"]');
    await closeButtons.nth(index).click();
  };

  public isSidebarVisible = async (): Promise<boolean> => {
    const sidebar = this.page.locator('.collection-card-header, input[aria-label="Filtrar requisições"]');
    return await sidebar.first().isVisible();
  };

  public isUrlBarVisible = async (): Promise<boolean> => {
    const urlBar = this.page.locator('input[aria-label="URL da requisição"]');
    return await urlBar.isVisible();
  };
}

export { AppPage };

