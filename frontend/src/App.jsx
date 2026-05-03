import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login       from "./pages/Login.jsx";
import Dashboard   from "./pages/Dashboard.jsx";
import Students    from "./pages/Students.jsx";
import User        from "./pages/User.jsx";
import Enrollments from "./pages/Enrollments.jsx";
import Grade       from "./pages/Grade.jsx";
import Classes     from "./pages/Classes.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Rota raiz ──────────────────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Rota pública ────────────────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />

          {/* ── Autenticado — qualquer role ─────────────────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/grades"    element={<Grade />} />
          </Route>

          {/* ── ADMIN + TEACHER ─────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={["ADMIN", "TEACHER"]} />}>
            <Route path="/students" element={<Students />} />
            <Route path="/classes"  element={<Classes />} />
          </Route>

          {/* ── Apenas ADMIN ────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/users"       element={<User />} />
            <Route path="/enrollments" element={<Enrollments />} />
          </Route>

          {/* ── Rota não encontrada ──────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;