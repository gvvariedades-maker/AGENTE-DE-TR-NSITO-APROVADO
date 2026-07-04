export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
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
          tempo_seg: number | null;
          user_id: string;
        };
        Insert: {
          acertou: boolean;
          created_at?: string;
          id?: string;
          modo?: string;
          question_id: string;
          resposta: string;
          tempo_seg?: number | null;
          user_id: string;
        };
        Update: {
          acertou?: boolean;
          created_at?: string;
          id?: string;
          modo?: string;
          question_id?: string;
          resposta?: string;
          tempo_seg?: number | null;
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
          ease_factor: number;
          id: string;
          interval_days: number;
          next_review: string;
          question_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          ease_factor?: number;
          id?: string;
          interval_days?: number;
          next_review: string;
          question_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          ease_factor?: number;
          id?: string;
          interval_days?: number;
          next_review?: string;
          question_id?: string;
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
