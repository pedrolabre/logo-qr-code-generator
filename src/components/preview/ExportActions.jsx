const ExportActions = ({
  canExport,
  exportActionDescription,
  isExporting,
  onExportCard,
  onExportQR,
  scannability,
}) => (
  <div className="actions-bar" role="group" aria-label="Ações de exportação">
    <button
      type="button"
      className="action-button action-button-primary"
      disabled={!canExport || isExporting}
      aria-disabled={!canExport || isExporting}
      aria-describedby={exportActionDescription}
      title={canExport ? 'Baixar QR em SVG' : 'Aumente o contraste para baixar'}
      onClick={() => onExportQR('svg')}
    >
      {isExporting ? 'Preparando…' : 'Baixar SVG'}
    </button>
    <button
      type="button"
      className="action-button action-button-primary"
      disabled={!canExport || isExporting}
      aria-disabled={!canExport || isExporting}
      aria-describedby={exportActionDescription}
      title={canExport ? 'Baixar QR em PNG' : 'Aumente o contraste para baixar'}
      onClick={() => onExportQR('png')}
    >
      {isExporting ? 'Preparando…' : 'Baixar PNG'}
    </button>
    <button
      type="button"
      className="action-button action-button-secondary"
      disabled={!canExport || isExporting}
      aria-disabled={!canExport || isExporting}
      aria-describedby={exportActionDescription}
      title={canExport ? 'Baixar card completo em PNG' : 'Aumente o contraste para baixar'}
      onClick={onExportCard}
    >
      {isExporting ? 'Preparando…' : 'Baixar card'}
    </button>
    <span className={`scannability-badge scannability-badge-${scannability.level}`}>
      {scannability.label}
    </span>
  </div>
);

export default ExportActions;
