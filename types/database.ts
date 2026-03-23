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
  public: {
    Tables: {
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at'>>
      }
      meta_tokens: {
        Row: MetaToken
        Insert: Omit<MetaToken, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Pick<MetaToken, 'encrypted_token' | 'updated_at'>>
      }
      daily_metrics: {
        Row: DailyMetric
        Insert: Omit<DailyMetric, 'id' | 'created_at'>
        Update: Partial<Omit<DailyMetric, 'id' | 'client_id' | 'date' | 'created_at'>>
      }
    }
  }
}
