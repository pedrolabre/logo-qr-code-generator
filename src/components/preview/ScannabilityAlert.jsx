const ScannabilityAlert = ({ scannability }) => (
  <div className="scannability-alert" role="alert">
    <span className="scannability-alert-icon" aria-hidden="true">⚠</span>
    <div className="scannability-alert-content">
      <strong className="scannability-alert-title">{scannability.label}</strong>
      <p className="scannability-alert-message" id="scannability-alert-message">
        {scannability.message}
      </p>
    </div>
  </div>
);

export default ScannabilityAlert;
