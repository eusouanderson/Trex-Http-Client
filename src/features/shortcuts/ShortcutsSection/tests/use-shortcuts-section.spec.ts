import { describe, expect, it } from 'vitest';
import { useShortcutsSection } from '../use-shortcuts-section';

describe('useShortcutsSection', () => {
  it('filters shortcuts by category and search query', () => {
    const { searchQuery, selectedCategory, filteredShortcuts } = useShortcutsSection();

    expect(filteredShortcuts.value.length).toBeGreaterThan(0);

    selectedCategory.value = 'requests';
    expect(filteredShortcuts.value.every((s) => s.category === 'requests')).toBe(true);

    searchQuery.value = 'URL';
    expect(filteredShortcuts.value.some((s) => s.id === 'focus-url')).toBe(true);
  });

  it('manages key combination recording state and saves valid combo', () => {
    const {
      recordingShortcutId,
      recordedCombo,
      startRecording,
      handleRecordKeyDown,
      saveRecordedCombo,
      resetShortcut,
      shortcuts,
    } = useShortcutsSection();

    startRecording('toggle-theme');
    expect(recordingShortcutId.value).toBe('toggle-theme');

    const keyEvent = new KeyboardEvent('keydown', {
      key: 'j',
      ctrlKey: true,
      altKey: true,
    });
    handleRecordKeyDown(keyEvent);
    expect(recordedCombo.value).toBe('ctrl+alt+j');

    saveRecordedCombo();
    expect(recordingShortcutId.value).toBeNull();

    const target = shortcuts.value.find((s) => s.id === 'toggle-theme');
    expect(target?.isCustom).toBe(true);

    resetShortcut('toggle-theme');
    const resetTarget = shortcuts.value.find((s) => s.id === 'toggle-theme');
    expect(resetTarget?.isCustom).toBe(false);

    startRecording('toggle-theme');
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    handleRecordKeyDown(escEvent);
    expect(recordingShortcutId.value).toBeNull();
  });

  it('resets all shortcuts', () => {
    const { startRecording, handleRecordKeyDown, saveRecordedCombo, resetAll, shortcuts } =
      useShortcutsSection();

    startRecording('toggle-sidebar');
    handleRecordKeyDown(new KeyboardEvent('keydown', { key: 'm', ctrlKey: true }));
    saveRecordedCombo();

    expect(shortcuts.value.some((s) => s.isCustom)).toBe(true);

    resetAll();
    expect(shortcuts.value.every((s) => !s.isCustom)).toBe(true);
  });

  it('handles modifier-only key presses and arrow keys during recording', () => {
    const {
      startRecording,
      stopRecording,
      handleRecordKeyDown,
      saveRecordedCombo,
      conflictWarning,
      recordedCombo,
    } = useShortcutsSection();

    handleRecordKeyDown(new KeyboardEvent('keydown', { key: 'a' }));

    startRecording('open-settings');

    handleRecordKeyDown(new KeyboardEvent('keydown', { key: 'Control' }));
    expect(recordedCombo.value).toBe('');

    handleRecordKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));
    expect(recordedCombo.value).toBe('alt+arrowleft');

    handleRecordKeyDown(new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true }));
    expect(recordedCombo.value).toBe('alt+arrowup');

    handleRecordKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true }));
    expect(recordedCombo.value).toBe('alt+arrowdown');

    handleRecordKeyDown(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    expect(recordedCombo.value).toBe('meta+k');

    saveRecordedCombo();
    expect(conflictWarning.value).toBeNull();

    startRecording('open-settings');
    handleRecordKeyDown(new KeyboardEvent('keydown', { key: 'p', ctrlKey: true, shiftKey: true }));
    saveRecordedCombo();
    expect(conflictWarning.value).toContain('Atenção: combinação já usada por:');

    startRecording('open-settings');
    saveRecordedCombo();
    stopRecording();
  });
});
