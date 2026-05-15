import { GameMode } from "@/types/song";
import { Guitar, Disc3 } from "lucide-react";

interface BottomNavProps {
  mode?: GameMode;
  onModeChange?: (m: GameMode) => void;
}

export default function BottomNav({ mode, onModeChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex h-14">
        <button
          onClick={() => onModeChange?.("GF")}
          className={`flex-1 flex items-center justify-center gap-2 font-display font-semibold text-sm tracking-wider transition-colors duration-150 ${
            mode === "GF"
              ? "text-primary border-t-2 border-primary"
              : "text-muted-foreground border-t-2 border-transparent"
          }`}
        >
          <Guitar size={18} />
          GUITAR
        </button>
        <button
          onClick={() => onModeChange?.("DM")}
          className={`flex-1 flex items-center justify-center gap-2 font-display font-semibold text-sm tracking-wider transition-colors duration-150 ${
            mode === "DM"
              ? "text-accent border-t-2 border-accent"
              : "text-muted-foreground border-t-2 border-transparent"
          }`}
        >
          <Disc3 size={18} />
          DRUMS
        </button>
      </div>
    </nav>
  );
}
