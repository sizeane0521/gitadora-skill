import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuthContext();

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: "var(--color-bg-primary)" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--color-brand)", borderTopColor: "transparent" }}
        />
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>驗證中…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
