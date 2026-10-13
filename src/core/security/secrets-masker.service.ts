import type { ISecuritySecretsMasker } from './interfaces';

class SecretsMaskerService implements ISecuritySecretsMasker {
  private readonly DEFAULT_MASK = '••••••••';

  public mask(value: string): string {
    if (!value || value.length === 0) {
      return '';
    }
    return '•'.repeat(Math.min(Math.max(value.length, 8), 20));
  }

  public maskRecord(
    record: Record<string, string>,
    secrets: string[],
  ): Record<string, string> {
    const masked: Record<string, string> = {};
    const validSecrets = secrets.filter((s) => s.trim().length > 0);

    for (const [key, value] of Object.entries(record)) {
      let maskedValue = value;
      const lowerKey = key.toLowerCase();

      if (lowerKey === 'authorization') {
        if (maskedValue.startsWith('Bearer ')) {
          maskedValue = `Bearer ${this.DEFAULT_MASK}`;
        } else if (maskedValue.startsWith('Basic ')) {
          maskedValue = `Basic ${this.DEFAULT_MASK}`;
        } else {
          maskedValue = this.DEFAULT_MASK;
        }
      } else if (
        lowerKey.includes('key') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token')
      ) {
        maskedValue = this.DEFAULT_MASK;
      } else {
        for (const secret of validSecrets) {
          if (maskedValue.includes(secret)) {
            maskedValue = maskedValue.replaceAll(secret, this.DEFAULT_MASK);
          }
        }
      }

      masked[key] = maskedValue;
    }

    return masked;
  }

  public maskUrl(url: string, secrets: string[]): string {
    if (!url || url.length === 0) {
      return url;
    }

    let masked = url;
    const validSecrets = secrets.filter((s) => s.trim().length > 0);

    for (const secret of validSecrets) {
      masked = masked.replaceAll(secret, this.DEFAULT_MASK);
    }

    try {
      const parsed = new URL(masked);
      parsed.searchParams.forEach((_val, key) => {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('token') ||
          lowerKey.includes('key') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('auth')
        ) {
          parsed.searchParams.set(key, this.DEFAULT_MASK);
        }
      });
      return decodeURI(parsed.toString());
    } catch {
      return masked;
    }
  }
}

export { SecretsMaskerService };
