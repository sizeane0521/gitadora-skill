import { ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Props {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function TagSelect({ options, value, onChange, placeholder = "選擇標籤..." }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div
        className="flex items-center w-full bg-input rounded px-3 py-2.5 text-sm font-body text-foreground cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {value ? (
          <div className="flex items-center gap-1 flex-1">
            <span className="truncate">{value}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="p-0.5 hover:bg-muted rounded"
            >
              <X size={12} className="text-muted-foreground" />
            </button>
          </div>
        ) : (
          <span className="text-muted-foreground flex-1">{placeholder}</span>
        )}
        <ChevronDown size={14} className="text-muted-foreground ml-1 shrink-0" />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded shadow-lg z-[80] max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">沒有可用的標籤</p>
          ) : (
            options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm font-body hover:bg-muted transition-colors ${
                  value === opt ? "text-primary font-semibold" : "text-foreground"
                }`}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
