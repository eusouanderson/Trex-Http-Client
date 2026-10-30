import { expect, test } from '../fixtures';

test.describe('Atalhos de Teclado, Command Palette e Alternância de Layout', () => {
  test.beforeEach(async ({ appPage }) => {
    await appPage.goto();
  });

  test('deve alternar estagios de layout atraves do botao da barra lateral', async ({
    appPage,
  }) => {
    let sidebarVisible = await appPage.isSidebarVisible();
    let urlBarVisible = await appPage.isUrlBarVisible();
    expect(sidebarVisible).toBe(true);
    expect(urlBarVisible).toBe(true);

    await appPage.toggleSidebar();
    sidebarVisible = await appPage.isSidebarVisible();
    urlBarVisible = await appPage.isUrlBarVisible();
    expect(sidebarVisible).toBe(false);
    expect(urlBarVisible).toBe(true);

    await appPage.toggleSidebar();
    sidebarVisible = await appPage.isSidebarVisible();
    urlBarVisible = await appPage.isUrlBarVisible();
    expect(sidebarVisible).toBe(false);
    expect(urlBarVisible).toBe(false);

    await appPage.toggleSidebar();
    sidebarVisible = await appPage.isSidebarVisible();
    urlBarVisible = await appPage.isUrlBarVisible();
    expect(sidebarVisible).toBe(true);
    expect(urlBarVisible).toBe(true);
  });

  test('deve abrir e fechar a Command Palette via atalho de teclado', async ({
    commandPalettePage,
  }) => {
    await commandPalettePage.openViaShortcut();
    let isVisible = await commandPalettePage.isVisible();
    expect(isVisible).toBe(true);

    await commandPalettePage.closeViaEscape();
    isVisible = await commandPalettePage.isVisible();
    expect(isVisible).toBe(false);
  });
});

