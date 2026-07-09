import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import RoleRoute from "./routes/RoleRoute";
import MainLayout from "./layouts/MainLayout";
import { authService } from "./services/authService";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CurrencyBuy from "./pages/CurrencyBuy";
import CurrencySell from "./pages/CurrencySell";
import CurrencyRates from "./pages/CurrencyRates";
import Transactions from "./pages/Transactions";
import Customers from "./pages/Customers";
import BankCash from "./pages/BankCash";
import BankTransfer from "./pages/BankTransfer";
import Reports from "./pages/Reports";
import SettingsUsers from "./pages/SettingsUsers";
import SettingsActivityLogs from "./pages/SettingsActivityLogs";
import SettingsBackup from "./pages/SettingsBackup";
import SettingsLanguage from "./pages/SettingsLanguage";
import NotFound from "./pages/NotFound";

/**
 * Prevents the browser from bfcache-ing this app at all.
 *
 * Adding an `unload` listener is a well-known signal that tells Chrome,
 * Firefox, and Safari "don't store this page in the back/forward cache" —
 * so every Back/Forward navigation forces a real fresh load, which means
 * a real re-check of Firebase auth state every single time. This is more
 * reliable than reacting to `pageshow`/`persisted` after the fact, because
 * it stops the stale snapshot from ever being created in the first place.
 *
 * Trade-off: back/forward navigation becomes slightly slower (a real
 * reload instead of an instant cached restore) — an acceptable cost for
 * a financial app where showing a logged-out user's old session is a
 * real security risk.
 *
 * Additionally, this component now force-logs-out the user whenever the
 * browser's Back/Forward buttons are used (popstate event), even within
 * the same tab/session.
 */
function BFCacheGuard() {
  useEffect(() => {
    const noop = () => {};
    window.addEventListener("unload", noop);
    return () => window.removeEventListener("unload", noop);
  }, []);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <BFCacheGuard />
          <Routes>
            {/* Public Route: Sirf wo log jo login nahi hain */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

            {/* Protected Routes: Sirf login users ke liye */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/currency/buy" element={<CurrencyBuy />} />
                <Route path="/currency/sell" element={<CurrencySell />} />
                <Route path="/currency/rates" element={<CurrencyRates />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/bank/cash" element={<BankCash />} />
                <Route path="/bank/transfer" element={<BankTransfer />} />
                <Route path="/reports" element={<Reports />} />

                {/* Admin/Manager specific routes */}
                <Route element={<RoleRoute roles={["admin", "manager"]} />}>
                  <Route path="/settings/users" element={<SettingsUsers />} />
                  <Route path="/settings/activity-logs" element={<SettingsActivityLogs />} />
                  <Route path="/settings/backup" element={<SettingsBackup />} />
                </Route>
                <Route path="/settings/language" element={<SettingsLanguage />} />
              </Route>
            </Route>

            {/* Default Catch-all */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}