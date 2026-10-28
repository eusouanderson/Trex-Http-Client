import { VariableResolverService } from '../../core/variables/variable-resolver.service';
import type {
  IVariableResolverService,
  VariableScope,
} from '../../core/variables/interfaces';
import type {
  IRequestValidatorService,
  PreparationContext,
  RequestTab,
  ValidationCategory,
  ValidationIssue,
  ValidationResult,
} from './interfaces';

const VALID_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);
const HEADER_NAME_REGEX = /^[!#$%&'*+\-.^_`|~0-9a-zA-Z]+$/;
const VARIABLE_REGEX = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

class RequestValidatorService implements IRequestValidatorService {
  constructor(
    private readonly variableResolver: IVariableResolverService = new VariableResolverService(),
  ) {}

  public validate(
    tab: RequestTab,
    context?: PreparationContext,
    timeoutMs?: number,
  ): ValidationResult {
    const issues: ValidationIssue[] = [];

    this.validateExecutionConfig(timeoutMs, issues);
    this.validateMethod(tab.method, issues);
    this.validateUrl(tab.url, context, issues);
    this.validateHeaders(tab, context, issues);
    this.validateParams(tab, context, issues);
    this.validateBody(tab, context, issues);
    this.validateAuth(tab, context, issues);

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  private validateExecutionConfig(timeoutMs: number | undefined, issues: ValidationIssue[]): void {
    if (timeoutMs !== undefined && timeoutMs <= 0) {
      issues.push(
        this.createIssue(
          'TIMEOUT_INVALID',
          'execution',
          'O tempo limite (timeout) deve ser um número positivo maior que zero.',
          'Configure um valor de timeout válido em milissegundos.',
          'timeout',
        ),
      );
    }
  }

  private validateMethod(method: RequestTab['method'], issues: ValidationIssue[]): void {
    if (!VALID_METHODS.has(method)) {
      issues.push(
        this.createIssue(
          'METHOD_INVALID',
          'url',
          `Método HTTP "${method}" é inválido ou não suportado.`,
          'Selecione um método HTTP padrão como GET, POST, PUT, DELETE, PATCH, HEAD ou OPTIONS.',
          'method',
        ),
      );
    }
  }

  private validateUrl(
    rawUrl: string,
    context: PreparationContext | undefined,
    issues: ValidationIssue[],
  ): void {
    if (rawUrl.trim().length === 0) {
      issues.push(
        this.createIssue(
          'URL_EMPTY',
          'url',
          'A URL da requisição não pode estar vazia.',
          'Informe uma URL válida ou um caminho relativo.',
          'url',
        ),
      );
      return;
    }

    if (this.hasControlChars(rawUrl)) {
      issues.push(
        this.createIssue(
          'URL_MALFORMED',
          'url',
          'A URL contém quebras de linha ou caracteres de controle inválidos.',
          'Remova caracteres de controle e quebras de linha da URL.',
          'url',
        ),
      );
      return;
    }

    const openCount = (rawUrl.match(/\{\{/g) ?? []).length;
    const closeCount = (rawUrl.match(/\}\}/g) ?? []).length;
    if (openCount !== closeCount) {
      issues.push(
        this.createIssue(
          'URL_MALFORMED',
          'url',
          'A URL contém marcadores de variável incompletos ou não fechados.',
          'Feche todas as chaves duplas {{ variavel }} corretamente.',
          'url',
        ),
      );
      return;
    }

    const protocolMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):(\/\/)?/.exec(rawUrl.trim());
    if (protocolMatch) {
      const protocol = protocolMatch[1]?.toLowerCase();
      if (protocol !== undefined && protocol !== 'http' && protocol !== 'https') {
        issues.push(
          this.createIssue(
            'PROTOCOL_UNSUPPORTED',
            'url',
            `O protocolo "${protocol}" não é suportado pelo cliente HTTP.`,
            'Utilize apenas os protocolos suportados: http:// ou https://.',
            'url',
          ),
        );
        return;
      }
    }

    const urlVars = this.extractVariableNames(rawUrl);
    this.validateVariablesInText(urlVars, context, issues);

    const scopes = this.buildScopes(context);
    const resolvedUrlResult = this.variableResolver.resolve(rawUrl, scopes);
    const resolvedUrl = resolvedUrlResult.resolved.trim();

    if (urlVars.length > 0 && context?.environment) {
      for (const varName of urlVars) {
        const envVar = context.environment.variables.find((v) => v.key === varName);
        if (envVar && envVar.enabled && envVar.value.trim().length === 0 && resolvedUrl.length === 0) {
          issues.push(
            this.createIssue(
              'VARIABLE_VALUE_EMPTY',
              'variable',
              `A variável "${varName}" está configurada com valor vazio e resulta em URL inválida.`,
              `Defina um valor para a variável "${varName}" no ambiente ativo.`,
              'url',
              varName,
            ),
          );
          return;
        }
      }
    }

    if (resolvedUrlResult.unresolvedKeys.length > 0 && context?.environment) {
      const env = context.environment;
      const isCyclic = resolvedUrlResult.unresolvedKeys.some((k) =>
        env.variables.some((v) => v.key === k && v.enabled),
      );
      if (isCyclic) {
        issues.push(
          this.createIssue(
            'VARIABLE_UNRESOLVED',
            'variable',
            'Não foi possível resolver uma ou mais variáveis devido a dependências circulares.',
            'Verifique a definição das variáveis no ambiente e remova referências cíclicas.',
            'url',
          ),
        );
        return;
      }
    }

    if (urlVars.length > 0 && issues.length === 0) {
      if (resolvedUrl.startsWith('://') || (!resolvedUrl.startsWith('/') && !this.isValidAbsoluteUrl(resolvedUrl))) {
        issues.push(
          this.createIssue(
            'URL_INVALID_AFTER_INTERPOLATION',
            'url',
            'A URL resultante da substituição de variáveis é inválida.',
            'Verifique os valores das variáveis aplicadas na URL.',
            'url',
          ),
        );
        return;
      }
    }

    if (urlVars.length === 0 && !rawUrl.startsWith('/') && !this.isValidAbsoluteUrl(rawUrl)) {
      issues.push(
        this.createIssue(
          'URL_MALFORMED',
          'url',
          'O formato da URL é inválido.',
          'Verifique a estrutura da URL e garanta um domínio e caminho válidos.',
          'url',
        ),
      );
    }
  }

  private validateHeaders(
    tab: RequestTab,
    context: PreparationContext | undefined,
    issues: ValidationIssue[],
  ): void {
    for (const h of tab.headers) {
      if (!h.enabled) {
        continue;
      }
      const trimmedKey = h.key.trim();
      if (trimmedKey.length === 0) {
        issues.push(
          this.createIssue(
            'HEADER_NAME_EMPTY',
            'header',
            'Existe um cabeçalho habilitado com o nome vazio.',
            'Defina o nome do cabeçalho ou desabilite o item.',
            'headers',
          ),
        );
        continue;
      }

      if (!HEADER_NAME_REGEX.test(trimmedKey)) {
        issues.push(
          this.createIssue(
            'HEADER_NAME_INVALID',
            'header',
            `O cabeçalho "${trimmedKey}" contém caracteres inválidos em seu nome.`,
            'Utilize apenas caracteres válidos segundo o padrão RFC 7230.',
            'headers',
          ),
        );
      }

      const keyVars = this.extractVariableNames(h.key);
      const valVars = this.extractVariableNames(h.value);
      this.validateVariablesInText([...keyVars, ...valVars], context, issues);
    }
  }

  private validateParams(
    tab: RequestTab,
    context: PreparationContext | undefined,
    issues: ValidationIssue[],
  ): void {
    for (const p of tab.params) {
      if (!p.enabled) {
        continue;
      }
      const keyVars = this.extractVariableNames(p.key);
      const valVars = this.extractVariableNames(p.value);
      this.validateVariablesInText([...keyVars, ...valVars], context, issues);
    }
  }

  private validateBody(
    tab: RequestTab,
    context: PreparationContext | undefined,
    issues: ValidationIssue[],
  ): void {
    const hasBodyContent = tab.body.trim().length > 0;

    if (tab.method === 'GET' || tab.method === 'HEAD') {
      if (tab.bodyType !== 'none' && hasBodyContent) {
        issues.push(
          this.createIssue(
            'BODY_NOT_ALLOWED',
            'body',
            `O método HTTP ${tab.method} não permite corpo de requisição.`,
            'Remova o corpo da requisição ou altere o tipo para "none".',
            'body',
          ),
        );
        return;
      }
    }

    if (tab.bodyType === 'none' || !hasBodyContent) {
      return;
    }

    const bodyVars = this.extractVariableNames(tab.body);
    this.validateVariablesInText(bodyVars, context, issues);

    if (tab.bodyType === 'json') {
      const scopes = this.buildScopes(context);
      const resolvedBody = this.variableResolver.resolve(tab.body, scopes).resolved;

      try {
        JSON.parse(resolvedBody);
      } catch {
        issues.push(
          this.createIssue(
            'JSON_SYNTAX_INVALID',
            'body',
            'O corpo em formato JSON contém sintaxe inválida.',
            'Verifique se o JSON está bem formatado com aspas duplas e chaves correspondentes.',
            'body',
          ),
        );
      }
    }
  }

  private validateAuth(
    tab: RequestTab,
    context: PreparationContext | undefined,
    issues: ValidationIssue[],
  ): void {
    const auth = tab.auth;
    if (!auth || auth.type === 'none') {
      return;
    }

    if (auth.type === 'bearer') {
      const token = auth.token;
      const tokenVars = this.extractVariableNames(token);
      this.validateVariablesInText(tokenVars, context, issues);

      if (token.trim().length === 0) {
        issues.push(
          this.createIssue(
            'AUTH_BEARER_TOKEN_REQUIRED',
            'auth',
            'A autenticação Bearer exige a configuração de um token.',
            'Informe um token Bearer válido ou use variáveis de ambiente.',
            'auth',
          ),
        );
      }
      return;
    }

    if (auth.type === 'basic') {
      const username = auth.username;
      const password = auth.password;
      const vars = [...this.extractVariableNames(username), ...this.extractVariableNames(password)];
      this.validateVariablesInText(vars, context, issues);

      if (username.trim().length === 0 && password.trim().length === 0) {
        issues.push(
          this.createIssue(
            'AUTH_BASIC_CREDENTIALS_REQUIRED',
            'auth',
            'A autenticação Basic exige o preenchimento de usuário e/ou senha.',
            'Preencha as credenciais ou selecione outro tipo de autenticação.',
            'auth',
          ),
        );
      }
      return;
    }

    if (auth.type === 'apiKey') {
      const key = auth.key;
      const value = auth.value;
      const vars = [...this.extractVariableNames(key), ...this.extractVariableNames(value)];
      this.validateVariablesInText(vars, context, issues);

      if (key.trim().length === 0 || value.trim().length === 0) {
        issues.push(
          this.createIssue(
            'AUTH_API_KEY_REQUIRED',
            'auth',
            'A autenticação via API Key exige o preenchimento da chave e do valor.',
            'Preencha a chave e o valor da API Key.',
            'auth',
          ),
        );
      }
      return;
    }

    if (auth.type === 'oauth2') {
      const tokenUrl = auth.tokenUrl;
      const clientId = auth.clientId;
      const vars = [...this.extractVariableNames(tokenUrl), ...this.extractVariableNames(clientId)];
      this.validateVariablesInText(vars, context, issues);

      if (tokenUrl.trim().length === 0 || clientId.trim().length === 0) {
        issues.push(
          this.createIssue(
            'AUTH_OAUTH2_CONFIG_INCOMPLETE',
            'auth',
            'A autenticação OAuth2 está incompleta.',
            'Preencha a URL de token e o Client ID.',
            'auth',
          ),
        );
      }
      return;
    }

    if (auth.type === 'inherit') {
      const parentAuth = context?.collection?.auth;
      if (!parentAuth || parentAuth.type === 'none' || parentAuth.type === 'inherit') {
        issues.push(
          this.createIssue(
            'AUTH_INHERIT_PARENT_NOT_FOUND',
            'auth',
            'A autenticação configurada como herdada não encontrou configurações válidas na coleção pai.',
            'Configure uma autenticação válida na coleção pai ou altere a autenticação desta requisição.',
            'auth',
          ),
        );
      }
    }
  }

  private validateVariablesInText(
    varNames: string[],
    context: PreparationContext | undefined,
    issues: ValidationIssue[],
  ): void {
    for (const varName of varNames) {
      if (!context?.environment) {
        issues.push(
          this.createIssue(
            'ENVIRONMENT_REQUIRED',
            'environment',
            `Não foi possível resolver a variável "${varName}" porque nenhum ambiente está selecionado.`,
            'Selecione um ambiente ativo ou defina o valor explicitamente.',
            undefined,
            varName,
          ),
        );
        continue;
      }

      const envVar = context.environment.variables.find((v) => v.key === varName);
      if (!envVar) {
        issues.push(
          this.createIssue(
            'VARIABLE_NOT_FOUND',
            'variable',
            `A variável "${varName}" não existe no ambiente selecionado.`,
            `Crie a variável "${varName}" no ambiente ativo ou ajuste seu nome.`,
            undefined,
            varName,
          ),
        );
      } else if (!envVar.enabled) {
        issues.push(
          this.createIssue(
            'VARIABLE_DISABLED',
            'variable',
            `A variável "${varName}" está desabilitada no ambiente selecionado.`,
            `Habilite a variável "${varName}" no ambiente ativo.`,
            undefined,
            varName,
          ),
        );
      }
    }
  }

  private extractVariableNames(text: string): string[] {
    const keys: string[] = [];
    const matches = text.matchAll(VARIABLE_REGEX);
    for (const match of matches) {
      const rawKey = match[1];
      if (rawKey !== undefined) {
        const key = rawKey.trim();
        if (key.length > 0 && !keys.includes(key)) {
          keys.push(key);
        }
      }
    }
    return keys;
  }

  private hasControlChars(text: string): boolean {
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code < 32 || code === 127) {
        return true;
      }
    }
    return false;
  }

  private buildScopes(context: PreparationContext | undefined): VariableScope[] {
    const scopes: VariableScope[] = [];
    if (context?.environment) {
      const envVars: Record<string, string> = {};
      for (const v of context.environment.variables) {
        if (v.enabled) {
          envVars[v.key] = v.value;
        }
      }
      scopes.push({ name: 'environment', variables: envVars });
    }
    return scopes;
  }

  private isValidAbsoluteUrl(value: string): boolean {
    try {
      const parsed = new URL(value);
      return (
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        parsed.hostname.length > 0
      );
    } catch {
      return false;
    }
  }

  private createIssue(
    code: string,
    category: ValidationCategory,
    message: string,
    remediation: string,
    field?: string,
    variableName?: string,
  ): ValidationIssue {
    return {
      code,
      category,
      message,
      remediation,
      field,
      variableName,
    };
  }
}

const requestValidatorService = new RequestValidatorService();

export { RequestValidatorService, requestValidatorService };
