import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { isPreviewPath } from "./navConfig";
import { api } from "../../lib/api";
import { clearSession, getSessionUser, getToken, setSession } from "../../lib/session";
import type { ApiResponse, SessionUser } from "../../lib/types";
import { FaFlask } from "react-icons/fa";

export default function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(getSessionUser);
  const [kicked, setKicked] = useState(false);
  const location = useLocation();
  const hasToken = getToken() !== null;

  // Validate the stored token once per load. GET /users/profile also hands back
  // a fresh token, which keeps an active session alive past the 1h JWT expiry.
  useEffect(() => {
    if (!hasToken) return;
    api
      .get<ApiResponse<SessionUser> & { token?: string }>("/users/profile")
      .then((res) => {
        if (res.data.role !== "platform_admin") {
          clearSession();
          setKicked(true);
          return;
        }
        if (res.token) setSession(res.token, res.data);
        setUser(res.data);
      })
      .catch(() => { /* api.ts already redirects on a dead token; network errors keep the cached user */ });
  }, [hasToken]);

  if (!hasToken || kicked) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        user={user}
      />
      <Header
        onMobileMenuClick={() => setIsMobileOpen((prev) => !prev)}
        isCollapsed={isCollapsed}
        user={user}
      />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        <div className="p-4 sm:p-6">
          {isPreviewPath(location.pathname) && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <FaFlask size={14} className="mt-0.5 shrink-0" />
              <p>
                <span className="font-semibold">Preview, mock data.</span> The backend has no API for this screen yet, so nothing
                here is real and no changes are saved.
              </p>
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
