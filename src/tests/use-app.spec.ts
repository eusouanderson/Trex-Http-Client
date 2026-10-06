import { describe, it, expect } from 'vitest';
import { useApp } from '../use-app';

describe('useApp', () => {
  it('should return app title', () => {
    const { title } = useApp();
    expect(title).toBe('T-Rex HTTP Client');
  });
});

