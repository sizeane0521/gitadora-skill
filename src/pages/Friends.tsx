import { useState } from "react";
import { Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  useFriendList,
  usePendingRequests,
  useSearchUsers,
  useSendFriendRequest,
  useRespondToFriendRequest,
} from "@/hooks/useFriends";
import { useFriendScores } from "@/hooks/useScores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { UserRow } from "@/types/database";
import type { SongData } from "@/types/song";

// ===== Friend List =====
function FriendList() {
  const { user } = useAuth();
  const { data: friends, isLoading } = useFriendList(user?.id);

  if (isLoading) return <LoadingSpinner />;

  if (!friends?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p style={{ color: "var(--color-text-muted)" }}>還沒有好友</p>
        <Link to="/friends/requests">
          <Button style={{ background: "var(--color-brand)", color: "#fff" }}>
            新增好友
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {friends.map(({ friendship, user: friend }) => (
        <Link
          key={friendship.id}
          to={`/friends/${friend.id}`}
          className="flex items-center gap-3 px-4 py-3 border-b hover:opacity-80 transition-opacity"
          style={{ borderColor: "var(--color-border-default)" }}
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={friend.avatar_url ?? undefined} />
            <AvatarFallback>{friend.display_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
              {friend.display_name}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {friend.main_game}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ===== Friend Requests =====
function FriendRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: pending } = usePendingRequests(user?.id);
  const sendRequest = useSendFriendRequest(user?.id);
  const respond = useRespondToFriendRequest();

  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults } = useSearchUsers(searchQuery);

  const handleSend = async (targetUser: UserRow) => {
    try {
      await sendRequest.mutateAsync(targetUser.id);
      toast({ title: `已送出好友邀請給 ${targetUser.display_name}` });
      setSearchQuery("");
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  };

  const handleRespond = async (friendshipId: number, status: "accepted" | "rejected" | "blocked") => {
    await respond.mutateAsync({ friendshipId, status });
  };

  return (
    <div className="space-y-6 px-4 py-4">
      {/* Search */}
      <div className="space-y-2">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
          搜尋玩家
        </p>
        <Input
          placeholder="輸入顯示名稱或 Email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchResults && searchResults.length === 0 && searchQuery.length >= 2 && (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            找不到符合的玩家
          </p>
        )}
        {searchResults && searchResults.length > 0 && (
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--color-border-default)" }}
          >
            {searchResults
              .filter((u) => u.id !== user?.id)
              .map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 px-3 py-2.5 border-b last:border-0"
                  style={{ borderColor: "var(--color-border-default)" }}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={u.avatar_url ?? undefined} />
                    <AvatarFallback>{u.display_name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm" style={{ color: "var(--color-text-primary)" }}>
                    {u.display_name}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleSend(u)}
                    style={{ background: "var(--color-brand)", color: "#fff" }}
                  >
                    新增
                  </Button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Pending incoming requests */}
      {pending && pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
            待處理邀請 ({pending.length})
          </p>
          {pending.map(({ friendship, user: requester }) => (
            <div
              key={friendship.id}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: "var(--color-bg-secondary)" }}
            >
              <Avatar className="w-9 h-9">
                <AvatarImage src={requester.avatar_url ?? undefined} />
                <AvatarFallback>{requester.display_name[0]}</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm" style={{ color: "var(--color-text-primary)" }}>
                {requester.display_name}
              </span>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  onClick={() => handleRespond(friendship.id, "accepted")}
                  style={{ background: "var(--color-brand)", color: "#fff" }}
                >
                  接受
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRespond(friendship.id, "rejected")}
                  style={{ color: "var(--color-text-muted)" }}
                >
                  拒絕
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRespond(friendship.id, "blocked")}
                  className="text-red-500"
                >
                  封鎖
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Friend Detail =====
function FriendDetail() {
  const { userId } = useParams<{ userId: string }>();
  const { user: me } = useAuth();
  const { data: friends } = useFriendList(me?.id);

  const isFriend = friends?.some((f) => f.user.id === userId);
  const friend = friends?.find((f) => f.user.id === userId)?.user;

  const { data: scores, isLoading } = useFriendScores(
    isFriend ? userId : undefined
  );

  if (!friends) return <LoadingSpinner />;

  if (!isFriend) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <p style={{ color: "var(--color-text-muted)" }}>你和這位玩家不是好友</p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-3 px-4 py-4 border-b"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        <Avatar className="w-10 h-10">
          <AvatarImage src={friend?.avatar_url ?? undefined} />
          <AvatarFallback>{friend?.display_name?.[0] ?? "?"}</AvatarFallback>
        </Avatar>
        <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {friend?.display_name}
        </p>
      </div>

      {isLoading && <LoadingSpinner />}

      {scores?.map((item, i) => (
        <div
          key={`${item._scoreId ?? i}`}
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: "var(--color-border-default)" }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
              {item.歌曲名稱}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {item.樂器類型} {item.譜面等級}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold tabular-nums" style={{ color: "var(--skill-gold-dark)" }}>
              {Number(item["家用版 Skill 點數"] || item["街機版 Skill 點數"]).toFixed(1)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Shared =====
function LoadingSpinner() {
  return (
    <div className="flex justify-center py-16">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--color-brand)" }}
      />
    </div>
  );
}

// ===== Main Friends page with sub-routes =====
export default function Friends() {
  const navigate = useNavigate();

  return (
    <div style={{ color: "var(--color-text-primary)" }}>
      <Routes>
        <Route
          path="list"
          element={
            <>
              <FriendsTabBar active="list" navigate={navigate} />
              <FriendList />
            </>
          }
        />
        <Route
          path="requests"
          element={
            <>
              <FriendsTabBar active="requests" navigate={navigate} />
              <FriendRequests />
            </>
          }
        />
        <Route path=":userId" element={<FriendDetail />} />
      </Routes>
    </div>
  );
}

function FriendsTabBar({ active, navigate }: { active: string; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div
      className="flex border-b sticky top-0 z-10"
      style={{
        background: "var(--color-bg-elevated)",
        borderColor: "var(--color-border-default)",
      }}
    >
      {(["list", "requests"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => navigate(`/friends/${tab}`)}
          className={cn(
            "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
            active === tab
              ? "border-[var(--color-brand)] text-[var(--color-brand)]"
              : "border-transparent text-[var(--color-text-muted)]"
          )}
        >
          {tab === "list" ? "好友列表" : "好友邀請"}
        </button>
      ))}
    </div>
  );
}
