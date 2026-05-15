import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuthContext";

// Eager-load critical pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Lazy-load authenticated pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Songs = lazy(() => import("./pages/Songs"));
const SongDetail = lazy(() => import("./pages/SongDetail"));
const PianFen = lazy(() => import("./pages/PianFen"));
const Friends = lazy(() => import("./pages/Friends"));
const Import = lazy(() => import("./pages/Import"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center gap-3"
    style={{ background: "var(--color-bg-primary)" }}
  >
    <div
      className="w-8 h-8 rounded-full border-2 animate-spin"
      style={{ borderColor: "var(--color-brand)", borderTopColor: "transparent" }}
    />
    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>載入中…</p>
  </div>
);

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />

              {/* Protected — wrapped in AppShell layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/:tab" element={<Dashboard />} />
                <Route path="/songs" element={<Songs />} />
                <Route path="/songs/:id" element={<SongDetail />} />
                <Route path="/pian-fen" element={<Navigate to="/pian-fen/gf" replace />} />
                <Route path="/pian-fen/:instrument" element={<PianFen />} />
                <Route path="/friends" element={<Navigate to="/friends/list" replace />} />
                <Route path="/friends/*" element={<Friends />} />
                <Route path="/import" element={<Import />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
