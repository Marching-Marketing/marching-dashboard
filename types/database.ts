export interface Client {
  id: string
  slug: string
  name: string
  created_at: string
}

export interface MetaToken {
  id: string
  client_id: string
  encrypted_token: string
  created_at: string
  updated_at: string
}

export interface DailyMetric {
  id: string
  client_id: string
  date: string
  impressions: number
  clicks: number
  spend: number
  leads: number | null
  conversions: number | null
  created_at: string
}

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at'>>
        Relationships: []
      }
      meta_tokens: {
        Row: MetaToken
        Insert: Omit<MetaToken, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Pick<MetaToken, 'encrypted_token' | 'updated_at'>>
        Relationships: []
      }
      daily_metrics: {
        Row: DailyMetric
        Insert: Omit<DailyMetric, 'id' | 'created_at'>
        Update: Partial<Omit<DailyMetric, 'id' | 'client_id' | 'date' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
