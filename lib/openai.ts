// ============================================
// AdPulse — Integração OpenAI
// ============================================
// Todas as funções que chamam a API do ChatGPT
// estão aqui centralizadas.

// Tipos de resposta da API
type RespostaConteudo = {
  legenda: string
  hook: string
  hashtags: string[]
}

type RespostaViralLab = {
  viral_score: number
  veredicto: string
  analise_hook: string
  analise_trend: string
  analise_nicho: string
  analise_formato: string
  sugestoes: string[]
  hooks_alternativos: string[]
}

type RespostaAnalyzer = {
  creator_score: number
  pontuacao_engagement: number
  pontuacao_frequencia: number
  pontuacao_formato: number
  pontuacao_crescimento: number
  sugestoes: string[]
  plano_30_dias: {
    fase1: string
    fase2: string
    fase3: string
  }
}

// ============================================
// Gerador de conteúdo principal
// ============================================
export async function gerarConteudo(
  topico: string,
  plataforma: string,
  tom: string = 'informal'
): Promise<RespostaConteudo> {

  const resposta = await fetch('/api/ia/gerar-conteudo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topico, plataforma, tom }),
  })

  if (!resposta.ok) {
    const erro = await resposta.json()
    throw new Error(erro.mensagem || 'Erro ao gerar conteúdo')
  }

  return resposta.json()
}

// ============================================
// Viral Lab — Análise de conteúdo
// ============================================
export async function analisarViralScore(
  conteudo: string,
  plataforma: string,
  nicho: string
): Promise<RespostaViralLab> {

  const resposta = await fetch('/api/ia/viral-lab', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conteudo, plataforma, nicho }),
  })

  if (!resposta.ok) {
    const erro = await resposta.json()
    throw new Error(erro.mensagem || 'Erro no Viral Lab')
  }

  return resposta.json()
}

// ============================================
// Creator Analyzer — Análise de perfil
// ============================================
export async function analisarCreator(
  nicho: string,
  plataforma: string,
  seguidores: number,
  posts_semana: number,
  engagement_medio: number
): Promise<RespostaAnalyzer> {

  const resposta = await fetch('/api/ia/creator-analyzer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nicho, plataforma, seguidores, posts_semana, engagement_medio }),
  })

  if (!resposta.ok) {
    const erro = await resposta.json()
    throw new Error(erro.mensagem || 'Erro no Creator Analyzer')
  }

  return resposta.json()
}

// ============================================
// Regenerar variações de legenda
// ============================================
export async function regenerarLegenda(
  topico: string,
  plataforma: string
): Promise<string[]> {

  const resposta = await fetch('/api/ia/variações-legenda', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topico, plataforma }),
  })

  if (!resposta.ok) {
    const erro = await resposta.json()
    throw new Error(erro.mensagem || 'Erro ao regenerar legendas')
  }

  return resposta.json()
}
