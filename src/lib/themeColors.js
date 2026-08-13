export const THEME_COLOR_FIELDS = ['qrColor', 'bgColor', 'eyeColor', 'textColor'];

export const THEME_COLOR_FIELD_SET = new Set(THEME_COLOR_FIELDS);

const THEME_COLOR_LABELS = {
  qrColor: 'QR',
  bgColor: 'Fundo',
  eyeColor: 'Olhos',
  textColor: 'Texto',
};

export const createManualColorOverrides = (overrides = {}) =>
  THEME_COLOR_FIELDS.reduce(
    (accumulator, fieldName) => ({
      ...accumulator,
      [fieldName]: Boolean(overrides[fieldName]),
    }),
    {},
  );

export const buildColorSourceSummary = (manualColorOverrides) =>
  THEME_COLOR_FIELDS
    .map((fieldName) => `${THEME_COLOR_LABELS[fieldName]}: ${manualColorOverrides[fieldName] ? 'manual' : 'tema'}`)
    .join(' | ');

export const buildSuggestedThemeSummary = (suggestedTheme) =>
  THEME_COLOR_FIELDS
    .map((fieldName) => `${THEME_COLOR_LABELS[fieldName]} ${suggestedTheme[fieldName].toUpperCase()}`)
    .join(' | ');
