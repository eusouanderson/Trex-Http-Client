import { expect, test } from '../fixtures';

test.describe('Runner de Coleções e Execução em Lote', () => {
  test.beforeEach(async ({ appPage }) => {
    await appPage.goto();
  });

  test('deve abrir o runner de colecao, disparar execucao em lote e exibir relatorio', async ({
    appPage,
    collectionsPage,
    collectionRunnerPage,
  }) => {
    await appPage.clearStorage();
    await appPage.goto();

    await collectionsPage.createCollection();
    await collectionsPage.addRequestToCollection('Nova Coleção');

    await collectionsPage.openRunner('Nova Coleção');
    const isModalOpen = await collectionRunnerPage.isVisible();
    expect(isModalOpen).toBe(true);

    await collectionRunnerPage.startRun();
    await collectionRunnerPage.waitForCompletion();

    const passedText = await collectionRunnerPage.getPassedCount();
    expect(passedText).toContain('1');

    await collectionRunnerPage.close();
    const isModalClosed = await collectionRunnerPage.isVisible();
    expect(isModalClosed).toBe(false);
  });
});
