import type { DinosaurSpecimen, IDemoEndpointEntity } from './interfaces';

const INITIAL_DINOSAURS: DinosaurSpecimen[] = [
  {
    id: 'dino-1',
    name: 'Tyrannosaurus Rex',
    period: 'Cretáceo Superior',
    diet: 'Carnívoro',
    lengthMeters: 12.3,
    weightKg: 8400,
    fossilLocation: 'América do Norte',
    dangerLevel: 'Extremo',
  },
  {
    id: 'dino-2',
    name: 'Spinosaurus',
    period: 'Cretáceo Superior',
    diet: 'Carnívoro',
    lengthMeters: 15.0,
    weightKg: 7500,
    fossilLocation: 'Norte da África',
    dangerLevel: 'Extremo',
  },
  {
    id: 'dino-3',
    name: 'Velociraptor',
    period: 'Cretáceo Superior',
    diet: 'Carnívoro',
    lengthMeters: 2.0,
    weightKg: 15,
    fossilLocation: 'Mongólia',
    dangerLevel: 'Alto',
  },
  {
    id: 'dino-4',
    name: 'Triceratops',
    period: 'Cretáceo Superior',
    diet: 'Herbívoro',
    lengthMeters: 9.0,
    weightKg: 6000,
    fossilLocation: 'América do Norte',
    dangerLevel: 'Médio',
  },
  {
    id: 'dino-5',
    name: 'Ankylosaurus',
    period: 'Cretáceo Superior',
    diet: 'Herbívoro',
    lengthMeters: 8.0,
    weightKg: 6000,
    fossilLocation: 'América do Norte',
    dangerLevel: 'Médio',
  },
  {
    id: 'dino-6',
    name: 'Brachiosaurus',
    period: 'Jurássico Superior',
    diet: 'Herbívoro',
    lengthMeters: 26.0,
    weightKg: 40000,
    fossilLocation: 'América do Norte',
    dangerLevel: 'Baixo',
  },
];

class DemoEndpointEntity implements IDemoEndpointEntity {
  private readonly specimens: DinosaurSpecimen[];

  constructor(initialSpecimens?: DinosaurSpecimen[]) {
    this.specimens = initialSpecimens ? [...initialSpecimens] : [...INITIAL_DINOSAURS];
  }

  public getAllDinosaurs = (): DinosaurSpecimen[] => {
    return [...this.specimens];
  };

  public filterDinosaurs = (params?: Record<string, string>): DinosaurSpecimen[] => {
    let result = [...this.specimens];
    if (params === undefined) {
      return result;
    }

    if (typeof params.diet === 'string' && params.diet.trim().length > 0) {
      const targetDiet = params.diet.trim().toLowerCase();
      result = result.filter((d) => d.diet.toLowerCase() === targetDiet);
    }

    if (typeof params.period === 'string' && params.period.trim().length > 0) {
      const targetPeriod = params.period.trim().toLowerCase();
      result = result.filter((d) => d.period.toLowerCase().includes(targetPeriod));
    }

    if (typeof params.search === 'string' && params.search.trim().length > 0) {
      const q = params.search.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.period.toLowerCase().includes(q) ||
          d.fossilLocation.toLowerCase().includes(q) ||
          d.diet.toLowerCase().includes(q),
      );
    }

    const offset = typeof params.offset === 'string' && params.offset.trim().length > 0 ? parseInt(params.offset, 10) : 0;
    const limit = typeof params.limit === 'string' && params.limit.trim().length > 0 ? parseInt(params.limit, 10) : undefined;

    if (!isNaN(offset) && offset > 0) {
      result = result.slice(offset);
    }

    if (limit !== undefined && !isNaN(limit) && limit >= 0) {
      result = result.slice(0, limit);
    }

    return result;
  };

  public createSpecimen = (data?: Record<string, unknown>): DinosaurSpecimen => {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newSpecimen: DinosaurSpecimen = {
      id: `dino-${Date.now().toString()}-${randomSuffix}`,
      name: typeof data?.name === 'string' && data.name.trim().length > 0 ? data.name.trim() : 'Espécime Fóssil Desconhecido',
      period: typeof data?.period === 'string' && data.period.trim().length > 0 ? data.period.trim() : 'Jurássico Indeterminado',
      diet: data?.diet === 'Carnívoro' || data?.diet === 'Onívoro' ? data.diet : 'Herbívoro',
      lengthMeters: typeof data?.lengthMeters === 'number' ? data.lengthMeters : 5.0,
      weightKg: typeof data?.weightKg === 'number' ? data.weightKg : 1000,
      fossilLocation: typeof data?.fossilLocation === 'string' ? data.fossilLocation : 'Bacia Fóssil Trex',
      dangerLevel: data?.dangerLevel === 'Baixo' || data?.dangerLevel === 'Alto' || data?.dangerLevel === 'Extremo' ? data.dangerLevel : 'Médio',
    };

    this.specimens.push(newSpecimen);
    return { ...newSpecimen };
  };

  public updateSpecimen = (id: string, patch?: Record<string, unknown>): DinosaurSpecimen => {
    const target = this.specimens.find((s) => s.id === id);
    if (!target) {
      throw new Error(`Espécime fóssil não encontrado: ${id}`);
    }

    const index = this.specimens.findIndex((s) => s.id === id);
    const updated: DinosaurSpecimen = {
      ...target,
      name: typeof patch?.name === 'string' ? patch.name : target.name,
      period: typeof patch?.period === 'string' ? patch.period : target.period,
      diet: patch?.diet === 'Carnívoro' || patch?.diet === 'Herbívoro' || patch?.diet === 'Onívoro' ? patch.diet : target.diet,
      lengthMeters: typeof patch?.lengthMeters === 'number' ? patch.lengthMeters : target.lengthMeters,
      weightKg: typeof patch?.weightKg === 'number' ? patch.weightKg : target.weightKg,
      fossilLocation: typeof patch?.fossilLocation === 'string' ? patch.fossilLocation : target.fossilLocation,
      dangerLevel: patch?.dangerLevel === 'Baixo' || patch?.dangerLevel === 'Médio' || patch?.dangerLevel === 'Alto' || patch?.dangerLevel === 'Extremo' ? patch.dangerLevel : target.dangerLevel,
    };

    this.specimens[index] = updated;
    return { ...updated };
  };
}

export { DemoEndpointEntity };
