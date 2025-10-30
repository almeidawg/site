export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bancos: {
        Row: {
          ativo: boolean | null
          codigo: string | null
          created_at: string | null
          id: string
          ispb: string | null
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          codigo?: string | null
          created_at?: string | null
          id?: string
          ispb?: string | null
          nome: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string | null
          created_at?: string | null
          id?: string
          ispb?: string | null
          nome?: string
        }
        Relationships: []
      }
      feriados: {
        Row: {
          created_at: string | null
          data: string
          id: string
          nome: string
          tipo: string | null
          uf: string | null
        }
        Insert: {
          created_at?: string | null
          data: string
          id?: string
          nome: string
          tipo?: string | null
          uf?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string
          id?: string
          nome?: string
          tipo?: string | null
          uf?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          agencia: string | null
          banco: string | null
          conta: string | null
          cpf_cnpj_titular: string | null
          created_at: string | null
          entity_id: string
          id: string
          is_principal: boolean | null
          pix_chave: string | null
          pix_tipo: string | null
          titular: string | null
        }
        Insert: {
          agencia?: string | null
          banco?: string | null
          conta?: string | null
          cpf_cnpj_titular?: string | null
          created_at?: string | null
          entity_id: string
          id?: string
          is_principal?: boolean | null
          pix_chave?: string | null
          pix_tipo?: string | null
          titular?: string | null
        }
        Update: {
          agencia?: string | null
          banco?: string | null
          conta?: string | null
          cpf_cnpj_titular?: string | null
          created_at?: string | null
          entity_id?: string
          id?: string
          is_principal?: boolean | null
          pix_chave?: string | null
          pix_tipo?: string | null
          titular?: string | null
        }
        Relationships: []
      }
      especificadores: {
        Row: {
          ativo: boolean | null
          cep: string | null
          cidade: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pricelist: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          preco: number
          produto_servico_id: string | null
          validade_fim: string | null
          validade_inicio: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          preco: number
          produto_servico_id?: string | null
          validade_fim?: string | null
          validade_inicio?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          preco?: number
          produto_servico_id?: string | null
          validade_fim?: string | null
          validade_inicio?: string | null
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
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
