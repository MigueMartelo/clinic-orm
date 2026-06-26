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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendances: {
        Row: {
          attended_at: string
          balance_cop: number
          clinical_notes: string | null
          created_at: string
          id: string
          paid_cop: number
          patient_id: string
          recorded_by: string | null
          service_id: string
          service_instance_id: string | null
          total_cop: number
          updated_at: string
        }
        Insert: {
          attended_at?: string
          balance_cop?: number
          clinical_notes?: string | null
          created_at?: string
          id?: string
          paid_cop?: number
          patient_id: string
          recorded_by?: string | null
          service_id: string
          service_instance_id?: string | null
          total_cop: number
          updated_at?: string
        }
        Update: {
          attended_at?: string
          balance_cop?: number
          clinical_notes?: string | null
          created_at?: string
          id?: string
          paid_cop?: number
          patient_id?: string
          recorded_by?: string | null
          service_id?: string
          service_instance_id?: string | null
          total_cop?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendances_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_service_instance_id_fkey"
            columns: ["service_instance_id"]
            isOneToOne: false
            referencedRelation: "service_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clinical_history_entries: {
        Row: {
          attachment_path: string | null
          attendance_id: string | null
          content: string | null
          created_at: string
          entry_type: Database["public"]["Enums"]["clinical_entry_type"]
          id: string
          patient_id: string
          recorded_at: string
          recorded_by: string | null
          service_session_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          attachment_path?: string | null
          attendance_id?: string | null
          content?: string | null
          created_at?: string
          entry_type?: Database["public"]["Enums"]["clinical_entry_type"]
          id?: string
          patient_id: string
          recorded_at?: string
          recorded_by?: string | null
          service_session_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          attachment_path?: string | null
          attendance_id?: string | null
          content?: string | null
          created_at?: string
          entry_type?: Database["public"]["Enums"]["clinical_entry_type"]
          id?: string
          patient_id?: string
          recorded_at?: string
          recorded_by?: string | null
          service_session_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_history_entries_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_history_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_history_entries_service_session_id_fkey"
            columns: ["service_session_id"]
            isOneToOne: false
            referencedRelation: "service_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          notes: string | null
          product_id: string
          quantity: number
          recorded_by: string | null
          unit_cost_cop: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          notes?: string | null
          product_id: string
          quantity: number
          recorded_by?: string | null
          unit_cost_cop?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          movement_type?: Database["public"]["Enums"]["inventory_movement_type"]
          notes?: string | null
          product_id?: string
          quantity?: number
          recorded_by?: string | null
          unit_cost_cop?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_medical_profiles: {
        Row: {
          allergies: string | null
          consent_notes: string | null
          consent_signed_at: string | null
          contraindications: string | null
          created_at: string
          medications: string | null
          patient_id: string
          skin_type: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          consent_notes?: string | null
          consent_signed_at?: string | null
          contraindications?: string | null
          created_at?: string
          medications?: string | null
          patient_id: string
          skin_type?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          consent_notes?: string | null
          consent_signed_at?: string | null
          contraindications?: string | null
          created_at?: string
          medications?: string | null
          patient_id?: string
          skin_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_medical_profiles_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          created_at: string
          document_id: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cop: number
          attendance_id: string | null
          created_at: string
          id: string
          notes: string | null
          paid_at: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          recorded_by: string | null
          service_instance_id: string | null
        }
        Insert: {
          amount_cop: number
          attendance_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          recorded_by?: string | null
          service_instance_id?: string | null
        }
        Update: {
          amount_cop?: number
          attendance_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          recorded_by?: string | null
          service_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_service_instance_id_fkey"
            columns: ["service_instance_id"]
            isOneToOne: false
            referencedRelation: "service_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sales: {
        Row: {
          created_at: string
          id: string
          patient_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          product_id: string
          quantity: number
          recorded_by: string | null
          sold_at: string
          total_cop: number
          unit_price_cop: number
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          product_id: string
          quantity: number
          recorded_by?: string | null
          sold_at?: string
          total_cop: number
          unit_price_cop: number
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          product_id?: string
          quantity?: number
          recorded_by?: string | null
          sold_at?: string
          total_cop?: number
          unit_price_cop?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_sales_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          created_at: string
          id: string
          low_stock_threshold: number
          name: string
          sku: string | null
          stock_quantity: number
          unit_price_cop: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          low_stock_threshold?: number
          name: string
          sku?: string | null
          stock_quantity?: number
          unit_price_cop?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          low_stock_threshold?: number
          name?: string
          sku?: string | null
          stock_quantity?: number
          unit_price_cop?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      service_instances: {
        Row: {
          balance_cop: number
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          paid_cop: number
          patient_id: string
          service_id: string
          started_at: string
          total_cop: number
          total_sessions: number | null
          updated_at: string
        }
        Insert: {
          balance_cop?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_cop?: number
          patient_id: string
          service_id: string
          started_at?: string
          total_cop: number
          total_sessions?: number | null
          updated_at?: string
        }
        Update: {
          balance_cop?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_cop?: number
          patient_id?: string
          service_id?: string
          started_at?: string
          total_cop?: number
          total_sessions?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_instances_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_instances_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_sessions: {
        Row: {
          attendance_id: string | null
          created_at: string
          id: string
          instance_id: string
          session_at: string
          session_number: number
        }
        Insert: {
          attendance_id?: string | null
          created_at?: string
          id?: string
          instance_id: string
          session_at?: string
          session_number: number
        }
        Update: {
          attendance_id?: string | null
          created_at?: string
          id?: string
          instance_id?: string
          session_at?: string
          session_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_sessions_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_sessions_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "service_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          category_id: string
          created_at: string
          default_deposit_pct: number | null
          default_price_cop: number
          default_session_count: number | null
          id: string
          name: string
          session_mode: Database["public"]["Enums"]["session_mode"]
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id: string
          created_at?: string
          default_deposit_pct?: number | null
          default_price_cop?: number
          default_session_count?: number | null
          id?: string
          name: string
          session_mode?: Database["public"]["Enums"]["session_mode"]
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string
          created_at?: string
          default_deposit_pct?: number | null
          default_price_cop?: number
          default_session_count?: number | null
          id?: string
          name?: string
          session_mode?: Database["public"]["Enums"]["session_mode"]
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      patient_timeline: {
        Row: {
          balance_cop: number | null
          event_at: string | null
          event_type: string | null
          patient_id: string | null
          recorded_by: string | null
          source_id: string | null
          source_table: string | null
          summary: string | null
          title: string | null
          total_cop: number | null
        }
        Relationships: []
      }
      receivables: {
        Row: {
          balance_cop: number | null
          patient_id: string | null
          patient_name: string | null
          patient_phone: string | null
          reference_at: string | null
          service_name: string | null
          source_id: string | null
          source_type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_write_operations: { Args: never; Returns: boolean }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_doctor: { Args: never; Returns: boolean }
      is_receptionist: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      write_audit_log: {
        Args: {
          p_action: string
          p_new_data?: Json
          p_old_data?: Json
          p_record_id: string
          p_table_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      clinical_entry_type: "clinical_note" | "attachment"
      inventory_movement_type: "entrada" | "salida"
      payment_method: "transferencia" | "datafono" | "efectivo" | "dolares"
      session_mode: "none" | "fixed_count" | "open"
      user_role: "admin" | "doctor" | "receptionist" | "user"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      clinical_entry_type: ["clinical_note", "attachment"],
      inventory_movement_type: ["entrada", "salida"],
      payment_method: ["transferencia", "datafono", "efectivo", "dolares"],
      session_mode: ["none", "fixed_count", "open"],
      user_role: ["admin", "doctor", "receptionist", "user"],
    },
  },
} as const
