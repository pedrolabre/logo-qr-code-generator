const ThemeIcon = ({ theme }) => {
  if (theme === 'dark') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
};

const AppHeader = ({ theme, onToggleTheme }) => {
  const themeToggleLabel = theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro';

  return (
    <header className="app-header">
      <p className="eyebrow">Logo QR Code Generator</p>
      <svg className="header-logo" viewBox="0 0 256 251" aria-hidden="true" role="img">
        <rect className="logo-bg" x="0" y="0" width="256" height="251" rx="24" />
        <path
          className="logo-l"
          d="M23 34H51V175C51 177 52 179 58 182H125L146 212H41C37 211 33 208 32 208C26 202 23 195 23 195V34Z"
        />
        <path
          className="logo-q"
          d="M98 55H195C201 55 208 63 211 69V179L207 182L226 204V212H176L148 181V159H171L181 172L183 171V91C183 86 178 83 175 83H116C114 85 112 87 112 89V157H83V73C83 66 87 62 91 58C93 56 95 55 98 55Z"
        />
      </svg>
      <h1 id="hero-title">QR Codes com identidade de marca.</h1>

      <div className="status-row" aria-label="Estado atual da aplicação">
        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={themeToggleLabel}
          title={themeToggleLabel}
        >
          <ThemeIcon theme={theme} />
        </button>
        <span className="status-chip">Dados locais</span>
        <span className="status-chip">Validação ao digitar</span>
        <span className="status-chip">Prévia atualizada</span>
      </div>
    </header>
  );
};

export default AppHeader;
