import { expect, test } from '../fixtures';

test.describe('Execução de Scripts de Teste de API pós-resposta (tx)', () => {
  test.beforeEach(async ({ appPage }) => {
    await appPage.goto();
  });

  test('deve executar script tx.test e renderizar resultados de aprovacao', async ({
    page,
    requestBuilderPage,
    responseViewerPage,
  }) => {
    await requestBuilderPage.setMethod('GET');
    await requestBuilderPage.setUrl('http://localhost:3000/dinosaurs');
    await requestBuilderPage.setTestScript('tx.test("Status deve ser 200", () => { tx.expect(tx.response.status).toBe(200); });');
    await requestBuilderPage.sendRequest();

    await responseViewerPage.waitForResponse();
    await responseViewerPage.openTestsTab();

    const passBadge = page.locator('span:has-text("✓ PASSOU")');
    await expect(passBadge).toBeVisible();

    const testItem = page.getByText('Status deve ser 200', { exact: true });
    await expect(testItem).toBeVisible();
  });
});
