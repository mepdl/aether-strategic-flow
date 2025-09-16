export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      brand_identity: {
        Row: {
          brand_persona: string | null
          created_at: string
          id: string
          marketing_mix: Json | null
          mission: string | null
          positioning: string | null
          updated_at: string
          user_id: string
          values: string | null
          vision: string | null
        }
        Insert: {
          brand_persona?: string | null
          created_at?: string
          id?: string
          marketing_mix?: Json | null
          mission?: string | null
          positioning?: string | null
          updated_at?: string
          user_id: string
          values?: string | null
          vision?: string | null
        }
        Update: {
          brand_persona?: string | null
          created_at?: string
          id?: string
          marketing_mix?: Json | null
          mission?: string | null
          positioning?: string | null
          updated_at?: string
          user_id?: string
          values?: string | null
          vision?: string | null
        }
        Relationships: []
      }
      campaign_personas: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          persona_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          persona_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          persona_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_personas_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_personas_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget: number | null
          channels: Database["public"]["Enums"]["marketing_channel"][] | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          objective_id: string | null
          spent: number | null
          start_date: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          channels?: Database["public"]["Enums"]["marketing_channel"][] | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          objective_id?: string | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          channels?: Database["public"]["Enums"]["marketing_channel"][] | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          objective_id?: string | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          created_at: string
          id: string
          marketing_strategies: string | null
          name: string
          notes: string | null
          pricing: Json | null
          products: Json | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          marketing_strategies?: string | null
          name: string
          notes?: string | null
          pricing?: Json | null
          products?: Json | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          marketing_strategies?: string | null
          name?: string
          notes?: string | null
          pricing?: Json | null
          products?: Json | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      content: {
        Row: {
          author: string | null
          campaign_id: string | null
          content_body: string | null
          created_at: string
          delivery_date: string | null
          format: Database["public"]["Enums"]["content_format"]
          id: string
          journey_stage:
            | Database["public"]["Enums"]["customer_journey_stage"]
            | null
          persona_id: string | null
          publish_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string | null
          campaign_id?: string | null
          content_body?: string | null
          created_at?: string
          delivery_date?: string | null
          format: Database["public"]["Enums"]["content_format"]
          id?: string
          journey_stage?:
            | Database["public"]["Enums"]["customer_journey_stage"]
            | null
          persona_id?: string | null
          publish_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string | null
          campaign_id?: string | null
          content_body?: string | null
          created_at?: string
          delivery_date?: string | null
          format?: Database["public"]["Enums"]["content_format"]
          id?: string
          journey_stage?:
            | Database["public"]["Enums"]["customer_journey_stage"]
            | null
          persona_id?: string | null
          publish_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      group_memberships: {
        Row: {
          created_at: string
          email: string
          group_id: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          group_id: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          group_id?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      key_results: {
        Row: {
          created_at: string
          current_value: number | null
          id: string
          objective_id: string
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          id?: string
          objective_id: string
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          id?: string
          objective_id?: string
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_results_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          campaign_id: string | null
          channel: Database["public"]["Enums"]["marketing_channel"] | null
          created_at: string
          date_recorded: string | null
          id: string
          metric_name: string
          metric_value: number | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          channel?: Database["public"]["Enums"]["marketing_channel"] | null
          created_at?: string
          date_recorded?: string | null
          id?: string
          metric_name: string
          metric_value?: number | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          channel?: Database["public"]["Enums"]["marketing_channel"] | null
          created_at?: string
          date_recorded?: string | null
          id?: string
          metric_name?: string
          metric_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      objectives: {
        Row: {
          created_at: string
          description: string | null
          id: string
          quarter: string | null
          title: string
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          quarter?: string | null
          title: string
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          quarter?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      persona_team_members: {
        Row: {
          created_at: string
          email: string
          id: string
          persona_id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          persona_id: string
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          persona_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "persona_team_members_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          avatar_url: string | null
          created_at: string
          demographics: Json | null
          goals: string | null
          id: string
          pain_points: string | null
          persona_name: string
          role: string | null
          updated_at: string
          user_id: string
          watering_holes: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          demographics?: Json | null
          goals?: string | null
          id?: string
          pain_points?: string | null
          persona_name: string
          role?: string | null
          updated_at?: string
          user_id: string
          watering_holes?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          demographics?: Json | null
          goals?: string | null
          id?: string
          pain_points?: string | null
          persona_name?: string
          role?: string | null
          updated_at?: string
          user_id?: string
          watering_holes?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      swot_analysis: {
        Row: {
          created_at: string
          id: string
          opportunities: string | null
          strengths: string | null
          threats: string | null
          updated_at: string
          user_id: string
          weaknesses: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          opportunities?: string | null
          strengths?: string | null
          threats?: string | null
          updated_at?: string
          user_id: string
          weaknesses?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          opportunities?: string | null
          strengths?: string | null
          threats?: string | null
          updated_at?: string
          user_id?: string
          weaknesses?: string | null
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          campaign_id: string | null
          content_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          campaign_id?: string | null
          content_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          campaign_id?: string | null
          content_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "editor"
        | "analyst"
        | "viewer"
        | "gerente_marketing"
        | "analista_marketing"
        | "assistente_marketing"
      content_format:
        | "blog_post"
        | "social_media"
        | "email"
        | "video"
        | "infographic"
        | "webinar"
        | "ebook"
      customer_journey_stage:
        | "awareness"
        | "consideration"
        | "decision"
        | "retention"
      marketing_channel:
        | "seo"
        | "ppc"
        | "social_media"
        | "email"
        | "content"
        | "pr"
        | "events"
      task_status: "ideas" | "in_progress" | "review" | "approved" | "published"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "editor",
        "analyst",
        "viewer",
        "gerente_marketing",
        "analista_marketing",
        "assistente_marketing",
      ],
      content_format: [
        "blog_post",
        "social_media",
        "email",
        "video",
        "infographic",
        "webinar",
        "ebook",
      ],
      customer_journey_stage: [
        "awareness",
        "consideration",
        "decision",
        "retention",
      ],
      marketing_channel: [
        "seo",
        "ppc",
        "social_media",
        "email",
        "content",
        "pr",
        "events",
      ],
      task_status: ["ideas", "in_progress", "review", "approved", "published"],
    },
  },
} as const
