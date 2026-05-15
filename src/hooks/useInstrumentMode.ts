import { useState, useEffect, useCallback } from "react";
import type { GameType } from "@/types/database";

const STORAGE_KEY = "siz-gitadora-instrument";

export type InstrumentMode = "gf" | "dm";

function toInstrumentMode(value: string | null): InstrumentMode {
  return value === "dm" ? "dm" : "gf";
}

export function useInstrumentMode(defaultMode?: InstrumentMode) {
  const [mode, setModeState] = useState<InstrumentMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return toInstrumentMode(stored ?? defaultMode ?? "gf");
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-instrument", mode);
  }, [mode]);

  const setMode = useCallback((next: InstrumentMode) => {
    localStorage.setItem(STORAGE_KEY, next);
    setModeState(next);
  }, []);

  const setModeFromMainGame = useCallback((mainGame: GameType | "BOTH" | undefined) => {
    if (mainGame === "DM") setMode("dm");
    else setMode("gf");
  }, [setMode]);

  return { mode, setMode, setModeFromMainGame };
}
