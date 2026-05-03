import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import api from "../services/api.js";

const Login = () => {
  const navigate   = useNavigate();
  const { login }  = useAuth();

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
    <div className="login-page">

      {/* Atmospheric noise overlay */}
      <div className="login-bg-noise" aria-hidden="true" />

      <div className="login-card">

        {/* ── Header ── */}
        <div className="login-header">
          <div className="login-logo-wrapper" aria-hidden="true">
            🎵
          </div>
          <h1 className="login-title">Euphonica</h1>
          <p className="login-subtitle">Music School Manager</p>
        </div>

        {/* ── Divider ── */}
        <div className="login-divider" aria-hidden="true" />

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>

          {/* Email */}
          <div className="login-field">
            <label className="login-label" htmlFor="login-email">Email</label>
            <div className="login-input-box">
              <span className="login-input-icon" aria-hidden="true">✉️</span>
              <input
                id="login-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                placeholder="seu@email.com"
                className="login-input"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label className="login-label" htmlFor="login-password">Senha</label>
            <div className="login-input-box">
              <span className="login-input-icon" aria-hidden="true">🔒</span>
              <input
                id="login-password"
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={handle}
                placeholder="••••••••"
                className="login-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="login-eye-btn"
                aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error" role="alert">
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? (
              <span className="login-loading-row">
                <span className="login-spinner" aria-hidden="true" />
                Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>

        </form>

        {/* ── Footer ── */}
        <p className="login-footer">
          Euphonica &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;