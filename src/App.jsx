import { useEffect, useState } from 'react';
import { QRCodeConfigSchema, TEXT_POSITIONS, createInitialAppState } from './types';
import { getContrastRatio, getReadableTextColor } from './lib/contrast';
import { detectLinkType, getLinkTypeLabel, getSuggestedLinkTheme } from './lib/linkDetection';

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

const getContrastFeedback = (value) => {
  if (value >= 4.5) {
    return {
      label: 'Contraste aprovado',
      tone: 'good',
      surface: 'rgba(22, 163, 74, 0.12)',
      border: 'rgba(22, 163, 74, 0.28)',
    };
  }

  if (value >= 3) {
    return {
      label: 'Contraste em atenção',
      tone: 'warning',
      surface: 'rgba(245, 158, 11, 0.14)',
      border: 'rgba(245, 158, 11, 0.3)',
    };
  }

  return {
    label: 'Contraste baixo',
    tone: 'danger',
    surface: 'rgba(220, 38, 38, 0.14)',
    border: 'rgba(220, 38, 38, 0.3)',
  };
};

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

const FieldError = ({ fieldName, error }) => (
  <p className="form-error" id={`${fieldName}-error`} aria-live="polite">
    {error || ' '}
  </p>
);

export default function App() {
  const [appState, setAppState] = useState(() => {
    const initialState = createInitialAppState();

    return {
      ...initialState,
      errors: buildFieldErrors(initialState.config),
      hasManualQrColorOverride: false,
    };
  });

  const updateValue = createValueUpdater(setAppState);
  const { config, errors, hasManualQrColorOverride } = appState;

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

  const suggestedTheme = getSuggestedLinkTheme(config.linkType);
  const linkTypeLabel = getLinkTypeLabel(config.linkType);
  const qrColorSourceLabel = hasManualQrColorOverride
    ? 'Override manual ativo'
    : 'Cor sincronizada automaticamente';
  const previewTextColor = getReadableTextColor(config.bgColor, {
    lightColor: config.textColor,
    darkColor: '#0f172a',
  });
  const textContrastRatio = getContrastRatio(previewTextColor, config.bgColor);
  const qrContrastRatio = getContrastRatio(config.qrColor, config.bgColor);
  const contrastFeedback = getContrastFeedback(textContrastRatio);
  const qrFeedback = getContrastFeedback(qrContrastRatio);
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
          <div>
            <p className="eyebrow">Logo QR Code Generator</p>
            <h1 id="hero-title">QR Codes com identidade de marca.</h1>
          </div>

          <p className="lead">
            Formulário principal com estado unico, validacao inline e base pronta para o preview.
          </p>
        </header>

        <div className="status-row" aria-label="Estado atual da aplicação">
          <span className="status-chip">Entrada unificada</span>
          <span className="status-chip">Validação em tempo real</span>
          <span className="status-chip">Preview no próximo bloco</span>
        </div>

        <div className="layout-grid">
          <section className="panel panel-controls form-panel" aria-labelledby="controls-title">
            <div className="panel-heading">
              <p className="panel-kicker">Controles</p>
              <h2 id="controls-title">Formulario principal</h2>
            </div>

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

              <div className="field-span-2 form-subheading">
                <p>Cores base</p>
                <span>Defina o tom principal do QR, do fundo e do texto agora.</span>
              </div>

              <label className="form-field color-field" htmlFor="qrColor">
                <div className="form-label-row">
                  <span className="form-label">Cor do QR</span>
                  <span className="form-hint">Hexadecimal</span>
                </div>
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
                <p className="form-hint">Sugestão atual: {suggestedTheme.qrColor.toUpperCase()}</p>
              </label>

              <label className="form-field color-field" htmlFor="bgColor">
                <div className="form-label-row">
                  <span className="form-label">Cor de fundo</span>
                  <span className="form-hint">Hexadecimal</span>
                </div>
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
                <div className="form-label-row">
                  <span className="form-label">Cor dos olhos</span>
                  <span className="form-hint">Opcional</span>
                </div>
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
                <div className="form-label-row">
                  <span className="form-label">Cor do texto</span>
                  <span className="form-hint">Hexadecimal</span>
                </div>
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
            <div className="panel-heading">
              <p className="panel-kicker">Estado</p>
              <h2 id="preview-title">Preview funcional do card</h2>
            </div>

            <div className="preview-stage" aria-label="Resumo da configuração atual">
              <article className={`preview-card preview-card-${config.textPosition}`} style={previewStyle}>
                <header className="preview-card-header">
                  <div className="preview-card-heading">
                    <span className="preview-badge">Preview base</span>
                    <p className="preview-kicker">Texto em {config.textPosition === 'top' ? 'topo' : 'base'} com QR e logo reservados</p>
                  </div>

                  <div className="preview-status-group" aria-label="Feedback visual do estado atual">
                    <span className={`preview-status preview-status-${contrastFeedback.tone}`}>
                      {contrastFeedback.label}
                    </span>
                    <span className={`preview-status preview-status-${qrFeedback.tone}`}>
                      QR {formatContrastRatio(qrContrastRatio)} contra o fundo
                    </span>
                  </div>
                </header>

                <div className="preview-card-body">
                  {config.textPosition === 'top' && (
                    <div className="preview-copy-card">
                      <p className="preview-title">
                        {config.title || 'Título do card ainda não definido'}
                      </p>
                      <p className="preview-text">
                        {config.description || 'A descrição curta aparece aqui enquanto o formulário é preenchido.'}
                      </p>
                      {previewDetails}
                    </div>
                  )}

                  <div className="preview-visual">
                    <div className="preview-visual-copy">
                      <span className="preview-visual-label">Área central reservada</span>
                      <strong>QR e logo ainda são placeholders</strong>
                      <p>
                        O card já exibe contraste, leitura e espaço físico para o QR real e para o logo SVG.
                      </p>
                    </div>

                    <div className="preview-qr-shell" aria-hidden="true">
                      <div className="preview-qr-frame">
                        {Array.from({ length: 9 }, (_, index) => (
                          <span key={index} />
                        ))}
                      </div>
                      <div className="preview-logo-slot">{config.showIcon ? 'Logo SVG' : 'Logo oculto'}</div>
                    </div>
                  </div>

                  {config.textPosition === 'bottom' && (
                    <div className="preview-copy-card">
                      <p className="preview-title">
                        {config.title || 'Título do card ainda não definido'}
                      </p>
                      <p className="preview-text">
                        {config.description || 'A descrição curta aparece aqui enquanto o formulário é preenchido.'}
                      </p>
                      {previewDetails}
                    </div>
                  )}
                </div>

                <footer className="preview-card-footer">
                  <span>{config.textPosition === 'top' ? 'Conteúdo acima do QR' : 'Conteúdo abaixo do QR'}</span>
                  <span>{formatLogoScale(config.logoScale)} de escala para o logo</span>
                  <span>{errors.url ? 'URL com ajuste pendente' : 'Validação inline ativa'}</span>
                  <span>{qrColorSourceLabel}</span>
                </footer>
              </article>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}