export type GameType = "GF" | "DM";
export type Difficulty = "BSC" | "ADV" | "EXT" | "MAS";
export type ScoreSource = "arcade" | "konaste";
export type MainGame = "GF" | "DM" | "BOTH";
export type FriendshipStatus = "pending" | "accepted" | "rejected" | "blocked";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      songs: {
        Row: SongRow;
        Insert: SongInsert;
        Update: SongUpdate;
      };
      scores: {
        Row: ScoreRow;
        Insert: ScoreInsert;
        Update: ScoreUpdate;
      };
      friendships: {
        Row: FriendshipRow;
        Insert: FriendshipInsert;
        Update: FriendshipUpdate;
      };
    };
  };
}

// users
export interface UserRow {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  konami_id: string | null;
  main_game: MainGame;
  created_at: string;
  updated_at: string;
}

export type UserInsert = Omit<UserRow, "created_at" | "updated_at">;
export type UserUpdate = Partial<
  Pick<UserRow, "display_name" | "avatar_url" | "konami_id" | "main_game">
>;

// songs
export interface SongRow {
  id: number;
  konami_song_id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  image_name: string | null;
  game_type: GameType;
  level_bsc: number | null;
  level_adv: number | null;
  level_ext: number | null;
  level_mas: number | null;
  version: string | null;
  instrument: "guitar" | "bass" | "drums" | null;
  reading: string | null;
  category: "HOT" | "Other" | null;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export type SongInsert = Omit<SongRow, "id" | "created_at" | "updated_at">;
export type SongUpdate = Partial<
  Pick<
    SongRow,
    | "title"
    | "artist"
    | "cover_url"
    | "image_name"
    | "level_bsc"
    | "level_adv"
    | "level_ext"
    | "level_mas"
    | "version"
    | "instrument"
    | "reading"
    | "category"
    | "tags"
  >
>;

// scores
export interface ScoreRow {
  id: number;
  user_id: string;
  song_id: number;
  game_type: GameType;
  difficulty: Difficulty;
  achievement_rate: number;
  skill_point: number;
  play_count: number;
  best_grade: string | null;
  is_excellent: boolean;
  is_full_combo: boolean;
  source: ScoreSource;
  level_value: number | null;
  imported_at: string;
  updated_at: string;
}

export type ScoreInsert = Omit<ScoreRow, "id" | "updated_at">;
export type ScoreUpdate = Partial<
  Pick<
    ScoreRow,
    | "achievement_rate"
    | "skill_point"
    | "play_count"
    | "best_grade"
    | "is_excellent"
    | "is_full_combo"
    | "level_value"
    | "imported_at"
  >
>;

// friendships
export interface FriendshipRow {
  id: number;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export type FriendshipInsert = Omit<
  FriendshipRow,
  "id" | "created_at" | "updated_at"
>;
export type FriendshipUpdate = Pick<FriendshipRow, "status">;
