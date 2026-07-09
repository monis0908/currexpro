import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Restricts a route subtree to specific roles (e.g. admin, manager). */
export default function RoleRoute({ roles = [] }) {
  const { hasRole } = useAuth();
  if (!hasRole(...roles)) return <Navigate to="/" replace />;
  return <Outlet />;
}
