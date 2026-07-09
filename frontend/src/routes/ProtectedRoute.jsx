import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

export default function ProtectedRoute() {
  const { user, initializing } = useAuth();

  if (sessionStorage.getItem("force_logout") === "1") {
    sessionStorage.removeItem("force_logout");
    return <Navigate to="/login" replace />;
  }

  if (initializing) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}