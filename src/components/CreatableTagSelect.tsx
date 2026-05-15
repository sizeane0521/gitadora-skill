import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface Props {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function CreatableTagSelect({ options, value, onChange, placeholder = "選擇或輸入標籤..." }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(input.toLowerCase())
  );

  const showCreate = input.trim() && !options.some((o) => o.toLowerCase() === input.trim().toLowerCase());

  const select = (v: string) => {
    onChange(v);
    setInput("");
    setOpen(false);
  };

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
          <div className="p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="搜尋或輸入新標籤..."
              className="w-full bg-input rounded px-2.5 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
          {filtered.map((opt) => (
            <button
              key={opt}
              onClick={() => select(opt)}
              className={`w-full text-left px-3 py-2 text-sm font-body hover:bg-muted transition-colors ${
                value === opt ? "text-primary font-semibold" : "text-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
          {showCreate && (
            <button
              onClick={() => select(input.trim())}
              className="w-full text-left px-3 py-2 text-sm font-body text-primary hover:bg-muted transition-colors"
            >
              新增「{input.trim()}」
            </button>
          )}
          {filtered.length === 0 && !showCreate && (
            <p className="px-3 py-2 text-sm text-muted-foreground">沒有符合的選項</p>
          )}
        </div>
      )}
    </div>
  );
}
