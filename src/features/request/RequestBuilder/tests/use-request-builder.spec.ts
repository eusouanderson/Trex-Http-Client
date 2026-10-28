import { describe, it, expect, beforeEach } from 'vitest';
import { useRequest } from '../../use-request';
import { useRequestBuilder } from '../use-request-builder';

describe('useRequestBuilder', () => {
  beforeEach(() => {
    const builder = useRequestBuilder();
    builder.setCategory('params');
  });

  it('should switch active category tabs', () => {
    const builder = useRequestBuilder();

    expect(builder.activeCategory.value).toBe('params');
    builder.setCategory('headers');
    expect(builder.activeCategory.value).toBe('headers');
    builder.setCategory('body');
    expect(builder.activeCategory.value).toBe('body');
  });

  it('should update current request method and URL', () => {
    const builder = useRequestBuilder();

    builder.setMethod('POST');
    expect(builder.activeTab.value?.method).toBe('POST');

    builder.setUrl('https://api.dino.dev/fossils');
    expect(builder.activeTab.value?.url).toBe('https://api.dino.dev/fossils');
  });

  it('should format JSON body if valid and ignore invalid JSON', () => {
    const builder = useRequestBuilder();

    builder.setBody('{"species":"T-Rex","carnivore":true}');
    builder.formatJsonBody();
    expect(builder.activeTab.value?.body).toContain('\n');

    builder.setBody('not a valid json');
    builder.formatJsonBody();
    expect(builder.activeTab.value?.body).toBe('not a valid json');

    const { tabs, closeTab } = useRequest();
    while (tabs.value.length > 0) {
      const first = tabs.value[0];
      if (!first) break;
      closeTab(first.id);
    }
    builder.formatJsonBody();
  });

  it('should manipulate parameters and headers through builder methods', () => {
    const builder = useRequestBuilder();

    builder.createNewTab();
    builder.addParam();
    expect(builder.activeTab.value?.params.length).toBeGreaterThan(0);
    const paramId = builder.activeTab.value?.params[0]?.id ?? '';
    builder.removeParam(paramId);

    builder.addHeader();
    expect(builder.activeTab.value?.headers.length).toBeGreaterThan(0);
    const headerId = builder.activeTab.value?.headers[0]?.id ?? '';
    builder.removeHeader(headerId);

    builder.setBodyType('text');
    expect(builder.activeTab.value?.bodyType).toBe('text');

    builder.setAuth({ type: 'bearer', token: 'token-builder', prefix: 'Bearer', enabled: true });
    expect(builder.activeTab.value?.auth?.type).toBe('bearer');

    builder.setTestScript('pm.test("Dino", () => {});');
    expect(builder.activeTab.value?.testScript).toBe('pm.test("Dino", () => {});');
  });

  it('should invoke send and handle callback', async () => {
    let sentCalled = false;
    const builder = useRequestBuilder(() => {
      sentCalled = true;
    });

    builder.setUrl('https://eusouanderson.github.io/Trex-Http-Client/get');
    builder.setMethod('GET');
    await builder.send();
    expect(sentCalled).toBe(true);
  });

  it('should reflect validation issues and hasUrlError when validation fails', async () => {
    const builder = useRequestBuilder();

    builder.setUrl('   ');
    await builder.send();

    expect(builder.validationIssues.value.length).toBeGreaterThan(0);
    expect(builder.hasUrlError.value).toBe(true);

    builder.clearValidationIssues();
    expect(builder.validationIssues.value).toHaveLength(0);
    expect(builder.hasUrlError.value).toBe(false);
  });

  it('should evaluate hasUrlError for category url, field url and other categories', () => {
    const builder = useRequestBuilder();
    const { setValidationIssues } = useRequest();

    setValidationIssues([
      {
        code: 'VARIABLE_VALUE_EMPTY',
        category: 'variable',
        field: 'url',
        message: 'Empty variable',
        remediation: 'Fill variable',
      },
    ]);
    expect(builder.hasUrlError.value).toBe(true);

    setValidationIssues([
      {
        code: 'HEADER_NAME_EMPTY',
        category: 'header',
        field: 'headers',
        message: 'Empty header',
        remediation: 'Fill header',
      },
    ]);
    expect(builder.hasUrlError.value).toBe(false);

    builder.clearValidationIssues();
    expect(builder.hasUrlError.value).toBe(false);
  });
});
