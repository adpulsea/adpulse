// ============================================
// AdPulse — Tipos TypeScript Globais
// ============================================

// Planos disponíveis
export type Plano = 'gratuito' | 'pro' | 'agencia'

// Plataformas suportadas
export type Plataforma = 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter'

// Formatos de conteúdo
export type FormatoConteudo = 'reel' | 'carrossel' | 'story' | 'post' | 'short'

// Estado de um post
export type EstadoPost = 'rascunho' | 'agendado' | 'publicado'

// Perfil do utilizador (tabela 'perfis' no Supabase)
export type Perfil = {
  id: string
  email: string
  nome: string
  avatar_url?: string
  plano: Plano
  nicho?: string
  plataformas_principais: Plataforma[]
  criado_em: string
}

// Campanha
export type Campanha = {
  id: string
  utilizador_id: string
  nome: string
  descricao?: string
  plataformas: Plataforma[]
  total_posts: number
  criado_em: string
  atualizado_em: string
}

// Post / Conteúdo
export type Post = {
  id: string
  campanha_id?: string
  utilizador_id: string
  titulo: string
  legenda: string
  hashtags: string[]
  hook: string
  plataforma: Plataforma
  formato: FormatoConteudo
  estado: EstadoPost
  viral_score?: number
  criado_em: string
}

// Resultado de geração AI
export type ResultadoIA = {
  legenda: string
  hook: string
  hashtags: string[]
  sugestoes_formato?: string[]
}

// Análise Viral Lab
export type AnaliseViral = {
  viral_score: number          // 0-100
  veredicto: string            // ex: "Alto potencial viral!"
  analise_hook: number         // 0-25
  analise_trend: number        // 0-25
  analise_nicho: number        // 0-25
  analise_formato: number      // 0-25
  sugestoes: string[]
  hooks_alternativos: string[]
}

// Análise Creator Analyzer
export type AnaliseCreator = {
  creator_score: number        // 0-100
  pontuacao_engagement: number // 0-25
  pontuacao_frequencia: number // 0-25
  pontuacao_formato: number    // 0-25
  pontuacao_crescimento: number// 0-25
  metricas: {
    seguidores: number
    posts_semana: number
    engagement_medio: number
  }
  sugestoes: string[]
  plano_30_dias: {
    fase1: string              // dias 1-10
    fase2: string              // dias 11-20
    fase3: string              // dias 21-30
  }
}

// Item do calendário semanal
export type ItemCalendario = {
  dia: string                  // 'Segunda', 'Terça', etc.
  hora: string                 // '10:00'
  tipo?: FormatoConteudo
  titulo?: string
  vazio: boolean
}

// Métricas do dashboard
export type MetricaDashboard = {
  titulo: string
  valor: string | number
  variacao: number             // percentagem vs período anterior
  tendencia: 'cima' | 'baixo' | 'igual'
  icone: string
}

// Alerta / Sugestão da IA no dashboard
export type AlertaAI = {
  id: string
  tipo: 'tendencia' | 'aviso' | 'sugestao'
  mensagem: string
  acao?: string                // texto do botão
  rota?: string                // para onde navegar ao clicar
}
