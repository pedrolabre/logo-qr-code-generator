import FieldError from '../FieldError';
import { buildAriaDescribedBy, formatLogoScale, getFieldErrorId } from '../../lib/formUtils';

const LogoScaleField = ({ error, logoScale, onChange }) => (
  <div className="form-field field-span-2">
    <div className="form-label-row">
      <label className="form-label" htmlFor="logoScale">Escala do logo</label>
      <span className="form-hint" id="logoScale-value">{formatLogoScale(logoScale)}</span>
    </div>
    <input
      id="logoScale"
      name="logoScale"
      className="range-input"
      type="range"
      min="0.1"
      max="0.25"
      step="0.01"
      value={logoScale}
      onChange={onChange}
      aria-invalid={Boolean(error)}
      aria-describedby={buildAriaDescribedBy('logoScale-value', getFieldErrorId('logoScale', error))}
      aria-errormessage={getFieldErrorId('logoScale', error)}
      aria-valuetext={formatLogoScale(logoScale)}
    />
    <div className="range-labels" aria-hidden="true">
      <span>10%</span>
      <span>25%</span>
    </div>
    <FieldError fieldName="logoScale" error={error} />
  </div>
);

export default LogoScaleField;
