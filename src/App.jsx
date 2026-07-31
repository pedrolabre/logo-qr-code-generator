export default function App() {
  return (
    <main className="app-shell">
      <section className="hero-card" aria-labelledby="hero-title">
        <p className="eyebrow">Logo QR Code Generator</p>
        <h1 id="hero-title">Gere QR Codes com logo SVG direto no navegador.</h1>
        <p className="lead">
          Esta base inicial roda somente no cliente, sem backend, sem login e sem escrever dados no repositório durante o uso normal.
        </p>
        <div className="status-row" aria-label="Status da aplicação">
          <span className="status-chip">SPA local</span>
          <span className="status-chip">React + Vite</span>
          <span className="status-chip">JavaScript</span>
        </div>
      </section>
    </main>
  );
}