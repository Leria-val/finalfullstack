import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import api from "../services/api.js";

const Login = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handle = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      return setError("Email e senha são obrigatórios.");
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* Decoração de fundo */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      <div style={styles.card}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.logoWrapper}>
            <span style={styles.logoEmoji}>🎵</span>
          </div>
          <h1 style={styles.title}>Euphonica</h1>
          <p style={styles.subtitle}>Music School Manager</p>
        </div>

        {/* ── Divisor ── */}
        <div style={styles.divider} />

        {/* ── Formulário ── */}
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Email */}
          <div style={styles.fieldWrapper}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputBox}>
              <span style={styles.icon}>✉️</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                placeholder="seu@email.com"
                style={styles.input}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Senha */}
          <div style={styles.fieldWrapper}>
            <label style={styles.label}>Senha</label>
            <div style={styles.inputBox}>
              <span style={styles.icon}>🔒</span>
              <input
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={handle}
                placeholder="••••••••"
                style={styles.input}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                style={styles.eyeBtn}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span style={styles.loadingRow}>
                <span style={styles.spinner} />
                Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>

        </form>

        {/* ── Footer ── */}
        <p style={styles.footer}>
          EduChain Manager &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f2044 0%, #1a365d 50%, #0f2044 100%)",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: 16,
    position: "relative",
    overflow: "hidden",
  },
  bgCircle1: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.03)",
    top: -100,
    right: -100,
    pointerEvents: "none",
  },
  bgCircle2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.03)",
    bottom: -80,
    left: -80,
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    background: "#ffffff",
    borderRadius: 24,
    padding: "44px 48px 32px",
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 32px 80px rgba(10,20,40,0.35)",
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
  },
  logoWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 64,
    background: "linear-gradient(135deg, #1a365d, #2b6cb0)",
    borderRadius: 18,
    marginBottom: 14,
    boxShadow: "0 8px 24px rgba(26,54,93,0.3)",
  },
  logoEmoji: {
    fontSize: 30,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: "#1a365d",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    margin: "5px 0 0",
    fontSize: 13,
    color: "#a0aec0",
    fontWeight: 500,
    letterSpacing: "0.02em",
  },
  divider: {
    height: 1,
    background: "linear-gradient(to right, transparent, #e2e8f0, transparent)",
    marginBottom: 28,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: "#4a5568",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    background: "#f7f9fc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 12,
    padding: "0 14px",
    gap: 10,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  icon: {
    fontSize: 16,
    userSelect: "none",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    fontSize: 14,
    color: "#1a202c",
    padding: "13px 0",
  },
  eyeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
    userSelect: "none",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff5f5",
    border: "1.5px solid #feb2b2",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 13,
    color: "#c53030",
    fontWeight: 500,
  },
  submitBtn: {
    marginTop: 4,
    background: "linear-gradient(135deg, #1a365d, #2b6cb0)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px 0",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    width: "100%",
    letterSpacing: "0.03em",
    boxShadow: "0 4px 16px rgba(26,54,93,0.3)",
    transition: "opacity 0.2s, transform 0.1s",
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  spinner: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  footer: {
    textAlign: "center",
    marginTop: 28,
    marginBottom: 0,
    fontSize: 11,
    color: "#cbd5e0",
    letterSpacing: "0.02em",
  },
};

export default Login;