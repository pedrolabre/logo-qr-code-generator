import { z } from 'zod';
import { DEFAULT_LINK_TYPE, LINK_TYPES } from './lib/linkDetection';
import { HEX_COLOR_PATTERN } from './lib/contrast';

export const TEXT_POSITIONS = Object.freeze(['top', 'bottom']);

const COLOR_FIELD_SCHEMA = z
  .string()
  .trim()
  .regex(HEX_COLOR_PATTERN, { message: 'Cor hexadecimal invalida.' });

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
    .min(1, { message: 'A URL de destino e obrigatoria.' })
    .url({ message: 'Insira um endereco web valido (ex: https://exemplo.com).' }),
  companyName: OPTIONAL_TEXT_FIELD_SCHEMA(30, 'O nome da empresa deve ter no maximo 30 caracteres.'),
  title: OPTIONAL_TEXT_FIELD_SCHEMA(40, 'O titulo do card deve ter no maximo 40 caracteres.'),
  description: OPTIONAL_TEXT_FIELD_SCHEMA(50, 'A descricao curta deve ter no maximo 50 caracteres.'),
  logoScale: z
    .number()
    .min(0.1, { message: 'A escala do logo deve ser de no minimo 10%.' })
    .max(0.25, { message: 'A escala maxima permitida no MVP e de 25%.' }),
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
  url: 'https://logoqrcodegenerator.com',
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