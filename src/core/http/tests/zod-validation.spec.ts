import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { createTrexClient, TrexError } from '../index';

describe('TrexClient - Zod Validation', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should validate and infer data correctly with schema', async () => {
    const DinoSchema = z.object({
      id: z.number(),
      species: z.string(),
      carnivore: z.boolean(),
    });

    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 1,
          species: 'Tyrannosaurus Rex',
          carnivore: true,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    const result = await client.get('/dinos/1', {
      schema: DinoSchema,
    });

    expect(result).toEqual({
      id: 1,
      species: 'Tyrannosaurus Rex',
      carnivore: true,
    });
  });

  it('should apply schema transforms correctly', async () => {
    const DinoTransformSchema = z.object({
      name: z.string().transform((val) => val.toUpperCase()),
      discoveredYear: z.string().transform((val) => parseInt(val, 10)),
    });

    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          name: 'velociraptor',
          discoveredYear: '1924',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    const result = await client.get('/dinos/raptor', {
      schema: DinoTransformSchema,
    });

    expect(result).toEqual({
      name: 'VELOCIRAPTOR',
      discoveredYear: 1924,
    });
  });

  it('should throw TrexError with VALIDATION_ERROR when schema parsing fails', async () => {
    const StrictDinoSchema = z.object({
      id: z.number(),
      heightInMeters: z.number(),
    });

    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 1,
          heightInMeters: 'not-a-number',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const client = createTrexClient({
      baseURL: 'https://api.dinossauro.dev',
      fetch: mockFetch,
    });

    await expect(
      client.get('/dinos/invalid', { schema: StrictDinoSchema }),
    ).rejects.toThrow(TrexError);

    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 1,
          heightInMeters: 'not-a-number',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    try {
      await client.get('/dinos/invalid', { schema: StrictDinoSchema });
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(TrexError);
      const trexError = error as TrexError;
      expect(trexError.code).toBe('VALIDATION_ERROR');
      expect(trexError.cause).toBeInstanceOf(z.ZodError);
    }
  });
});
