export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          country: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: string
          country?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          country?: string | null
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          location: string
          category: string
          required_capital: number
          current_funding: number
          expected_roi: number
          duration_months: number
          start_date: string
          expected_harvest_date: string
          risk_level: string
          status: string
          owner_name: string
          owner_bio: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          location: string
          category: string
          required_capital: number
          current_funding?: number
          expected_roi: number
          duration_months: number
          start_date: string
          expected_harvest_date: string
          risk_level?: string
          status?: string
          owner_name: string
          owner_bio?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          location?: string
          category?: string
          required_capital?: number
          current_funding?: number
          expected_roi?: number
          duration_months?: number
          start_date?: string
          expected_harvest_date?: string
          risk_level?: string
          status?: string
          owner_name?: string
          owner_bio?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          investor_id: string
          project_id: string
          amount: number
          expected_return: number
          status: string
          invested_at: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
        }
        Insert: {
          id?: string
          investor_id: string
          project_id: string
          amount: number
          expected_return: number
          status?: string
          invested_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
        }
        Update: {
          id?: string
          investor_id?: string
          project_id?: string
          amount?: number
          expected_return?: number
          status?: string
          invested_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
        }
      }
      weekly_updates: {
        Row: {
          id: string
          project_id: string
          week_number: number
          title: string
          description: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          week_number: number
          title: string
          description: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          week_number?: number
          title?: string
          description?: string
          image_url?: string | null
          created_at?: string
        }
      }
    }
  }
}
