const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  fullWidth = false,
  size = "md",
}) => {
  const variants = {
    primary: { background: "#1a365d", color: "#fff", border: "none" },
    secondary: { background: "#f7f9fc", color: "#4a5568", border: "1.5px solid #e2e8f0" },
    danger: { background: "#fff5f5", color: "#c53030", border: "1.5px solid #fed7d7" },
    success: { background: "#f0fff4", color: "#276749", border: "1.5px solid #c6f6d5" },
  };

  const sizes = {
    sm: { padding: "6px 14px", fontSize: 12 },
    md: { padding: "10px 20px", fontSize: 13 },
    lg: { padding: "13px 28px", fontSize: 15 },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        ...sizes[size],
        width: fullWidth ? "100%" : "auto",
        borderRadius: 10,
        fontWeight: 600,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        transition: "opacity 0.15s",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      {children}
    </button>
  );
};

export default Button;