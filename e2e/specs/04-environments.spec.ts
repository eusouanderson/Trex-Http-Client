import { expect, test } from '../fixtures';

test.describe('Gerenciamento de Ambientes e Resolução de Variáveis', () => {
  test.beforeEach(async ({ appPage }) => {
    await appPage.goto();
  });

  test('deve criar ambiente com variavel e resolver no envio da requisicao', async ({
    environmentsPage,
    requestBuilderPage,
    responseViewerPage,
  }) => {
    await environmentsPage.openManager();
    await environmentsPage.createEnvironment('Ambiente E2E');
    await environmentsPage.addVariable({ key: 'endpoint_path', value: 'dinosaurs' });
    await environmentsPage.setAsActive();
    await environmentsPage.closeManager();

    await requestBuilderPage.setMethod('GET');
    await requestBuilderPage.setUrl('http://localhost:3000/{{endpoint_path}}');
    await requestBuilderPage.sendRequest();

    await responseViewerPage.waitForResponse();
    const statusText = await responseViewerPage.getStatusText();
    expect(statusText).toContain('200');

    const bodyText = await responseViewerPage.getBodyText();
    expect(bodyText).toContain('Tyrannosaurus Rex');
  });
});

