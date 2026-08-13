import { buildAriaDescribedBy } from '../../lib/formUtils';

const LogoUploadField = ({ logoUploadState, logoUploadStatusLabel, onChange }) => (
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
      onChange={onChange}
      aria-invalid={Boolean(logoUploadState.error)}
      aria-describedby={buildAriaDescribedBy(
        'logoUpload-help',
        'logoUpload-status',
        logoUploadState.warning ? 'logoUpload-warning' : undefined,
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
    {logoUploadState.warning && (
      <p className="form-hint" id="logoUpload-warning" aria-live="polite">
        {logoUploadState.warning}
      </p>
    )}
    <p className="upload-status" id="logoUpload-status" aria-live="polite">
      {logoUploadStatusLabel}
    </p>
  </div>
);

export default LogoUploadField;
