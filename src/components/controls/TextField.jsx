import FieldError from '../FieldError';
import { buildAriaDescribedBy, getFieldErrorId } from '../../lib/formUtils';

const TextField = ({
  as = 'input',
  className = 'text-input',
  error,
  fieldName,
  hint,
  inputProps = {},
  label,
  onChange,
  placeholder,
  required = false,
  rows,
  type = 'text',
  value,
  wide = false,
}) => {
  const fieldErrorId = getFieldErrorId(fieldName, error);
  const hintId = `${fieldName}-hint`;
  const InputComponent = as;

  return (
    <label className={`form-field${wide ? ' field-span-2' : ''}`} htmlFor={fieldName}>
      <div className="form-label-row">
        <span className="form-label">{label}</span>
        <span className="form-hint" id={hintId}>{hint}</span>
      </div>
      <InputComponent
        id={fieldName}
        name={fieldName}
        className={className}
        type={as === 'input' ? type : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={buildAriaDescribedBy(hintId, fieldErrorId)}
        aria-errormessage={fieldErrorId}
        required={required}
        rows={rows}
        {...inputProps}
      />
      <FieldError fieldName={fieldName} error={error} />
    </label>
  );
};

export default TextField;
