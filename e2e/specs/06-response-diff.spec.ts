import { expect, test } from '../fixtures';

test.describe('Comparador de Diff de Respostas', () => {
  test.beforeEach(async ({ appPage }) => {
    await appPage.goto();
  });

  test('deve comparar duas respostas e exibir tabela de diferencas', async ({
    collectionsPage,
    requestBuilderPage,
    responseViewerPage,
    responseDiffPage,
  }) => {
    await requestBuilderPage.setMethod('GET');
    await requestBuilderPage.setUrl('http://localhost:3000/dinosaurs');
    await requestBuilderPage.sendRequest();
    await responseViewerPage.waitForResponse();

    await collectionsPage.selectRequestItem('Criar Espécime');
    await requestBuilderPage.setMethod('POST');
    await requestBuilderPage.setUrl('http://localhost:3000/post');
    await requestBuilderPage.setBodyJson('{"dino": "T-Rex"}');
    await requestBuilderPage.sendRequest();
    await responseViewerPage.waitForResponse();

    await responseViewerPage.openDiffTab();
    await responseDiffPage.selectTargetTab(1);

    const isVisible = await responseDiffPage.isDiffTableVisible();
    expect(isVisible).toBe(true);
  });
});

