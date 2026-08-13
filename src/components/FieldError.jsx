const FieldError = ({ fieldName, error }) => {
  if (!error) {
    return null;
  }

  return (
    <p className="form-error" id={`${fieldName}-error`} aria-live="polite">
      {error}
    </p>
  );
};

export default FieldError;
