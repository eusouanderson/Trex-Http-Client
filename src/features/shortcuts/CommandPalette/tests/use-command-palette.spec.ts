import { describe, expect, it, vi } from 'vitest';
import { useCommandPalette } from '../use-command-palette';

describe('useCommandPalette', () => {
  it('filters commands based on search query', () => {
    const closeSpy = vi.fn();
    const { searchQuery, filteredCommands } = useCommandPalette({ emit: closeSpy });

    expect(filteredCommands.value.length).toBeGreaterThan(0);

    searchQuery.value = 'Requisição';
    expect(filteredCommands.value.length).toBeGreaterThan(0);

    searchQuery.value = 'termo-inexistente-xyz';
    expect(filteredCommands.value.length).toBe(0);
  });

  it('navigates through items with selectNext and selectPrev', () => {
    const closeSpy = vi.fn();
    const { selectedIndex, selectNext, selectPrev, filteredCommands } = useCommandPalette({
      emit: closeSpy,
    });

    expect(selectedIndex.value).toBe(0);

    selectNext();
    expect(selectedIndex.value).toBe(1);

    selectPrev();
    expect(selectedIndex.value).toBe(0);

    selectPrev();
    expect(selectedIndex.value).toBe(filteredCommands.value.length - 1);
  });

  it('executes item and calls close emit', () => {
    const closeSpy = vi.fn();
    const actionSpy = vi.fn();
    const { executeItem } = useCommandPalette({ emit: closeSpy });

    executeItem({
      id: 'mock-1',
      title: 'Mock Command',
      description: 'Desc',
      category: 'general',
      formattedShortcut: 'Ctrl+M',
      action: actionSpy,
    });

    expect(actionSpy).toHaveBeenCalledOnce();
    expect(closeSpy).toHaveBeenCalledWith('close');
  });

  it('handles empty filtered commands on navigation and enter', () => {
    const { searchQuery, selectNext, selectPrev, handleKeydown } = useCommandPalette();
    searchQuery.value = 'nenhum-comando-vai-bater-xyz';

    selectNext();
    selectPrev();

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    handleKeydown(enterEvent);
    expect(searchQuery.value).toBe('nenhum-comando-vai-bater-xyz');

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    handleKeydown(escEvent);
    expect(searchQuery.value).toBe('');
  });

  it('handles keyboard navigation keys (ArrowDown, ArrowUp, Enter, Escape)', () => {
    const closeSpy = vi.fn();
    const { handleKeydown, selectedIndex, filteredCommands } = useCommandPalette({
      emit: closeSpy,
    });

    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    const preventSpy = vi.spyOn(downEvent, 'preventDefault');
    handleKeydown(downEvent);
    expect(selectedIndex.value).toBe(1);
    expect(preventSpy).toHaveBeenCalled();

    const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    handleKeydown(upEvent);
    expect(selectedIndex.value).toBe(0);

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    handleKeydown(escEvent);
    expect(closeSpy).toHaveBeenCalledWith('close');

    if (filteredCommands.value[0]) {
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      handleKeydown(enterEvent);
      expect(closeSpy).toHaveBeenCalledTimes(2);
    }
  });
});
