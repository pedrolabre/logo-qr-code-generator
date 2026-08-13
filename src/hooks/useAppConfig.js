import { useEffect, useMemo, useState } from 'react';
import { createInitialAppState } from '../types';
import { detectLinkType, getSuggestedLinkTheme } from '../lib/linkDetection';
import { buildFieldErrors } from '../lib/formUtils';
import {
  THEME_COLOR_FIELD_SET,
  THEME_COLOR_FIELDS,
  createManualColorOverrides,
} from '../lib/themeColors';

export const useAppConfig = () => {
  const [appState, setAppState] = useState(() => {
    const initialState = createInitialAppState();

    return {
      ...initialState,
      errors: buildFieldErrors(initialState.config),
      manualColorOverrides: createManualColorOverrides(),
    };
  });

  const { config, errors, manualColorOverrides } = appState;

  const effectiveManualColorOverrides = useMemo(
    () => createManualColorOverrides(manualColorOverrides),
    [manualColorOverrides],
  );

  const updateValue = (fieldName, value) => {
    setAppState((currentState) => {
      const nextConfig = {
        ...currentState.config,
        [fieldName]: value,
      };
      const shouldMarkManualColorOverride = THEME_COLOR_FIELD_SET.has(fieldName);
      const nextManualColorOverrides = shouldMarkManualColorOverride
        ? {
            ...createManualColorOverrides(currentState.manualColorOverrides),
            [fieldName]: true,
          }
        : currentState.manualColorOverrides;

      return {
        ...currentState,
        config: nextConfig,
        errors: buildFieldErrors(nextConfig),
        manualColorOverrides: nextManualColorOverrides,
      };
    });
  };

  useEffect(() => {
    const detectedLinkType = detectLinkType(config.url);
    const suggestedTheme = getSuggestedLinkTheme(detectedLinkType);

    setAppState((currentState) => {
      const nextManualColorOverrides = createManualColorOverrides(currentState.manualColorOverrides);
      const nextConfig = {
        ...currentState.config,
        linkType: detectedLinkType,
      };

      for (const fieldName of THEME_COLOR_FIELDS) {
        if (!nextManualColorOverrides[fieldName]) {
          nextConfig[fieldName] = suggestedTheme[fieldName];
        }
      }

      const hasConfigChanges =
        currentState.config.linkType !== nextConfig.linkType ||
        THEME_COLOR_FIELDS.some((fieldName) => currentState.config[fieldName] !== nextConfig[fieldName]);

      if (!hasConfigChanges) {
        return currentState;
      }

      return {
        ...currentState,
        config: nextConfig,
        errors: buildFieldErrors(nextConfig),
        manualColorOverrides: nextManualColorOverrides,
      };
    });
  }, [config.url]);

  return {
    config,
    errors,
    manualColorOverrides: effectiveManualColorOverrides,
    updateValue,
  };
};
