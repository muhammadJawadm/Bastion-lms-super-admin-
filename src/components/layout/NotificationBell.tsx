import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaGraduationCap, FaClipboardList } from "react-icons/fa";
import { api } from "../../lib/api";
import { formatDateTime } from "../../lib/format";
import type { AppNotification, Paginated } from "../../lib/types";

const POLL_MS = 60_000;

const ICONS: Record<AppNotification["type"], { icon: React.ElementType; bg: string; color: string }> = {
  success: { icon: FaCheckCircle, bg: "bg-green-100", color: "text-green-600" },
  warning: { icon: FaExclamationTriangle, bg: "bg-amber-100", color: "text-amber-600" },
  course: { icon: FaGraduationCap, bg: "bg-blue-100", color: "text-blue-600" },
  form: { icon: FaClipboardList, bg: "bg-emerald-100", color: "text-emerald-600" },
  default: { icon: FaInfoCircle, bg: "bg-gray-100", color: "text-gray-500" },
};

// Where clicking a notification goes. Billing events (subscribed / payment failed /
// cancelled) carry no redirect, and they're the only kind a Super Admin gets today.
function targetFor(n: AppNotification): string {
  if (n.redirectTo === "course" && n.redirectId) return `/courses/${n.redirectId}`;
  if (n.redirectTo === "form" && n.redirectId) return `/forms/${n.redirectId}`;
  if (n.redirectTo === "certificate") return "/certificates";
  return "/billing";
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  // GET /notifications marks everything it returns as read server-side, so
  // "new" is tracked here: anything that arrived with isNew stays unread
  // until the dropdown is opened.
  const [unread, setUnread] = useState<Set<string>>(() => new Set());
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      api
        .get<Paginated<AppNotification>>("/notifications", { perPage: 20, pageNo: 1 })
        .then((res) => {
          if (cancelled) return;
          setFailed(false);
          setItems(res.data);
          const fresh = res.data.filter((n) => n.isNew).map((n) => n.notificationID);
          if (fresh.length) setUnread((prev) => new Set([...prev, ...fresh]));
        })
        .catch(() => { if (!cancelled) setFailed(true); });
    };
    load();
    const t = setInterval(load, POLL_MS);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggle = () => {
    // Closing the dropdown after viewing clears the badge.
    if (open) setUnread(new Set());
    setOpen(!open);
  };

  const count = unread.size;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label={count ? `${count} new notifications` : "Notifications"}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
      >
        <FaBell size={17} />
        {count > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {count > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">{count} new</span>}
          </div>
          <div className="max-h-96 divide-y divide-gray-50 overflow-y-auto">
            {failed && items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-gray-400">Couldn't load notifications.</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-gray-400">No notifications yet. You'll see billing events here: new subscriptions, failed payments and cancellations.</p>
            ) : items.map((n) => {
              const meta = ICONS[n.type] ?? ICONS.default;
              const Icon = meta.icon;
              const isNew = unread.has(n.notificationID);
              return (
                <button
                  key={n.notificationID}
                  onClick={() => { setOpen(false); setUnread(new Set()); navigate(targetFor(n)); }}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${isNew ? "bg-blue-50/40" : ""}`}
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.bg}`}>
                    <Icon size={12} className={meta.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs leading-snug ${isNew ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>{n.title}</p>
                    <p className="mt-1 text-[10px] text-gray-400">{formatDateTime(n.createdAt)}</p>
                  </div>
                  {isNew && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
