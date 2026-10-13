import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import type {
  ScriptSnippet,
  TestScriptEditorEmits,
  TestScriptEditorProps,
} from './interfaces';

const defaultSnippets: ScriptSnippet[] = [
  {
    id: 'status-200',
    title: 'Status: 200 OK',
    description: 'Valida se a resposta HTTP retornou status 200',
    code: 'tx.test("Status deve ser 200", () => {\n  tx.response.to.have.status(200);\n});\n',
  },
  {
    id: 'json-value',
    title: 'Validar JSON',
    description: 'Valida tipo e campo específico do JSON da resposta',
    code: 'tx.test("Corpo da resposta deve conter dados válidos", () => {\n  const body = tx.response.json();\n  tx.expect(body).to.be.an("object");\n});\n',
  },
  {
    id: 'set-env-var',
    title: 'Salvar Variável de Ambiente',
    description: 'Captura valor da resposta e persiste no ambiente ativo',
    code: 'tx.test("Salvar token no ambiente", () => {\n  const body = tx.response.json();\n  tx.expect(body.token).to.be.a("string");\n  tx.environment.set("token", body.token);\n});\n',
  },
];

interface UseTestScriptEditorReturn {
  script: ComputedRef<string>;
  snippets: ScriptSnippet[];
  handleScriptChange: (value: string) => void;
  applySnippet: (snippet: ScriptSnippet) => void;
}

const useTestScriptEditor = (
  props: TestScriptEditorProps,
  emit: TestScriptEditorEmits,
): UseTestScriptEditorReturn => {
  const script = computed<string>(() => props.modelValue);

  const handleScriptChange = (value: string): void => {
    emit('update:modelValue', value);
  };

  const applySnippet = (snippet: ScriptSnippet): void => {
    const current = props.modelValue.trim();
    const separator = current.length > 0 ? '\n\n' : '';
    const updated = `${current}${separator}${snippet.code}`;
    emit('update:modelValue', updated);
  };

  return {
    script,
    snippets: defaultSnippets,
    handleScriptChange,
    applySnippet,
  };
};

export { useTestScriptEditor };

