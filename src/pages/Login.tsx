import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, loading, navigate]);

  async function handleSignIn() {
    setSigningIn(true);
    try {
      await signIn();
    } catch {
      setSigningIn(false);
    }
  }

  const isBusy = loading || signingIn;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-4"
      style={{ background: "var(--color-bg-primary)" }}
    >
      <div className="text-center space-y-2">
        <h1
          className="text-4xl font-bold"
          style={{ color: "var(--color-brand)" }}
        >
          SIZ_GITADORA
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          GF/DM 雙環境 Skill 分析工具
        </p>
      </div>

      <Button
        size="lg"
        onClick={handleSignIn}
        disabled={isBusy}
        className="gap-2 min-w-[180px]"
        style={{
          background: "var(--color-brand)",
          color: "#fff",
        }}
      >
        {isBusy ? (
          <>
            <span
              className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "rgba(255,255,255,0.5)", borderTopColor: "transparent" }}
            />
            登入中…
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            使用 Google 登入
          </>
        )}
      </Button>

      {signingIn && (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          正在開啟 Google 登入視窗…
        </p>
      )}
    </div>
  );
}
