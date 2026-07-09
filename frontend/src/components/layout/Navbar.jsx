import { useState } from "react";
import { FiMenu, FiBell, FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import RateTicker from "./RateTicker";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-black/5">
      <div className="h-16 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-black/5 text-ink"
          >
            <FiMenu size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-black/5 text-muted relative">
            <FiBell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-coral" />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-black/5"
            >
              <div className="w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center font-medium text-sm">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-ink leading-tight">{user?.name}</p>
                <p className="text-xs text-muted capitalize leading-tight">{user?.role}</p>
              </div>
              <FiChevronDown size={14} className="text-muted" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lift border border-black/5 py-1 animate-fadeIn">
                <div className="px-3 py-2 text-xs text-muted flex items-center gap-2">
                  <FiUser size={14} /> {user?.email}
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-coral hover:bg-coral-light"
                >
                  <FiLogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <RateTicker />
    </div>
  );
}
