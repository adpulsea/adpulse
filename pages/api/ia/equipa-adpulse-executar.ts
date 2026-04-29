import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

type Agente = {
  id: string
  nome: string
  cargo: string
  fase: string
  titulo: string
  instrucao: string
}

const AGENTES: Agente[] = [
  {
    id: 'explorador',
    nome: 'Explorador',
    cargo: 'Chief Intelligence Officer',
    fase: 'Inteligência',
    titulo: 'Briefing global de inteligência',
    instrucao:
      'Analisa tendências de IA, redes sociais, algoritmos e oportunidades atuais para conteúdo.',
  },
  {
    id: 'rui',
    nome: 'Rui Ferreira',
    cargo: 'Research & Tendências',
    fase: 'Inteligência',
    titulo: 'Tendências e oportunidades virais',
    instrucao:
      'Identifica tendências e ângulos virais para aproveitar hoje.',
  },
  {
    id: 'sofia',
    nome: 'Sofia Martins',
    cargo: 'Estratégia de Conteúdo',
    fase: 'Estratégia',
    titulo: 'Plano estratégico do dia',
    instrucao:
      'Cria o plano de conteúdo do dia com tema central, objetivo, mensagem principal e canais.',
  },
  {
    id: 'joao',
    nome: 'João Silva',
    cargo: 'Copywriter & Hooks',
    fase: 'Criação',
    titulo: 'Copy, hooks e legendas',
    instrucao:
      'Cria hooks fortes, legenda Instagram, copy TikTok, LinkedIn e CTA.',
  },
  {
    id: 'ines',
    nome: 'Inês Rodrigues',
    cargo: 'Video Content Specialist',
    fase: 'Criação',
    titulo: 'Guiões de vídeo',
    instrucao:
      'Cria guiões para Reels, TikTok e YouTube Shorts com falas, cenas e CTA.',
  },
  {
    id: 'ana',
    nome: 'Ana Costa',
    cargo: 'Designer Visual',
    fase: 'Criação',
    titulo: 'Briefing visual',
    instrucao:
      'Cria direção visual, paleta, layout, texto overlay e briefing para criativos.',
  },
  {
    id: 'tiago',
    nome: 'Tiago Rocha',
    cargo: 'SEO & Hashtags',
    fase: 'Criação',
    titulo: 'SEO social e hashtags',
    instrucao:
      'Cria hashtags, palavras-chave e otimização para cada plataforma.',
  },
  {
    id: 'miguel',
    nome: 'Miguel Santos',
    cargo: 'Revisor de Conteúdo',
    fase: 'Qualidade',
    titulo: 'Revisão e melhoria',
    instrucao:
      'Revê o conteúdo, melhora clareza, gramática, CTA e força do hook.',
  },
  {
    id: 'mariana',
    nome: 'Mariana Sousa',
    cargo: 'Brand Voice',
    fase: 'Qualidade',
    titulo: 'Consistência de marca',
    instrucao:
      'Garante tom moderno, direto, português europeu, próximo e sem jargão.',
  },
  {
    id: 'carla',
    nome: 'Carla Nunes',
    cargo: 'Publicação & Agendamento',
    fase: 'Execução',
    titulo: 'Calendário de publicação',
    instrucao:
      'Define horários, ordem de publicação e prioridades do dia.',
  },
  {
    id: 'beatriz',
    nome: 'Beatriz Lima',
    cargo: 'Community Manager',
    fase: 'Execução',
    titulo: 'Engagement e respostas',
    instrucao:
      'Cria perguntas, respostas a comentários, templates de DM e ações de comunidade.',
  },
  {
    id: 'pedro',
    nome: 'Pedro Alves',
    cargo: 'Analytics & Performance',
    fase: 'Performance',
    titulo: 'Métricas e performance',
    instrucao:
      'Define KPIs, benchmarks e recomendações para medir resultados.',
  },
  {
    id: 'antonio',
    nome: 'António Mendes',
    cargo: 'Growth Hacker',
    fase: 'Performance',
    titulo: 'Tática de crescimento',
    instrucao:
      'Cria uma tática prática de crescimento para executar hoje.',
  },
]

