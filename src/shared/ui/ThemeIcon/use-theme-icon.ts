import { computed } from 'vue';
import type { ThemeIconProps, UseThemeIconReturn } from './interfaces';

const isImagePath = (icon: string): boolean => {
  const normalized = icon.trim().toLowerCase();
  return (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('data:image/') ||
    normalized.startsWith('logos/') ||
    normalized.startsWith('/logos/') ||
    normalized.endsWith('.png') ||
    normalized.endsWith('.svg') ||
    normalized.endsWith('.webp') ||
    normalized.endsWith('.jpg')
  );
};

const resolveIconUrl = (icon: string): string => {
  const trimmed = icon.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }
  const cleanPath = trimmed.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};

const useThemeIcon = (props: ThemeIconProps): UseThemeIconReturn => {
  const isImage = computed<boolean>(() => isImagePath(props.icon));

  const resolvedSrc = computed<string>(() => {
    if (!isImage.value) {
      return '';
    }
    return resolveIconUrl(props.icon);
  });

  const displayIcon = computed<string>(() => props.icon);

  const sizeClasses = computed<string>(() => {
    switch (props.size) {
      case 'sm':
        return 'w-6 h-6';
      case 'lg':
        return 'w-10 h-10';
      case 'md':
      default:
        return 'w-8 h-8';
    }
  });

  const iconSizeClasses = computed<string>(() => {
    switch (props.size) {
      case 'sm':
        return 'text-base';
      case 'lg':
        return 'text-2xl';
      case 'md':
      default:
        return 'text-xl';
    }
  });

  return {
    isImage,
    resolvedSrc,
    displayIcon,
    sizeClasses,
    iconSizeClasses,
  };
};

export { useThemeIcon };

