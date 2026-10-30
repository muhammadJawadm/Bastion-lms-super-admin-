import { FaExclamationTriangle, FaInbox } from "react-icons/fa";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-label="Loading"
    />
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 px-5 py-10 text-sm text-gray-400">
      <Spinner className="text-blue-500" /> {label}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
      <FaExclamationTriangle size={18} className="text-red-400" />
      <p className="text-sm text-gray-600">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
      <FaInbox size={18} className="text-gray-300" />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

export function Alert({ variant, children }: { variant: "error" | "success" | "info" | "warning"; children: React.ReactNode }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-green-200 bg-green-50 text-green-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  }[variant];
  return <div className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>{children}</div>;
}
