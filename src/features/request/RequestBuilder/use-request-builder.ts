import { computed, ref, type ComputedRef } from 'vue';
import type { HttpMethod } from '../../../core/http/interfaces';
import type { BodyType } from '../interfaces';
import { useRequest } from '../use-request';
import type { RequestTabCategory } from './interfaces';

import type { AuthConfig } from '../../../core/security/interfaces';

const activeCategoryState = ref<RequestTabCategory>('params');

interface UseRequestBuilderReturn {
  logoSrc: string;
  activeCategory: typeof activeCategoryState;
  activeTab: ReturnType<typeof useRequest>['activeTab'];
  isLoading: ReturnType<typeof useRequest>['isLoading'];
  validationIssues: ReturnType<typeof useRequest>['validationIssues'];
  hasUrlError: ComputedRef<boolean>;
  clearValidationIssues: () => void;
  setCategory: (cat: RequestTabCategory) => void;
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setBody: (body: string) => void;
  setBodyType: (type: BodyType) => void;
  setAuth: (auth: AuthConfig) => void;
  setTestScript: (script: string) => void;
  formatJsonBody: () => void;
  addParam: () => void;
  removeParam: (id: string) => void;
  addHeader: () => void;
  removeHeader: (id: string) => void;
  send: (timeoutMs?: number) => Promise<void>;
  createNewTab: () => void;
}

const useRequestBuilder = (onSent?: () => void): UseRequestBuilderReturn => {
  const logoSrc = `${import.meta.env.BASE_URL}logos/Trex.png`;

  const {
    activeTab,
    isLoading,
    validationIssues,
    clearValidationIssues,
    createTab,
    updateActiveTab,
    addParam,
    removeParam,
    addHeader,
    removeHeader,
    sendRequest,
  } = useRequest();

  const hasUrlError = computed<boolean>(() => {
    return validationIssues.value.some((issue) => issue.category === 'url' || issue.field === 'url');
  });

  const setCategory = (cat: RequestTabCategory): void => {
    activeCategoryState.value = cat;
  };

  const setMethod = (method: HttpMethod): void => {
    updateActiveTab({ method });
  };

  const setUrl = (url: string): void => {
    updateActiveTab({ url });
  };

  const setBody = (body: string): void => {
    updateActiveTab({ body });
  };

  const setBodyType = (bodyType: BodyType): void => {
    updateActiveTab({ bodyType });
  };

  const setAuth = (auth: AuthConfig): void => {
    updateActiveTab({ auth });
  };

  const setTestScript = (testScript: string): void => {
    updateActiveTab({ testScript });
  };

  const formatJsonBody = (): void => {
    if (!activeTab.value) {
      return;
    }
    try {
      const parsed: unknown = JSON.parse(activeTab.value.body);
      const formatted = JSON.stringify(parsed, null, 2);
      updateActiveTab({ body: formatted });
    } catch {
      return;
    }
  };

  const send = async (timeoutMs?: number): Promise<void> => {
    await sendRequest(timeoutMs);
    if (onSent !== undefined) {
      onSent();
    }
  };

  const createNewTab = (): void => {
    createTab();
  };

  return {
    logoSrc,
    activeCategory: activeCategoryState,
    activeTab,
    isLoading,
    validationIssues,
    hasUrlError,
    clearValidationIssues,
    setCategory,
    setMethod,
    setUrl,
    setBody,
    setBodyType,
    setAuth,
    setTestScript,
    formatJsonBody,
    addParam,
    removeParam,
    addHeader,
    removeHeader,
    send,
    createNewTab,
  };
};

export { useRequestBuilder };
