// ============================================
// AdPulse — Funções de Autenticação
// ============================================

import { supabase } from './supabase'

// Fazer login com email e password
export async function fazerLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)

  return data
}

// Criar conta nova
export async function criarConta(email: string, password: string, nome: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome },
    },
  })

  if (error) throw new Error(error.message)

  if (data.user) {
    await supabase.from('perfis').upsert({
      id: data.user.id,
      email: data.user.email,
      nome,
      plano: 'gratuito',
      nichos: [],
      plataformas_principais: [],
      onboarding_completo: false,
    })
  }

  return data
}

// Fazer logout
export async function fazerLogout() {
  const { error } = await supabase.auth.signOut()

  if (error) throw new Error(error.message)
}

// Obter utilizador atual da sessão
export async function obterUtilizadorAtual() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) return null

  return user
}

// Verificar limite diário de gerações
export async function verificarLimiteGeracoes(utilizadorId: string): Promise<{
  podeGerar: boolean
  geracoesHoje: number
  limiteMaximo: number
  plano: 'gratuito' | 'pro' | 'agencia'
}> {
  const hoje = new Date().toISOString().split('T')[0]

  const { count, error: erroContagem } = await supabase
    .from('geracoes_ai')
    .select('*', { count: 'exact', head: true })
    .eq('utilizador_id', utilizadorId)
    .eq('data_geracao', hoje)

  if (erroContagem) {
    throw new Error(erroContagem.message)
  }

  const { data: perfil, error: erroPerfil } = await supabase
    .from('perfis')
    .select('plano')
    .eq('id', utilizadorId)
    .single()

  if (erroPerfil) {
    throw new Error(erroPerfil.message)
  }

  const limites = {
    gratuito: 3,
    pro: 999,
    agencia: 9999,
  }

  const plano = (perfil?.plano || 'gratuito') as 'gratuito' | 'pro' | 'agencia'
  const limiteMaximo = limites[plano]
  const geracoesHoje = count || 0

  return {
    podeGerar: geracoesHoje < limiteMaximo,
    geracoesHoje,
    limiteMaximo,
    plano,
  }
}

// Registar geração feita
export async function registarGeracaoAI({
  utilizadorId,
  tipo,
  promptEntrada,
  resultado,
  tokensUsados = 0,
}: {
  utilizadorId: string
  tipo: 'legenda' | 'hook' | 'hashtags' | 'viral' | 'analyzer'
  promptEntrada: string
  resultado: string
  tokensUsados?: number
}) {
  const hoje = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('geracoes_ai').insert({
    utilizador_id: utilizadorId,
    tipo,
    prompt_entrada: promptEntrada,
    resultado,
    tokens_usados: tokensUsados,
    data_geracao: hoje,
  })

  if (error) {
    throw new Error(error.message)
  }
}
