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

  // Criar perfil com todas as colunas necessárias
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
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) return null
  return user
}

// Verificar se pode gerar conteúdo (limite do plano gratuito)
export async function verificarLimiteGeracoes(utilizadorId: string): Promise<{
  podeGerar: boolean
  geracoesHoje: number
  limiteMaximo: number
}> {
  const hoje = new Date().toISOString().split('T')[0]

  const { count } = await supabase
    .from('geracoes_ai')
    .select('*', { count: 'exact', head: true })
    .eq('utilizador_id', utilizadorId)
    .eq('data_geracao', hoje)

  const { data: perfil } = await supabase
    .from('perfis')
    .select('plano')
    .eq('id', utilizadorId)
    .single()

  const limites = {
    gratuito: 3,
    pro:      999,
    agencia:  9999,
  }

  const plano = perfil?.plano || 'gratuito'
  const limiteMaximo = limites[plano as keyof typeof limites]
  const geracoesHoje = count || 0

  return {
    podeGerar: geracoesHoje < limiteMaximo,
    geracoesHoje,
    limiteMaximo,
  }
}