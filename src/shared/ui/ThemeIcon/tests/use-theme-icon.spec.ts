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

  it('should handle blob url without prepending base url', () => {
    const blobIcon = useThemeIcon({ icon: 'blob:http://localhost/12345' });
    expect(blobIcon.isImage.value).toBe(true);
    expect(blobIcon.resolvedSrc.value).toBe('blob:http://localhost/12345');
  });

  it('should handle data image url without prepending base url', () => {
    const dataIcon = useThemeIcon({ icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==' });
    expect(dataIcon.isImage.value).toBe(true);
    expect(dataIcon.resolvedSrc.value).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==');
  });

  it('should resolve icons from public/icons folder with base url', () => {
    const iconWithRelativePath = useThemeIcon({ icon: 'icons/velociraptor.png' });
    expect(iconWithRelativePath.isImage.value).toBe(true);
    expect(iconWithRelativePath.resolvedSrc.value).toBe(`${import.meta.env.BASE_URL}icons/velociraptor.png`);

    const iconWithLeadingSlash = useThemeIcon({ icon: '/icons/velociraptor.png' });
    expect(iconWithLeadingSlash.isImage.value).toBe(true);
    expect(iconWithLeadingSlash.resolvedSrc.value).toBe(`${import.meta.env.BASE_URL}icons/velociraptor.png`);
  });

  it('should not duplicate base url when icon already contains base url', () => {
    const originalBase = import.meta.env.BASE_URL;
    const testBase = '/Trex-Http-Client/';
    import.meta.env.BASE_URL = testBase;

    try {
      const alreadyPrefixed = useThemeIcon({ icon: '/Trex-Http-Client/icons/velociraptor.png' });
      expect(alreadyPrefixed.isImage.value).toBe(true);
      expect(alreadyPrefixed.resolvedSrc.value).toBe('/Trex-Http-Client/icons/velociraptor.png');
    } finally {
      import.meta.env.BASE_URL = originalBase;
    }
  });

  it('should identify http, /logos/, webp and jpg paths properly', () => {
    const httpIcon = useThemeIcon({ icon: 'http://example.com/icon.png' });
    expect(httpIcon.isImage.value).toBe(true);
    expect(httpIcon.resolvedSrc.value).toBe('http://example.com/icon.png');

    const logosSlashIcon = useThemeIcon({ icon: '/logos/custom.svg' });
    expect(logosSlashIcon.isImage.value).toBe(true);

    const webpIcon = useThemeIcon({ icon: 'avatar.webp' });
    expect(webpIcon.isImage.value).toBe(true);

    const jpgIcon = useThemeIcon({ icon: 'banner.jpg' });
    expect(jpgIcon.isImage.value).toBe(true);
  });
});

