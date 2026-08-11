import { z } from 'zod';
import { DEFAULT_LINK_TYPE, LINK_TYPES } from './lib/linkDetection';
import { HEX_COLOR_PATTERN } from './lib/contrast';

export const TEXT_POSITIONS = Object.freeze(['top', 'bottom']);

const COLOR_FIELD_SCHEMA = z
  .string()
  .trim()
  .regex(HEX_COLOR_PATTERN, { message: 'Use uma cor hexadecimal válida, como #0B5FFF.' });

const OPTIONAL_TEXT_FIELD_SCHEMA = (maxLength, message) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(maxLength, { message }).optional(),
  );

const OPTIONAL_COLOR_FIELD_SCHEMA = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  COLOR_FIELD_SCHEMA.optional(),
);

export const QRCodeConfigSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, { message: 'Informe a URL que o QR Code deve abrir.' })
    .url({ message: 'Use uma URL completa, como https://exemplo.com.' }),
  companyName: OPTIONAL_TEXT_FIELD_SCHEMA(30, 'Use até 30 caracteres para o nome da empresa.'),
  title: OPTIONAL_TEXT_FIELD_SCHEMA(40, 'Use até 40 caracteres para o título do card.'),
  description: OPTIONAL_TEXT_FIELD_SCHEMA(50, 'Use até 50 caracteres para a descrição curta.'),
  logoScale: z
    .number()
    .min(0.1, { message: 'Use logo com pelo menos 10% de escala.' })
    .max(0.25, { message: 'Use no máximo 25% para preservar a leitura.' }),
  qrColor: COLOR_FIELD_SCHEMA,
  bgColor: COLOR_FIELD_SCHEMA,
  eyeColor: OPTIONAL_COLOR_FIELD_SCHEMA,
  textColor: COLOR_FIELD_SCHEMA,
  textPosition: z.enum(TEXT_POSITIONS),
  showIcon: z.boolean(),
  linkType: z.enum(LINK_TYPES).default(DEFAULT_LINK_TYPE),
});

/**
 * @typedef {'website' | 'whatsapp' | 'instagram' | 'facebook' | 'maps' | 'forms' | 'menu'} LinkType
 */

/**
 * @typedef {'top' | 'bottom'} TextPosition
 */

/**
 * @typedef {z.infer<typeof QRCodeConfigSchema>} QRCodeConfig
 */

/**
 * @typedef {Object} AppState
 * @property {QRCodeConfig} config
 * @property {Record<string, string>} errors
 * @property {string | null} logoDataUrl
 * @property {boolean} isExporting
 * @property {boolean} isDraggingFile
 */

export const createDefaultQRCodeConfig = (overrides = {}) => ({
  url: 'https://exemplo.com',
  companyName: '',
  title: '',
  description: '',
  logoScale: 0.18,
  qrColor: '#0b5fff',
  bgColor: '#ffffff',
  eyeColor: '#0f172a',
  textColor: '#0f172a',
  textPosition: 'bottom',
  showIcon: true,
  linkType: DEFAULT_LINK_TYPE,
  ...overrides,
});

export const createInitialAppState = (overrides = {}) => ({
  config: createDefaultQRCodeConfig(overrides.config),
  errors: overrides.errors ? { ...overrides.errors } : {},
  logoDataUrl: overrides.logoDataUrl ?? null,
  isExporting: overrides.isExporting ?? false,
  isDraggingFile: overrides.isDraggingFile ?? false,
});
