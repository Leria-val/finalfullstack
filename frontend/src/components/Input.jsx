// src/components/Input.jsx
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {label && (
        <label htmlFor={name} style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "#2d3748",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}>
          {label}
          {required && <span style={{ color: "#e53e3e", marginLeft: 3 }}>*</span>}
        </label>
      )}
      <div style={{
        display: "flex",
        alignItems: "center",
        background: focused ? "#fff" : "#f7f9fc",
        border: `1.5px solid ${error ? "#e53e3e" : focused ? "#1a365d" : "#e2e8f0"}`,
        borderRadius: 10,
        padding: "0 14px",
        gap: 10,
        transition: "all 0.2s ease",
        boxShadow: focused ? "0 0 0 3px rgba(26,54,93,0.08)" : "none",
        opacity: disabled ? 0.5 : 1,
      }}>
        {icon && <span style={{ color: "#a0aec0", display: "flex", alignItems: "center" }}>{icon}</span>}
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
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "#1a202c",
            padding: "11px 0",
          }}
        />
      </div>
      {error && (
        <span style={{ fontSize: 12, color: "#e53e3e", fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;