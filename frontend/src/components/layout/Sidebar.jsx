import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiChevronDown, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { NAV_ITEMS } from "../../utils/navigation";

function NavGroup({ item, collapsed, onNavigate }) {
  const location = useLocation();
  const isChildActive = item.children?.some((c) => location.pathname === c.path);
  const [open, setOpen] = useState(isChildActive);

  if (!item.children) {
    return (
      <NavLink
        to={item.path}
        onClick={onNavigate}
        end={item.path === "/"}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
          }`
        }
      >
        <item.icon size={18} className="shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isChildActive ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5"
        }`}
      >
        <item.icon size={18} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            <FiChevronDown
              size={14}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>
      {open && !collapsed && (
        <div className="ml-4 mt-1 pl-4 border-l border-white/10 flex flex-col gap-0.5">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ collapsed, setCollapsed, onNavigate }) {
  return (
    <aside
      className={`h-full bg-ink flex flex-col transition-all duration-200 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center font-display font-bold text-ink text-sm">
          CX
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-white tracking-tight">CurrExPro</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavGroup key={item.label} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="hidden md:flex items-center justify-center gap-2 mx-3 mb-4 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-xs"
      >
        {collapsed ? <FiChevronsRight size={16} /> : <FiChevronsLeft size={16} />}
        {!collapsed && "Collapse"}
      </button>
    </aside>
  );
}
