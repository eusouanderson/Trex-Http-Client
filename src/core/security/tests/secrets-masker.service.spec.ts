import { describe, expect, it } from 'vitest';
import { SecretsMaskerService } from '../secrets-masker.service';

describe('SecretsMaskerService', () => {
  const masker = new SecretsMaskerService();

  it('should mask full secret string with bullet points preserving none or tiny prefix', () => {
    expect(masker.mask('my-super-secret-token-12345')).toBe('••••••••••••••••••••');
    expect(masker.mask('')).toBe('');
  });

  it('should mask sensitive headers such as authorization, x-api-key, and bearer values', () => {
    const headers = {
      Authorization: 'Bearer secret_access_token_abc',
      'Content-Type': 'application/json',
      'X-API-Key': 'key_12345_secret',
    };
    const masked = masker.maskRecord(headers, ['secret_access_token_abc', 'key_12345_secret']);

    expect(masked.Authorization).toBe('Bearer ••••••••');
    expect(masked['Content-Type']).toBe('application/json');
    expect(masked['X-API-Key']).toBe('••••••••');

    const basicHeaders = {
      Authorization: 'Basic dXNlcjpwYXNz',
    };
    const maskedBasic = masker.maskRecord(basicHeaders, []);
    expect(maskedBasic.Authorization).toBe('Basic ••••••••');

    const otherAuthHeaders = {
      Authorization: 'Digest otherauthcredentials',
    };
    const maskedOther = masker.maskRecord(otherAuthHeaders, []);
    expect(maskedOther.Authorization).toBe('••••••••');
  });

  it('should mask secrets inside URL query parameters', () => {
    const url = 'https://api.example.com/data?token=secret_abc123&page=1&apikey=my_key_999';
    const masked = masker.maskUrl(url, ['secret_abc123', 'my_key_999']);

    expect(masked).toContain('page=1');
    expect(masked).not.toContain('secret_abc123');
    expect(masked).not.toContain('my_key_999');
    expect(masked).toContain('token=••••••••');
    expect(masked).toContain('apikey=••••••••');
  });

  it('should handle empty or invalid URLs without throwing', () => {
    expect(masker.maskUrl('', [])).toBe('');
    expect(masker.maskUrl('://', [])).toBe('://');
  });

  it('should mask occurrences of valid secrets in general headers', () => {
    const headers = {
      'Custom-Header': 'prefix-supersecret-suffix',
    };
    const masked = masker.maskRecord(headers, ['supersecret']);
    expect(masked['Custom-Header']).toBe('prefix-••••••••-suffix');
  });
});

