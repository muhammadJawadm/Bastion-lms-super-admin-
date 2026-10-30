import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { FaBars, FaUser, FaSignOutAlt } from "react-icons/fa";
import { clearSession } from "../../lib/session";
import { initials, ROLE_LABEL } from "../../lib/format";
import { API_BASE_URL } from "../../lib/api";
import type { SessionUser } from "../../lib/types";
import { NotificationBell } from "./NotificationBell";

interface HeaderProps {
  onMobileMenuClick: () => void;
  isCollapsed: boolean;
  user: SessionUser | null;
}

export default function Header({ onMobileMenuClick, isCollapsed, user }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const signOut = () => {
    setDropdownOpen(false);
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 transition-all duration-300 ease-in-out
        left-0 ${isCollapsed ? "lg:left-16" : "lg:left-64"}
      `}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuClick}
        className="flex lg:hidden items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <FaBars size={17} />
      </button>

      {/* Which backend this panel is talking to — easy to miss otherwise */}
      <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500" title="API base URL">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> {API_BASE_URL.replace(/^https?:\/\//, "")}
      </span>

      <div className="flex-1" />

      <NotificationBell />

      <div className="mx-1 h-6 w-px bg-gray-200" />

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
        >
          <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold text-white">
            {initials(user?.name ?? "Super Admin")}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium leading-tight text-gray-800">{user?.name ?? "Super Admin"}</p>
            <p className="text-xs leading-tight text-gray-400">{user ? ROLE_LABEL[user.role] : "Super Admin"}</p>
          </div>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
            <Link
              to="/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FaUser size={12} className="text-gray-400" /> My Profile
            </Link>
            <div className="my-1 border-t border-gray-100" />
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaSignOutAlt size={12} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
