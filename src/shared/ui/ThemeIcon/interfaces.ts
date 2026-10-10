import type { ComputedRef } from 'vue';

interface ThemeIconProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg';
  alt?: string;
}

interface UseThemeIconReturn {
  isImage: ComputedRef<boolean>;
  resolvedSrc: ComputedRef<string>;
  displayIcon: ComputedRef<string>;
  sizeClasses: ComputedRef<string>;
  iconSizeClasses: ComputedRef<string>;
}

export type { ThemeIconProps, UseThemeIconReturn };

