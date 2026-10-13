import { describe, expect, it, vi } from 'vitest';
import { OAuth2Provider } from '../providers/oauth2.provider';

describe('OAuth2Provider', () => {
  const provider = new OAuth2Provider();

  it('should generate PKCE code verifier and code challenge (S256)', async () => {
    const pkce = await provider.generatePkcePair();

    expect(pkce.codeVerifier).toBeDefined();
    expect(pkce.codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(pkce.codeChallenge).toBeDefined();
    expect(pkce.codeChallengeMethod).toBe('S256');
  });

  it('should build authorization URL without leaking client secret', () => {
    const authUrl = provider.buildAuthorizationUrl({
      type: 'oauth2',
      grantType: 'authorization_code',
      authUrl: 'https://auth.example.com/oauth/authorize',
      tokenUrl: 'https://auth.example.com/oauth/token',
      clientId: 'my-client-id',
      clientSecret: 'super-confidential-secret',
      redirectUri: 'https://trex.app/callback',
      scope: 'read write',
      state: 'random-state-123',
      codeVerifier: 'verifier-123',
      enabled: true,
    }, 'challenge-456');

    expect(authUrl).toContain('client_id=my-client-id');
    expect(authUrl).toContain('redirect_uri=https%3A%2F%2Ftrex.app%2Fcallback');
    expect(authUrl).toContain('code_challenge=challenge-456');
    expect(authUrl).toContain('code_challenge_method=S256');
    expect(authUrl).not.toContain('super-confidential-secret');
  });

  it('should exchange client credentials for access token', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'new-oauth-token-123',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
    });

    const result = await provider.fetchClientCredentialsToken({
      type: 'oauth2',
      grantType: 'client_credentials',
      tokenUrl: 'https://auth.example.com/oauth/token',
      clientId: 'dino-client',
      clientSecret: 'dino-secret',
      scope: 'api',
      enabled: true,
    }, mockFetch);

    expect(result.accessToken).toBe('new-oauth-token-123');
    expect(result.expiresAt).toBeGreaterThan(Date.now());
  });

  it('should apply accessToken to Authorization header when enabled', async () => {
    const result = await provider.apply({
      config: {
        type: 'oauth2',
        grantType: 'client_credentials',
        tokenUrl: 'https://auth.example.com/token',
        clientId: 'id',
        accessToken: 'valid-token-xyz',
        enabled: true,
      },
      resolveVariable: (v: string) => v,
    });

    expect(result.headers.Authorization).toBe('Bearer valid-token-xyz');
    expect(result.secrets).toContain('valid-token-xyz');
  });
});

