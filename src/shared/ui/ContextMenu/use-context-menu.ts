import type { ComputedRef, Ref } from 'vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { ContextMenuEmits, ContextMenuItem, ContextMenuProps } from './interfaces';

interface UseContextMenuReturn {
  menuRef: Ref<HTMLElement | null>;
  menuStyle: ComputedRef<{ top: string; left: string }>;
  handleSelect: (item: ContextMenuItem) => void;
}

const useContextMenu = (
  props: ContextMenuProps,
  emit: ContextMenuEmits,
): UseContextMenuReturn => {
  const menuRef = ref<HTMLElement | null>(null);

  const menuStyle = computed<{ top: string; left: string }>(() => {
    const estimatedWidth = 200;
    const estimatedHeight = Math.max(100, props.items.length * 36 + 20);
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    let posX = props.x;
    let posY = props.y;

    if (posX + estimatedWidth > winWidth) {
      posX = Math.max(8, winWidth - estimatedWidth - 8);
    }
    if (posY + estimatedHeight > winHeight) {
      posY = Math.max(8, winHeight - estimatedHeight - 8);
    }

    return {
      top: `${posY.toString()}px`,
      left: `${posX.toString()}px`,
    };
  });

  const handleSelect = (item: ContextMenuItem): void => {
    if (item.disabled === true) {
      return;
    }
    item.action();
    emit('select', item);
    emit('close');
  };

  const onKeydown = (event: KeyboardEvent): void => {
    if (!props.isOpen) {
      return;
    }
    if (event.key === 'Escape') {
      emit('close');
    }
  };

  const onMousedown = (event: MouseEvent): void => {
    if (!props.isOpen) {
      return;
    }
    const target = event.target as Node | null;
    if (menuRef.value && target && menuRef.value.contains(target)) {
      return;
    }
    emit('close');
  };

  onMounted(() => {
    window.addEventListener('keydown', onKeydown);
    document.addEventListener('mousedown', onMousedown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown);
    document.removeEventListener('mousedown', onMousedown);
  });

  return {
    menuRef,
    menuStyle,
    handleSelect,
  };
};

export { useContextMenu };

