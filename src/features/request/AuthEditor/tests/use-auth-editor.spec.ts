import { describe, expect, it } from 'vitest';
import { useAuthEditor } from '../use-auth-editor';
import type { AuthConfig, BearerAuthConfig, BasicAuthConfig, ApiKeyAuthConfig } from '../../../../core/security/interfaces';

describe('useAuthEditor', () => {
  it('should initialize with default No Auth when modelValue is undefined', () => {
    const { currentAuth, authType } = useAuthEditor();

    expect(authType.value).toBe('none');
    expect(currentAuth.value.type).toBe('none');
  });

  it('should change auth type and emit update:modelValue', () => {
    let emitted: AuthConfig | null = null;
    const emit = (_event: 'update:modelValue', val: AuthConfig): void => {
      emitted = val;
    };

    const { setAuthType, authType } = useAuthEditor(undefined, undefined, emit);
    setAuthType('bearer');

    expect(authType.value).toBe('bearer');
    expect(emitted).not.toBeNull();
    expect((emitted as unknown as BearerAuthConfig).type).toBe('bearer');
  });

  it('should toggle secret visibility', () => {
    const { isSecretVisible, toggleSecretVisibility } = useAuthEditor();

    expect(isSecretVisible.value).toBe(false);
    toggleSecretVisibility();
    expect(isSecretVisible.value).toBe(true);
  });

  it('should update bearer token and emit changes', () => {
    let emitted: AuthConfig | null = null;
    const emit = (_event: 'update:modelValue', val: AuthConfig): void => {
      emitted = val;
    };

    const initial: BearerAuthConfig = { type: 'bearer', token: '', enabled: true };
    const { updateBearerToken, currentAuth } = useAuthEditor(initial, undefined, emit);

    updateBearerToken('new-token-123');

    expect((currentAuth.value as BearerAuthConfig).token).toBe('new-token-123');
    expect((emitted as unknown as BearerAuthConfig).token).toBe('new-token-123');
  });

  it('should update basic auth credentials', () => {
    let emitted: AuthConfig | null = null;
    const emit = (_event: 'update:modelValue', val: AuthConfig): void => {
      emitted = val;
    };

    const initial: BasicAuthConfig = { type: 'basic', username: '', password: '', enabled: true };
    const { updateBasicAuth } = useAuthEditor(initial, undefined, emit);

    updateBasicAuth('admin', '123456');

    expect((emitted as unknown as BasicAuthConfig).username).toBe('admin');
    expect((emitted as unknown as BasicAuthConfig).password).toBe('123456');
  });

  it('should update apiKey auth parameters', () => {
    let emitted: AuthConfig | null = null;
    const emit = (_event: 'update:modelValue', val: AuthConfig): void => {
      emitted = val;
    };

    const initial: ApiKeyAuthConfig = { type: 'apiKey', key: '', value: '', addTo: 'header', enabled: true };
    const { updateApiKeyAuth } = useAuthEditor(initial, undefined, emit);

    updateApiKeyAuth('X-Token', 'secret-val', 'query');

    expect((emitted as unknown as ApiKeyAuthConfig).key).toBe('X-Token');
    expect((emitted as unknown as ApiKeyAuthConfig).value).toBe('secret-val');
    expect((emitted as unknown as ApiKeyAuthConfig).addTo).toBe('query');
  });

  it('should update oauth2 and custom configurations', () => {
    const state = { emitted: null as AuthConfig | null };
    const emit = (_event: 'update:modelValue', val: AuthConfig): void => {
      state.emitted = val;
    };

    const { setAuthType, updateOAuth2, updateCustom } = useAuthEditor(undefined, undefined, emit);

    setAuthType('inherit');
    expect(state.emitted?.type).toBe('inherit');

    setAuthType('basic');
    expect(state.emitted?.type).toBe('basic');

    setAuthType('apiKey');
    expect(state.emitted?.type).toBe('apiKey');

    setAuthType('none');
    expect(state.emitted?.type).toBe('none');

    setAuthType('custom');
    expect(state.emitted?.type).toBe('custom');
    updateCustom({ headers: [{ id: '1', key: 'h', value: 'v', enabled: true }] });
    expect(state.emitted?.type).toBe('custom');

    setAuthType('oauth2');
    expect(state.emitted?.type).toBe('oauth2');
    updateOAuth2({ clientId: 'oauth-client-id' });
    expect(state.emitted?.type).toBe('oauth2');

    setAuthType('none');
    updateOAuth2({ clientId: 'fallback-client' });
    expect(state.emitted?.type).toBe('oauth2');

    setAuthType('none');
    updateCustom({ headers: [{ id: '9', key: 'h', value: 'v', enabled: true }] });
    expect(state.emitted?.type).toBe('custom');
  });
});

