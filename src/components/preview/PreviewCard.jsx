import { formatContrastRatio, formatLogoScale } from '../../lib/formUtils';
import PreviewDetails from './PreviewDetails';

const PreviewCard = ({
  colorSourceSummary,
  config,
  contrastFeedback,
  linkTypeLabel,
  logoDataUrl,
  logoUploadState,
  previewStyle,
  qrContainerRef,
  qrContrastRatio,
  qrFeedback,
  suggestedThemeSummary,
}) => (
  <article className={`preview-card preview-card-${config.textPosition}`} style={previewStyle}>
    <header className="preview-card-header exclude-from-export">
      <span className="preview-badge">Prévia</span>
      <div
        className="preview-status-group"
        role="status"
        aria-live="polite"
        aria-label="Feedback visual do estado atual"
      >
        <span className={`preview-status preview-status-${contrastFeedback.tone}`}>
          {contrastFeedback.label}
        </span>
        <span className={`preview-status preview-status-${qrFeedback.tone}`}>
          QR {formatContrastRatio(qrContrastRatio)}
        </span>
      </div>
    </header>

    <div id="preview-card-export-area" className="preview-card-body" style={{ backgroundColor: config.bgColor }}>
      <div
        className="preview-visual"
        role="img"
        aria-label={`Prévia do QR Code apontando para ${config.url}`}
      >
        <div className="preview-qr-mount" ref={qrContainerRef} />
      </div>

      <div className="preview-copy-card">
        <p className="preview-title">
          {config.title || 'Digite um título para o card'}
        </p>
        <p className="preview-text">
          {config.description || 'A descrição opcional aparece aqui.'}
        </p>
        <div className="exclude-from-export">
          <PreviewDetails
            config={config}
            linkTypeLabel={linkTypeLabel}
            logoUploadState={logoUploadState}
            suggestedThemeSummary={suggestedThemeSummary}
          />
        </div>
      </div>
    </div>

    <footer className="preview-card-footer exclude-from-export">
      <span>{formatLogoScale(config.logoScale)} escala</span>
      <span>{logoDataUrl ? 'Logo pronto' : 'Sem logo'}</span>
      <span>{colorSourceSummary}</span>
    </footer>
  </article>
);

export default PreviewCard;
