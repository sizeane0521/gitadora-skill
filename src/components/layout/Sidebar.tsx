import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Users, Download, User, Guitar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInstrumentMode } from "@/hooks/useInstrumentMode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "成績總覽" },
  { to: "/pian-fen", icon: TrendingUp, label: "賺分曲" },
  { to: "/friends", icon: Users, label: "好友" },
  { to: "/import", icon: Download, label: "匯入成績" },
  { to: "/profile", icon: User, label: "個人資料" },
];

export function Sidebar() {
  const location = useLocation();
  const { profile } = useAuth();
  const { mode, setMode } = useInstrumentMode();

  return (
    <aside
      className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r"
      style={{
        background: "var(--color-bg-elevated)",
        borderColor: "var(--color-border-default)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--color-border-default)" }}>
        <span className="text-xl font-bold" style={{ color: "var(--color-brand)" }}>
          SIZ_GITADORA
        </span>
      </div>

      {/* GF/DM mode toggle */}
      <div className="px-3 py-3 flex gap-2">
        <button
          onClick={() => setMode("gf")}
          className={cn(
            "flex-1 py-1.5 rounded text-sm font-medium transition-colors",
            mode === "gf"
              ? "text-white"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          )}
          style={mode === "gf" ? { background: "var(--color-brand)" } : {}}
        >
          GF
        </button>
        <button
          onClick={() => setMode("dm")}
          className={cn(
            "flex-1 py-1.5 rounded text-sm font-medium transition-colors",
            mode === "dm"
              ? "text-white"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          )}
          style={mode === "dm" ? { background: "var(--color-brand)" } : {}}
        >
          DM
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive
                  ? "font-medium"
                  : "hover:opacity-80"
              )}
              style={
                isActive
                  ? {
                      color: "var(--color-brand)",
                      background: "var(--color-brand-subtle)",
                    }
                  : { color: "var(--color-text-secondary)" }
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: user avatar + theme toggle */}
      <div
        className="px-4 py-4 border-t flex items-center gap-3"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        {profile && (
          <>
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback>{profile.display_name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm truncate flex-1" style={{ color: "var(--color-text-secondary)" }}>
              {profile.display_name}
            </span>
          </>
        )}
        <ThemeToggle />
      </div>
    </aside>
  );
}
