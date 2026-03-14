export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      favorites: {
        Row: { created_at: string; game_id: string; user_id: string }
        Insert: { created_at?: string; game_id: string; user_id: string }
        Update: { created_at?: string; game_id?: string; user_id?: string }
        Relationships: [
          { foreignKeyName: "favorites_game_id_fkey"; columns: ["game_id"]; isOneToOne: false; referencedRelation: "games"; referencedColumns: ["id"] },
          { foreignKeyName: "favorites_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      follows: {
        Row: { created_at: string | null; follower_id: string; following_id: string }
        Insert: { created_at?: string | null; follower_id: string; following_id: string }
        Update: { created_at?: string | null; follower_id?: string; following_id?: string }
        Relationships: [
          { foreignKeyName: "follows_follower_id_fkey"; columns: ["follower_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "follows_following_id_fkey"; columns: ["following_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      games: {
        Row: {
          author_id: string | null; bundle_path: string | null; created_at: string
          description: string | null; id: string; is_official: boolean; plays: number
          published_at: string; slug: string | null; tags: string[]
          thumbnail_url: string | null; title: string
        }
        Insert: {
          author_id?: string | null; bundle_path?: string | null; created_at?: string
          description?: string | null; id?: string; is_official?: boolean; plays?: number
          published_at?: string; slug?: string | null; tags?: string[]
          thumbnail_url?: string | null; title: string
        }
        Update: {
          author_id?: string | null; bundle_path?: string | null; created_at?: string
          description?: string | null; id?: string; is_official?: boolean; plays?: number
          published_at?: string; slug?: string | null; tags?: string[]
          thumbnail_url?: string | null; title?: string
        }
        Relationships: [
          { foreignKeyName: "games_author_id_fkey"; columns: ["author_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null; bio: string | null; created_at: string
          display_name: string | null; id: string; is_public: boolean
          show_favorites: boolean; updated_at: string; username: string
          username_confirmed: boolean; website: string | null
        }
        Insert: {
          avatar_url?: string | null; bio?: string | null; created_at?: string
          display_name?: string | null; id: string; is_public?: boolean
          show_favorites?: boolean; updated_at?: string; username: string
          username_confirmed?: boolean; website?: string | null
        }
        Update: {
          avatar_url?: string | null; bio?: string | null; created_at?: string
          display_name?: string | null; id?: string; is_public?: boolean
          show_favorites?: boolean; updated_at?: string; username?: string
          username_confirmed?: boolean; website?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: { created_at: string; data: Json; id: string; name: string; thumbnail_url: string | null; updated_at: string; user_id: string }
        Insert: { created_at?: string; data?: Json; id?: string; name: string; thumbnail_url?: string | null; updated_at?: string; user_id: string }
        Update: { created_at?: string; data?: Json; id?: string; name?: string; thumbnail_url?: string | null; updated_at?: string; user_id?: string }
        Relationships: [
          { foreignKeyName: "projects_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      reviews: {
        Row: { body: string | null; created_at: string; game_id: string; id: string; rating: number; updated_at: string; user_id: string }
        Insert: { body?: string | null; created_at?: string; game_id: string; id?: string; rating: number; updated_at?: string; user_id: string }
        Update: { body?: string | null; created_at?: string; game_id?: string; id?: string; rating?: number; updated_at?: string; user_id?: string }
        Relationships: [
          { foreignKeyName: "reviews_game_id_fkey"; columns: ["game_id"]; isOneToOne: false; referencedRelation: "games"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      tags: {
        Row: { id: number; name: string; slug: string }
        Insert: { id?: number; name: string; slug: string }
        Update: { id?: number; name?: string; slug?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      increment_plays: { Args: { game_id: string }; Returns: undefined }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R } ? R : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R } ? R : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I } ? I : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I } ? I : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U } ? U : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U } ? U : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = { public: { Enums: {} } } as const
