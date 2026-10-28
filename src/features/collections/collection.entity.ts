import type {
  Collection,
  CollectionItem,
  CreateItemInput,
  ParsedCollectionResult,
} from './interfaces';

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
            url: 'https://eusouanderson.github.io/Trex-Http-Client/get',
          },
          {
            id: 'req-dino-2',
            name: 'Criar Espécime',
            type: 'request',
            method: 'POST',
            url: 'https://eusouanderson.github.io/Trex-Http-Client/post',
            body: JSON.stringify({ name: 'Spinosaurus', period: 'Cretaceous' }, null, 2),
            headers: {
              'Content-Type': 'application/json',
            },
          },
          {
            id: 'req-dino-3',
            name: 'Atualizar Fóssil',
            type: 'request',
            method: 'PUT',
            url: 'https://eusouanderson.github.io/Trex-Http-Client/put',
            body: JSON.stringify({ id: 'dino-1', status: 'Fossilized', museum: 'T-Rex Museum' }, null, 2),
            headers: {
              'Content-Type': 'application/json',
            },
          },
          {
            id: 'req-dino-4',
            name: 'Excluir Registro',
            type: 'request',
            method: 'DELETE',
            url: 'https://eusouanderson.github.io/Trex-Http-Client/delete',
          },
          {
            id: 'req-dino-5',
            name: 'Autenticação Bearer',
            type: 'request',
            method: 'GET',
            url: 'https://eusouanderson.github.io/Trex-Http-Client/auth/bearer',
            headers: {
              Authorization: 'Bearer trex_secret_token_123',
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

  public reorder(collections: Collection[]): void {
    this.collections = [...collections];
  }

  public duplicate(collectionId: string): Collection {
    const target = this.collections.find((col) => col.id === collectionId);
    if (!target) {
      throw new Error(`Collection not found: ${collectionId}`);
    }

    const newId = `col-${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`;
    const clonedItems: CollectionItem[] = target.items.map((item) => ({
      ...item,
      id: `item-${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`,
      headers: item.headers ? { ...item.headers } : undefined,
      params: item.params ? { ...item.params } : undefined,
      auth: item.auth ? JSON.parse(JSON.stringify(item.auth)) as typeof item.auth : undefined,
    }));

    const duplicated: Collection = {
      ...target,
      id: newId,
      name: `${target.name} (Cópia)`,
      auth: target.auth ? JSON.parse(JSON.stringify(target.auth)) as typeof target.auth : undefined,
      items: clonedItems,
    };

    this.collections.push(duplicated);
    return { ...duplicated };
  }

  public clearStatuses(collectionId: string): void {
    const target = this.collections.find((col) => col.id === collectionId);
    if (!target) {
      return;
    }
    target.items = target.items.map((item) => {
      const copy = { ...item };
      delete copy.status;
      return copy;
    });
  }

  public export(collectionId: string): string {
    const target = this.collections.find((col) => col.id === collectionId);
    if (!target) {
      throw new Error(`Collection not found: ${collectionId}`);
    }
    const exportData = {
      info: {
        name: target.name,
        description: target.description,
        schema: 'https://trex-http-client.dev/schemas/collection/v1.0.0/collection.json',
      },
      ...target,
    };
    return JSON.stringify(exportData, null, 2);
  }

  public import(parsed: ParsedCollectionResult): Collection {
    const newId = `col-${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`;
    const idMap = new Map<string, string>();

    const newItems: CollectionItem[] = parsed.items.map((item) => {
      const newItemId = `item-${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`;
      if (typeof item.id === 'string' && item.id.length > 0) {
        idMap.set(item.id, newItemId);
      }
      return {
        id: newItemId,
        name: item.name,
        type: item.type,
        parentId: item.parentId,
        method: item.method,
        url: item.url,
        headers: item.headers ? { ...item.headers } : undefined,
        params: item.params ? { ...item.params } : undefined,
        body: item.body,
        auth: item.auth ? (JSON.parse(JSON.stringify(item.auth)) as typeof item.auth) : undefined,
        testScript: item.testScript,
        status: item.status,
      };
    });

    const remappedItems: CollectionItem[] = newItems.map((item) => {
      if (typeof item.parentId === 'string' && item.parentId.length > 0 && idMap.has(item.parentId)) {
        return {
          ...item,
          parentId: idMap.get(item.parentId),
        };
      }
      return item;
    });

    const newCollection: Collection = {
      id: newId,
      name: parsed.name,
      description: parsed.description,
      auth: parsed.auth ? (JSON.parse(JSON.stringify(parsed.auth)) as typeof parsed.auth) : undefined,
      items: remappedItems,
    };

    this.collections.push(newCollection);
    return { ...newCollection };
  }
}

export { CollectionEntity };
