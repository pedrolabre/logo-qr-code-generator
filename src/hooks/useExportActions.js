import { useState } from 'react';
import { exportCardAsPng } from '../lib/cardExport';
import { downloadQRCode } from '../lib/qr';

export const useExportActions = ({ canExport, qrInstanceRef, cardBackgroundColor }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const handleExportError = (error, fallbackMessage) => {
    const message = error instanceof Error ? error.message : fallbackMessage;

    setExportError(message);
    setTimeout(() => setExportError(''), 5000);
  };

  const handleExportQR = async (extension) => {
    if (!canExport || isExporting || !qrInstanceRef.current) {
      return;
    }

    setIsExporting(true);
    setExportError('');

    try {
      await downloadQRCode(qrInstanceRef.current, extension);
    } catch (error) {
      handleExportError(error, 'Não foi possível iniciar o download. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCard = async () => {
    if (!canExport || isExporting) {
      return;
    }

    setIsExporting(true);
    setExportError('');

    try {
      await exportCardAsPng('preview-card-export-area', cardBackgroundColor);
    } catch (error) {
      handleExportError(error, 'Não foi possível baixar o card. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportError,
    handleExportCard,
    handleExportQR,
    isExporting,
  };
};
