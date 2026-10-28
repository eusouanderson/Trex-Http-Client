interface DinosaurSpecimen {
  id: string;
  name: string;
  period: string;
  diet: 'Carnívoro' | 'Herbívoro' | 'Onívoro';
  lengthMeters: number;
  weightKg: number;
  fossilLocation: string;
  dangerLevel: 'Baixo' | 'Médio' | 'Alto' | 'Extremo';
}

interface DemoRequestEcho {
  url: string;
  method: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body?: unknown;
}

interface DemoGetDinosaursResponse {
  message: string;
  total: number;
  count: number;
  dinosaurs: DinosaurSpecimen[];
  echo: DemoRequestEcho;
  timestamp: string;
}

interface DemoMutationResponse {
  success: boolean;
  message: string;
  data?: unknown;
  echo: DemoRequestEcho;
  timestamp: string;
}

interface DemoAuthResponse {
  authenticated: boolean;
  authType: 'bearer' | 'basic' | 'api-key';
  user?: string;
  tokenMasked?: string;
  apiKeyMasked?: string;
  error?: string;
  requiredHeader?: string;
  timestamp: string;
}

interface DemoStatusResponse {
  status: number;
  statusText: string;
  message: string;
  timestamp: string;
}

interface IDemoEndpointEntity {
  getAllDinosaurs(): DinosaurSpecimen[];
  filterDinosaurs(params?: Record<string, string>): DinosaurSpecimen[];
  createSpecimen(data?: Record<string, unknown>): DinosaurSpecimen;
  updateSpecimen(id: string, patch?: Record<string, unknown>): DinosaurSpecimen;
}

interface IDemoEndpointService {
  matches(url: string): boolean;
  dispatch(url: string, init?: RequestInit): Promise<Response>;
}

export type {
  DinosaurSpecimen,
  DemoRequestEcho,
  DemoGetDinosaursResponse,
  DemoMutationResponse,
  DemoAuthResponse,
  DemoStatusResponse,
  IDemoEndpointEntity,
  IDemoEndpointService,
};

