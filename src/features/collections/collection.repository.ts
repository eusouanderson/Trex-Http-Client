import type { Collection, ILocalCollectionRepository } from './interfaces';
import type { ICollectionRepository as IPersistentCollectionRepository } from '../../core/storage/interfaces';
import { getPersistenceStorage } from '../../core/storage/storage.factory';

const DEFAULT_COLLECTIONS: Collection[] = [
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

class CollectionRepository implements ILocalCollectionRepository {
  private readonly STORAGE_KEY = 'trex_collections';
  private cache: Collection[] = [];
  private readonly persistentRepo: IPersistentCollectionRepository;

  constructor(persistentRepo?: IPersistentCollectionRepository) {
    this.persistentRepo = persistentRepo ?? getPersistenceStorage().collections;
    this.cache = this.readStorage();
  }

  private readStorage(): Collection[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw === null || raw.length === 0) return [...DEFAULT_COLLECTIONS];
      const parsed = JSON.parse(raw) as Collection[];
      return parsed.length > 0 ? parsed : [...DEFAULT_COLLECTIONS];
    } catch {
      return [...DEFAULT_COLLECTIONS];
    }
  }

  private writeStorage(data: Collection[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  public readonly load = async (): Promise<void> => {
    const stored = await this.persistentRepo.getAll();
    if (stored.length > 0) {
      this.cache = [...stored];
      this.writeStorage(this.cache);
    } else {
      await this.persistentRepo.bulkSave(this.cache);
    }
  };

  public readonly getAll = (): Collection[] => {
    return [...this.cache];
  };

  public readonly getById = (id: string): Collection | null => {
    const found = this.cache.find((c) => c.id === id);
    return found ? { ...found } : null;
  };

  public readonly save = (collection: Collection): void => {
    const index = this.cache.findIndex((c) => c.id === collection.id);
    if (index >= 0) {
      this.cache[index] = { ...collection };
    } else {
      this.cache.push({ ...collection });
    }
    this.writeStorage(this.cache);
    void this.persistentRepo.save(collection);
  };

  public readonly delete = (id: string): void => {
    this.cache = this.cache.filter((c) => c.id !== id);
    this.writeStorage(this.cache);
    void this.persistentRepo.delete(id);
  };

  public readonly reorder = (collections: Collection[]): void => {
    this.cache = [...collections];
    this.writeStorage(this.cache);
    void this.persistentRepo.bulkSave(collections);
  };
}

export { CollectionRepository, DEFAULT_COLLECTIONS };
