const PreviewDetails = ({ config, linkTypeLabel, logoUploadState, suggestedThemeSummary }) => (
  <dl className="preview-summary preview-summary-grid">
    <div>
      <dt>URL</dt>
      <dd>{config.url}</dd>
    </div>
    <div>
      <dt>Empresa</dt>
      <dd>{config.companyName || 'Sem nome no card'}</dd>
    </div>
    <div>
      <dt>Logo SVG</dt>
      <dd>{logoUploadState.sanitizedMarkup ? logoUploadState.fileName : 'Sem logo carregado'}</dd>
    </div>
    <div>
      <dt>Tipo detectado</dt>
      <dd>{linkTypeLabel}</dd>
    </div>
    <div>
      <dt>Tema de cores</dt>
      <dd>{suggestedThemeSummary}</dd>
    </div>
  </dl>
);

export default PreviewDetails;
