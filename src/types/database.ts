export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      attempts: {
        Row: {
          acertou: boolean;
          created_at: string;
          id: string;
          modo: string;
          question_id: string;
          resposta: string;
          session_id: string | null;
          tempo_seg: number | null;
          tipo_erro: string | null;
          user_id: string;
        };
        Insert: {
          acertou: boolean;
          created_at?: string;
          id?: string;
          modo?: string;
          question_id: string;
          resposta: string;
          session_id?: string | null;
          tempo_seg?: number | null;
          tipo_erro?: string | null;
          user_id: string;
        };
        Update: {
          acertou?: boolean;
          created_at?: string;
          id?: string;
          modo?: string;
          question_id?: string;
          resposta?: string;
          session_id?: string | null;
          tempo_seg?: number | null;
          tipo_erro?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attempts_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      estudo_reverso_sessions: {
        Row: {
          attempt_id: string | null;
          concluido: boolean;
          concluido_em: string | null;
          id: string;
          iniciado_em: string;
          question_id: string;
          recall_acertou: boolean | null;
          telas_vistas: Json;
          tempo_total_seg: number | null;
          user_id: string;
        };
        Insert: {
          attempt_id?: string | null;
          concluido?: boolean;
          concluido_em?: string | null;
          id?: string;
          iniciado_em?: string;
          question_id: string;
          recall_acertou?: boolean | null;
          telas_vistas?: Json;
          tempo_total_seg?: number | null;
          user_id: string;
        };
        Update: {
          attempt_id?: string | null;
          concluido?: boolean;
          concluido_em?: string | null;
          id?: string;
          iniciado_em?: string;
          question_id?: string;
          recall_acertou?: boolean | null;
          telas_vistas?: Json;
          tempo_total_seg?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "estudo_reverso_sessions_attempt_id_fkey";
            columns: ["attempt_id"];
            isOneToOne: false;
            referencedRelation: "attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "estudo_reverso_sessions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      questions: {
        Row: {
          alt_a: string;
          alt_b: string;
          alt_c: string;
          alt_d: string;
          alt_e: string | null;
          comentario_json: Json;
          created_at: string;
          dificuldade: number;
          enunciado: string;
          estilo_idecan: string | null;
          estudo_reverso_visual_completo_json: Json | null;
          estudo_reverso_visual_json: Json | null;
          gabarito: string;
          id: string;
          tags: string[] | null;
          tipo: string;
          topic_id: string;
        };
        Insert: {
          alt_a: string;
          alt_b: string;
          alt_c: string;
          alt_d: string;
          alt_e?: string | null;
          comentario_json?: Json;
          created_at?: string;
          dificuldade?: number;
          enunciado: string;
          estilo_idecan?: string | null;
          estudo_reverso_visual_completo_json?: Json | null;
          estudo_reverso_visual_json?: Json | null;
          gabarito: string;
          id?: string;
          tags?: string[] | null;
          tipo?: string;
          topic_id: string;
        };
        Update: {
          alt_a?: string;
          alt_b?: string;
          alt_c?: string;
          alt_d?: string;
          alt_e?: string | null;
          comentario_json?: Json;
          created_at?: string;
          dificuldade?: number;
          enunciado?: string;
          estilo_idecan?: string | null;
          estudo_reverso_visual_completo_json?: Json | null;
          estudo_reverso_visual_json?: Json | null;
          gabarito?: string;
          id?: string;
          tags?: string[] | null;
          tipo?: string;
          topic_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
      simulados: {
        Row: {
          created_at: string;
          duracao_min: number | null;
          id: string;
          nota_total: number;
          notas_disciplina_json: Json;
          tipo: string;
          user_id: string;
          zerou_disciplina: boolean;
        };
        Insert: {
          created_at?: string;
          duracao_min?: number | null;
          id?: string;
          nota_total: number;
          notas_disciplina_json?: Json;
          tipo?: string;
          user_id: string;
          zerou_disciplina?: boolean;
        };
        Update: {
          created_at?: string;
          duracao_min?: number | null;
          id?: string;
          nota_total?: number;
          notas_disciplina_json?: Json;
          tipo?: string;
          user_id?: string;
          zerou_disciplina?: boolean;
        };
        Relationships: [];
      };
      srs_cards: {
        Row: {
          created_at: string;
          difficulty: number;
          id: string;
          interval_days: number;
          lapses: number;
          last_review: string | null;
          next_review: string;
          question_id: string;
          reps: number;
          stability: number;
          state: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          difficulty?: number;
          id?: string;
          interval_days?: number;
          lapses?: number;
          last_review?: string | null;
          next_review: string;
          question_id: string;
          reps?: number;
          stability?: number;
          state?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          difficulty?: number;
          id?: string;
          interval_days?: number;
          lapses?: number;
          last_review?: string | null;
          next_review?: string;
          question_id?: string;
          reps?: number;
          stability?: number;
          state?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "srs_cards_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      study_sessions: {
        Row: {
          acertos: number;
          answered_count: number;
          completed: boolean;
          disciplina: Database["public"]["Enums"]["disciplina"] | null;
          ended_at: string | null;
          erros: number;
          id: string;
          modo: string;
          planned_count: number;
          started_at: string;
          topico_slug: string | null;
          user_id: string;
        };
        Insert: {
          acertos?: number;
          answered_count?: number;
          completed?: boolean;
          disciplina?: Database["public"]["Enums"]["disciplina"] | null;
          ended_at?: string | null;
          erros?: number;
          id?: string;
          modo?: string;
          planned_count?: number;
          started_at?: string;
          topico_slug?: string | null;
          user_id: string;
        };
        Update: {
          acertos?: number;
          answered_count?: number;
          completed?: boolean;
          disciplina?: Database["public"]["Enums"]["disciplina"] | null;
          ended_at?: string | null;
          erros?: number;
          id?: string;
          modo?: string;
          planned_count?: number;
          started_at?: string;
          topico_slug?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          created_at: string;
          disciplina: Database["public"]["Enums"]["disciplina"];
          edital_ref: string | null;
          id: string;
          nome: string;
          parent_id: string | null;
        };
        Insert: {
          created_at?: string;
          disciplina: Database["public"]["Enums"]["disciplina"];
          edital_ref?: string | null;
          id?: string;
          nome: string;
          parent_id?: string | null;
        };
        Update: {
          created_at?: string;
          disciplina?: Database["public"]["Enums"]["disciplina"];
          edital_ref?: string | null;
          id?: string;
          nome?: string;
          parent_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      disciplina:
        | "portugues"
        | "informatica"
        | "historia_cg_pb"
        | "legislacao_etica_sp"
        | "direito_administrativo"
        | "direito_constitucional"
        | "legislacao_transito";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      disciplina: [
        "portugues",
        "informatica",
        "historia_cg_pb",
        "legislacao_etica_sp",
        "direito_administrativo",
        "direito_constitucional",
        "legislacao_transito",
      ],
    },
  },
} as const;
