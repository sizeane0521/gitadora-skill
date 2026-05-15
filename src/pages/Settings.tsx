import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MainGame } from "@/types/database";

export default function Settings() {
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const handleMainGameChange = async (value: MainGame) => {
    if (!user) return;
    const { supabase } = await import("@/lib/supabase");
    const { error } = await (supabase.from("users") as any)
      .update({ main_game: value })
      .eq("id", user.id);
    if (error) {
      toast({ title: "更新失敗", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "主玩遊戲已更新" });
    }
  };

  return (
    <div
      className="max-w-lg mx-auto px-4 py-8 space-y-6"
      style={{ color: "var(--color-text-primary)" }}
    >
      <h1 className="text-2xl font-semibold">設定</h1>

      <div className="space-y-2">
        <Label>主玩遊戲</Label>
        <Select
          defaultValue={profile?.main_game ?? "GF"}
          onValueChange={(v) => handleMainGameChange(v as MainGame)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GF">GF（吉他/貝斯）</SelectItem>
            <SelectItem value="DM">DM（鼓）</SelectItem>
            <SelectItem value="BOTH">GF + DM</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          影響預設的樂器模式顯示
        </p>
      </div>
    </div>
  );
}
