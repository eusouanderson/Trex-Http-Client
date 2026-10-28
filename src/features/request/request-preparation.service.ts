import type {
  AuthConfig,
  IAuthRegistry,
} from '../../core/security/interfaces';
import { SecretsMaskerService } from '../../core/security/secrets-masker.service';
import type {
  IVariableResolverService,
  VariableScope,
} from '../../core/variables/interfaces';
import type {
  PreparationContext,
  PreparedRequest,
  RequestTab,
} from './interfaces';

class RequestPreparationService {
  private readonly secretsMasker = new SecretsMaskerService();

  constructor(
    private readonly authRegistry: IAuthRegistry,
    private readonly variableResolver: IVariableResolverService,
  ) {}

  public async prepare(
    tab: RequestTab,
    context?: PreparationContext,
  ): Promise<PreparedRequest> {
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

    const resolveVar = (text: string): string => {
      return this.variableResolver.resolve(text, scopes).resolved;
    };

    const resolvedUrl = resolveVar(tab.url);
    const resolvedBody = resolveVar(tab.body);

    const manualHeaders: Record<string, string> = {};
    for (const h of tab.headers) {
      if (h.enabled && h.key.trim().length > 0) {
        manualHeaders[resolveVar(h.key).trim()] = resolveVar(h.value);
      }
    }

    const manualParams: Record<string, string> = {};
    for (const p of tab.params) {
      if (p.enabled && p.key.trim().length > 0) {
        manualParams[resolveVar(p.key).trim()] = resolveVar(p.value);
      }
    }

    const effectiveAuth = this.resolveEffectiveAuth(tab.auth, context?.collection?.auth);

    const collectedSecrets: string[] = [];
    let authHeaders: Record<string, string> = {};
    let authParams: Record<string, string> = {};

    if (effectiveAuth && effectiveAuth.type !== 'none' && effectiveAuth.type !== 'inherit') {
      const provider = this.authRegistry.get(effectiveAuth.type);
      if (provider) {
        const authResult = await provider.apply({
          config: effectiveAuth,
          resolveVariable: resolveVar,
        });
        authHeaders = authResult.headers;
        authParams = authResult.params;
        collectedSecrets.push(...authResult.secrets);
      }
    }

    const mergedHeaders: Record<string, string> = {
      ...authHeaders,
      ...manualHeaders,
    };

    const mergedParams: Record<string, string> = {
      ...authParams,
      ...manualParams,
    };

    const maskedHeaders = this.secretsMasker.maskRecord(mergedHeaders, collectedSecrets);
    const maskedParams = this.secretsMasker.maskRecord(mergedParams, collectedSecrets);
    const maskedUrl = this.secretsMasker.maskUrl(resolvedUrl, collectedSecrets);

    return {
      url: resolvedUrl,
      method: tab.method,
      headers: mergedHeaders,
      params: mergedParams,
      body: resolvedBody,
      maskedHeaders,
      maskedParams,
      maskedUrl,
      secrets: collectedSecrets,
    };
  }

  private resolveEffectiveAuth(
    tabAuth?: AuthConfig,
    collectionAuth?: AuthConfig,
  ): AuthConfig | null {
    if (!tabAuth || tabAuth.type === 'inherit') {
      if (collectionAuth) {
        return collectionAuth;
      }
      return null;
    }
    return tabAuth;
  }
}

export {
  RequestPreparationService,
  type PreparationContext,
  type PreparedRequest,
};

