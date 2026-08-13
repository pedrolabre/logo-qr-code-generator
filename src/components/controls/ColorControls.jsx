import FieldError from '../FieldError';
import { buildAriaDescribedBy, getFieldErrorId } from '../../lib/formUtils';

const COLOR_FIELDS = [
  { fieldName: 'qrColor', label: 'QR', ariaLabel: 'Cor do QR Code' },
  { fieldName: 'bgColor', label: 'Fundo', ariaLabel: 'Cor de fundo' },
  { fieldName: 'eyeColor', label: 'Olhos', ariaLabel: 'Cor dos olhos do QR Code' },
  { fieldName: 'textColor', label: 'Texto', ariaLabel: 'Cor do texto' },
];

const ColorControls = ({ config, errors, onChange }) => (
  <>
    <div className="field-span-2 form-subheading">
      <p>Cores</p>
    </div>

    <div className="field-span-2 color-grid">
      {COLOR_FIELDS.map(({ ariaLabel, fieldName, label }) => {
        const error = errors[fieldName];
        const valueId = `${fieldName}-value`;
        const fieldErrorId = getFieldErrorId(fieldName, error);

        return (
          <label className="form-field color-field" htmlFor={fieldName} key={fieldName}>
            <span className="form-label">{label}</span>
            <div className="color-control">
              <input
                id={fieldName}
                name={fieldName}
                type="color"
                value={config[fieldName]}
                onChange={onChange}
                aria-label={ariaLabel}
                aria-invalid={Boolean(error)}
                aria-describedby={buildAriaDescribedBy(valueId, fieldErrorId)}
                aria-errormessage={fieldErrorId}
              />
              <span className="text-input color-value" id={valueId}>{config[fieldName].toUpperCase()}</span>
            </div>
            <FieldError fieldName={fieldName} error={error} />
          </label>
        );
      })}
    </div>
  </>
);

export default ColorControls;
