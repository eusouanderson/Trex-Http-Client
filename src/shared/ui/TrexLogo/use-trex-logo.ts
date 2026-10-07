import { computed } from 'vue';
import type { TrexLogoProps, UseTrexLogoReturn } from './interfaces';

export const useTrexLogo = (props: TrexLogoProps): UseTrexLogoReturn => {
  const logoSrc = '/logos/Trex.png';

  const containerClasses = computed(() => {
    switch (props.size) {
      case 'sm':
        return 'w-7 h-7 p-[2px]';
      case 'md':
        return 'w-10 h-10 p-[3px]';
      case 'lg':
        return 'w-16 h-16 p-1';
      case 'xl':
        return 'w-24 h-24 p-1.5';
      default:
        return 'w-7 h-7 p-[2px]';
    }
  });

  const innerClasses = computed(() => {
    switch (props.size) {
      case 'sm':
        return 'p-0.5 rounded-md';
      case 'md':
        return 'p-1 rounded-lg';
      case 'lg':
        return 'p-1.5 rounded-xl';
      case 'xl':
        return 'p-2 rounded-2xl';
      default:
        return 'p-0.5 rounded-md';
    }
  });

  return {
    logoSrc,
    containerClasses,
    innerClasses,
  };
};
