import { describe, expect, it } from 'vitest';
import { RequestPreparationService } from '../request-preparation.service';
import type { RequestTab } from '../interfaces';
import type { Collection } from '../../collections/interfaces';
import type { Environment } from '../../environments/interfaces';
import { createDefaultAuthRegistry } from '../../../core/security';
import { VariableResolverService } from '../../../core/variables';

describe('RequestPreparationService', () => {
  const authRegistry = createDefaultAuthRegistry();
  const variableResolver = new VariableResolverService();
  const preparationService = new RequestPreparationService(authRegistry, variableResolver);

  it('should interpolate url, headers, params and body from active environment', async () => {
    const tab: RequestTab = {
      id: 'tab-1',
      name: 'Req',
      method: 'POST',
      url: '{{base_url}}/api/users',
      params: [{ id: '1', key: 'filter', value: '{{filter_val}}', enabled: true }],
      headers: [{ id: '2', key: 'X-Tenant', value: '{{tenant}}', enabled: true }],
      bodyType: 'json',
      body: JSON.stringify({ user: '{{user_name}}' }),
      isDirty: false,
    };

    const env: Environment = {
      id: 'env-1',
      name: 'Dev',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      variables: [
        { id: 'v1', key: 'base_url', value: 'https://api.dev', enabled: true },
        { id: 'v2', key: 'filter_val', value: 'active', enabled: true },
        { id: 'v3', key: 'tenant', value: 'dino-corp', enabled: true },
        { id: 'v4', key: 'user_name', value: 'Rex', enabled: true },
      ],
    };

    const prepared = await preparationService.prepare(tab, { environment: env });

    expect(prepared.url).toBe('https://api.dev/api/users');
    expect(prepared.params.filter).toBe('active');
    expect(prepared.headers['X-Tenant']).toBe('dino-corp');
    expect(prepared.body).toContain('"Rex"');
  });

  it('should apply Bearer token auth defined on the request', async () => {
    const tab: RequestTab = {
      id: 'tab-2',
      name: 'Req',
      method: 'GET',
      url: 'https://api.dev/me',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      auth: {
        type: 'bearer',
        token: 'secret-token-xyz',
        enabled: true,
      },
      isDirty: false,
    };

    const prepared = await preparationService.prepare(tab);

    expect(prepared.headers.Authorization).toBe('Bearer secret-token-xyz');
    expect(prepared.maskedHeaders.Authorization).toBe('Bearer ••••••••');
    expect(prepared.secrets).toContain('secret-token-xyz');
  });

  it('should inherit auth from collection when request auth is inherit or undefined', async () => {
    const collection: Collection = {
      id: 'col-1',
      name: 'Col',
      auth: {
        type: 'bearer',
        token: 'col-token-abc',
        enabled: true,
      },
      items: [],
    };

    const tab: RequestTab = {
      id: 'tab-3',
      name: 'Req',
      method: 'GET',
      url: 'https://api.dev/status',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      auth: { type: 'inherit' },
      isDirty: false,
    };

    const prepared = await preparationService.prepare(tab, { collection });

    expect(prepared.headers.Authorization).toBe('Bearer col-token-abc');
  });

  it('should override collection auth when request explicitly defines none', async () => {
    const collection: Collection = {
      id: 'col-1',
      name: 'Col',
      auth: {
        type: 'bearer',
        token: 'col-token-abc',
        enabled: true,
      },
      items: [],
    };

    const tab: RequestTab = {
      id: 'tab-4',
      name: 'Req',
      method: 'GET',
      url: 'https://api.dev/public',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      auth: { type: 'none' },
      isDirty: false,
    };

    const prepared = await preparationService.prepare(tab, { collection });

    expect(prepared.headers.Authorization).toBeUndefined();
  });

  it('should resolve conflicts giving priority to explicit manual headers over auto-generated auth', async () => {
    const tab: RequestTab = {
      id: 'tab-5',
      name: 'Req',
      method: 'GET',
      url: 'https://api.dev/status',
      params: [],
      headers: [
        { id: 'h1', key: 'Authorization', value: 'CustomManualAuth 123', enabled: true },
      ],
      bodyType: 'none',
      body: '',
      auth: {
        type: 'bearer',
        token: 'auto-generated-token',
        enabled: true,
      },
      isDirty: false,
    };

    const prepared = await preparationService.prepare(tab);

    expect(prepared.headers.Authorization).toBe('CustomManualAuth 123');
  });
});
