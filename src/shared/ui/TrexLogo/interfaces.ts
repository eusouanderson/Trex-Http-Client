export interface TrexLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface UseTrexLogoReturn {
  logoSrc: string;
  containerClasses: import('vue').ComputedRef<string>;
  innerClasses: import('vue').ComputedRef<string>;
}
