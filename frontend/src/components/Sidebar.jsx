import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const MENU = {
  ADMIN: [
    { label: "Dashboard",  path: "/dashboard",   icon: "📊" },
    { label: "Usuários",   path: "/users",        icon: "👥" },
    { label: "Alunos",     path: "/students",     icon: "🎓" },
    { label: "Turmas",     path: "/classes",      icon: "📚" },
    { label: "Matrículas", path: "/enrollments",  icon: "📋" },
    { label: "Notas",      path: "/grades",       icon: "📝" },
  ],
  TEACHER: [
    { label: "Dashboard",  path: "/dashboard",   icon: "📊" },
    { label: "Alunos",     path: "/students",     icon: "🎓" },
    { label: "Turmas",     path: "/classes",      icon: "📚" },
    { label: "Notas",      path: "/grades",       icon: "📝" },
  ],
  STUDENT: [
    { label: "Dashboard",  path: "/dashboard",   icon: "📊" },
    { label: "Notas",      path: "/grades",       icon: "📝" },
  ],
};

const Sidebar = () => {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { user, logout } = useAuth();

  const role  = user?.role?.toUpperCase();
  const items = MENU[role] ?? MENU.STUDENT;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside style={styles.sidebar}>

      {/* ── Logo ── */}
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>🎵</div>
        <div>
          <p style={styles.logoTitle}>Euphonica</p>
          <p style={styles.logoSub}>Music School Manager</p>
        </div>
      </div>

      {/* ── Divisor ── */}
      <div style={styles.divider} />

      {/* ── Menu ── */}
      <nav style={styles.nav}>
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.menuItem,
                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                fontWeight: isActive ? 700 : 500,
                borderLeft: isActive ? "3px solid #90cdf4" : "3px solid transparent",
              }}
            >
              <span style={styles.menuIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Footer — usuário logado ── */}
      <div style={styles.footer}>
        <div style={styles.divider} />
        <div style={styles.userArea}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user?.name ?? "Usuário"}</p>
            <p style={styles.userRole}>{user?.role ?? ""}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Sair
        </button>
      </div>

    </aside>
  );
};

const styles = {
  sidebar: {
    width: 240,
    minHeight: "100vh",
    background: "linear-gradient(180deg, #1a365d 0%, #0f2044 100%)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 0",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "sticky",
    top: 0,
    flexShrink: 0,
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 20px 0 24px",
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 28,
  },
  logoTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  logoSub: {
    margin: 0,
    fontSize: 10,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.1)",
    margin: "0 20px 16px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
    padding: "0 12px",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 16px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    textAlign: "left",
    width: "100%",
    transition: "background 0.15s, color 0.15s",
  },
  menuIcon: {
    fontSize: 17,
    minWidth: 20,
    textAlign: "center",
  },
  footer: {
    padding: "0 12px",
    marginTop: 8,
  },
  userArea: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 8px",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: 700,
    flexShrink: 0,
  },
  userInfo: {
    overflow: "hidden",
  },
  userName: {
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    margin: 0,
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  logoutBtn: {
    width: "100%",
    background: "rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.65)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "9px 0",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    marginTop: 4,
    transition: "background 0.15s",
  },
};

export default Sidebar;