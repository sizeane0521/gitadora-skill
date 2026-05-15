import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Users, Download } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "成績" },
  { to: "/pian-fen", icon: TrendingUp, label: "賺分曲" },
  { to: "/friends", icon: Users, label: "好友" },
  { to: "/import", icon: Download, label: "匯入" },
];

export function BottomNav() {
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t"
      style={{
        background: isDark ? "#0A051A" : "var(--color-bg-elevated)",
        borderColor: isDark ? "var(--bg-grid)" : "var(--color-border-default)",
        height: 52,
      }}
    >
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
        const isActive = location.pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            className="relative flex-1 flex flex-col items-center justify-center gap-0.5"
          >
            {isActive ? (
              <>
                {/* Active top glow bar */}
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "15%",
                    right: "15%",
                    height: "2px",
                    borderRadius: "0 0 3px 3px",
                    background: isDark ? "var(--neon-lime)" : "var(--color-brand)",
                    boxShadow: isDark
                      ? "0 0 8px var(--neon-lime), 0 0 20px color-mix(in srgb, var(--neon-lime) 60%, transparent), 0 2px 14px var(--neon-lime)"
                      : "0 0 6px var(--color-brand)",
                  }}
                />
                {/* Active background highlight */}
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: isDark
                      ? "color-mix(in srgb, var(--neon-lime) 6%, transparent)"
                      : "color-mix(in srgb, var(--color-brand) 8%, transparent)",
                    pointerEvents: "none",
                  }}
                />
                <Icon
                  className="w-5 h-5"
                  style={{
                    color: isDark ? "var(--neon-lime)" : "var(--color-brand)",
                    filter: isDark
                      ? "drop-shadow(0 0 6px var(--neon-lime))"
                      : "none",
                    position: "relative",
                  }}
                />
                <span
                  style={{
                    color: isDark ? "var(--neon-lime)" : "var(--color-brand)",
                    fontFamily: "var(--font-display)",
                    fontSize: "9px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    position: "relative",
                    textShadow: isDark ? "0 0 8px var(--neon-lime)" : "none",
                  }}
                >
                  {label}
                </span>
              </>
            ) : (
              <>
                <Icon
                  className="w-5 h-5"
                  style={{ color: isDark ? "var(--text-dim)" : "var(--color-text-muted)" }}
                />
                <span
                  style={{
                    color: isDark ? "var(--text-dim)" : "var(--color-text-muted)",
                    fontFamily: "var(--font-display)",
                    fontSize: "9px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
