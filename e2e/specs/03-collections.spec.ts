import { expect, test } from '../fixtures';

test.describe('Gerenciamento de Coleções e Requisições', () => {
  test.beforeEach(async ({ appPage }) => {
    await appPage.goto();
  });

  test('deve criar uma nova colecao com sucesso', async ({ collectionsPage }) => {
    const initialCount = await collectionsPage.getCollectionCards().count();
    await collectionsPage.createCollection();

    const finalCount = await collectionsPage.getCollectionCards().count();
    expect(finalCount).toBe(initialCount + 1);
  });

  test('deve filtrar colecoes pelo campo de pesquisa', async ({ collectionsPage }) => {
    await collectionsPage.search('Dinossauros');
    const matchedCard = collectionsPage.getCollectionByName('Coleção T-Rex');
    await expect(matchedCard).toBeVisible();

    await collectionsPage.search('TermoInexistenteXYZ');
    const emptyResult = collectionsPage.getCollectionCards();
    await expect(emptyResult).toHaveCount(0);
  });

  test('deve adicionar uma nova requisicao dentro de uma colecao', async ({
    collectionsPage,
  }) => {
    const targetCard = collectionsPage.getCollectionByName('Coleção T-Rex');
    const itemsBefore = await targetCard.locator('.request-item-card').count();

    await collectionsPage.addRequestToCollection('Coleção T-Rex');
    const itemsAfter = await targetCard.locator('.request-item-card').count();
    expect(itemsAfter).toBe(itemsBefore + 1);
  });

  test('deve excluir uma colecao criada', async ({ collectionsPage }) => {
    await collectionsPage.createCollection();
    const countBefore = await collectionsPage.getCollectionCards().count();

    const lastCard = collectionsPage.getCollectionCards().last();
    const header = lastCard.locator('.collection-card-header');
    await header.hover();
    await header.locator('button[title="Excluir Coleção"]').click();

    const countAfter = await collectionsPage.getCollectionCards().count();
    expect(countAfter).toBe(countBefore - 1);
  });
});

