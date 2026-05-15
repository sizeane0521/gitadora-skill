import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { FriendshipRow, FriendshipStatus, UserRow } from "@/types/database";

export interface FriendWithUser {
  friendship: FriendshipRow;
  user: UserRow;
}

export function useFriendList(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "accepted", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select("*, requester:requester_id(id,display_name,avatar_url,main_game), addressee:addressee_id(id,display_name,avatar_url,main_game)")
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
      if (error) throw error;
      return (data ?? []).map((f: any) => {
        const friend = f.requester_id === userId ? f.addressee : f.requester;
        return { friendship: f as FriendshipRow, user: friend as UserRow };
      });
    },
  });
}

export function usePendingRequests(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "pending", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select("*, requester:requester_id(id,display_name,avatar_url,main_game)")
        .eq("addressee_id", userId!)
        .eq("status", "pending");
      if (error) throw error;
      return (data ?? []).map((f: any) => ({
        friendship: f as FriendshipRow,
        user: f.requester as UserRow,
      }));
    },
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    enabled: query.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id,display_name,avatar_url,main_game,email")
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);
      if (error) throw error;
      return (data ?? []) as UserRow[];
    },
  });
}

export function useSendFriendRequest(myId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (addresseeId: string) => {
      if (!myId) throw new Error("Not authenticated");
      if (myId === addresseeId) throw new Error("Cannot add yourself as a friend");

      // Check for existing request
      const { data: existing } = await supabase
        .from("friendships")
        .select("id,status")
        .or(
          `and(requester_id.eq.${myId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${myId})`
        )
        .single();

      if (existing) throw new Error("Friend request already sent or relationship exists");

      const { error } = await supabase.from("friendships").insert({
        requester_id: myId,
        addressee_id: addresseeId,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });
}

export function useRespondToFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ friendshipId, status }: { friendshipId: number; status: FriendshipStatus }) => {
      const { error } = await supabase
        .from("friendships")
        .update({ status })
        .eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });
}
