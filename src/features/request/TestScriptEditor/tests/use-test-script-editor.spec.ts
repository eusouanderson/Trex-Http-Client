import { describe, expect, it, vi } from 'vitest';
import { useTestScriptEditor } from '../use-test-script-editor';

describe('useTestScriptEditor', () => {
  it('deve expor o script reativo baseado na modelValue', () => {
    const props = { modelValue: 'tx.test("Status", () => {});' };
    const emit = vi.fn();
    const { script, snippets } = useTestScriptEditor(props, emit);

    expect(script.value).toBe('tx.test("Status", () => {});');
    expect(snippets.length).toBeGreaterThan(0);
    expect(snippets[0]?.code).toContain('tx.test');
  });

  it('deve emitir update:modelValue ao atualizar o script', () => {
    const props = { modelValue: '' };
    const emit = vi.fn();
    const { handleScriptChange } = useTestScriptEditor(props, emit);

    handleScriptChange('pm.expect(1).to.equal(1);');
    expect(emit).toHaveBeenCalledWith('update:modelValue', 'pm.expect(1).to.equal(1);');
  });

  it('deve anexar snippet ao script existente sem emit duplicado', () => {
    const props = { modelValue: 'pm.test("A", () => {});\n' };
    const emit = vi.fn();
    const { applySnippet, snippets } = useTestScriptEditor(props, emit);

    const firstSnippet = snippets[0];
    expect(firstSnippet).toBeDefined();
    if (!firstSnippet) return;

    applySnippet(firstSnippet);
    expect(emit).toHaveBeenCalledWith(
      'update:modelValue',
      expect.stringContaining(firstSnippet.code),
    );
  });
});

