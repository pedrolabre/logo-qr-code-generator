import { useMemo, useState } from 'react';
import {
  normalizeSvgMarkup,
  normalizeSvgMarkupWithInfo,
  readAndSanitizeSvgFile,
  svgMarkupToDataUrl,
} from '../lib/svg';

export const useLogoUpload = () => {
  const [logoUploadState, setLogoUploadState] = useState({
    fileName: '',
    sanitizedMarkup: null,
    error: '',
    warning: '',
  });

  const logoDataUrl = useMemo(() => {
    if (!logoUploadState.sanitizedMarkup) {
      return null;
    }

    try {
      const normalizedMarkup = normalizeSvgMarkup(logoUploadState.sanitizedMarkup);

      return svgMarkupToDataUrl(normalizedMarkup);
    } catch {
      return null;
    }
  }, [logoUploadState.sanitizedMarkup]);

  const handleLogoUpload = async (event) => {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    try {
      const sanitizedSvg = await readAndSanitizeSvgFile(file);
      const normalizedSvg = normalizeSvgMarkupWithInfo(sanitizedSvg);

      setLogoUploadState({
        fileName: file.name,
        sanitizedMarkup: sanitizedSvg,
        error: '',
        warning: normalizedSvg.warning,
      });
    } catch (error) {
      setLogoUploadState((currentState) => ({
        ...currentState,
        warning: '',
        error: error instanceof Error ? error.message : 'Não foi possível processar esse SVG. Tente outro arquivo.',
      }));
    } finally {
      event.currentTarget.value = '';
    }
  };

  return {
    logoDataUrl,
    logoUploadState,
    handleLogoUpload,
  };
};
