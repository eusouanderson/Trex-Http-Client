import { computed, ref, watch } from 'vue';
import type {
  ApiKeyAuthConfig,
  ApiKeyPlacement,
  AuthConfig,
  AuthType,
  BasicAuthConfig,
  BearerAuthConfig,
  CustomAuthConfig,
  OAuth2Config,
} from '../../../core/security/interfaces';
import type { AuthEditorEmits, AuthTypeOption, UseAuthEditorReturn } from './interfaces';

const authTypeOptions: AuthTypeOption[] = [
  { type: 'none', label: 'No Auth', description: 'Nenhuma autenticação anexada' },
  { type: 'inherit', label: 'Herdar da Coleção', description: 'Utiliza as credenciais definidas na coleção pai' },
  { type: 'bearer', label: 'Bearer Token', description: 'Token de portador no header Authorization' },
  { type: 'basic', label: 'Basic Auth', description: 'Usuário e senha codificados em Base64' },
  { type: 'apiKey', label: 'API Key', description: 'Chave de API enviada no cabeçalho ou na query' },
  { type: 'oauth2', label: 'OAuth 2.0', description: 'Fluxos OAuth 2.0 (Client Credentials e Authorization Code com PKCE)' },
  { type: 'custom', label: 'Custom Auth', description: 'Headers e parâmetros personalizados de autenticação' },
];

const useAuthEditor = (
  initialValue?: AuthConfig,
  inheritedAuth?: AuthConfig | null,
  emit?: AuthEditorEmits,
): UseAuthEditorReturn => {
  const currentAuth = ref<AuthConfig>(initialValue ?? { type: 'none' });
  const isSecretVisible = ref<boolean>(false);

  watch(
    () => initialValue,
    (newVal) => {
      if (newVal) {
        currentAuth.value = newVal;
      }
    },
  );

  const authType = computed<AuthType>(() => currentAuth.value.type);

  const toggleSecretVisibility = (): void => {
    isSecretVisible.value = !isSecretVisible.value;
  };

  const notifyChange = (updated: AuthConfig): void => {
    currentAuth.value = updated;
    if (emit) {
      emit('update:modelValue', updated);
    }
  };

  const setAuthType = (type: AuthType): void => {
    if (type === 'none') {
      notifyChange({ type: 'none' });
    } else if (type === 'inherit') {
      notifyChange({ type: 'inherit' });
    } else if (type === 'bearer') {
      notifyChange({ type: 'bearer', token: '', prefix: 'Bearer', enabled: true });
    } else if (type === 'basic') {
      notifyChange({ type: 'basic', username: '', password: '', enabled: true });
    } else if (type === 'apiKey') {
      notifyChange({ type: 'apiKey', key: '', value: '', addTo: 'header', enabled: true });
    } else if (type === 'custom') {
      notifyChange({ type: 'custom', headers: [], params: [], enabled: true });
    } else {
      notifyChange({
        type: 'oauth2',
        grantType: 'client_credentials',
        tokenUrl: '',
        clientId: '',
        clientSecret: '',
        scope: '',
        enabled: true,
      });
    }
  };

  const updateBearerToken = (token: string, prefix?: string): void => {
    const updated: BearerAuthConfig = {
      type: 'bearer',
      token,
      prefix: prefix ?? 'Bearer',
      enabled: true,
    };
    notifyChange(updated);
  };

  const updateBasicAuth = (username: string, password: string): void => {
    const updated: BasicAuthConfig = {
      type: 'basic',
      username,
      password,
      enabled: true,
    };
    notifyChange(updated);
  };

  const updateApiKeyAuth = (
    key: string,
    value: string,
    addTo: ApiKeyPlacement,
  ): void => {
    const updated: ApiKeyAuthConfig = {
      type: 'apiKey',
      key,
      value,
      addTo,
      enabled: true,
    };
    notifyChange(updated);
  };

  const updateOAuth2 = (patch: Partial<OAuth2Config>): void => {
    const base = currentAuth.value.type === 'oauth2'
      ? currentAuth.value
      : {
          type: 'oauth2' as const,
          grantType: 'client_credentials' as const,
          tokenUrl: '',
          clientId: '',
          enabled: true,
        };
    const updated: OAuth2Config = {
      ...base,
      ...patch,
      type: 'oauth2',
      enabled: true,
    };
    notifyChange(updated);
  };

  const updateCustom = (patch: Partial<CustomAuthConfig>): void => {
    const base = currentAuth.value.type === 'custom'
      ? currentAuth.value
      : {
          type: 'custom' as const,
          headers: [],
          params: [],
          enabled: true,
        };
    const updated: CustomAuthConfig = {
      ...base,
      ...patch,
      type: 'custom',
      enabled: true,
    };
    notifyChange(updated);
  };

  return {
    authTypeOptions,
    currentAuth,
    authType,
    isSecretVisible,
    inheritedAuth,
    toggleSecretVisibility,
    setAuthType,
    updateBearerToken,
    updateBasicAuth,
    updateApiKeyAuth,
    updateOAuth2,
    updateCustom,
  };
};

export { useAuthEditor, authTypeOptions };

