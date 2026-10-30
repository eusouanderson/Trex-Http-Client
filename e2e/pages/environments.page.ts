import type { Locator, Page } from '@playwright/test';
import type { EnvironmentVariableInput } from '../interfaces';

class EnvironmentsPage {
  private readonly page: Page;
  private readonly selector: Locator;
  private readonly managerModal: Locator;
  private readonly newEnvButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.selector = page.locator('select[aria-label="Selecionar ambiente ativo"]');
    this.managerModal = page.locator('h2:has-text("Gerenciar Ambientes")').locator('xpath=ancestor::div[contains(@class, "fixed")]');
    this.newEnvButton = page.locator('button:has-text("+ Novo Ambiente")');
  }

  public openManager = async (): Promise<void> => {
    await this.selector.selectOption('manage');
  };

  public closeManager = async (): Promise<void> => {
    const closeBtn = this.managerModal.locator('.border-b button:has-text("✕")').first();
    await closeBtn.click();
  };

  public selectActiveEnvironment = async (envName: string): Promise<void> => {
    await this.selector.selectOption({ label: envName });
  };

  public createEnvironment = async (name: string): Promise<void> => {
    await this.newEnvButton.click();
    const nameInput = this.page.locator('input[aria-label="Nome do Ambiente"]');
    await nameInput.fill(name);
  };

  public addVariable = async (variable: EnvironmentVariableInput): Promise<void> => {
    await this.page.locator('button:has-text("+ Adicionar Variável")').click();
    const rows = this.page.locator('.grid-cols-12');
    const lastRow = rows.last();
    await lastRow.locator('input[aria-label="Nome da variável"]').fill(variable.key);
    await lastRow.locator('input[aria-label="Valor da variável"]').fill(variable.value);
  };

  public setAsActive = async (): Promise<void> => {
    const btn = this.page.locator('button:has-text("Definir como Ativo")');
    if (await btn.isVisible()) {
      await btn.click();
    }
  };
}

export { EnvironmentsPage };

