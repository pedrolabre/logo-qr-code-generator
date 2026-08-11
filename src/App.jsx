import { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeConfigSchema, TEXT_POSITIONS, createInitialAppState } from './types';
import { getContrastRatio, getContrastFeedback, getReadableTextColor, getScannabilityStatus } from './lib/contrast';
import { detectLinkType, getLinkTypeLabel, getSuggestedLinkTheme } from './lib/linkDetection';
import { readAndSanitizeSvgFile, normalizeSvgMarkup, svgMarkupToDataUrl } from './lib/svg';
import { createQRCodeInstance, buildQRCodeOptions, downloadQRCode } from './lib/qr';
import { exportCardAsPng } from './lib/cardExport';

const buildFieldErrors = (config) => {
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

const formatLogoScale = (value) => `${Math.round(value * 100)}%`;

const formatContrastRatio = (value) => `${value.toFixed(1)}:1`;

const buildAriaDescribedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined;

const getFieldErrorId = (fieldName, error) => (error ? `${fieldName}-error` : undefined);

const createValueUpdater = (setAppState) => (fieldName, value) => {
  setAppState((currentState) => {
    const nextConfig = {
      ...currentState.config,
      [fieldName]: value,
    };

    return {
      ...currentState,
      config: nextConfig,
      errors: buildFieldErrors(nextConfig),
    };
  });
};

const FieldError = ({ fieldName, error }) => {
  if (!error) {
    return null;
  }

  return (
    <p className="form-error" id={`${fieldName}-error`} aria-live="polite">
      {error}
    </p>
  );
};

export default function App() {
  const [appState, setAppState] = useState(() => {
    const initialState = createInitialAppState();

    return {
      ...initialState,
      errors: buildFieldErrors(initialState.config),
      hasManualQrColorOverride: false,
    };
  });
  const [logoUploadState, setLogoUploadState] = useState({
    fileName: '',
    sanitizedMarkup: null,
    error: '',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const updateValue = createValueUpdater(setAppState);
  const { config, errors, hasManualQrColorOverride } = appState;

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

  const qrContainerRef = useRef(null);
  const qrInstanceRef = useRef(null);

  useEffect(() => {
    const instance = createQRCodeInstance(config, logoDataUrl);

    qrInstanceRef.current = instance;

    if (qrContainerRef.current) {
      instance.append(qrContainerRef.current);
    }

    return () => {
      qrInstanceRef.current = null;

      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    if (!qrInstanceRef.current) {
      return;
    }

    const nextOptions = buildQRCodeOptions(config, logoDataUrl);

    qrInstanceRef.current.update(nextOptions);
  }, [config, logoDataUrl]);

  useEffect(() => {
    const detectedLinkType = detectLinkType(config.url);
    const suggestedTheme = getSuggestedLinkTheme(detectedLinkType);

    setAppState((currentState) => {
      const nextLinkType = detectedLinkType;
      const nextQrColor = currentState.hasManualQrColorOverride
        ? currentState.config.qrColor
        : suggestedTheme.qrColor;

      if (
        currentState.config.linkType === nextLinkType &&
        currentState.config.qrColor === nextQrColor
      ) {
        return currentState;
      }

      const nextConfig = {
        ...currentState.config,
        linkType: nextLinkType,
        qrColor: nextQrColor,
      };

      return {
        ...currentState,
        config: nextConfig,
        errors: buildFieldErrors(nextConfig),
      };
    });
  }, [config.url]);

  const handleTextChange = (event) => {
    updateValue(event.currentTarget.name, event.currentTarget.value);
  };

  const handleRangeChange = (event) => {
    updateValue('logoScale', event.currentTarget.valueAsNumber);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
  };

  const handleLogoUpload = async (event) => {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    try {
      const sanitizedSvg = await readAndSanitizeSvgFile(file);

      setLogoUploadState({
        fileName: file.name,
        sanitizedMarkup: sanitizedSvg,
        error: '',
      });
    } catch (error) {
      setLogoUploadState((currentState) => ({
        ...currentState,
        error: error instanceof Error ? error.message : 'Não foi possível processar esse SVG. Tente outro arquivo.',
      }));
    } finally {
      event.currentTarget.value = '';
    }
  };

  const handleQrColorChange = (event) => {
    const nextQrColor = event.currentTarget.value;

    setAppState((currentState) => {
      const nextConfig = {
        ...currentState.config,
        qrColor: nextQrColor,
      };

      return {
        ...currentState,
        config: nextConfig,
        errors: buildFieldErrors(nextConfig),
        hasManualQrColorOverride: true,
      };
    });
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
      const message = error instanceof Error ? error.message : 'Não foi possível iniciar o download. Tente novamente.';

      setExportError(message);

      setTimeout(() => setExportError(''), 5000);
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
      await exportCardAsPng('preview-card-export-area', config.bgColor);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível baixar o card. Tente novamente.';

      setExportError(message);

      setTimeout(() => setExportError(''), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const suggestedTheme = getSuggestedLinkTheme(config.linkType);
  const linkTypeLabel = getLinkTypeLabel(config.linkType);
  const qrColorSourceLabel = hasManualQrColorOverride
    ? 'Cor escolhida manualmente'
    : 'Cor sugerida pelo link';
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

  const previewDetails = (
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
        <dt>Cor sugerida</dt>
        <dd>{suggestedTheme.qrColor.toUpperCase()}</dd>
      </div>
    </dl>
  );

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <section className="app-frame" aria-labelledby="hero-title">
        <header className="app-header">
          <p className="eyebrow">Logo QR Code Generator</p>
          <h1 id="hero-title">QR Codes com identidade de marca.</h1>

          <div className="status-row" aria-label="Estado atual da aplicação">
            <span className="status-chip">Dados locais</span>
            <span className="status-chip">Validação ao digitar</span>
            <span className="status-chip">Prévia atualizada</span>
          </div>
        </header>

        <div className="layout-grid">
          <section className="panel panel-controls form-panel" aria-labelledby="controls-title">
            <h2 id="controls-title" className="sr-only">Configuração do QR Code</h2>
            <form className="form-grid" noValidate aria-labelledby="controls-title" onSubmit={handleFormSubmit}>
              <label className="form-field field-span-2" htmlFor="url">
                <div className="form-label-row">
                  <span className="form-label">URL de destino</span>
                  <span className="form-hint" id="url-hint">Obrigatória</span>
                </div>
                <input
                  id="url"
                  name="url"
                  className="text-input"
                  type="url"
                  value={config.url}
                  onChange={handleTextChange}
                  placeholder="Ex.: https://exemplo.com"
                  aria-invalid={Boolean(errors.url)}
                  aria-describedby={buildAriaDescribedBy('url-hint', getFieldErrorId('url', errors.url))}
                  aria-errormessage={getFieldErrorId('url', errors.url)}
                  required
                />
                <FieldError fieldName="url" error={errors.url} />
              </label>

              <label className="form-field" htmlFor="companyName">
                <div className="form-label-row">
                  <span className="form-label">Nome da empresa</span>
                  <span className="form-hint" id="companyName-hint">Opcional</span>
                </div>
                <input
                  id="companyName"
                  name="companyName"
                  className="text-input"
                  type="text"
                  value={config.companyName}
                  onChange={handleTextChange}
                  placeholder="Ex.: Nome da empresa"
                  aria-invalid={Boolean(errors.companyName)}
                  aria-describedby={buildAriaDescribedBy('companyName-hint', getFieldErrorId('companyName', errors.companyName))}
                  aria-errormessage={getFieldErrorId('companyName', errors.companyName)}
                />
                <FieldError fieldName="companyName" error={errors.companyName} />
              </label>

              <label className="form-field" htmlFor="title">
                <div className="form-label-row">
                  <span className="form-label">Título</span>
                  <span className="form-hint" id="title-hint">Até 40 caracteres</span>
                </div>
                <input
                  id="title"
                  name="title"
                  className="text-input"
                  type="text"
                  value={config.title}
                  onChange={handleTextChange}
                  placeholder="Ex.: Acesse nosso catálogo"
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={buildAriaDescribedBy('title-hint', getFieldErrorId('title', errors.title))}
                  aria-errormessage={getFieldErrorId('title', errors.title)}
                />
                <FieldError fieldName="title" error={errors.title} />
              </label>

              <label className="form-field field-span-2" htmlFor="description">
                <div className="form-label-row">
                  <span className="form-label">Descrição curta</span>
                  <span className="form-hint" id="description-hint">Até 50 caracteres</span>
                </div>
                <textarea
                  id="description"
                  name="description"
                  className="text-input text-area"
                  value={config.description}
                  onChange={handleTextChange}
                  placeholder="Ex.: Consulte cardápio, contatos e horários."
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={buildAriaDescribedBy('description-hint', getFieldErrorId('description', errors.description))}
                  aria-errormessage={getFieldErrorId('description', errors.description)}
                  rows={3}
                />
                <FieldError fieldName="description" error={errors.description} />
              </label>

              <div className="form-field field-span-2">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="logoScale">Escala do logo</label>
                  <span className="form-hint" id="logoScale-value">{formatLogoScale(config.logoScale)}</span>
                </div>
                <input
                  id="logoScale"
                  name="logoScale"
                  className="range-input"
                  type="range"
                  min="0.1"
                  max="0.25"
                  step="0.01"
                  value={config.logoScale}
                  onChange={handleRangeChange}
                  aria-invalid={Boolean(errors.logoScale)}
                  aria-describedby={buildAriaDescribedBy('logoScale-value', getFieldErrorId('logoScale', errors.logoScale))}
                  aria-errormessage={getFieldErrorId('logoScale', errors.logoScale)}
                  aria-valuetext={formatLogoScale(config.logoScale)}
                />
                <div className="range-labels" aria-hidden="true">
                  <span>10%</span>
                  <span>25%</span>
                </div>
                <FieldError fieldName="logoScale" error={errors.logoScale} />
              </div>

              <div className="form-field field-span-2">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="logoUpload">Logo SVG</label>
                  <span className="form-hint">Arquivo local</span>
                </div>
                <input
                  id="logoUpload"
                  className="file-input"
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleLogoUpload}
                  aria-invalid={Boolean(logoUploadState.error)}
                  aria-describedby={buildAriaDescribedBy(
                    'logoUpload-help',
                    'logoUpload-status',
                    logoUploadState.error ? 'logoUpload-error' : undefined,
                  )}
                  aria-errormessage={logoUploadState.error ? 'logoUpload-error' : undefined}
                />
                <p className="form-hint" id="logoUpload-help">
                  Envie um SVG. O app remove conteúdo perigoso antes de usar o logo.
                </p>
                {logoUploadState.error && (
                  <p className="form-error" id="logoUpload-error" aria-live="polite">
                    {logoUploadState.error}
                  </p>
                )}
                <p className="upload-status" id="logoUpload-status" aria-live="polite">
                  {logoUploadStatusLabel}
                </p>
              </div>

              <div className="field-span-2 form-subheading">
                <p>Cores</p>
              </div>

              <div className="field-span-2 color-grid">
                <label className="form-field color-field" htmlFor="qrColor">
                  <span className="form-label">QR</span>
                  <div className="color-control">
                    <input
                      id="qrColor"
                      name="qrColor"
                      type="color"
                      value={config.qrColor}
                      onChange={handleQrColorChange}
                      aria-label="Cor do QR Code"
                      aria-invalid={Boolean(errors.qrColor)}
                      aria-describedby={buildAriaDescribedBy('qrColor-value', getFieldErrorId('qrColor', errors.qrColor))}
                      aria-errormessage={getFieldErrorId('qrColor', errors.qrColor)}
                    />
                    <span className="text-input color-value" id="qrColor-value">{config.qrColor.toUpperCase()}</span>
                  </div>
                  <FieldError fieldName="qrColor" error={errors.qrColor} />
                </label>

                <label className="form-field color-field" htmlFor="bgColor">
                  <span className="form-label">Fundo</span>
                  <div className="color-control">
                    <input
                      id="bgColor"
                      name="bgColor"
                      type="color"
                      value={config.bgColor}
                      onChange={handleTextChange}
                      aria-label="Cor de fundo"
                      aria-invalid={Boolean(errors.bgColor)}
                      aria-describedby={buildAriaDescribedBy('bgColor-value', getFieldErrorId('bgColor', errors.bgColor))}
                      aria-errormessage={getFieldErrorId('bgColor', errors.bgColor)}
                    />
                    <span className="text-input color-value" id="bgColor-value">{config.bgColor.toUpperCase()}</span>
                  </div>
                  <FieldError fieldName="bgColor" error={errors.bgColor} />
                </label>

                <label className="form-field color-field" htmlFor="eyeColor">
                  <span className="form-label">Olhos</span>
                  <div className="color-control">
                    <input
                      id="eyeColor"
                      name="eyeColor"
                      type="color"
                      value={config.eyeColor}
                      onChange={handleTextChange}
                      aria-label="Cor dos olhos do QR Code"
                      aria-invalid={Boolean(errors.eyeColor)}
                      aria-describedby={buildAriaDescribedBy('eyeColor-value', getFieldErrorId('eyeColor', errors.eyeColor))}
                      aria-errormessage={getFieldErrorId('eyeColor', errors.eyeColor)}
                    />
                    <span className="text-input color-value" id="eyeColor-value">{config.eyeColor.toUpperCase()}</span>
                  </div>
                  <FieldError fieldName="eyeColor" error={errors.eyeColor} />
                </label>

                <label className="form-field color-field" htmlFor="textColor">
                  <span className="form-label">Texto</span>
                  <div className="color-control">
                    <input
                      id="textColor"
                      name="textColor"
                      type="color"
                      value={config.textColor}
                      onChange={handleTextChange}
                      aria-label="Cor do texto"
                      aria-invalid={Boolean(errors.textColor)}
                      aria-describedby={buildAriaDescribedBy('textColor-value', getFieldErrorId('textColor', errors.textColor))}
                      aria-errormessage={getFieldErrorId('textColor', errors.textColor)}
                    />
                    <span className="text-input color-value" id="textColor-value">{config.textColor.toUpperCase()}</span>
                  </div>
                  <FieldError fieldName="textColor" error={errors.textColor} />
                </label>
              </div>

              <label className="form-field field-span-2" htmlFor="textPosition">
                <div className="form-label-row">
                  <span className="form-label">Posição do texto</span>
                  <span className="form-hint" id="textPosition-hint">Onde o texto aparece</span>
                </div>
                <select
                  id="textPosition"
                  name="textPosition"
                  className="text-input"
                  value={config.textPosition}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.textPosition)}
                  aria-describedby={buildAriaDescribedBy('textPosition-hint', getFieldErrorId('textPosition', errors.textPosition))}
                  aria-errormessage={getFieldErrorId('textPosition', errors.textPosition)}
                >
                  {TEXT_POSITIONS.map((position) => (
                    <option key={position} value={position}>
                      {position === 'top' ? 'Topo' : 'Base'}
                    </option>
                  ))}
                </select>
                <FieldError fieldName="textPosition" error={errors.textPosition} />
              </label>
            </form>
          </section>

          <section className="panel panel-preview" aria-labelledby="preview-title">
            <h2 id="preview-title" className="sr-only">Prévia do card e exportação</h2>
            <div className="preview-stage" aria-label="Prévia e feedback da configuração atual">
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
                      {previewDetails}
                    </div>
                  </div>
                </div>

                <footer className="preview-card-footer exclude-from-export">
                  <span>{formatLogoScale(config.logoScale)} escala</span>
                  <span>{logoDataUrl ? 'Logo pronto' : 'Sem logo'}</span>
                  <span>{qrColorSourceLabel}</span>
                </footer>
              </article>

              {!canExport && (
                <div className="scannability-alert" role="alert">
                  <span className="scannability-alert-icon" aria-hidden="true">⚠</span>
                  <div className="scannability-alert-content">
                    <strong className="scannability-alert-title">{scannability.label}</strong>
                    <p className="scannability-alert-message" id="scannability-alert-message">
                      {scannability.message}
                    </p>
                  </div>
                </div>
              )}

              <p className="sr-only" id="export-status" role="status" aria-live="polite">
                {exportStatusMessage}
              </p>

              <div className="actions-bar" role="group" aria-label="Ações de exportação">
                <button
                  type="button"
                  className="action-button action-button-primary"
                  disabled={!canExport || isExporting}
                  aria-disabled={!canExport || isExporting}
                  aria-describedby={exportActionDescription}
                  title={canExport ? 'Baixar QR em SVG' : 'Aumente o contraste para baixar'}
                  onClick={() => handleExportQR('svg')}
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
                  onClick={() => handleExportQR('png')}
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
                  onClick={handleExportCard}
                >
                  {isExporting ? 'Preparando…' : 'Baixar card'}
                </button>
                <span className={`scannability-badge scannability-badge-${scannability.level}`}>
                  {scannability.label}
                </span>
              </div>
              {exportError && (
                <p className="export-error" role="alert">
                  {exportError}
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
