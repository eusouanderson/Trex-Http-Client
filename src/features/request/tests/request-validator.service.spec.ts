import { describe, it, expect, beforeEach } from 'vitest';
import { VariableResolverService } from '../../../core/variables';
import type { Collection } from '../../collections/interfaces';
import type { Environment } from '../../environments/interfaces';
import type { RequestTab } from '../interfaces';
import { RequestValidatorService } from '../request-validator.service';

describe('RequestValidatorService', () => {
  let validator: RequestValidatorService;
  let variableResolver: VariableResolverService;

  const createBaseTab = (overrides?: Partial<RequestTab>): RequestTab => ({
    id: 'tab-1',
    name: 'Requisição de Teste',
    method: 'GET',
    url: 'https://api.dinossauro.dev/v1/fossils',
    params: [],
    headers: [],
    bodyType: 'none',
    body: '',
    auth: { type: 'none' },
    isDirty: false,
    ...overrides,
  });

  const createEnvironment = (variables: { key: string; value: string; enabled?: boolean }[]): Environment => ({
    id: 'env-1',
    name: 'Produção',
    variables: variables.map((v, idx) => ({
      id: `v-${idx.toString()}`,
      key: v.key,
      value: v.value,
      enabled: v.enabled ?? true,
    })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  beforeEach(() => {
    variableResolver = new VariableResolverService();
    validator = new RequestValidatorService(variableResolver);
  });

  describe('Validação de URL e Método HTTP', () => {
    it('deve aprovar uma requisição válida com URL absoluta', () => {
      const tab = createBaseTab();
      const result = validator.validate(tab);

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('deve aprovar uma requisição válida com URL relativa', () => {
      const tab = createBaseTab({ url: '/api/v1/dinosaurs' });
      const result = validator.validate(tab);

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('deve rejeitar URL vazia', () => {
      const tab = createBaseTab({ url: '' });
      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'URL_EMPTY',
            category: 'url',
            field: 'url',
          }),
        ]),
      );
    });

    it('deve rejeitar URL composta apenas por espaços', () => {
      const tab = createBaseTab({ url: '    ' });
      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues[0]?.code).toBe('URL_EMPTY');
    });

    it('deve rejeitar método HTTP ausente ou inválido', () => {
      const tab = createBaseTab({ method: 'INVALID' as unknown as RequestTab['method'] });
      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'METHOD_INVALID',
            category: 'url',
            field: 'method',
          }),
        ]),
      );
    });

    it('deve rejeitar URL com quebras de linha ou caracteres de controle', () => {
      const tab = createBaseTab({ url: 'https://api.dinossauro.dev/v1\n/fossils' });
      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'URL_MALFORMED',
            category: 'url',
            field: 'url',
          }),
        ]),
      );
    });

    it('deve rejeitar protocolos não suportados como ftp://', () => {
      const tab = createBaseTab({ url: 'ftp://files.dinossauro.dev/fossil.zip' });
      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'PROTOCOL_UNSUPPORTED',
            category: 'url',
            field: 'url',
          }),
        ]),
      );
    });

    it('deve rejeitar formato de URL malformado sem variáveis', () => {
      const tab = createBaseTab({ url: 'http://' });
      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'URL_MALFORMED',
            category: 'url',
            field: 'url',
          }),
        ]),
      );
    });
  });

  describe('Validação de Variáveis e Ambientes', () => {
    it('deve aprovar URL com variável existente e resolvida', () => {
      const tab = createBaseTab({ url: '{{ baseUrl }}/fossils' });
      const env = createEnvironment([{ key: 'baseUrl', value: 'https://api.dinossauro.dev' }]);

      const result = validator.validate(tab, { environment: env });

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('deve rejeitar variável quando nenhum ambiente estiver ativo', () => {
      const tab = createBaseTab({ url: '{{ baseUrl }}/fossils' });

      const result = validator.validate(tab, { environment: null });

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'ENVIRONMENT_REQUIRED',
            category: 'environment',
            variableName: 'baseUrl',
          }),
        ]),
      );
      expect(result.issues[0]?.message).toContain('baseUrl');
    });

    it('deve rejeitar variável que não existe no ambiente ativo', () => {
      const tab = createBaseTab({ url: '{{ missingVar }}/fossils' });
      const env = createEnvironment([{ key: 'baseUrl', value: 'https://api.dinossauro.dev' }]);

      const result = validator.validate(tab, { environment: env });

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'VARIABLE_NOT_FOUND',
            category: 'variable',
            variableName: 'missingVar',
          }),
        ]),
      );
    });

    it('deve rejeitar variável que está desabilitada no ambiente ativo', () => {
      const tab = createBaseTab({ url: '{{ apiKey }}/fossils' });
      const env = createEnvironment([{ key: 'apiKey', value: 'secret-123', enabled: false }]);

      const result = validator.validate(tab, { environment: env });

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'VARIABLE_DISABLED',
            category: 'variable',
            variableName: 'apiKey',
          }),
        ]),
      );
    });

    it('deve apontar variável configurada com valor vazio quando resulta em URL inválida', () => {
      const tab = createBaseTab({ url: '{{ host }}' });
      const env = createEnvironment([{ key: 'host', value: '' }]);

      const result = validator.validate(tab, { environment: env });

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'VARIABLE_VALUE_EMPTY',
            category: 'variable',
            variableName: 'host',
          }),
        ]),
      );
    });

    it('deve rejeitar dependência cíclica de variáveis', () => {
      const tab = createBaseTab({ url: '{{ a }}' });
      const env = createEnvironment([
        { key: 'a', value: '{{ b }}' },
        { key: 'b', value: '{{ a }}' },
      ]);

      const result = validator.validate(tab, { environment: env });

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'VARIABLE_UNRESOLVED',
            category: 'variable',
          }),
        ]),
      );
    });

    it('deve rejeitar URL que continua contendo placeholders após resolução', () => {
      const tab = createBaseTab({ url: 'https://api.dinossauro.dev/{{ unclosed' });
      const env = createEnvironment([]);

      const result = validator.validate(tab, { environment: env });

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'URL_MALFORMED',
            category: 'url',
          }),
        ]),
      );
    });

    it('deve rejeitar quando a substituição de variável resulta em formato inválido', () => {
      const tab = createBaseTab({ url: '{{ invalidUrl }}' });
      const env = createEnvironment([{ key: 'invalidUrl', value: '://bad-domain' }]);

      const result = validator.validate(tab, { environment: env });

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'URL_INVALID_AFTER_INTERPOLATION',
            category: 'url',
          }),
        ]),
      );
    });
  });

  describe('Validação de Headers e Parâmetros', () => {
    it('deve rejeitar header habilitado com chave vazia', () => {
      const tab = createBaseTab({
        headers: [{ id: 'h1', key: '   ', value: 'application/json', enabled: true }],
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'HEADER_NAME_EMPTY',
            category: 'header',
            field: 'headers',
          }),
        ]),
      );
    });

    it('deve ignorar header com chave vazia se estiver desabilitado', () => {
      const tab = createBaseTab({
        headers: [{ id: 'h1', key: '', value: 'ignored', enabled: false }],
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar header com caracteres inválidos no nome', () => {
      const tab = createBaseTab({
        headers: [{ id: 'h1', key: 'Invalid Header Name:', value: 'val', enabled: true }],
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'HEADER_NAME_INVALID',
            category: 'header',
            field: 'headers',
          }),
        ]),
      );
    });

    it('deve rejeitar header com variável ausente', () => {
      const tab = createBaseTab({
        headers: [{ id: 'h1', key: 'Authorization', value: 'Bearer {{ token }}', enabled: true }],
      });
      const env = createEnvironment([]);

      const result = validator.validate(tab, { environment: env });

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'VARIABLE_NOT_FOUND',
            category: 'variable',
            variableName: 'token',
          }),
        ]),
      );
    });

    it('deve rejeitar parâmetro de query com variável ausente', () => {
      const tab = createBaseTab({
        params: [{ id: 'p1', key: 'limit', value: '{{ pageSize }}', enabled: true }],
      });
      const env = createEnvironment([]);

      const result = validator.validate(tab, { environment: env });

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'VARIABLE_NOT_FOUND',
            category: 'variable',
            variableName: 'pageSize',
          }),
        ]),
      );
    });

    it('deve ignorar parâmetro de query com variável se estiver desabilitado', () => {
      const tab = createBaseTab({
        params: [{ id: 'p1', key: 'query', value: '{{ missing }}', enabled: false }],
      });
      const result = validator.validate(tab);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Validação de Body', () => {
    it('deve aprovar body JSON válido', () => {
      const tab = createBaseTab({
        method: 'POST',
        bodyType: 'json',
        body: '{"name": "T-Rex", "diet": "carnivore"}',
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(true);
    });

    it('deve aprovar body JSON vazio', () => {
      const tab = createBaseTab({
        method: 'POST',
        bodyType: 'json',
        body: '   ',
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar body JSON malformado', () => {
      const tab = createBaseTab({
        method: 'POST',
        bodyType: 'json',
        body: '{"name": "T-Rex", invalid}',
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'JSON_SYNTAX_INVALID',
            category: 'body',
            field: 'body',
          }),
        ]),
      );
    });

    it('deve aprovar JSON com variáveis de ambiente que resultam em JSON válido', () => {
      const tab = createBaseTab({
        method: 'POST',
        bodyType: 'json',
        body: '{"id": {{ dinoId }}, "name": "{{ dinoName }}"}',
      });
      const env = createEnvironment([
        { key: 'dinoId', value: '42' },
        { key: 'dinoName', value: 'Velociraptor' },
      ]);

      const result = validator.validate(tab, { environment: env });

      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar body que referencia variável ausente', () => {
      const tab = createBaseTab({
        method: 'POST',
        bodyType: 'json',
        body: '{"token": "{{ secretToken }}"}',
      });
      const env = createEnvironment([]);

      const result = validator.validate(tab, { environment: env });

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'VARIABLE_NOT_FOUND',
            variableName: 'secretToken',
          }),
        ]),
      );
    });

    it('deve alertar quando método GET possui corpo preenchido', () => {
      const tab = createBaseTab({
        method: 'GET',
        bodyType: 'json',
        body: '{"unexpected": true}',
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'BODY_NOT_ALLOWED',
            category: 'body',
            field: 'body',
          }),
        ]),
      );
    });

    it('deve alertar quando método HEAD possui corpo preenchido', () => {
      const tab = createBaseTab({
        method: 'HEAD',
        bodyType: 'text',
        body: 'Texto não permitido em HEAD',
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues[0]?.code).toBe('BODY_NOT_ALLOWED');
    });
  });

  describe('Validação de Autenticação', () => {
    it('deve aprovar autenticação none', () => {
      const tab = createBaseTab({ auth: { type: 'none' } });
      const result = validator.validate(tab);

      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar autenticação Bearer com token vazio', () => {
      const tab = createBaseTab({
        auth: { type: 'bearer', token: '   ', enabled: true },
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'AUTH_BEARER_TOKEN_REQUIRED',
            category: 'auth',
            field: 'auth',
          }),
        ]),
      );
    });

    it('deve rejeitar autenticação Bearer com variável de token ausente', () => {
      const tab = createBaseTab({
        auth: { type: 'bearer', token: '{{ authToken }}', enabled: true },
      });
      const env = createEnvironment([]);

      const result = validator.validate(tab, { environment: env });

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'VARIABLE_NOT_FOUND',
            variableName: 'authToken',
          }),
        ]),
      );
    });

    it('não deve vazar o valor do token na mensagem de erro', () => {
      const tab = createBaseTab({
        auth: { type: 'bearer', token: '{{ mySecret }}', enabled: true },
      });
      const env = createEnvironment([]);

      const result = validator.validate(tab, { environment: env });

      result.issues.forEach((issue) => {
        expect(issue.message).not.toContain('super-secret-password');
        expect(issue.remediation).not.toContain('super-secret-password');
      });
    });

    it('deve rejeitar autenticação Basic quando usuário e senha estiverem vazios', () => {
      const tab = createBaseTab({
        auth: { type: 'basic', username: '', password: '', enabled: true },
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'AUTH_BASIC_CREDENTIALS_REQUIRED',
            category: 'auth',
            field: 'auth',
          }),
        ]),
      );
    });

    it('deve rejeitar autenticação API Key com chave ou valor vazios', () => {
      const tab = createBaseTab({
        auth: { type: 'apiKey', key: '', value: 'xyz', addTo: 'header', enabled: true },
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'AUTH_API_KEY_REQUIRED',
            category: 'auth',
            field: 'auth',
          }),
        ]),
      );
    });

    it('deve rejeitar autenticação API Key com chave preenchida e valor vazio', () => {
      const tab = createBaseTab({
        auth: { type: 'apiKey', key: 'X-API-KEY', value: '   ', addTo: 'header', enabled: true },
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues[0]?.code).toBe('AUTH_API_KEY_REQUIRED');
    });

    it('deve aprovar autenticação API Key com chave e valor válidos', () => {
      const tab = createBaseTab({
        auth: { type: 'apiKey', key: 'X-API-KEY', value: 'secret-val', addTo: 'header', enabled: true },
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar autenticação OAuth2 com URL ou client id incompletos', () => {
      const tab = createBaseTab({
        auth: {
          type: 'oauth2',
          grantType: 'client_credentials',
          tokenUrl: '',
          clientId: '',
          enabled: true,
        },
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'AUTH_OAUTH2_CONFIG_INCOMPLETE',
            category: 'auth',
            field: 'auth',
          }),
        ]),
      );
    });

    it('deve rejeitar autenticação OAuth2 com URL preenchida e client id vazio', () => {
      const tab = createBaseTab({
        auth: {
          type: 'oauth2',
          grantType: 'client_credentials',
          tokenUrl: 'https://oauth.dino.dev/token',
          clientId: '   ',
          enabled: true,
        },
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(false);
      expect(result.issues[0]?.code).toBe('AUTH_OAUTH2_CONFIG_INCOMPLETE');
    });

    it('deve aprovar autenticação OAuth2 com URL e client id válidos', () => {
      const tab = createBaseTab({
        auth: {
          type: 'oauth2',
          grantType: 'client_credentials',
          tokenUrl: 'https://oauth.dino.dev/token',
          clientId: 'client-id-123',
          enabled: true,
        },
      });

      const result = validator.validate(tab);

      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar autenticação inherit quando não há coleção pai', () => {
      const tab = createBaseTab({
        auth: { type: 'inherit' },
      });

      const result = validator.validate(tab, { collection: null });

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'AUTH_INHERIT_PARENT_NOT_FOUND',
            category: 'auth',
            field: 'auth',
          }),
        ]),
      );
    });

    it('deve rejeitar autenticação inherit quando coleção pai tem auth none', () => {
      const tab = createBaseTab({
        auth: { type: 'inherit' },
      });
      const collection: Collection = {
        id: 'col-1',
        name: 'Coleção Raiz',
        auth: { type: 'none' },
        items: [],
      };

      const result = validator.validate(tab, { collection });

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'AUTH_INHERIT_PARENT_NOT_FOUND',
            category: 'auth',
          }),
        ]),
      );
    });

    it('deve aprovar autenticação inherit quando coleção pai possui auth válida', () => {
      const tab = createBaseTab({
        auth: { type: 'inherit' },
      });
      const collection: Collection = {
        id: 'col-1',
        name: 'Coleção Raiz',
        auth: { type: 'bearer', token: 'token-valido', enabled: true },
        items: [],
      };

      const result = validator.validate(tab, { collection });

      expect(result.isValid).toBe(true);
    });
  });

  describe('Validação de Configurações de Execução', () => {
    it('deve rejeitar timeout inválido ou menor/igual a zero', () => {
      const tab = createBaseTab();
      const result = validator.validate(tab, { environment: null }, -500);

      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'TIMEOUT_INVALID',
            category: 'execution',
            field: 'timeout',
          }),
        ]),
      );
    });

    it('deve aprovar timeout válido e positivo', () => {
      const tab = createBaseTab();
      const result = validator.validate(tab, { environment: null }, 5000);

      expect(result.isValid).toBe(true);
    });
  });
});
