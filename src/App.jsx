import { useState } from 'react';
import { QRCodeConfigSchema, TEXT_POSITIONS, createInitialAppState } from './types';

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
    };
  });

  const updateValue = createValueUpdater(setAppState);
  const { config, errors } = appState;

  const handleTextChange = (event) => {
    updateValue(event.currentTarget.name, event.currentTarget.value);
  };

  const handleRangeChange = (event) => {
    updateValue('logoScale', event.currentTarget.valueAsNumber);
  };

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
                    onChange={handleTextChange}
                    aria-invalid={Boolean(errors.qrColor)}
                    aria-describedby="qrColor-error"
                  />
                  <span className="text-input color-value">{config.qrColor.toUpperCase()}</span>
                </div>
                <FieldError fieldName="qrColor" error={errors.qrColor} />
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
              <h2 id="preview-title">Resumo do formulário</h2>
            </div>

            <div className="preview-stage" aria-label="Resumo da configuração atual">
              <div className="preview-card">
                <div className="preview-badge">Preview base</div>
                <div className="preview-grid preview-grid-form">
                  <div className="preview-qr preview-qr-placeholder" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="preview-copy">
                    <p className="preview-title">{config.title || 'Título do card ainda não definido'}</p>
                    <p className="preview-text">
                      {config.description || 'A descrição curta aparece aqui enquanto o formulário é preenchido.'}
                    </p>

                    <dl className="preview-summary">
                      <div>
                        <dt>URL</dt>
                        <dd>{config.url}</dd>
                      </div>
                      <div>
                        <dt>Empresa</dt>
                        <dd>{config.companyName || 'Opcional'}</dd>
                      </div>
                      <div>
                        <dt>Escala</dt>
                        <dd>{formatLogoScale(config.logoScale)}</dd>
                      </div>
                      <div>
                        <dt>Texto</dt>
                        <dd>{config.textPosition === 'top' ? 'Topo' : 'Base'}</dd>
                      </div>
                    </dl>

                    <div className="preview-metrics" aria-hidden="true">
                      <span>{errors.url ? 'URL com ajuste pendente' : 'Validação inline ativa'}</span>
                      <span>QR real no próximo bloco</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}