import { describe, it, expect } from 'vitest';
import { useCodeEditor } from '../use-code-editor';

describe('useCodeEditor', () => {
  it('should initialize extensions and react to updates', () => {
    let emittedValue = '';
    const { code, extensions, handleUpdate, openSearch } = useCodeEditor(
      { modelValue: '{"test": 123}', readOnly: false },
      (eventName, val) => {
        if (eventName === 'update:modelValue') {
          emittedValue = val;
        }
      },
    );

    expect(code.value).toBe('{"test": 123}');
    expect(extensions.value.length).toBeGreaterThan(0);

    handleUpdate('{"test": 456}');
    expect(emittedValue).toBe('{"test": 456}');

    expect(() => { openSearch(); }).not.toThrow();
  });

  it('should handle change event and showSearch prop options', () => {
    let changedValue = '';
    const editor = useCodeEditor(
      { modelValue: 'content', showSearch: false },
      (event, val) => {
        if (event === 'change') {
          changedValue = val;
        }
      },
    );

    expect(editor.showSearch.value).toBe(false);
    editor.handleChange('new content');
    expect(changedValue).toBe('new content');

    const noEmitEditor = useCodeEditor({ modelValue: 'standalone' });
    expect(() => {
      noEmitEditor.handleUpdate('val');
      noEmitEditor.handleChange('val');
    }).not.toThrow();
  });

  it('should support readOnly prop when set to true', () => {
    const editor = useCodeEditor({ modelValue: 'read-only-content', readOnly: true });
    expect(editor.code.value).toBe('read-only-content');
    expect(editor.extensions.value.length).toBeGreaterThan(0);
  });

  it('should support showCopy and handle copyCode', async () => {
    const editor = useCodeEditor({ modelValue: 'copy-content', showCopy: true });
    expect(editor.showCopy.value).toBe(true);
    await expect(editor.copyCode()).resolves.toBeUndefined();
    
    const hiddenCopy = useCodeEditor({ modelValue: '', showCopy: false });
    expect(hiddenCopy.showCopy.value).toBe(false);
  });
});
