import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, loading, navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 text-center"
      style={{ background: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}
    >
      <div className="space-y-3">
        <h1 className="text-5xl font-bold" style={{ color: "var(--color-brand)" }}>
          SIZ_GITADORA
        </h1>
        <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
          GF / DM 雙環境 Skill 分析工具
        </p>
        <p className="text-sm max-w-md" style={{ color: "var(--color-text-muted)" }}>
          整合家用（Konaste）與街機成績，找出你的賺分曲，和朋友比較進步
        </p>
      </div>
      <Button
        size="lg"
        onClick={signIn}
        style={{ background: "var(--color-brand)", color: "#fff" }}
      >
        使用 Google 登入
      </Button>
    </div>
  );
}
