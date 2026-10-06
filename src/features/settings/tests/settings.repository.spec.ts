import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { SettingsRepository } from '../settings.repository';
import type { ClientSettings } from '../interfaces';
import { DexiePersistenceStorage } from '../../../core/storage/indexeddb/dexie-persistence-storage';

describe('SettingsRepository', () => {
  let storage: DexiePersistenceStorage;
  let repository: SettingsRepository;

  beforeEach(async () => {
    localStorage.clear();
    storage = new DexiePersistenceStorage(`settings-repo-test-${Date.now().toString()}-${Math.random().toString()}`);
    await storage.initialize();
    repository = new SettingsRepository(storage.settings);
  });

  it('should initialize with default settings when localStorage is empty', () => {
    const settings = repository.getSettings();
    expect(settings.theme).toBe('dino');
    expect(settings.orientation).toBe('horizontal');
  });

  it('should initialize from localStorage if available', () => {
    localStorage.setItem('trex_settings', JSON.stringify({ theme: 'raptor-dracula' }));
    const repoWithStorage = new SettingsRepository(storage.settings);
    expect(repoWithStorage.getSettings().theme).toBe('raptor-dracula');
  });

  it('should fallback to defaults if localStorage has invalid JSON', () => {
    localStorage.setItem('trex_settings', '{invalid-json');
    const repoWithCorruptStorage = new SettingsRepository(storage.settings);
    expect(repoWithCorruptStorage.getSettings().theme).toBe('dino');
  });

  it('should save and update settings', () => {
    const updated: ClientSettings = {
      ...repository.getSettings(),
      theme: 'raptor-dracula',
      defaultTimeout: 10000,
    };
    repository.save(updated);
    expect(repository.getSettings().theme).toBe('raptor-dracula');
    expect(repository.getSettings().defaultTimeout).toBe(10000);
  });

  it('should reset settings to default', () => {
    const updated: ClientSettings = {
      ...repository.getSettings(),
      theme: 'pterodactyl-midnight',
    };
    repository.save(updated);
    expect(repository.getSettings().theme).toBe('pterodactyl-midnight');

    const reset = repository.reset();
    expect(reset.theme).toBe('dino');
    expect(repository.getSettings().theme).toBe('dino');
  });

  it('should load settings from persistent storage when present and local is empty', async () => {
    const customSettings: ClientSettings = {
      ...repository.getSettings(),
      theme: 'trex-monokai',
    };
    await storage.settings.saveSettings(customSettings);

    const reloaded = new SettingsRepository(storage.settings);
    await reloaded.load();
    expect(reloaded.getSettings().theme).toBe('trex-monokai');
  });

  it('should sync local storage to persistent storage if both have values on load', async () => {
    localStorage.setItem('trex_settings', JSON.stringify({ theme: 'pterodactyl-midnight' }));
    
    const customSettings: ClientSettings = {
      ...repository.getSettings(),
      theme: 'trex-monokai',
    };
    await storage.settings.saveSettings(customSettings);

    const syncRepo = new SettingsRepository(storage.settings);
    expect(syncRepo.getSettings().theme).toBe('pterodactyl-midnight');

    await syncRepo.load();
    const fromStorage = await storage.settings.getSettings();
    expect(fromStorage?.theme).toBe('pterodactyl-midnight');
  });

  it('should save default settings to persistent storage when empty on load', async () => {
    const emptyStorage = new DexiePersistenceStorage(`empty-settings-${Date.now().toString()}-${Math.random().toString()}`);
    await emptyStorage.initialize();

    const emptyRepo = new SettingsRepository(emptyStorage.settings);
    await emptyRepo.load();

    const fromStorage = await emptyStorage.settings.getSettings();
    expect(fromStorage).not.toBeNull();
    expect(fromStorage?.theme).toBe('dino');

    await emptyStorage.clearAll();
    await emptyStorage.close();
  });
});

