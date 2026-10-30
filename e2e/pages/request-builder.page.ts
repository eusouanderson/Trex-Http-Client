import type { Locator, Page } from '@playwright/test';
import type { RequestHeaderInput, RequestParamInput } from '../interfaces';

class RequestBuilderPage {
  private readonly page: Page;
  private readonly methodSelect: Locator;
  private readonly urlInput: Locator;
  private readonly sendButton: Locator;
  private readonly paramsTabButton: Locator;
  private readonly headersTabButton: Locator;
  private readonly bodyTabButton: Locator;
  private readonly authTabButton: Locator;
  private readonly testsTabButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.methodSelect = page.locator('select[aria-label="Método HTTP"]');
    this.urlInput = page.locator('input[aria-label="URL da requisição"]');
    this.sendButton = page.locator('.request-url-bar button:has-text("Enviar"), .request-url-bar button:has-text("Enviando...")');
    this.paramsTabButton = page.locator('.request-category-tabs button:has-text("Parâmetros")');
    this.headersTabButton = page.locator('.request-category-tabs button:has-text("Headers")');
    this.bodyTabButton = page.locator('.request-category-tabs button:has-text("Corpo (Body)")');
    this.authTabButton = page.locator('.request-category-tabs button:has-text("Autorização")');
    this.testsTabButton = page.locator('.request-category-tabs button:has-text("Testes")');
  }

  public setMethod = async (method: string): Promise<void> => {
    await this.methodSelect.selectOption(method);
  };

  public setUrl = async (url: string): Promise<void> => {
    await this.urlInput.fill(url);
  };

  public getUrlValue = async (): Promise<string> => {
    return await this.urlInput.inputValue();
  };

  public sendRequest = async (): Promise<void> => {
    await this.sendButton.click();
  };

  public openParamsTab = async (): Promise<void> => {
    await this.paramsTabButton.click();
  };

  public openHeadersTab = async (): Promise<void> => {
    await this.headersTabButton.click();
  };

  public openBodyTab = async (): Promise<void> => {
    await this.bodyTabButton.click();
  };

  public openAuthTab = async (): Promise<void> => {
    await this.authTabButton.click();
  };

  public openTestsTab = async (): Promise<void> => {
    await this.testsTabButton.click();
  };

  public addQueryParam = async (param: RequestParamInput): Promise<void> => {
    await this.openParamsTab();
    await this.page.locator('button:has-text("+ Adicionar Parâmetro")').click();
    const rows = this.page.locator('.kv-row');
    const lastRow = rows.last();
    await lastRow.locator('input[aria-label="Chave do parâmetro"]').fill(param.key);
    await lastRow.locator('input[aria-label="Valor do parâmetro"]').fill(param.value);
  };

  public addHeader = async (header: RequestHeaderInput): Promise<void> => {
    await this.openHeadersTab();
    await this.page.locator('button:has-text("+ Adicionar Header")').click();
    const rows = this.page.locator('.kv-row');
    const lastRow = rows.last();
    await lastRow.locator('input[aria-label="Chave do cabeçalho"]').fill(header.key);
    await lastRow.locator('input[aria-label="Valor do cabeçalho"]').fill(header.value);
  };

  public setBodyType = async (type: 'none' | 'json' | 'text'): Promise<void> => {
    await this.openBodyTab();
    await this.page.locator(`input[name="bodyType"][value="${type}"]`).check();
  };

  public setBodyJson = async (jsonString: string): Promise<void> => {
    await this.setBodyType('json');
    const editor = this.page.locator('.cm-content').first();
    await editor.click();
    await this.page.keyboard.press('ControlOrMeta+A');
    await this.page.keyboard.press('Backspace');
    await editor.fill(jsonString);
  };

  public setBearerToken = async (token: string): Promise<void> => {
    await this.openAuthTab();
    await this.page.locator('select[aria-label="Tipo de Autenticação"]').selectOption('bearer');
    const tokenInput = this.page.locator('input[placeholder*="token"]').first();
    await tokenInput.fill(token);
  };

  public setTestScript = async (script: string): Promise<void> => {
    await this.openTestsTab();
    const editor = this.page.locator('.cm-content').last();
    await editor.click();
    await this.page.keyboard.press('ControlOrMeta+A');
    await this.page.keyboard.press('Backspace');
    await editor.fill(script);
  };
}

export { RequestBuilderPage };

