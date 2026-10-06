import { getPersistenceStorage } from './storage.factory';
import { LocalStorageMigrator } from './migrations/local-storage-migrator';

const initializePersistence = async (): Promise<void> => {
  const storage = getPersistenceStorage();
  await storage.initialize();
  const migrator = new LocalStorageMigrator(storage);
  await migrator.migrate();
};

export { initializePersistence };

