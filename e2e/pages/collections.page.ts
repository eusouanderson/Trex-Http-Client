import type { Locator, Page } from '@playwright/test';

class CollectionsPage {
  private readonly page: Page;
  private readonly newCollectionButton: Locator;
  private readonly searchInput: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.newCollectionButton = page.locator('button:has-text("Nova")');
    this.searchInput = page.locator('input[aria-label="Filtrar requisições"]');
  }

  public createCollection = async (): Promise<void> => {
    await this.newCollectionButton.click();
  };

  public search = async (query: string): Promise<void> => {
    await this.searchInput.fill(query);
  };

  public getCollectionCards = (): Locator => {
    return this.page.locator('.collection-card');
  };

  public getCollectionByName = (name: string): Locator => {
    return this.page.locator(`.collection-card:has-text("${name}")`);
  };

  public expandCollection = async (name: string): Promise<void> => {
    const header = this.getCollectionByName(name).locator('.collection-card-header');
    await header.click();
  };

  public addRequestToCollection = async (collectionName: string): Promise<void> => {
    const card = this.getCollectionByName(collectionName);
    const header = card.locator('.collection-card-header');
    await header.hover();
    const addBtn = header.locator('button[title="Nova Requisição"]');
    await addBtn.click();
  };

  public deleteCollection = async (name: string): Promise<void> => {
    const card = this.getCollectionByName(name);
    const header = card.locator('.collection-card-header');
    await header.hover();
    const deleteBtn = header.locator('button[title="Excluir Coleção"]');
    await deleteBtn.click();
  };

  public selectRequestItem = async (requestName: string): Promise<void> => {
    const item = this.page.locator(`.request-item-card:has-text("${requestName}")`);
    await item.click();
  };

  public renameCollection = async (oldName: string, newName: string): Promise<void> => {
    const nameSpan = this.getCollectionByName(oldName).locator('.collection-card-header span[title*="Clique duas vezes"]');
    await nameSpan.dblclick();
    const input = this.page.locator('input[aria-label="Nome da coleção"]');
    await input.fill(newName);
    await input.press('Enter');
  };

  public openRunner = async (name: string): Promise<void> => {
    const card = this.getCollectionByName(name);
    const header = card.locator('.collection-card-header');
    await header.click({ button: 'right' });
    const runOption = this.page.locator('button:has-text("Executar Coleção")');
    await runOption.click();
  };
}

export { CollectionsPage };

