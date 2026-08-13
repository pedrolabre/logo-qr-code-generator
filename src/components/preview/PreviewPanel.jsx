import ExportActions from './ExportActions';
import PreviewCard from './PreviewCard';
import ScannabilityAlert from './ScannabilityAlert';

const PreviewPanel = ({
  canExport,
  colorSourceSummary,
  config,
  contrastFeedback,
  exportActionDescription,
  exportError,
  exportStatusMessage,
  isExporting,
  linkTypeLabel,
  logoDataUrl,
  logoUploadState,
  onExportCard,
  onExportQR,
  previewStyle,
  qrContainerRef,
  qrContrastRatio,
  qrFeedback,
  scannability,
  suggestedThemeSummary,
}) => (
  <section className="panel panel-preview" aria-labelledby="preview-title">
    <h2 id="preview-title" className="sr-only">Prévia do card e exportação</h2>
    <div className="preview-stage" aria-label="Prévia e feedback da configuração atual">
      <PreviewCard
        colorSourceSummary={colorSourceSummary}
        config={config}
        contrastFeedback={contrastFeedback}
        linkTypeLabel={linkTypeLabel}
        logoDataUrl={logoDataUrl}
        logoUploadState={logoUploadState}
        previewStyle={previewStyle}
        qrContainerRef={qrContainerRef}
        qrContrastRatio={qrContrastRatio}
        qrFeedback={qrFeedback}
        suggestedThemeSummary={suggestedThemeSummary}
      />

      {!canExport && <ScannabilityAlert scannability={scannability} />}

      <p className="sr-only" id="export-status" role="status" aria-live="polite">
        {exportStatusMessage}
      </p>

      <ExportActions
        canExport={canExport}
        exportActionDescription={exportActionDescription}
        isExporting={isExporting}
        onExportCard={onExportCard}
        onExportQR={onExportQR}
        scannability={scannability}
      />

      {exportError && (
        <p className="export-error" role="alert">
          {exportError}
        </p>
      )}
    </div>
  </section>
);

export default PreviewPanel;
