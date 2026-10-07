import type { ComputedRef, Ref } from 'vue';
import { computed, shallowRef } from 'vue';
import { useClipboard } from '@vueuse/core';
import type { Extension } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { useSettings } from '../../../features/settings';
import { CodeMirrorThemeService } from './code-mirror-theme.service';
import type { CodeEditorProps, CodeEditorEmits } from './interfaces';

const themeService = new CodeMirrorThemeService();

interface UseCodeEditorReturn {
  code: ComputedRef<string>;
  extensions: ComputedRef<Extension[]>;
  showSearch: ComputedRef<boolean>;
  showCopy: ComputedRef<boolean>;
  isCopied: Ref<boolean>;
  copyCode: () => Promise<void>;
  handleUpdate: (value: string) => void;
  handleChange: (value: string) => void;
  handleReady: (payload: { view: EditorView }) => void;
  openSearch: () => void;
}

const useCodeEditor = (
  props: CodeEditorProps,
  emit?: CodeEditorEmits,
): UseCodeEditorReturn => {
  const { settings } = useSettings();
  const editorView = shallowRef<EditorView | null>(null);

  const code = computed<string>(() => props.modelValue);
  const showSearch = computed<boolean>(() => {
    if (props.hideSearchButton === true || props.showSearch === false) {
      return false;
    }
    return true;
  });

  const showCopy = computed<boolean>(() => props.showCopy !== false);

  const { copy, copied: isCopied } = useClipboard({ source: code });

  const copyCode = async (): Promise<void> => {
    await copy(code.value);
  };

  const extensions = computed<Extension[]>(() => {
    return themeService.buildExtensions(
      settings.value.jsonTheme,
      Boolean(props.readOnly),
    );
  });

  const handleUpdate = (val: string): void => {
    if (emit) {
      emit('update:modelValue', val);
    }
  };

  const handleChange = (val: string): void => {
    if (emit) {
      emit('change', val);
    }
  };

  const handleReady = (payload: { view: EditorView }): void => {
    editorView.value = payload.view;
  };

  const openSearch = (): void => {
    themeService.triggerSearch(editorView.value);
  };

  return {
    code,
    extensions,
    showSearch,
    showCopy,
    isCopied,
    copyCode,
    handleUpdate,
    handleChange,
    handleReady,
    openSearch,
  };
};

export { useCodeEditor };
