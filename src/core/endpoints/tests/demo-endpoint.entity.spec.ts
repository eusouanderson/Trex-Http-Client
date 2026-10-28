import { describe, expect, it } from 'vitest';
import { DemoEndpointEntity } from '../demo-endpoint.entity';

describe('DemoEndpointEntity', () => {
  it('should return initial list of dinosaurs', () => {
    const entity = new DemoEndpointEntity();
    const list = entity.getAllDinosaurs();

    expect(list.length).toBeGreaterThanOrEqual(6);
    expect(list[0]?.name).toBe('Tyrannosaurus Rex');
    expect(list[0]?.diet).toBe('Carnívoro');
  });

  it('should return all dinosaurs when filterDinosaurs is called without params', () => {
    const entity = new DemoEndpointEntity();
    const all = entity.filterDinosaurs();
    expect(all.length).toBe(entity.getAllDinosaurs().length);
  });

  it('should filter dinosaurs by diet', () => {
    const entity = new DemoEndpointEntity();
    const carnivores = entity.filterDinosaurs({ diet: 'Carnívoro' });
    const herbivores = entity.filterDinosaurs({ diet: 'Herbívoro' });

    expect(carnivores.every((d) => d.diet === 'Carnívoro')).toBe(true);
    expect(herbivores.every((d) => d.diet === 'Herbívoro')).toBe(true);
  });

  it('should filter dinosaurs by name or period search', () => {
    const entity = new DemoEndpointEntity();
    const spinos = entity.filterDinosaurs({ search: 'spino' });
    expect(spinos.length).toBe(1);
    expect(spinos[0]?.name).toBe('Spinosaurus');

    const cretaceous = entity.filterDinosaurs({ period: 'cretáceo' });
    expect(cretaceous.length).toBeGreaterThanOrEqual(3);
  });

  it('should apply limit and offset pagination', () => {
    const entity = new DemoEndpointEntity();
    const paginated = entity.filterDinosaurs({ limit: '2', offset: '1' });
    expect(paginated.length).toBe(2);
    expect(paginated[0]?.name).toBe('Spinosaurus');
  });

  it('should create new dinosaur specimen with generated id', () => {
    const entity = new DemoEndpointEntity();
    const initialCount = entity.getAllDinosaurs().length;

    const created = entity.createSpecimen({
      name: 'Carnotaurus',
      period: 'Cretáceo Superior',
      diet: 'Carnívoro',
      lengthMeters: 7.5,
      weightKg: 1500,
      fossilLocation: 'Argentina',
      dangerLevel: 'Alto',
    });

    expect(created.id).toContain('dino-');
    expect(created.name).toBe('Carnotaurus');
    expect(entity.getAllDinosaurs().length).toBe(initialCount + 1);
  });

  it('should use default values when creating specimen without all fields', () => {
    const entity = new DemoEndpointEntity();
    const created = entity.createSpecimen();

    expect(created.name).toBe('Espécime Fóssil Desconhecido');
    expect(created.diet).toBe('Herbívoro');
    expect(created.dangerLevel).toBe('Médio');
  });

  it('should accept custom initial specimens in constructor', () => {
    const custom = [
      {
        id: 'custom-1',
        name: 'CustomDino',
        period: 'Triássico',
        diet: 'Onívoro' as const,
        lengthMeters: 3,
        weightKg: 200,
        fossilLocation: 'Brasil',
        dangerLevel: 'Baixo' as const,
      },
    ];
    const entity = new DemoEndpointEntity(custom);
    expect(entity.getAllDinosaurs()).toHaveLength(1);
    expect(entity.getAllDinosaurs()[0]?.name).toBe('CustomDino');
  });

  it('should update all fields of existing dinosaur specimen', () => {
    const entity = new DemoEndpointEntity();
    const updated = entity.updateSpecimen('dino-1', {
      name: 'Tyrannosaurus Rex Rex',
      period: 'Cretáceo Final',
      diet: 'Onívoro',
      lengthMeters: 13.0,
      weightKg: 9000,
      fossilLocation: 'Hell Creek, EUA',
      dangerLevel: 'Extremo',
    });

    expect(updated.id).toBe('dino-1');
    expect(updated.name).toBe('Tyrannosaurus Rex Rex');
    expect(updated.period).toBe('Cretáceo Final');
    expect(updated.diet).toBe('Onívoro');
    expect(updated.lengthMeters).toBe(13.0);
    expect(updated.weightKg).toBe(9000);
    expect(updated.fossilLocation).toBe('Hell Creek, EUA');
    expect(updated.dangerLevel).toBe('Extremo');
  });

  it('should throw error when updating non-existent specimen', () => {
    const entity = new DemoEndpointEntity();
    expect(() => entity.updateSpecimen('inexistente-123', { name: 'Novo' })).toThrow(
      'Espécime fóssil não encontrado: inexistente-123',
    );
  });
});
