interface ToggleGroupProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  accentClass?: string;
}

export default function ToggleGroup({ options, value, onChange, accentClass = "bg-primary text-primary-foreground" }: ToggleGroupProps) {
  return (
    <div className="flex bg-input rounded p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-1.5 rounded text-xs font-display font-semibold tracking-wide transition-all ${
            value === opt.value
              ? `${accentClass} shadow-sm`
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
