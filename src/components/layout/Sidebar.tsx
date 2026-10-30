import { NavLink } from "react-router";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import logo from "../../assets/logo.png";
import type { SessionUser } from "../../lib/types";
import { initials } from "../../lib/format";
import { navGroups } from "./navConfig";

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  user: SessionUser | null;
}

export default function Sidebar({
  isMobileOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapse,
  user,
}: SidebarProps) {
  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        style={{ background: "linear-gradient(160deg, #0C2242 0%, #0047AB 100%)" }}
        className={`fixed inset-y-0 left-0 z-40 flex flex-col text-white transition-all duration-300 ease-in-out
          ${isCollapsed ? "lg:w-16" : "lg:w-64"}
          ${isMobileOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo / Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          {!isCollapsed && (
            <img className="h-14 w-auto object-contain" src={logo} alt="Bastionlms" />
          )}
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ${
              isCollapsed ? "mx-auto" : "ml-auto"
            }`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FaChevronRight size={13} /> : <FaChevronLeft size={13} />}
          </button>
          <button
            onClick={onMobileClose}
            className="lg:hidden ml-auto flex items-center justify-center w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-5" : ""}>
              {!isCollapsed && group.label && (
                <p className={`mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest ${group.preview ? "text-amber-300/70" : "text-white/40"}`}>
                  {group.label}
                </p>
              )}
              {isCollapsed && gi > 0 && (
                <div className="mx-2 mb-3 border-t border-white/10" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150
                      ${isCollapsed ? "lg:justify-center lg:px-0" : ""}
                      ${isActive
                        ? "bg-white/20 text-white"
                        : group.preview
                          ? "text-white/50 hover:bg-white/10 hover:text-white"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span
                      className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
                        isCollapsed ? "lg:w-0 lg:opacity-0" : "lg:w-auto lg:opacity-100"
                      }`}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-white/10 p-3">
          {isCollapsed ? (
            <div className="flex justify-center">
              <div
                className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold"
                title={user?.name ?? "Super Admin"}
              >
                {initials(user?.name ?? "Super Admin")}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                {initials(user?.name ?? "Super Admin")}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user?.name ?? "Super Admin"}</p>
                <p className="truncate text-xs text-white/55">{user?.email ?? ""}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
