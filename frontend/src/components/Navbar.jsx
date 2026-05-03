import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const ROLE_BADGE = {
  ADMIN:   { label: "Administrador", cls: "role-badge--admin"   },
  TEACHER: { label: "Professor",     cls: "role-badge--teacher" },
  STUDENT: { label: "Aluno",         cls: "role-badge--student" },
};

const Navbar = () => {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role  = user?.role?.toUpperCase();
  const badge = ROLE_BADGE[role] ?? { label: role, cls: "role-badge--student" };

  return (
    <header className="navbar">

      {/* ── Logo ── */}
      <div className="navbar-logo">
        <span className="navbar-logo-icon" aria-hidden="true">🎵</span>
        <span className="navbar-logo-text">Euphonica</span>
      </div>

      {/* ── Right area ── */}
      <div className="navbar-right">

        <span className={`role-badge ${badge.cls}`}>
          {badge.label}
        </span>

        <div className="navbar-user">
          <div className="avatar" aria-hidden="true">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <span className="navbar-username">{user?.name ?? "Usuário"}</span>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Sair
        </button>

      </div>
    </header>
  );
};

export default Navbar;