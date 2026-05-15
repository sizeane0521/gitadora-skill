import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "siz-gitadora-theme";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      // Check new key first, fall back to legacy "theme" key
      return (
        (localStorage.getItem(STORAGE_KEY) as Theme) ||
        (localStorage.getItem("theme") as Theme) ||
        "light"
      );
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    // Set both class (for shadcn/ui) and data-theme (for design system tokens)
    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
