/**
 * Unified form field.
 * Props: label, type, value, onChange, options, placeholder, required,
 *        error, helpText, name, disabled, min, max, rows.
 *
 * type: text | email | password | number | date | datetime-local | textarea | select
 * `onChange` receives the raw value (not the event).
 * `options` for select: [{ value, label }] or string[].
 */
export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  options = [],
  placeholder,
  required = false,
  error,
  helpText,
  name,
  disabled = false,
  min,
  max,
  rows = 4,
}) {
  const inputClass = `field-input${error ? ' error' : ''}`
  const handle = (e) => onChange?.(e.target.value)

  const normalizedOptions = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o
  )

  return (
    <div className="form-field">
      {label && (
        <label className="field-label" htmlFor={name}>
          {label}
          {required && <span className="req">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          className={inputClass}
          value={value ?? ''}
          onChange={handle}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          className={inputClass}
          value={value ?? ''}
          onChange={handle}
          disabled={disabled}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {normalizedOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className={inputClass}
          value={value ?? ''}
          onChange={handle}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
        />
      )}

      {error && <div className="field-error">{error}</div>}
      {helpText && !error && <div className="field-help">{helpText}</div>}
    </div>
  )
}
