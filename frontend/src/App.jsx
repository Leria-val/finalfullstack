// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/Shared/ProtectedRoute.jsx";

import Login       from "./pages/Login/index.jsx";
import Dashboard   from "./pages/Dashboard/index.jsx";
import Students    from "./pages/Students/index.jsx";
import Users       from "./pages/Users/index.jsx";
import Enrollments from "./pages/Enrollments/index.jsx";
import Grades      from "./pages/Grades/index.jsx";
import Classes     from "./pages/Classes/index.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Rota pública */}
          <Route path="/login" element={<Login />} />

          {/* Rota raiz redireciona para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rotas protegidas — qualquer usuário autenticado */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/grades"    element={<Grades />} />
          </Route>

          {/* Rotas protegidas — apenas ADMIN e TEACHER */}
          <Route element={<ProtectedRoute roles={["ADMIN", "TEACHER"]} />}>
            <Route path="/students"   element={<Students />} />
            <Route path="/classes"    element={<Classes />} />
          </Route>

          {/* Rotas protegidas — apenas ADMIN */}
          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/users"       element={<Users />} />
            <Route path="/enrollments" element={<Enrollments />} />
          </Route>

          {/* Rota não encontrada */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;