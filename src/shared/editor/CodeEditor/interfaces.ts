import type { Extension } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import type { JsonThemeSettings } from '../../../features/settings/interfaces';

interface CodeEditorProps {
  modelValue: string;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  hideSearchButton?: boolean;
  showSearch?: boolean;
}

type CodeEditorEmits = (e: 'update:modelValue' | 'change', value: string) => void;

interface ICodeMirrorThemeService {
  buildExtensions(theme: JsonThemeSettings, readOnly?: boolean): Extension[];
  triggerSearch(view: EditorView | null): void;
}

export type {
  CodeEditorProps,
  CodeEditorEmits,
  ICodeMirrorThemeService,
};
