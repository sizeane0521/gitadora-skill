import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import type { UserRow } from "@/types/database";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserRow | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    return data as UserRow | null;
  }, []);

  const createProfile = useCallback(async (user: User) => {
    const insert = {
      id: user.id,
      email: user.email ?? "",
      display_name: user.user_metadata?.full_name ?? user.email ?? "Player",
      avatar_url: user.user_metadata?.avatar_url ?? null,
      konami_id: null,
      main_game: "GF" as const,
    };
    const { data } = await supabase
      .from("users")
      .insert(insert)
      .select()
      .single();
    return data as UserRow | null;
  }, []);

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on mount with the restored session.
    // Using it as the single source of truth avoids the race condition where
    // getSession() returns a session before the client has set the JWT header,
    // causing immediate data requests to go out as `anon` → 403.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          let profile = await fetchProfile(session.user.id);
          if (!profile) profile = await createProfile(session.user);
          setState({ session, user: session.user, profile, loading: false });
        } else {
          setState({ session: null, user: null, profile: null, loading: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, createProfile]);

  const signIn = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, signIn, signOut };
}
