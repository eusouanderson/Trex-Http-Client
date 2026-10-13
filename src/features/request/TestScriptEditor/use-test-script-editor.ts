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
    description: 'Valida se o status HTTP é 200',
    code: 'tx.test("Status HTTP deve ser 200", () => {\n  tx.response.to.have.status(200);\n});\n',
  },
  {
    id: 'array-validation',
    title: 'Validar Array',
    description: 'Valida se o corpo retornado é uma lista',
    code: 'tx.test("Resposta deve ser um array", () => {\n  const body = tx.response.json();\n  tx.expect(body).to.be.an("array");\n});\n',
  },
  {
    id: 'array-length',
    title: 'Tamanho da Lista',
    description: 'Valida quantidade exata de itens no array',
    code: 'tx.test("Deve retornar exatamente 100 itens", () => {\n  const body = tx.response.json();\n  tx.expect(body).to.have.lengthOf(100);\n});\n',
  },
  {
    id: 'array-fields-exist',
    title: 'Campos Obrigatórios na Lista',
    description: 'Itera lista e valida existência de propriedades obrigatórias',
    code: 'tx.test("Todos os itens devem possuir campos obrigatórios", () => {\n  const body = tx.response.json();\n  body.forEach((item, index) => {\n    tx.expect(item, `Item ${index + 1}`).to.have.property("userId");\n    tx.expect(item, `Item ${index + 1}`).to.have.property("id");\n    tx.expect(item, `Item ${index + 1}`).to.have.property("title");\n    tx.expect(item, `Item ${index + 1}`).to.have.property("body");\n  });\n});\n',
  },
  {
    id: 'array-fields-types',
    title: 'Tipos dos Campos da Lista',
    description: 'Valida os tipos primitivos de cada campo dos itens',
    code: 'tx.test("Todos os campos devem possuir os tipos corretos", () => {\n  const body = tx.response.json();\n  body.forEach((item, index) => {\n    tx.expect(item.userId, `userId do item ${index + 1}`).to.be.a("number");\n    tx.expect(item.id, `id do item ${index + 1}`).to.be.a("number");\n    tx.expect(item.title, `title do item ${index + 1}`).to.be.a("string");\n    tx.expect(item.body, `body do item ${index + 1}`).to.be.a("string");\n  });\n});\n',
  },
  {
    id: 'unique-ids',
    title: 'IDs Únicos',
    description: 'Verifica se não há identificadores duplicados na lista',
    code: 'tx.test("IDs devem ser únicos", () => {\n  const body = tx.response.json();\n  const ids = body.map((item) => item.id);\n  tx.expect(new Set(ids).size).to.eql(ids.length);\n});\n',
  },
  {
    id: 'non-empty-fields',
    title: 'Campos Preenchidos',
    description: 'Verifica se números são positivos e strings não estão vazias',
    code: 'tx.test("Todos os campos obrigatórios devem estar preenchidos", () => {\n  const body = tx.response.json();\n  body.forEach((item, index) => {\n    tx.expect(item.userId, `userId do item ${index + 1}`).to.be.greaterThan(0);\n    tx.expect(item.id, `id do item ${index + 1}`).to.be.greaterThan(0);\n    tx.expect(item.title.trim(), `title do item ${index + 1}`).to.not.be.empty;\n    tx.expect(item.body.trim(), `body do item ${index + 1}`).to.not.be.empty;\n  });\n});\n',
  },
  {
    id: 'ordered-ids',
    title: 'IDs Ordenados',
    description: 'Verifica se os IDs seguem sequência ordinal',
    code: 'tx.test("IDs devem estar ordenados de 1 a 100", () => {\n  const body = tx.response.json();\n  body.forEach((item, index) => {\n    tx.expect(item.id).to.eql(index + 1);\n  });\n});\n',
  },
  {
    id: 'number-within-range',
    title: 'Intervalo Numérico',
    description: 'Valida se campo numérico está dentro de faixa esperada',
    code: 'tx.test("userId deve estar entre 1 e 10", () => {\n  const body = tx.response.json();\n  body.forEach((item, index) => {\n    tx.expect(item.userId, `userId do item ${index + 1}`).to.be.within(1, 10);\n  });\n});\n',
  },
  {
    id: 'first-item-detail',
    title: 'Primeiro Item Específico',
    description: 'Valida valores específicos do primeiro item da lista',
    code: 'tx.test("Primeiro item deve possuir os dados esperados", () => {\n  const body = tx.response.json();\n  const first = body[0];\n  tx.expect(first.id).to.eql(1);\n  tx.expect(first.userId).to.eql(1);\n  tx.expect(first.title).to.be.a("string");\n  tx.expect(first.body).to.include("quia et suscipit");\n});\n',
  },
  {
    id: 'last-item-detail',
    title: 'Último Item Específico',
    description: 'Valida valores específicos do último item da lista',
    code: 'tx.test("Último item deve possuir os dados esperados", () => {\n  const body = tx.response.json();\n  const last = body[body.length - 1];\n  tx.expect(last.id).to.eql(100);\n  tx.expect(last.userId).to.eql(10);\n  tx.expect(last.title).to.be.a("string");\n});\n',
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

