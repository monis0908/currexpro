import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = authService.onChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await authService.getUserProfile(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: profile.name || firebaseUser.email,
          role: profile.role || "cashier",
        });
      } else {
        setUser(null);
      }
      setInitializing(false);
    });
    return unsub;
  }, []);

  // `identifier` can be either a username or an email — authService.login
  // resolves that internally, so this function's shape is unchanged.
  const login = async (identifier, password) => {
    const profile = await authService.login(identifier, password);
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const hasRole = (...roles) => !!user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, initializing, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}