import { describe, it, expect } from 'vitest';
import { useThemeIcon } from '../use-theme-icon';

describe('useThemeIcon', () => {
  it('should identify emoji icon and provide proper size classes', () => {
    const { isImage, displayIcon, resolvedSrc, sizeClasses, iconSizeClasses } = useThemeIcon({
      icon: '🦖',
      size: 'md',
    });

    expect(isImage.value).toBe(false);
    expect(displayIcon.value).toBe('🦖');
    expect(resolvedSrc.value).toBe('');
    expect(sizeClasses.value).toContain('w-8 h-8');
    expect(iconSizeClasses.value).toContain('text-xl');
  });

  it('should identify image path and resolve url with base URL', () => {
    const { isImage, resolvedSrc } = useThemeIcon({
      icon: 'logos/Trex.png',
      size: 'lg',
    });

    expect(isImage.value).toBe(true);
    expect(resolvedSrc.value).toBe(`${import.meta.env.BASE_URL}logos/Trex.png`);
  });

  it('should identify http image url without modifying it', () => {
    const { isImage, resolvedSrc } = useThemeIcon({
      icon: 'https://example.com/icon.svg',
      size: 'sm',
    });

    expect(isImage.value).toBe(true);
    expect(resolvedSrc.value).toBe('https://example.com/icon.svg');
  });

  it('should apply small and large size classes properly', () => {
    const smIcon = useThemeIcon({ icon: '🌋', size: 'sm' });
    expect(smIcon.sizeClasses.value).toContain('w-6 h-6');
    expect(smIcon.iconSizeClasses.value).toContain('text-base');

    const lgIcon = useThemeIcon({ icon: '🦕', size: 'lg' });
    expect(lgIcon.sizeClasses.value).toContain('w-10 h-10');
    expect(lgIcon.iconSizeClasses.value).toContain('text-2xl');
  });

  it('should fallback to default size md when size is omitted', () => {
    const defaultIcon = useThemeIcon({ icon: '🪨' });
    expect(defaultIcon.sizeClasses.value).toContain('w-8 h-8');
  });
});

