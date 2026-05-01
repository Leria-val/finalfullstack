// src/components/Modal.jsx
import { useEffect } from "react";

/**
 * Props:
 *   isOpen:   boolean
 *   onClose:  () => void
 *   title:    string
 *   children: JSX
 *   size:     "sm" | "md" | "lg" (default: "md")
 */
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  // Fecha com ESC
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Bloqueia scroll do body
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = { sm: 400, md: 560, lg: 760 };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(10,20,40,0.55)",
        backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        animation: "fadeIn 0.18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: widths[size],
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(10,20,40,0.22)",
          animation: "slideUp 0.22s ease",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* HEADER */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 28px",
          borderBottom: "1.5px solid #edf2f7",
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            color: "#1a365d",
            letterSpacing: "-0.01em",
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#f7f9fc",
              border: "none",
              borderRadius: 8,
              width: 32, height: 32,
              cursor: "pointer",
              fontSize: 18,
              color: "#718096",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.target.style.background = "#e2e8f0"}
            onMouseLeave={e => e.target.style.background = "#f7f9fc"}
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: "24px 28px" }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
};

export default Modal;