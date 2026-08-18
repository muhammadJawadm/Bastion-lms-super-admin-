import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  FaBars, FaBell, FaSearch, FaUser, FaSignOutAlt,
  FaShieldAlt, FaCalendarCheck, FaExclamationCircle, FaLock, FaFlag, FaCog,
} from "react-icons/fa";

/* ── Static notification data ────────────────────────────────────────── */

const NOTIFS = [
  {
    id: 1,
    icon: FaShieldAlt,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "New verification request",
    body: "James Turner submitted ID documents.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    icon: FaCalendarCheck,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "Booking confirmed",
    body: "BK-3921 · Sony A7 III Camera — 10–15 Aug.",
    time: "18 min ago",
    unread: true,
  },
  {
    id: 3,
    icon: FaExclamationCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    title: "Dispute opened",
    body: "Marcus Reid vs Daniel Brooks (Bond Refund).",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: 4,
    icon: FaLock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    title: "Escrow release requested",
    body: "TXN-9841 · $425.00 awaiting approval.",
    time: "3 hr ago",
    unread: false,
  },
  {
    id: 5,
    icon: FaFlag,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    title: "Review flagged",
    body: "Road Bike review by Tom Nguyen auto-flagged.",
    time: "1 day ago",
    unread: false,
  },
  {
    id: 6,
    icon: FaCog,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
    title: "Platform maintenance",
    body: "Scheduled window: Sun 18 Aug 2–4am AEST.",
    time: "2 days ago",
    unread: false,
  },
];

/* ── Header ──────────────────────────────────────────────────────────── */

interface HeaderProps {
  onMobileMenuClick: () => void;
  isCollapsed: boolean;
}

export default function Header({ onMobileMenuClick, isCollapsed }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [readIds,      setReadIds]      = useState<number[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);
  const navigate    = useNavigate();

  const unread = NOTIFS.filter((n) => n.unread && !readIds.includes(n.id)).length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () => setReadIds(NOTIFS.map((n) => n.id));

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

      {/* Search */}
      <div className="hidden lg:flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 w-72">
        <FaSearch size={13} className="shrink-0 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">

        {/* Bell + Notification popup */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <FaBell size={17} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-gray-100 bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  {unread > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                      {unread} new
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {NOTIFS.map((n) => {
                  const Icon     = n.icon;
                  const isUnread = n.unread && !readIds.includes(n.id);
                  return (
                    <div
                      key={n.id}
                      onClick={() => setReadIds((ids) => ids.includes(n.id) ? ids : [...ids, n.id])}
                      className={"flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 " + (isUnread ? "bg-blue-50/40" : "")}
                    >
                      <div className={"mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full " + n.iconBg}>
                        <Icon size={12} className={n.iconColor} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={"text-xs leading-snug " + (isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
                          {n.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-gray-400">{n.body}</p>
                        <p className="mt-1 text-[10px] text-gray-300">{n.time}</p>
                      </div>
                      {isUnread && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-4 py-3">
                <Link
                  to="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold text-white">
              A
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight text-gray-800">Admin</p>
              <p className="text-xs leading-tight text-gray-400">Administrator</p>
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
                onClick={() => { setDropdownOpen(false); navigate("/login"); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <FaSignOutAlt size={12} /> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
