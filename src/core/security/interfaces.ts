type AuthType =
  | 'none'
  | 'inherit'
  | 'bearer'
  | 'basic'
  | 'apiKey'
  | 'custom'
  | 'oauth2';

type ApiKeyPlacement = 'header' | 'query';

type OAuth2GrantType = 'client_credentials' | 'authorization_code';

type ClientAuthMethod = 'body' | 'basic_header';

interface NoAuthConfig {
  type: 'none';
}

interface InheritAuthConfig {
  type: 'inherit';
}

interface BearerAuthConfig {
  type: 'bearer';
  token: string;
  prefix?: string;
  enabled: boolean;
}

interface BasicAuthConfig {
  type: 'basic';
  username: string;
  password: string;
  enabled: boolean;
}

interface ApiKeyAuthConfig {
  type: 'apiKey';
  key: string;
  value: string;
  addTo: ApiKeyPlacement;
  enabled: boolean;
}

interface CustomAuthHeader {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface CustomAuthParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface CustomAuthConfig {
  type: 'custom';
  headers: CustomAuthHeader[];
  params: CustomAuthParam[];
  enabled: boolean;
}

interface OAuth2Config {
  type: 'oauth2';
  grantType: OAuth2GrantType;
  authUrl?: string;
  tokenUrl: string;
  clientId: string;
  clientSecret?: string;
  scope?: string;
  redirectUri?: string;
  clientAuthMethod?: ClientAuthMethod;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  codeVerifier?: string;
  state?: string;
  enabled: boolean;
}

type AuthConfig =
  | NoAuthConfig
  | InheritAuthConfig
  | BearerAuthConfig
  | BasicAuthConfig
  | ApiKeyAuthConfig
  | CustomAuthConfig
  | OAuth2Config;

interface ResolvedAuthData {
  headers: Record<string, string>;
  params: Record<string, string>;
  maskedHeaders?: Record<string, string>;
  maskedParams?: Record<string, string>;
  secrets: string[];
}

interface AuthContext {
  authConfig: AuthConfig;
  resolveVariable: (key: string) => string;
}

interface IAuthProvider<T extends AuthConfig = AuthConfig> {
  readonly type: AuthType;
  apply(context: { config: T; resolveVariable: (val: string) => string }): Promise<ResolvedAuthData>;
}

interface IAuthRegistry {
  register(provider: { readonly type: AuthType; apply(context: { config: AuthConfig; resolveVariable: (val: string) => string }): Promise<ResolvedAuthData> }): void;
  get(type: AuthType): IAuthProvider | null;
  has(type: AuthType): boolean;
}

interface ISecuritySecretsMasker {
  mask(value: string): string;
  maskRecord(record: Record<string, string>, secrets: string[]): Record<string, string>;
  maskUrl(url: string, secrets: string[]): string;
}

export type {
  AuthType,
  ApiKeyPlacement,
  OAuth2GrantType,
  ClientAuthMethod,
  NoAuthConfig,
  InheritAuthConfig,
  BearerAuthConfig,
  BasicAuthConfig,
  ApiKeyAuthConfig,
  CustomAuthHeader,
  CustomAuthParam,
  CustomAuthConfig,
  OAuth2Config,
  AuthConfig,
  ResolvedAuthData,
  AuthContext,
  IAuthProvider,
  IAuthRegistry,
  ISecuritySecretsMasker,
};

