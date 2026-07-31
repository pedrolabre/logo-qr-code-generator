export default function App() {
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
            Interface client-side, sem backend, pronta para os contratos e o preview.
          </p>
        </header>

        <div className="status-row" aria-label="Características da base da aplicação">
          <span className="status-chip">SPA local</span>
          <span className="status-chip">React + Vite</span>
          <span className="status-chip">JavaScript</span>
        </div>

        <div className="layout-grid">
          <section className="panel panel-controls" aria-labelledby="controls-title">
            <div className="panel-heading">
              <p className="panel-kicker">Controles</p>
              <h2 id="controls-title">Base de configuração</h2>
            </div>

            <div className="mock-control mock-control-large">
              <span className="mock-label">URL de destino</span>
              <div className="mock-input" aria-hidden="true">https://exemplo.com.br</div>
            </div>

            <div className="mock-control-row" aria-hidden="true">
              <div className="mock-control">
                <span className="mock-label">Cor principal</span>
                <div className="mock-swatch mock-swatch-primary" />
              </div>
              <div className="mock-control">
                <span className="mock-label">Escala</span>
                <div className="mock-slider" />
              </div>
            </div>

            <div className="mock-footer" aria-hidden="true">
              <div className="mock-pill">SVG pronto</div>
            </div>
          </section>

          <section className="panel panel-preview" aria-labelledby="preview-title">
            <div className="panel-heading">
              <p className="panel-kicker">Preview</p>
              <h2 id="preview-title">Preview ao vivo</h2>
            </div>

            <div className="preview-stage" aria-label="Pré-visualização do card">
              <div className="preview-card">
                <div className="preview-badge">Client-side</div>
                <div className="preview-grid">
                  <div className="preview-qr" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="preview-copy">
                    <p className="preview-title">Card visual</p>
                    <p className="preview-text">
                      QR Code, logo central e estados básicos do produto.
                    </p>
                    <div className="preview-metrics" aria-hidden="true">
                      <span>Preview estável</span>
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