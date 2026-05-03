import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const ProtectedRoute = ({ roles = [] }) => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role?.toUpperCase())) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;