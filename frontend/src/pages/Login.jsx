import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../services/api.js";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

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

      const role = data.user.role?.toUpperCase();
      if (role === "ADMIN")   return navigate("/dashboard");
      if (role === "TEACHER") return navigate("/dashboard");
      if (role === "STUDENT") return navigate("/dashboard");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Card */}
      <div style={styles.card}>

        {/* Logo / Header */}
        <div style={styles.header}>
          <div style={styles.logoIcon}>🎵</div>
          <h1 style={styles.title}>Euphonica</h1>
          <p style={styles.subtitle}>Music School Manager</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Email */}
          <div style={styles.fieldWrapper}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputBox}>
              <span style={styles.inputIcon}>✉️</span>
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
              <span style={styles.inputIcon}>🔒</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handle}
                placeholder="••••••••"
                style={styles.input}
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div style={styles.errorBox}>
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Botão */}
          <button type="submit" disabled={loading} style={{
            ...styles.submitBtn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

        </form>

        <p style={styles.footer}>
          EduChain Manager © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a365d 0%, #2a4a7f 60%, #1a365d 100%)",
    fontFamily: "'DM Sans', sans-serif",
    padding: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "40px 44px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 24px 64px rgba(10,20,40,0.25)",
  },
  header: {
    textAlign: "center",
    marginBottom: 32,
  },
  logoIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
    color: "#1a365d",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#718096",
    fontWeight: 500,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: "#2d3748",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    background: "#f7f9fc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 14px",
    gap: 10,
    transition: "border-color 0.2s",
  },
  inputIcon: {
    fontSize: 15,
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: "#1a202c",
    padding: "12px 0",
  },
  errorBox: {
    background: "#fff5f5",
    border: "1.5px solid #fed7d7",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#c53030",
    fontWeight: 500,
  },
  submitBtn: {
    marginTop: 4,
    background: "#1a365d",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "13px 0",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    width: "100%",
    letterSpacing: "0.02em",
    transition: "opacity 0.2s",
  },
  footer: {
    textAlign: "center",
    marginTop: 28,
    marginBottom: 0,
    fontSize: 12,
    color: "#b2bec3",
  },
};

export default Login;