import { useState } from "react";

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  icon = null,
  disabled = false,
}) => {
  const [focused, setFocused] = useState(false);

  const boxClass = [
    "input-box",
    focused  ? "focused"   : "",
    error    ? "has-error" : "",
    disabled ? "disabled"  : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required-star" aria-hidden="true">*</span>}
        </label>
      )}

      <div className={boxClass}>
        {icon && <span className="input-icon" aria-hidden="true">{icon}</span>}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="input-field"
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </div>

      {error && (
        <span id={`${name}-error`} className="input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;