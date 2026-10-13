import type {
  IAuthProvider,
  OAuth2Config,
  ResolvedAuthData,
} from '../interfaces';

interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}

interface OAuthTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  expiresAt?: number;
  refreshToken?: string;
}

class OAuth2Provider implements IAuthProvider<OAuth2Config> {
  public readonly type = 'oauth2';

  public apply(context: {
    config: OAuth2Config;
    resolveVariable: (val: string) => string;
  }): Promise<ResolvedAuthData> {
    const { config, resolveVariable } = context;

    if (!config.enabled) {
      return Promise.resolve({ headers: {}, params: {}, secrets: [] });
    }

    const token = config.accessToken !== undefined && config.accessToken.length > 0
      ? resolveVariable(config.accessToken).trim()
      : '';
    if (token.length === 0) {
      return Promise.resolve({ headers: {}, params: {}, secrets: [] });
    }

    return Promise.resolve({
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {},
      secrets: [token],
    });
  }

  public async generatePkcePair(): Promise<PkcePair> {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const codeVerifier = this.base64UrlEncode(randomBytes);

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = this.base64UrlEncode(new Uint8Array(digest));

    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256',
    };
  }

  public buildAuthorizationUrl(config: OAuth2Config, codeChallenge?: string): string {
    if (config.authUrl === undefined || config.authUrl.length === 0) {
      throw new Error('OAuth 2.0 authorization URL is required');
    }

    const url = new URL(config.authUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', config.clientId);

    if (config.redirectUri !== undefined && config.redirectUri.length > 0) {
      url.searchParams.set('redirect_uri', config.redirectUri);
    }
    if (config.scope !== undefined && config.scope.length > 0) {
      url.searchParams.set('scope', config.scope);
    }
    if (config.state !== undefined && config.state.length > 0) {
      url.searchParams.set('state', config.state);
    }
    if (codeChallenge !== undefined && codeChallenge.length > 0) {
      url.searchParams.set('code_challenge', codeChallenge);
      url.searchParams.set('code_challenge_method', 'S256');
    }

    return url.toString();
  }

  public async fetchClientCredentialsToken(
    config: OAuth2Config,
    customFetch?: typeof fetch,
  ): Promise<OAuthTokenResponse> {
    const fetchFn = customFetch ?? fetch;
    const bodyParams = new URLSearchParams();
    bodyParams.set('grant_type', 'client_credentials');

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (config.clientAuthMethod === 'basic_header') {
      const creds = btoa(`${config.clientId}:${config.clientSecret ?? ''}`);
      headers.Authorization = `Basic ${creds}`;
    } else {
      bodyParams.set('client_id', config.clientId);
      if (config.clientSecret !== undefined && config.clientSecret.length > 0) {
        bodyParams.set('client_secret', config.clientSecret);
      }
    }

    if (config.scope !== undefined && config.scope.length > 0) {
      bodyParams.set('scope', config.scope);
    }

    const response = await fetchFn(config.tokenUrl, {
      method: 'POST',
      headers,
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      throw new Error(`OAuth 2.0 token request failed with status ${String(response.status)}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      token_type?: string;
      expires_in?: number;
      refresh_token?: string;
    };

    const expiresIn = data.expires_in ?? 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    return {
      accessToken: data.access_token,
      tokenType: data.token_type ?? 'Bearer',
      expiresIn,
      expiresAt,
      refreshToken: data.refresh_token,
    };
  }

  private base64UrlEncode(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      const b = bytes[i];
      if (b !== undefined) {
        binary += String.fromCharCode(b);
      }
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}

export { OAuth2Provider, type PkcePair, type OAuthTokenResponse };
