import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppShell() {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      <Sidebar />
      <main className="flex-1 pb-16 md:pb-0 min-w-0">
        <div className="max-w-2xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
      {/* Mobile-only theme toggle — fixed top-right */}
      <div className="fixed top-3 right-3 z-40 md:hidden">
        <ThemeToggle />
      </div>
      <BottomNav />
    </div>
  );
}
