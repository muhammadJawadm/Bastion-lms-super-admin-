interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, sublabel, disabled }: ToggleProps) {
  return (
    <label
      className={`inline-flex items-center gap-2.5 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </button>
      {(label || sublabel) && (
        <span>
          {label && <span className="block text-sm text-gray-700">{label}</span>}
          {sublabel && <span className="block text-xs text-gray-400">{sublabel}</span>}
        </span>
      )}
    </label>
  );
}