async function obterUtilizador(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) return null
  return user
}

async function gerarComIA(agente: Agente, contexto: string) {
  const prompt = `
És ${agente.nome}, ${agente.cargo}, da Equipa AdPulse.

Contexto:
${contexto}

A tua missão:
${agente.instrucao}

Regras:
- Escreve em português de Portugal.
- Sê prático, específico e pronto a usar.
- Não uses texto genérico.
- Entrega conteúdo profissional.
- Estrutura bem a resposta.
`

  const resposta = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.75,
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!resposta.ok) {
    const erro = await resposta.text()
    throw new Error(erro)
  }

  const data = await resposta.json()
  return data.choices?.[0]?.message?.content || 'Sem resposta da IA.'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' })
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ erro: 'OPENAI_API_KEY não configurada.' })
    }

    const utilizador = await obterUtilizador(req)

    if (!utilizador?.id) {
      return res.status(401).json({ erro: 'Sessão inválida.' })
    }

    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from('perfis')
      .select('plano')
      .eq('id', utilizador.id)
      .single()

    if (perfilError) {
      return res.status(500).json({
        erro: 'Erro ao procurar perfil.',
        detalhe: perfilError.message,
      })
    }

    if (perfil?.plano !== 'agencia') {
      return res.status(403).json({
        erro: 'A Equipa AdPulse está disponível apenas no plano Agência.',
        planoAtual: perfil?.plano || 'desconhecido',
      })
    }

    const {
      nicho = 'marketing digital',
      plataforma = 'instagram',
      objetivo = 'criar conteúdo do dia',
    } = req.body || {}

    const { data: execucao, error: execucaoError } = await supabaseAdmin
      .from('equipa_adpulse_execucoes')
      .insert({
        utilizador_id: utilizador.id,
        plano: perfil.plano,
        nicho,
        plataforma,
        objetivo,
        estado: 'em_progresso',
      })
      .select()
      .single()

    if (execucaoError || !execucao) {
      return res.status(500).json({
        erro: 'Erro ao criar execução.',
        detalhe: execucaoError?.message,
      })
    }

    let contexto = `
Nicho: ${nicho}
Plataforma principal: ${plataforma}
Objetivo: ${objetivo}
`

    const tarefasCriadas = []

    for (const agente of AGENTES) {
      let conteudo = ''

      try {
        conteudo = await gerarComIA(agente, contexto)
      } catch (error: any) {
        conteudo = `Erro ao gerar conteúdo deste agente.

Detalhe:
${error?.message || 'Erro desconhecido'}`
      }

      const { data: tarefa, error: tarefaError } = await supabaseAdmin
        .from('equipa_adpulse_tarefas')
        .insert({
          execucao_id: execucao.id,
          utilizador_id: utilizador.id,
          agente_id: agente.id,
          agente_nome: agente.nome,
          agente_cargo: agente.cargo,
          fase: agente.fase,
          titulo: agente.titulo,
          conteudo,
          estado: 'aguarda_aprovacao',
        })
        .select()
        .single()

      if (!tarefaError && tarefa) {
        tarefasCriadas.push(tarefa)
      }

      contexto += `

--- ${agente.nome} / ${agente.titulo} ---
${conteudo}
`
    }

    await supabaseAdmin
      .from('equipa_adpulse_execucoes')
      .update({ estado: 'concluido' })
      .eq('id', execucao.id)

    return res.status(200).json({
      sucesso: true,
      execucao,
      tarefas: tarefasCriadas,
    })
  } catch (error: any) {
    return res.status(500).json({
      erro: 'Erro ao executar Equipa AdPulse.',
      detalhe: error?.message || String(error),
    })
  }
}
