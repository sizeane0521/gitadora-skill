import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "切換淺色模式" : "切換深色模式"}
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-lg transition-colors cursor-pointer",
        "hover:opacity-80",
        className
      )}
      style={{
        color: "var(--color-text-muted)",
        background: "var(--color-bg-secondary)",
      }}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
