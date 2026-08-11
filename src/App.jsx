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
        error: error instanceof Error ? error.message : 'Nao foi possivel processar o SVG enviado.',
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
      const message = error instanceof Error ? error.message : 'Erro ao exportar.';

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
      const message = error instanceof Error ? error.message : 'Erro ao exportar o card.';

      setExportError(message);

      setTimeout(() => setExportError(''), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const suggestedTheme = getSuggestedLinkTheme(config.linkType);
  const linkTypeLabel = getLinkTypeLabel(config.linkType);
  const qrColorSourceLabel = hasManualQrColorOverride
    ? 'Override manual ativo'
    : 'Cor sincronizada automaticamente';
  const logoUploadStatusLabel = logoDataUrl
    ? `Logo normalizado: ${logoUploadState.fileName}`
    : 'Nenhum logo SVG carregado';
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
        <dd>{config.companyName || 'Opcional'}</dd>
      </div>
      <div>
        <dt>Logo SVG</dt>
        <dd>{logoUploadState.sanitizedMarkup ? logoUploadState.fileName : 'Aguardando upload'}</dd>
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
            <span className="status-chip">Entrada unificada</span>
            <span className="status-chip">Validação em tempo real</span>
            <span className="status-chip">Preview</span>
          </div>
        </header>

        <div className="layout-grid">
          <section className="panel panel-controls form-panel" aria-labelledby="controls-title">
            <form className="form-grid" noValidate>
              <label className="form-field field-span-2" htmlFor="url">
                <div className="form-label-row">
                  <span className="form-label">URL de destino</span>
                  <span className="form-hint">Obrigatoria</span>
                </div>
                <input
                  id="url"
                  name="url"
                  className="text-input"
                  type="url"
                  value={config.url}
                  onChange={handleTextChange}
                  placeholder="https://sua-marca.com"
                  aria-invalid={Boolean(errors.url)}
                  aria-describedby="url-error"
                  required
                />
                <FieldError fieldName="url" error={errors.url} />
              </label>

              <label className="form-field" htmlFor="companyName">
                <div className="form-label-row">
                  <span className="form-label">Nome da empresa</span>
                  <span className="form-hint">Opcional</span>
                </div>
                <input
                  id="companyName"
                  name="companyName"
                  className="text-input"
                  type="text"
                  value={config.companyName}
                  onChange={handleTextChange}
                  placeholder="Ex.: Studio Atlas"
                  aria-invalid={Boolean(errors.companyName)}
                  aria-describedby="companyName-error"
                />
                <FieldError fieldName="companyName" error={errors.companyName} />
              </label>

              <label className="form-field" htmlFor="title">
                <div className="form-label-row">
                  <span className="form-label">Título</span>
                  <span className="form-hint">Até 40 caracteres</span>
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
                  aria-describedby="title-error"
                />
                <FieldError fieldName="title" error={errors.title} />
              </label>

              <label className="form-field field-span-2" htmlFor="description">
                <div className="form-label-row">
                  <span className="form-label">Descrição curta</span>
                  <span className="form-hint">Até 50 caracteres</span>
                </div>
                <textarea
                  id="description"
                  name="description"
                  className="text-input text-area"
                  value={config.description}
                  onChange={handleTextChange}
                  placeholder="Ex.: Consulte cardápio, contatos e horários."
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby="description-error"
                  rows={3}
                />
                <FieldError fieldName="description" error={errors.description} />
              </label>

              <div className="form-field field-span-2">
                <div className="form-label-row">
                  <span className="form-label">Escala do logo</span>
                  <span className="form-hint">{formatLogoScale(config.logoScale)}</span>
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
                  aria-describedby="logoScale-error"
                />
                <div className="range-labels" aria-hidden="true">
                  <span>10%</span>
                  <span>25%</span>
                </div>
                <FieldError fieldName="logoScale" error={errors.logoScale} />
              </div>

              <div className="form-field field-span-2">
                <div className="form-label-row">
                  <span className="form-label">Logo SVG</span>
                  <span className="form-hint">Apenas SVG limpo</span>
                </div>
                <input
                  id="logoUpload"
                  className="file-input"
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleLogoUpload}
                  aria-invalid={Boolean(logoUploadState.error)}
                  aria-describedby="logoUpload-help logoUpload-error"
                />
                <p className="form-hint" id="logoUpload-help">
                  O arquivo e validado como SVG, tags perigosas sao removidas e erros nao quebram a tela.
                </p>
                {logoUploadState.error && (
                  <p className="form-error" id="logoUpload-error" aria-live="polite">
                    {logoUploadState.error}
                  </p>
                )}
                <p className="upload-status">{logoUploadStatusLabel}</p>
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
                      aria-invalid={Boolean(errors.qrColor)}
                      aria-describedby="qrColor-error"
                    />
                    <span className="text-input color-value">{config.qrColor.toUpperCase()}</span>
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
                      aria-invalid={Boolean(errors.bgColor)}
                      aria-describedby="bgColor-error"
                    />
                    <span className="text-input color-value">{config.bgColor.toUpperCase()}</span>
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
                      aria-invalid={Boolean(errors.eyeColor)}
                      aria-describedby="eyeColor-error"
                    />
                    <span className="text-input color-value">{config.eyeColor.toUpperCase()}</span>
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
                      aria-invalid={Boolean(errors.textColor)}
                      aria-describedby="textColor-error"
                    />
                    <span className="text-input color-value">{config.textColor.toUpperCase()}</span>
                  </div>
                  <FieldError fieldName="textColor" error={errors.textColor} />
                </label>
              </div>

              <label className="form-field field-span-2" htmlFor="textPosition">
                <div className="form-label-row">
                  <span className="form-label">Posição do texto</span>
                  <span className="form-hint">Topo ou base do card</span>
                </div>
                <select
                  id="textPosition"
                  name="textPosition"
                  className="text-input"
                  value={config.textPosition}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.textPosition)}
                  aria-describedby="textPosition-error"
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
            <div className="preview-stage" aria-label="Resumo da configuração atual">
              <article className={`preview-card preview-card-${config.textPosition}`} style={previewStyle}>
                <header className="preview-card-header exclude-from-export">
                  <span className="preview-badge">Preview</span>
                  <div className="preview-status-group" aria-label="Feedback visual do estado atual">
                    <span className={`preview-status preview-status-${contrastFeedback.tone}`}>
                      {contrastFeedback.label}
                    </span>
                    <span className={`preview-status preview-status-${qrFeedback.tone}`}>
                      QR {formatContrastRatio(qrContrastRatio)}
                    </span>
                  </div>
                </header>

                <div id="preview-card-export-area" className="preview-card-body" style={{ backgroundColor: config.bgColor }}>
                  <div className="preview-visual">
                    <div className="preview-qr-mount" ref={qrContainerRef} />
                  </div>

                  <div className="preview-copy-card">
                    <p className="preview-title">
                      {config.title || 'Título do card ainda não definido'}
                    </p>
                    <p className="preview-text">
                      {config.description || 'A descrição curta aparece aqui enquanto o formulário é preenchido.'}
                    </p>
                    <div className="exclude-from-export">
                      {previewDetails}
                    </div>
                  </div>
                </div>

                <footer className="preview-card-footer exclude-from-export">
                  <span>{formatLogoScale(config.logoScale)} escala</span>
                  <span>{logoDataUrl ? 'Logo pronto' : 'SVG pendente'}</span>
                  <span>{qrColorSourceLabel}</span>
                </footer>
              </article>

              {!canExport && (
                <div className="scannability-alert" role="alert">
                  <span className="scannability-alert-icon" aria-hidden="true">⚠</span>
                  <div className="scannability-alert-content">
                    <strong className="scannability-alert-title">{scannability.label}</strong>
                    <p className="scannability-alert-message">{scannability.message}</p>
                  </div>
                </div>
              )}

              <div className="actions-bar" aria-label="Ações de exportação">
                <button
                  type="button"
                  className="action-button action-button-primary"
                  disabled={!canExport || isExporting}
                  aria-disabled={!canExport || isExporting}
                  title={canExport ? 'Exportar QR em SVG' : 'Corrija o contraste para exportar'}
                  onClick={() => handleExportQR('svg')}
                >
                  {isExporting ? 'Exportando…' : 'Exportar SVG'}
                </button>
                <button
                  type="button"
                  className="action-button action-button-primary"
                  disabled={!canExport || isExporting}
                  aria-disabled={!canExport || isExporting}
                  title={canExport ? 'Exportar QR em PNG' : 'Corrija o contraste para exportar'}
                  onClick={() => handleExportQR('png')}
                >
                  {isExporting ? 'Exportando…' : 'Exportar PNG'}
                </button>
                <button
                  type="button"
                  className="action-button action-button-secondary"
                  disabled={!canExport || isExporting}
                  aria-disabled={!canExport || isExporting}
                  title={canExport ? 'Exportar card completo em PNG' : 'Corrija o contraste para exportar'}
                  onClick={handleExportCard}
                >
                  {isExporting ? 'Exportando…' : 'Exportar Card'}
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