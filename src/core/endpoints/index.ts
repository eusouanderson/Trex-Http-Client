import { DemoEndpointEntity } from './demo-endpoint.entity';
import { DemoEndpointService } from './demo-endpoint.service';
import type {
  DinosaurSpecimen,
  DemoRequestEcho,
  DemoGetDinosaursResponse,
  DemoMutationResponse,
  DemoAuthResponse,
  DemoStatusResponse,
  IDemoEndpointEntity,
  IDemoEndpointService,
} from './interfaces';

const createDemoEndpointService = (): DemoEndpointService => {
  const entity = new DemoEndpointEntity();
  return new DemoEndpointService(entity);
};

export {
  DemoEndpointEntity,
  DemoEndpointService,
  createDemoEndpointService,
};

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

