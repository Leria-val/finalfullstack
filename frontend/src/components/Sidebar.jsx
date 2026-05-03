import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const MENU = {
  ADMIN: [
    { label: "Dashboard",  path: "/dashboard",  icon: "📊" },
    { label: "Usuários",   path: "/users",       icon: "👥" },
    { label: "Alunos",     path: "/students",    icon: "🎓" },
    { label: "Turmas",     path: "/classes",     icon: "📚" },
    { label: "Matrículas", path: "/enrollments", icon: "📋" },
    { label: "Notas",      path: "/grades",      icon: "📝" },
  ],
  TEACHER: [
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "Alunos",    path: "/students",  icon: "🎓" },
    { label: "Turmas",    path: "/classes",   icon: "📚" },
    { label: "Notas",     path: "/grades",    icon: "📝" },
  ],
  STUDENT: [
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "Notas",     path: "/grades",    icon: "📝" },
  ],
};

const Sidebar = () => {
  const navigate             = useNavigate();
  const location             = useLocation();
  const { user, logout }     = useAuth();

  const role  = user?.role?.toUpperCase();
  const items = MENU[role] ?? MENU.STUDENT;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">

      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon" aria-hidden="true">🎵</span>
        <div>
          <p className="sidebar-logo-title">Euphonica</p>
          <p className="sidebar-logo-sub">Music School</p>
        </div>
      </div>

      <div className="sidebar-divider" aria-hidden="true" />

      {/* ── Nav ── */}
      <nav className="sidebar-nav" aria-label="Menu principal">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-item${isActive ? " active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="sidebar-item-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div className="sidebar-divider" aria-hidden="true" />
        <div className="sidebar-user">
          <div className="sidebar-avatar" aria-hidden="true">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name ?? "Usuário"}</p>
            <p className="sidebar-user-role">{user?.role ?? ""}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-logout">
          🚪 Sair
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;