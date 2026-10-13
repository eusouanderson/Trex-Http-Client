import type { ComputedRef, Ref } from 'vue';
import type {
  ApiKeyPlacement,
  AuthConfig,
  AuthType,
  CustomAuthConfig,
  OAuth2Config,
} from '../../../core/security/interfaces';

interface AuthEditorProps {
  modelValue?: AuthConfig;
  inheritedAuth?: AuthConfig | null;
}

type AuthEditorEmits = (e: 'update:modelValue', value: AuthConfig) => void;

interface AuthTypeOption {
  type: AuthType;
  label: string;
  description: string;
}

interface UseAuthEditorReturn {
  authTypeOptions: AuthTypeOption[];
  currentAuth: Ref<AuthConfig>;
  authType: ComputedRef<AuthType>;
  isSecretVisible: Ref<boolean>;
  inheritedAuth?: AuthConfig | null;
  toggleSecretVisibility: () => void;
  setAuthType: (type: AuthType) => void;
  updateBearerToken: (token: string, prefix?: string) => void;
  updateBasicAuth: (username: string, password: string) => void;
  updateApiKeyAuth: (key: string, value: string, addTo: ApiKeyPlacement) => void;
  updateOAuth2: (patch: Partial<OAuth2Config>) => void;
  updateCustom: (patch: Partial<CustomAuthConfig>) => void;
}

export type {
  AuthEditorProps,
  AuthEditorEmits,
  AuthTypeOption,
  UseAuthEditorReturn,
};

