import { QRCodeConfigSchema } from '../types';

export const buildFieldErrors = (config) => {
  const validationResult = QRCodeConfigSchema.safeParse(config);

  if (validationResult.success) {
    return {};
  }

  return validationResult.error.issues.reduce((accumulator, issue) => {
    const fieldName = issue.path[0];

    if (typeof fieldName === 'string' && accumulator[fieldName] === undefined) {
      accumulator[fieldName] = issue.message;
    }

    return accumulator;
  }, {});
};

export const formatLogoScale = (value) => `${Math.round(value * 100)}%`;

export const formatContrastRatio = (value) => `${value.toFixed(1)}:1`;

export const buildAriaDescribedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined;

export const getFieldErrorId = (fieldName, error) => (error ? `${fieldName}-error` : undefined);
