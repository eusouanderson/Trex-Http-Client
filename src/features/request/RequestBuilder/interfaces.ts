type RequestTabCategory = 'params' | 'headers' | 'body';

interface RequestBuilderProps {
  modelValue?: string;
}

type RequestBuilderEmits = (e: 'sent') => void;

export type { RequestTabCategory, RequestBuilderProps, RequestBuilderEmits };
