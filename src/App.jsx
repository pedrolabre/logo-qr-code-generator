import { getContrastFeedback, getContrastRatio, getReadableTextColor, getScannabilityStatus } from './lib/contrast';
import { getLinkTypeLabel, getSuggestedLinkTheme } from './lib/linkDetection';
import { buildAriaDescribedBy } from './lib/formUtils';
import { buildColorSourceSummary, buildSuggestedThemeSummary } from './lib/themeColors';
import AppHeader from './components/AppHeader';
import ControlsPanel from './components/controls/ControlsPanel';
import PreviewPanel from './components/preview/PreviewPanel';
import { useAppConfig } from './hooks/useAppConfig';
import { useExportActions } from './hooks/useExportActions';
import { useLogoUpload } from './hooks/useLogoUpload';
import { useQrCode } from './hooks/useQrCode';
import { useThemeMode } from './hooks/useThemeMode';

export default function App() {
  const { theme, toggleTheme } = useThemeMode();
  const { config, errors, manualColorOverrides, updateValue } = useAppConfig();
  const { logoDataUrl, logoUploadState, handleLogoUpload } = useLogoUpload();
  const { qrContainerRef, qrInstanceRef } = useQrCode(config, logoDataUrl);

  const suggestedTheme = getSuggestedLinkTheme(config.linkType);
  const linkTypeLabel = getLinkTypeLabel(config.linkType);
  const colorSourceSummary = buildColorSourceSummary(manualColorOverrides);
  const suggestedThemeSummary = buildSuggestedThemeSummary(suggestedTheme);
  const logoUploadStatusLabel = logoDataUrl
    ? `Logo pronto: ${logoUploadState.fileName}`
    : 'Sem logo: envie um SVG para marcar o centro';
  const previewTextColor = getReadableTextColor(config.bgColor, {
    lightColor: config.textColor,
    darkColor: '#0f172a',
  });
  const textContrastRatio = getContrastRatio(previewTextColor, config.bgColor);
  const qrContrastRatio = getContrastRatio(config.qrColor, config.bgColor);
  const contrastFeedback = getContrastFeedback(textContrastRatio);
  const qrFeedback = getContrastFeedback(qrContrastRatio);
  const scannability = getScannabilityStatus(qrContrastRatio);
  const canExport = scannability.canExport;
  const {
    exportError,
    handleExportCard,
    handleExportQR,
    isExporting,
  } = useExportActions({
    canExport,
    cardBackgroundColor: config.bgColor,
    qrInstanceRef,
  });
  const exportActionDescription = buildAriaDescribedBy(
    'export-status',
    !canExport ? 'scannability-alert-message' : undefined,
  );
  const exportStatusMessage = isExporting
    ? 'Download em preparo.'
    : canExport
      ? 'Downloads liberados.'
      : scannability.message;
  const previewStyle = {
    '--preview-bg': config.bgColor,
    '--preview-accent': config.qrColor,
    '--preview-eye': config.eyeColor || config.qrColor,
    '--preview-text': previewTextColor,
    '--preview-surface': contrastFeedback.surface,
    '--preview-border': contrastFeedback.border,
  };

  const handleTextChange = (event) => {
    updateValue(event.currentTarget.name, event.currentTarget.value);
  };

  const handleRangeChange = (event) => {
    updateValue('logoScale', event.currentTarget.valueAsNumber);
  };

  const handleColorChange = (event) => {
    updateValue(event.currentTarget.name, event.currentTarget.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <section className="app-frame" aria-labelledby="hero-title">
        <AppHeader theme={theme} onToggleTheme={toggleTheme} />

        <div className="layout-grid">
          <ControlsPanel
            config={config}
            errors={errors}
            logoUploadState={logoUploadState}
            logoUploadStatusLabel={logoUploadStatusLabel}
            onColorChange={handleColorChange}
            onLogoUpload={handleLogoUpload}
            onRangeChange={handleRangeChange}
            onSubmit={handleFormSubmit}
            onTextChange={handleTextChange}
          />

          <PreviewPanel
            canExport={canExport}
            colorSourceSummary={colorSourceSummary}
            config={config}
            contrastFeedback={contrastFeedback}
            exportActionDescription={exportActionDescription}
            exportError={exportError}
            exportStatusMessage={exportStatusMessage}
            isExporting={isExporting}
            linkTypeLabel={linkTypeLabel}
            logoDataUrl={logoDataUrl}
            logoUploadState={logoUploadState}
            onExportCard={handleExportCard}
            onExportQR={handleExportQR}
            previewStyle={previewStyle}
            qrContainerRef={qrContainerRef}
            qrContrastRatio={qrContrastRatio}
            qrFeedback={qrFeedback}
            scannability={scannability}
            suggestedThemeSummary={suggestedThemeSummary}
          />
        </div>
      </section>
    </main>
  );
}
