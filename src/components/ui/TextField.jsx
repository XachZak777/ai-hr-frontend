export default function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  error = '',
}) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={error ? 'input-error' : ''}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
