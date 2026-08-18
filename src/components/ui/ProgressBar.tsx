interface ProgressBarProps {
  value: number;
  color?: string;
  label?: string;
  trailing?: string;
  trackColor?: string;
}

export function ProgressBar({
  value,
  color = "bg-blue-500",
  label,
  trailing,
  trackColor = "bg-gray-100",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div>
      {(label || trailing) && (
        <div className="mb-1 flex items-center justify-between gap-2">
          {label && <span className="text-xs text-gray-600">{label}</span>}
          {trailing && <span className="text-xs font-medium text-gray-700">{trailing}</span>}
        </div>
      )}
      <div className={`h-2 w-full overflow-hidden rounded-full ${trackColor}`}>
        <div
          className={`h-2 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
