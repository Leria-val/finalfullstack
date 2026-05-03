import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const ROLE_LABEL = {
  ADMIN:   { label: "Administrador", bg: "#fefcbf", color: "#744210" },
  TEACHER: { label: "Professor",     bg: "#bee3f8", color: "#1a365d" },
  STUDENT: { label: "Aluno",         bg: "#c6f6d5", color: "#276749" },
};

const Navbar = () => {
  const navigate    = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.role?.toUpperCase();
  const badge = ROLE_LABEL[role] ?? { label: role, bg: "#edf2f7", color: "#4a5568" };

  return (
    <header style={styles.navbar}>

      {/* ── Logo ── */}
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>🎵</div>
        <span style={styles.logoText}>Euphonica</span>
      </div>

      {/* ── Usuário + Logout ── */}
      <div style={styles.rightArea}>

        {/* Badge de role */}
        <span style={{ ...styles.roleBadge, background: badge.bg, color: badge.color }}>
          {badge.label}
        </span>

        {/* Avatar + Nome */}
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <span style={styles.userName}>{user?.name ?? "Usuário"}</span>
        </div>

        {/* Botão logout */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Sair
        </button>

      </div>
    </header>
  );
};

const styles = {
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    padding: "0 32px",
    background: "#ffffff",
    borderBottom: "1.5px solid #edf2f7",
    boxShadow: "0 2px 8px rgba(26,54,93,0.06)",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    fontSize: 22,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 800,
    color: "#1a365d",
    letterSpacing: "-0.02em",
  },
  rightArea: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  roleBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 20,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1a365d, #2b6cb0)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
  },
  userName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#2d3748",
  },
  logoutBtn: {
    background: "#fff5f5",
    color: "#c53030",
    border: "1.5px solid #fed7d7",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    transition: "background 0.15s",
  },
};

export default Navbar;