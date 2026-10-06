import type { Collection, CollectionItem, CreateItemInput } from './interfaces';

class CollectionEntity {
  private collections: Collection[];

  constructor(initial?: Collection[]) {
    this.collections = initial ?? [
      {
        id: 'col-default-trex',
        name: '🦖 Coleção T-Rex',
        description: 'Exemplos pré-históricos de endpoints HTTP',
        items: [
          {
            id: 'req-dino-1',
            name: 'Listar Dinossauros',
            type: 'request',
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts',
          },
          {
            id: 'req-dino-2',
            name: 'Criar Espécime',
            type: 'request',
            method: 'POST',
            url: 'https://jsonplaceholder.typicode.com/posts',
            body: JSON.stringify({ name: 'Spinosaurus', period: 'Cretaceous' }, null, 2),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ],
      },
    ];
  }

  public get all(): Collection[] {
    return [...this.collections];
  }

  public create(name: string, description?: string): Collection {
    const newCollection: Collection = {
      id: `col-${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      description,
      items: [],
    };
    this.collections.push(newCollection);
    return { ...newCollection };
  }

  public update(id: string, patch: Partial<Collection>): Collection {
    const target = this.collections.find((col) => col.id === id);
    if (!target) {
      throw new Error(`Collection not found: ${id}`);
    }
    const updated: Collection = {
      ...target,
      ...patch,
      id: target.id,
      items: patch.items ?? target.items,
    };
    const index = this.collections.findIndex((col) => col.id === id);
    this.collections[index] = updated;
    return { ...updated };
  }

  public delete(id: string): void {
    this.collections = this.collections.filter((col) => col.id !== id);
  }

  public addItem(collectionId: string, input: CreateItemInput): CollectionItem {
    const target = this.collections.find((col) => col.id === collectionId);
    if (!target) {
      throw new Error(`Collection not found: ${collectionId}`);
    }

    const newItem: CollectionItem = {
      id: `item-${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`,
      ...input,
    };

    target.items.push(newItem);
    return { ...newItem };
  }

  public updateItem(
    collectionId: string,
    itemId: string,
    patch: Partial<CollectionItem>,
  ): CollectionItem {
    const target = this.collections.find((col) => col.id === collectionId);
    if (!target) {
      throw new Error(`Collection not found: ${collectionId}`);
    }

    const itemIndex = target.items.findIndex((item) => item.id === itemId);
    const currentItem = target.items[itemIndex];
    if (itemIndex === -1 || !currentItem) {
      throw new Error(`Item not found: ${itemId}`);
    }

    const updated = {
      ...currentItem,
      ...patch,
      id: currentItem.id,
    };

    target.items[itemIndex] = updated;
    return { ...updated };
  }

  public updateItemById(
    itemId: string,
    patch: Partial<CollectionItem>,
  ): CollectionItem | null {
    for (const col of this.collections) {
      const itemIndex = col.items.findIndex((item) => item.id === itemId);
      const currentItem = col.items[itemIndex];
      if (itemIndex !== -1 && currentItem) {
        const updated = {
          ...currentItem,
          ...patch,
          id: currentItem.id,
        };
        col.items[itemIndex] = updated;
        return { ...updated };
      }
    }
    return null;
  }

  public deleteItem(collectionId: string, itemId: string): void {
    const target = this.collections.find((col) => col.id === collectionId);
    if (!target) {
      return;
    }
    target.items = target.items.filter((item) => item.id !== itemId);
  }

  public reorderItems(collectionId: string, items: CollectionItem[]): void {
    const target = this.collections.find((col) => col.id === collectionId);
    if (!target) {
      return;
    }
    target.items = [...items];
  }
}

export { CollectionEntity };
