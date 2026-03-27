// ============================================
// AdPulse — Cliente Supabase
// ============================================
// Este ficheiro cria e exporta o cliente Supabase
// para ser usado em toda a aplicação.

import { createClient } from '@supabase/supabase-js'

// Variáveis de ambiente (definidas no .env.local)
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Verifica se as variáveis estão configuradas
if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    'Faltam variáveis de ambiente do Supabase. ' +
    'Verifica o ficheiro .env.local e preenche ' +
    'NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Cria o cliente Supabase (singleton)
export const supabase = createClient(supabaseUrl, supabaseAnon)

// ============================================
// Tipos das tabelas da base de dados
// ============================================

export type Utilizador = {
  id: string
  email: string
  nome?: string
  avatar_url?: string
  plano: 'gratuito' | 'pro' | 'agencia'
  geracoes_hoje: number
  criado_em: string
}

export type Campanha = {
  id: string
  utilizador_id: string
  nome: string
  descricao?: string
  plataformas: string[]
  criado_em: string
  atualizado_em: string
}

export type Post = {
  id: string
  campanha_id: string
  utilizador_id: string
  titulo: string
  legenda: string
  hashtags: string[]
  hook: string
  plataforma: string
  estado: 'rascunho' | 'agendado' | 'publicado'
  criado_em: string
}

export type GeracaoAI = {
  id: string
  utilizador_id: string
  tipo: 'legenda' | 'hook' | 'hashtags' | 'viral' | 'analyzer'
  prompt_entrada: string
  resultado: string
  tokens_usados: number
  criado_em: string
  data_geracao: string  // formato YYYY-MM-DD para contar por dia
}
