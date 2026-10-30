import { expect, test } from '../fixtures';

test.describe('Navegação por Abas e Isolamento de Resposta', () => {
  test.beforeEach(async ({ appPage }) => {
    await appPage.goto();
  });

  test('deve alternar entre abas abertas e manter isolamento de contexto', async ({
    appPage,
    collectionsPage,
    requestBuilderPage,
  }) => {
    await collectionsPage.selectRequestItem('Criar Espécime');

    const tabs = appPage.getTabs();
    await expect(tabs).toHaveCount(2);

    await appPage.selectTabByName('Listar Dinossauros');
    let urlValue = await requestBuilderPage.getUrlValue();
    expect(urlValue).toContain('get');

    await appPage.selectTabByName('Criar Espécime');
    urlValue = await requestBuilderPage.getUrlValue();
    expect(urlValue).toContain('post');
  });

  test('deve isolar o resultado de execucao entre abas distintas', async ({
    appPage,
    collectionsPage,
    requestBuilderPage,
    responseViewerPage,
  }) => {
    await requestBuilderPage.setMethod('GET');
    await requestBuilderPage.setUrl('http://localhost:3000/dinosaurs');
    await requestBuilderPage.sendRequest();

    await responseViewerPage.waitForResponse();
    const firstBody = await responseViewerPage.getBodyText();
    expect(firstBody).toContain('Tyrannosaurus Rex');

    await collectionsPage.selectRequestItem('Criar Espécime');
    await requestBuilderPage.setMethod('POST');
    await requestBuilderPage.setUrl('http://localhost:3000/post');
    await requestBuilderPage.setBodyJson('{"dino": "Triceratops"}');
    await requestBuilderPage.sendRequest();

    await responseViewerPage.waitForResponse();
    const secondBody = await responseViewerPage.getBodyText();
    expect(secondBody).toContain('Triceratops');

    await appPage.selectTabByName('Listar Dinossauros');
    const restoredFirstBody = await responseViewerPage.getBodyText();
    expect(restoredFirstBody).toContain('Tyrannosaurus Rex');
  });

  test('deve fechar uma aba e manter as outras ativas', async ({
    appPage,
    collectionsPage,
  }) => {
    await collectionsPage.selectRequestItem('Criar Espécime');
    let tabs = appPage.getTabs();
    await expect(tabs).toHaveCount(2);

    await appPage.closeTabByIndex(1);
    tabs = appPage.getTabs();
    await expect(tabs).toHaveCount(1);
  });
});
