import { describe, expect, it } from 'vitest';
import { useTrexLogo } from '../use-trex-logo';

describe('useTrexLogo', () => {
  it('should return default size classes if not provided', () => {
    const { containerClasses, innerClasses, logoSrc } = useTrexLogo({});
    
    expect(containerClasses.value).toContain('w-7');
    expect(innerClasses.value).toContain('p-0.5');
    expect(logoSrc).toBe('/logos/Trex.png');
  });

  it('should return lg size classes when specified', () => {
    const { containerClasses } = useTrexLogo({ size: 'lg' });
    
    expect(containerClasses.value).toContain('w-16');
  });
});

