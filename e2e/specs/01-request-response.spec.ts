import { expect, test } from '../fixtures';

test.describe('Envio de Requisições HTTP e Visualização de Resposta', () => {
  test.beforeEach(async ({ appPage }) => {
    await appPage.goto();
  });

  test('deve enviar requisicao GET com sucesso e exibir dados da resposta', async ({
    requestBuilderPage,
    responseViewerPage,
  }) => {
    await requestBuilderPage.setMethod('GET');
    await requestBuilderPage.setUrl('http://localhost:3000/dinosaurs');
    await requestBuilderPage.sendRequest();

    await responseViewerPage.waitForResponse();
    const statusText = await responseViewerPage.getStatusText();
    expect(statusText).toContain('200');

    const bodyText = await responseViewerPage.getBodyText();
    expect(bodyText).toContain('Tyrannosaurus Rex');
  });

  test('deve enviar requisicao com query parameters', async ({
    requestBuilderPage,
    responseViewerPage,
  }) => {
    await requestBuilderPage.setMethod('GET');
    await requestBuilderPage.setUrl('http://localhost:3000/get');
    await requestBuilderPage.addQueryParam({ key: 'periodo', value: 'cretaceo' });
    await requestBuilderPage.sendRequest();

    await responseViewerPage.waitForResponse();
    const statusText = await responseViewerPage.getStatusText();
    expect(statusText).toContain('200');

    const bodyText = await responseViewerPage.getBodyText();
    expect(bodyText.toLowerCase()).toContain('cret');
  });

  test('deve enviar requisicao POST com corpo JSON', async ({
    requestBuilderPage,
    responseViewerPage,
  }) => {
    await requestBuilderPage.setMethod('POST');
    await requestBuilderPage.setUrl('http://localhost:3000/post');
    await requestBuilderPage.setBodyJson('{"dino": "Velociraptor", "diet": "carnivore"}');
    await requestBuilderPage.sendRequest();

    await responseViewerPage.waitForResponse();
    const statusText = await responseViewerPage.getStatusText();
    expect(statusText).toMatch(/200|201/);

    const bodyText = await responseViewerPage.getBodyText();
    expect(bodyText).toContain('Velociraptor');
  });

  test('deve enviar requisicao com autenticacao Bearer token', async ({
    requestBuilderPage,
    responseViewerPage,
  }) => {
    await requestBuilderPage.setMethod('GET');
    await requestBuilderPage.setUrl('http://localhost:3000/auth/bearer');
    await requestBuilderPage.setBearerToken('trex-secret-token-123');
    await requestBuilderPage.sendRequest();

    await responseViewerPage.waitForResponse();
    const statusText = await responseViewerPage.getStatusText();
    expect(statusText).toContain('200');

    const bodyText = await responseViewerPage.getBodyText();
    expect(bodyText).toContain('authenticated');
  });
});

