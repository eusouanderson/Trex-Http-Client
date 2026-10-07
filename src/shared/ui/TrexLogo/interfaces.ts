import type { ComputedRef } from 'vue';

 interface TrexLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
 interface UseTrexLogoReturn {
  logoSrc: string;
  containerClasses: ComputedRef<string>;
  innerClasses: ComputedRef<string>;
}

export type { TrexLogoProps, UseTrexLogoReturn };
