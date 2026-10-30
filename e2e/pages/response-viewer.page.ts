import type { Locator, Page } from '@playwright/test';

class ResponseViewerPage {
  private readonly page: Page;
  private readonly statusBadge: Locator;
  private readonly bodyTabButton: Locator;
  private readonly headersTabButton: Locator;
  private readonly testsTabButton: Locator;
  private readonly diffTabButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.statusBadge = page.locator('.response-meta-bar span[class*="font-black rounded-md"]').first();
    this.bodyTabButton = page.locator('.response-meta-bar button:has-text("Corpo")');
    this.headersTabButton = page.locator('.response-meta-bar button:has-text("Headers")');
    this.testsTabButton = page.locator('.response-meta-bar button:has-text("Testes")');
    this.diffTabButton = page.locator('.response-meta-bar button:has-text("Comparar")');
  }

  public waitForResponse = async (timeoutMs = 15000): Promise<void> => {
    await this.statusBadge.waitFor({ state: 'visible', timeout: timeoutMs });
  };

  public getStatusText = async (): Promise<string> => {
    return await this.statusBadge.innerText();
  };

  public openBodyTab = async (): Promise<void> => {
    await this.bodyTabButton.click();
  };

  public openHeadersTab = async (): Promise<void> => {
    await this.headersTabButton.click();
  };

  public openTestsTab = async (): Promise<void> => {
    await this.testsTabButton.click();
  };

  public openDiffTab = async (): Promise<void> => {
    await this.diffTabButton.click();
  };

  public getBodyText = async (): Promise<string> => {
    const editor = this.page.locator('.response-meta-bar ~ div .cm-content');
    if (await editor.isVisible()) {
      return await editor.innerText();
    }
    const pre = this.page.locator('.response-meta-bar ~ div pre');
    if (await pre.isVisible()) {
      return await pre.innerText();
    }
    return '';
  };

  public getDurationText = async (): Promise<string> => {
    const duration = this.page.locator('.response-meta-bar span:has-text("⏱")');
    return await duration.innerText();
  };

  public getSizeBytesText = async (): Promise<string> => {
    const size = this.page.locator('.response-meta-bar span:has-text("📦")');
    return await size.innerText();
  };

  public getTestPassedBadgeText = async (): Promise<string> => {
    const badge = this.testsTabButton.locator('span[class*="rounded-full"]');
    return await badge.innerText();
  };
}

export { ResponseViewerPage };

