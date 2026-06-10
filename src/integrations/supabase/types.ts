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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          created_at: string
          description: string
          id: string
          impact: string | null
          module: string
          severity: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          impact?: string | null
          module: string
          severity?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          impact?: string | null
          module?: string
          severity?: string
          title?: string
        }
        Relationships: []
      }
      attendance_marks: {
        Row: {
          created_at: string
          date: string
          id: string
          status: string
          student_htno: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          status: string
          student_htno: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          status?: string
          student_htno?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_marks_student_htno_fkey"
            columns: ["student_htno"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["htno"]
          },
        ]
      }
      facilities: {
        Row: {
          capacity: number
          created_at: string
          id: string
          name: string
          predicted_next_pct: number | null
          trend: string
          type: string
          updated_at: string
          utilization_pct: number
        }
        Insert: {
          capacity: number
          created_at?: string
          id?: string
          name: string
          predicted_next_pct?: number | null
          trend?: string
          type: string
          updated_at?: string
          utilization_pct?: number
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          name?: string
          predicted_next_pct?: number | null
          trend?: string
          type?: string
          updated_at?: string
          utilization_pct?: number
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string
          id: string
          last_restocked: string | null
          min_threshold: number
          name: string
          predicted_need: number
          quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          last_restocked?: string | null
          min_threshold?: number
          name: string
          predicted_need?: number
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          last_restocked?: string | null
          min_threshold?: number
          name?: string
          predicted_need?: number
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_records: {
        Row: {
          created_at: string
          equipment_name: string
          health_score: number
          id: string
          last_serviced: string | null
          location: string
          next_due: string | null
          notes: string | null
          risk_level: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment_name: string
          health_score?: number
          id?: string
          last_serviced?: string | null
          location: string
          next_due?: string | null
          notes?: string | null
          risk_level?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment_name?: string
          health_score?: number
          id?: string
          last_serviced?: string | null
          location?: string
          next_due?: string | null
          notes?: string | null
          risk_level?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      resource_usage: {
        Row: {
          consumption: number
          cost: number
          created_at: string
          forecast: boolean
          id: string
          period: string
          resource_type: string
          unit: string
        }
        Insert: {
          consumption: number
          cost?: number
          created_at?: string
          forecast?: boolean
          id?: string
          period: string
          resource_type: string
          unit: string
        }
        Update: {
          consumption?: number
          cost?: number
          created_at?: string
          forecast?: boolean
          id?: string
          period?: string
          resource_type?: string
          unit?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          htno: string
          name: string
          sno: number
          tp_percent: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          htno: string
          name: string
          sno: number
          tp_percent?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          htno?: string
          name?: string
          sno?: number
          tp_percent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
