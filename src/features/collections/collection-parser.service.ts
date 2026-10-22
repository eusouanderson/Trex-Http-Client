import type { GenericCollectionProbe, ICollectionParserService, ParsedCollectionResult } from './interfaces';
import { PostmanParserService } from './postman-parser.service';
import { TrexParserService } from './trex-parser.service';

class CollectionParserService implements ICollectionParserService {
  constructor(
    private readonly postmanParser = new PostmanParserService(),
    private readonly trexParser = new TrexParserService(),
  ) {}

  public readonly parse = (jsonString: string): ParsedCollectionResult => {
    let raw: unknown = null;
    try {
      raw = JSON.parse(jsonString) as unknown;
    } catch {
      throw new Error('Invalid JSON format');
    }

    if (raw === null || typeof raw !== 'object') {
      throw new Error('Unsupported collection format');
    }

    const probe = raw as GenericCollectionProbe;

    const isPostmanSchema =
      typeof probe.info?.schema === 'string' &&
      probe.info.schema.toLowerCase().includes('postman');
    const isPostmanShape =
      probe.info !== undefined &&
      typeof probe.info.name === 'string' &&
      Array.isArray(probe.item);

    if (isPostmanSchema || isPostmanShape) {
      const parsed = this.postmanParser.parse(jsonString);
      return {
        name: parsed.name,
        items: parsed.items,
        variables: parsed.variables,
        format: 'postman',
      };
    }

    const isTrexSchema =
      (typeof probe.info?.schema === 'string' && probe.info.schema.toLowerCase().includes('trex')) ||
      (typeof probe.schema === 'string' && probe.schema.toLowerCase().includes('trex'));
    const isTrexShape =
      Array.isArray(probe.items) &&
      (typeof probe.name === 'string' || typeof probe.info?.name === 'string');

    if (isTrexSchema || isTrexShape) {
      return this.trexParser.parse(jsonString);
    }

    throw new Error('Unsupported collection format');
  };
}

export { CollectionParserService };

