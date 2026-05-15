import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings } from "lucide-react";

export default function Profile() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [konamiId, setKonamiId] = useState(profile?.konami_id ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = displayName.trim();
    if (trimmed.length < 1 || trimmed.length > 50) {
      toast({
        title: "顯示名稱長度須在 1–50 字元之間",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({ display_name: trimmed, konami_id: konamiId || null })
      .eq("id", user!.id);
    setSaving(false);

    if (error) {
      toast({ title: "儲存失敗", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "已儲存" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div
      className="max-w-lg mx-auto px-4 py-8 space-y-8"
      style={{ color: "var(--color-text-primary)" }}
    >
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback>{profile?.display_name?.[0] ?? "P"}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-lg">{profile?.display_name}</p>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm">
            {user?.email}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="displayName">顯示名稱</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            placeholder="1–50 字元"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="konamiId">Konami ID（選填）</Label>
          <Input
            id="konamiId"
            value={konamiId}
            onChange={(e) => setKonamiId(e.target.value)}
            placeholder="你的 Konami 玩家 ID"
          />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "儲存中..." : "儲存"}
        </Button>
      </div>

      <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "var(--color-border-default)" }}>
        <Button variant="outline" onClick={() => navigate("/profile/settings")} className="gap-2">
          <Settings className="w-4 h-4" />
          設定
        </Button>
        <Button variant="ghost" onClick={handleSignOut} className="gap-2 text-red-500 hover:text-red-600">
          <LogOut className="w-4 h-4" />
          登出
        </Button>
      </div>
    </div>
  );
}
