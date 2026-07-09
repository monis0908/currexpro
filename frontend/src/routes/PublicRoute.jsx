import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader"; 

export default function PublicRoute({ children }) {
  const { user, initializing } = useAuth();

  // Force-logout flag: agar back/forward se logout trigger hua hai,
  // to Firebase ka stale auth state ignore kar ke turant login page dikhao
  if (sessionStorage.getItem("force_logout") === "1") {
    sessionStorage.removeItem("force_logout");
    return children;
  }

  if (initializing) return <Loader full label="Checking session..." />;
  
  return user ? <Navigate to="/dashboard" replace /> : children;
}