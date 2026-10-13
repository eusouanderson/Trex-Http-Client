interface TestScriptEditorProps {
  modelValue: string;
}

type TestScriptEditorEmits = (e: 'update:modelValue', value: string) => void;

interface ScriptSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
}

export type {
  TestScriptEditorProps,
  TestScriptEditorEmits,
  ScriptSnippet,
};

