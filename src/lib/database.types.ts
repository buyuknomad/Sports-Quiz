// Generated Supabase database types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type QuestionCategory = 'football' | 'basketball' | 'tennis' | 'olympics' | 'mixed';

export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string
          category: QuestionCategory
          question: string
          options: string[]
          correct_answer: string
          created_at: string
          updated_at: string
          external_id: string | null
          active: boolean
        }
        Insert: {
          id?: string
          category: QuestionCategory
          question: string
          options: string[]
          correct_answer: string
          created_at?: string
          updated_at?: string
          external_id?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          category?: QuestionCategory
          question?: string
          options?: string[]
          correct_answer?: string
          created_at?: string
          updated_at?: string
          external_id?: string | null
          active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      question_category: QuestionCategory
    }
  }
}