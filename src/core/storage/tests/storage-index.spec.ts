import { describe, it, expect } from 'vitest';
import * as StorageModule from '../index';

describe('Storage Module Barrel Export', () => {
  it('should export all public storage interfaces, classes and utilities', () => {
    expect(StorageModule.createPersistenceStorage).toBeDefined();
    expect(StorageModule.getPersistenceStorage).toBeDefined();
    expect(StorageModule.setPersistenceStorage).toBeDefined();
    expect(StorageModule.DexiePersistenceStorage).toBeDefined();
    expect(StorageModule.SqlitePersistenceStorage).toBeDefined();
    expect(StorageModule.LocalStorageMigrator).toBeDefined();
    expect(StorageModule.initializePersistence).toBeDefined();
    expect(StorageModule.validateCollection).toBeDefined();
    expect(StorageModule.validateEnvironment).toBeDefined();
    expect(StorageModule.validateClientSettings).toBeDefined();
    expect(StorageModule.validateRequestHistoryItem).toBeDefined();
  });
});

