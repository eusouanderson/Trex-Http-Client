import { expect, test } from '../fixtures';

test.describe('Configurações, Temas Visuais e Tipografia', () => {
  test.beforeEach(async ({ appPage }) => {
    await appPage.goto();
  });

  test('deve abrir modal de configuracoes e alternar tema visual', async ({
    page,
    appPage,
    settingsPage,
  }) => {
    await appPage.openSettings();
    const isVisible = await settingsPage.isVisible();
    expect(isVisible).toBe(true);

    await settingsPage.selectTheme('TRex Monokai');
    await settingsPage.close();

    const rootContainer = page.locator('div[class*="theme-"]');
    await expect(rootContainer).toHaveClass(/theme-trex-monokai/);
  });

  test('deve alterar tipografia da aplicacao', async ({
    page,
    appPage,
    settingsPage,
  }) => {
    await appPage.openSettings();
    await settingsPage.selectFont('Fira Code');
    await settingsPage.close();

    const fontStyle = await page.evaluate((): string => {
      return document.documentElement.style.getPropertyValue('--font-family-app');
    });
    expect(fontStyle).toContain('Fira Code');
  });
});

