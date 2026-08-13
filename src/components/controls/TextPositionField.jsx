import { TEXT_POSITIONS } from '../../types';
import FieldError from '../FieldError';
import { buildAriaDescribedBy, getFieldErrorId } from '../../lib/formUtils';

const TextPositionField = ({ error, onChange, value }) => {
  const fieldErrorId = getFieldErrorId('textPosition', error);

  return (
    <label className="form-field field-span-2" htmlFor="textPosition">
      <div className="form-label-row">
        <span className="form-label">Posição do texto</span>
        <span className="form-hint" id="textPosition-hint">Onde o texto aparece</span>
      </div>
      <select
        id="textPosition"
        name="textPosition"
        className="text-input"
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={buildAriaDescribedBy('textPosition-hint', fieldErrorId)}
        aria-errormessage={fieldErrorId}
      >
        {TEXT_POSITIONS.map((position) => (
          <option key={position} value={position}>
            {position === 'top' ? 'Topo' : 'Base'}
          </option>
        ))}
      </select>
      <FieldError fieldName="textPosition" error={error} />
    </label>
  );
};

export default TextPositionField;
