import type {
  Collection,
  CollectionItem,
  CreateItemInput,
  ICollectionService,
  ILocalCollectionRepository,
} from './interfaces';
import { CollectionEntity } from './collection.entity';

class CollectionService implements ICollectionService {
  private readonly entity: CollectionEntity;

  constructor(
    initial?: Collection[],
    private readonly repository?: ILocalCollectionRepository,
  ) {
    const list = initial ?? repository?.getAll();
    this.entity = new CollectionEntity(list);
  }

  private syncRepository(collectionId: string): void {
    if (!this.repository) return;
    const col = this.entity.all.find((c) => c.id === collectionId);
    if (col) {
      this.repository.save(col);
    }
  }

  public getCollections(): Collection[] {
    if (this.repository) {
      return this.repository.getAll();
    }
    return this.entity.all;
  }

  public createCollection(name: string, description?: string): Collection {
    const created = this.entity.create(name, description);
    this.repository?.save(created);
    return created;
  }

  public updateCollection(id: string, patch: Partial<Collection>): Collection {
    const updated = this.entity.update(id, patch);
    this.repository?.save(updated);
    return updated;
  }

  public deleteCollection(id: string): void {
    this.entity.delete(id);
    this.repository?.delete(id);
  }

  public addItem(collectionId: string, input: CreateItemInput): CollectionItem {
    const item = this.entity.addItem(collectionId, input);
    this.syncRepository(collectionId);
    return item;
  }

  public updateItem(
    collectionId: string,
    itemId: string,
    patch: Partial<CollectionItem>,
  ): CollectionItem {
    const item = this.entity.updateItem(collectionId, itemId, patch);
    this.syncRepository(collectionId);
    return item;
  }

  public updateItemById(
    itemId: string,
    patch: Partial<CollectionItem>,
  ): CollectionItem | null {
    const item = this.entity.updateItemById(itemId, patch);
    if (item) {
      const parentCol = this.entity.all.find((col) =>
        col.items.some((it) => it.id === itemId),
      );
      if (parentCol) {
        this.syncRepository(parentCol.id);
      }
    }
    return item;
  }

  public deleteItem(collectionId: string, itemId: string): void {
    this.entity.deleteItem(collectionId, itemId);
    this.syncRepository(collectionId);
  }

  public reorderItems(collectionId: string, items: CollectionItem[]): void {
    this.entity.reorderItems(collectionId, items);
    this.syncRepository(collectionId);
  }
}

export { CollectionService };
