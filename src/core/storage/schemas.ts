import { z } from 'zod';
import type { Collection, CollectionItem } from '../../features/collections/interfaces';
import type { Environment } from '../../features/environments/interfaces';
import type { ClientSettings } from '../../features/settings/interfaces';
import type { RequestHistoryItem } from './interfaces';

const httpMethodSchema = z.enum([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]);

const collectionItemSchema: z.ZodType<CollectionItem> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.enum(['request', 'folder']),
    parentId: z.string().nullable().optional(),
    method: httpMethodSchema.optional(),
    url: z.string().optional(),
    headers: z.record(z.string()).optional(),
    params: z.record(z.string()).optional(),
    body: z.string().optional(),
    status: z.number().optional(),
    children: z.array(collectionItemSchema).optional(),
  }),
);

const collectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  items: z.array(collectionItemSchema),
});

const environmentVariableSchema = z.object({
  id: z.string().min(1),
  key: z.string(),
  value: z.string(),
  enabled: z.boolean(),
});

const environmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  variables: z.array(environmentVariableSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const themePaletteSchema = z.enum([
  'dino',
  'trex-monokai',
  'raptor-dracula',
  'pterodactyl-midnight',
  'triceratops-amber',
  'brachiosaurus-light',
]);

const jsonPresetNameSchema = z.enum([
  'dino',
  'trex-monokai',
  'raptor-dracula',
  'pterodactyl-midnight',
  'triceratops-amber',
  'brachiosaurus-light',
  'custom',
]);

const jsonThemeSettingsSchema = z.object({
  preset: jsonPresetNameSchema,
  backgroundColor: z.string(),
  keyColor: z.string(),
  stringColor: z.string(),
  numberColor: z.string(),
  booleanColor: z.string(),
  nullColor: z.string(),
  bracketColor: z.string(),
});

const clientSettingsSchema = z.object({
  theme: themePaletteSchema,
  orientation: z.enum(['horizontal', 'vertical']),
  density: z.enum(['compact', 'comfortable']),
  defaultTimeout: z.number().positive(),
  defaultRetryAttempts: z.number().nonnegative(),
  followRedirects: z.boolean(),
  globalHeaders: z.record(z.string()),
  jsonTheme: jsonThemeSettingsSchema,
});

const requestHistoryItemSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
  method: httpMethodSchema,
  status: z.number().optional(),
  durationMs: z.number().optional(),
  timestamp: z.number(),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
});

const validateCollection = (data: unknown): Collection => {
  return collectionSchema.parse(data);
};

const validateEnvironment = (data: unknown): Environment => {
  return environmentSchema.parse(data);
};

const validateClientSettings = (data: unknown): ClientSettings => {
  return clientSettingsSchema.parse(data);
};

const validateRequestHistoryItem = (data: unknown): RequestHistoryItem => {
  return requestHistoryItemSchema.parse(data);
};

export {
  collectionItemSchema,
  collectionSchema,
  environmentVariableSchema,
  environmentSchema,
  jsonThemeSettingsSchema,
  clientSettingsSchema,
  requestHistoryItemSchema,
  validateCollection,
  validateEnvironment,
  validateClientSettings,
  validateRequestHistoryItem,
};

