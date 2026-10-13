import { describe, expect, it } from 'vitest';
import { VariableResolverService } from '../variable-resolver.service';
import type { VariableScope } from '../interfaces';

describe('VariableResolverService', () => {
  const service = new VariableResolverService();

  it('should return unchanged text when there are no placeholders', () => {
    const scopes: VariableScope[] = [{ name: 'env', variables: { key: 'val' } }];
    const result = service.resolve('https://api.dinossauro.dev/fossils', scopes);

    expect(result.resolved).toBe('https://api.dinossauro.dev/fossils');
    expect(result.unresolvedKeys).toEqual([]);
  });

  it('should resolve variable from active scope', () => {
    const scopes: VariableScope[] = [
      { name: 'env', variables: { base_url: 'https://api.dev', id: '42' } },
    ];
    const result = service.resolve('{{base_url}}/items/{{id}}', scopes);

    expect(result.resolved).toBe('https://api.dev/items/42');
    expect(result.unresolvedKeys).toEqual([]);
  });

  it('should respect scope precedence (first matching scope wins)', () => {
    const scopes: VariableScope[] = [
      { name: 'request', variables: { token: 'token-request' } },
      { name: 'folder', variables: { token: 'token-folder' } },
      { name: 'collection', variables: { token: 'token-collection' } },
      { name: 'env', variables: { token: 'token-env' } },
    ];
    const result = service.resolve('Bearer {{token}}', scopes);

    expect(result.resolved).toBe('Bearer token-request');
  });

  it('should identify unresolved variables without throwing', () => {
    const scopes: VariableScope[] = [
      { name: 'env', variables: { exists: 'yes' } },
    ];
    const result = service.resolve('{{exists}} - {{missing}}', scopes);

    expect(result.resolved).toBe('yes - {{missing}}');
    expect(result.unresolvedKeys).toEqual(['missing']);
  });

  it('should resolve nested/chained variables', () => {
    const scopes: VariableScope[] = [
      { name: 'env', variables: { host: 'localhost', port: '8080', url: 'http://{{host}}:{{port}}' } },
    ];
    const result = service.resolve('{{url}}/api', scopes);

    expect(result.resolved).toBe('http://localhost:8080/api');
    expect(result.unresolvedKeys).toEqual([]);
  });

  it('should detect cycles and prevent infinite loops', () => {
    const scopes: VariableScope[] = [
      { name: 'env', variables: { a: '{{b}}', b: '{{a}}' } },
    ];
    const result = service.resolve('{{a}}', scopes);

    expect(result.unresolvedKeys).toContain('a');
  });

  it('should resolve all fields of a record', () => {
    const scopes: VariableScope[] = [
      { name: 'env', variables: { auth: 'secret-token', agent: 'Trex' } },
    ];
    const record = {
      Authorization: 'Bearer {{auth}}',
      'User-Agent': '{{agent}}',
      'X-Static': '123',
    };

    const res = service.resolveRecord(record, scopes);
    expect(res.resolved.Authorization).toBe('Bearer secret-token');
    expect(res.resolved['User-Agent']).toBe('Trex');
    expect(res.resolved['X-Static']).toBe('123');
    expect(res.unresolvedKeys).toEqual([]);
  });

  it('should capture remaining matches when recursion depth limit is reached', () => {
    const chain: Record<string, string> = {};
    for (let i = 0; i < 15; i++) {
      chain[`v${String(i)}`] = `{{v${String(i + 1)}}}`;
    }
    const scopes: VariableScope[] = [{ name: 'env', variables: chain }];
    const res = service.resolve('{{v0}}', scopes);
    expect(res.unresolvedKeys.length).toBeGreaterThan(0);
  });

  it('should collect unresolved keys from both record keys and values', () => {
    const scopes: VariableScope[] = [];
    const record = {
      '{{missing_key}}': '{{missing_val}}',
    };
    const res = service.resolveRecord(record, scopes);
    expect(res.unresolvedKeys).toContain('missing_key');
    expect(res.unresolvedKeys).toContain('missing_val');
  });

  it('should fallback to match when variable value in mergedVariables is undefined', () => {
    const scopes: VariableScope[] = [
      { name: 'env', variables: { undefinedVar: undefined as unknown as string } },
    ];
    const res = service.resolve('prefix-{{undefinedVar}}-suffix', scopes);
    expect(res.resolved).toBe('prefix-{{undefinedVar}}-suffix');
  });
});

