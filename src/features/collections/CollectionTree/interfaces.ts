import type { CollectionItem } from '../interfaces';

interface CollectionTreeProps {
  activeItemId?: string | null;
}

type CollectionTreeEmits = (e: 'selectItem', item: CollectionItem) => void;

export type { CollectionTreeProps, CollectionTreeEmits };
