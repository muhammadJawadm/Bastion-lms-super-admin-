import { useState } from "react";
import { useNavigate } from "react-router";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/logo.png";

export default function Login() {
  const [email, setEmail]           = useState("admin@bastionlms.com");
  const [password, setPassword]     = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    if (email === "admin@bastionlms.com" && password === "admin123") {
      navigate("/");
    } else {
      setError("Invalid email or password. Check the demo credentials below.");
    }
    setLoading(false);
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #1976D2 0%, #1565C0 40%, #0D47A1 100%)" }}
    >
      {/* Decorative rings */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[280, 480, 680, 900].map((s) => (
          <div
            key={s}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
            style={{ width: s, height: s }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <img src={logo} alt="Bastionlms" className="h-16 w-auto object-contain" />
          <p className="mt-2 text-sm font-medium text-white/60 tracking-wide">
            Super Admin Panel
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-sm">
          <h1 className="text-xl font-bold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-white/55">
            Enter your credentials to access the dashboard.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/20 px-4 py-2.5 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/70">Email</label>
              <div className="relative">
                <FaEnvelope
                  size={13}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@bastionlms.com"
                  className="w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/35 outline-none transition-all focus:border-white/50 focus:bg-white/15"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/70">Password</label>
              <div className="relative">
                <FaLock
                  size={13}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-10 pr-10 text-sm text-white placeholder-white/35 outline-none transition-all focus:border-white/50 focus:bg-white/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPwd ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-white py-2.5 text-sm font-bold text-blue-700 shadow-sm transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-65"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/40">
              Demo credentials
            </p>
            <div className="space-y-0.5 text-xs text-white/60">
              <p>Email: <span className="font-medium text-white/80">admin@bastionlms.com</span></p>
              <p>Password: <span className="font-medium text-white/80">admin123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
