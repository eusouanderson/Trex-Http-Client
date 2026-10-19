import { describe, expect, it } from 'vitest';
import { useTrexLogo } from '../use-trex-logo';

describe('useTrexLogo', () => {
  it('should return default size classes if not provided', () => {
    const { containerClasses, innerClasses, logoSrc } = useTrexLogo({});
    
    expect(containerClasses.value).toContain('w-7');
    expect(innerClasses.value).toContain('p-0.5');
    expect(logoSrc).toBe('/logos/Trex.png');
  });

  it('should use custom src when provided in props', () => {
    const { logoSrc } = useTrexLogo({ src: '/custom/dino.png' });
    expect(logoSrc).toBe('/custom/dino.png');
  });

  it('should pick a randomized dinosaur icon when randomize is true', () => {
    const { logoSrc } = useTrexLogo({ randomize: true });
    expect(logoSrc).toBeTruthy();
    expect(logoSrc).not.toBe('/logos/Trex.png');
  });

  it('should return lg size classes when specified', () => {
    const { containerClasses, innerClasses } = useTrexLogo({ size: 'lg' });
    
    expect(containerClasses.value).toContain('w-16');
    expect(innerClasses.value).toContain('p-1.5');
  });

  it('should return sm size classes when specified', () => {
    const { containerClasses, innerClasses } = useTrexLogo({ size: 'sm' });
    expect(containerClasses.value).toContain('w-7');
    expect(innerClasses.value).toContain('p-0.5');
  });

  it('should return md size classes when specified', () => {
    const { containerClasses, innerClasses } = useTrexLogo({ size: 'md' });
    expect(containerClasses.value).toContain('w-10');
    expect(innerClasses.value).toContain('p-1');
  });

  it('should return xl size classes when specified', () => {
    const { containerClasses, innerClasses } = useTrexLogo({ size: 'xl' });
    expect(containerClasses.value).toContain('w-24');
    expect(innerClasses.value).toContain('p-2');
  });
});
