import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const AGENTES = [
  { id: 'explorador', nome: 'Explorador', cargo: 'Chief Intelligence Officer', fase: 'Inteligência', titulo: 'Briefing global de inteligência' },
  { id: 'rui', nome: 'Rui Ferreira', cargo: 'Research & Tendências', fase: 'Inteligência', titulo: 'Tendências e oportunidades virais' },
  { id: 'sofia', nome: 'Sofia Martins', cargo: 'Estratégia de Conteúdo', fase: 'Estratégia', titulo: 'Plano estratégico do dia' },
  { id: 'joao', nome: 'João Silva', cargo: 'Copywriter & Hooks', fase: 'Criação', titulo: 'Copy, hooks e legendas' },
  { id: 'ines', nome: 'Inês Rodrigues', cargo: 'Video Content Specialist', fase: 'Criação', titulo: 'Guiões de vídeo' },
  { id: 'ana', nome: 'Ana Costa', cargo: 'Designer Visual', fase: 'Criação', titulo: 'Briefing visual' },
  { id: 'tiago', nome: 'Tiago Rocha', cargo: 'SEO & Hashtags', fase: 'Criação', titulo: 'SEO social e hashtags' },
  { id: 'miguel', nome: 'Miguel Santos', cargo: 'Revisor de Conteúdo', fase: 'Qualidade', titulo: 'Revisão e melhoria' },
  { id: 'mariana', nome: 'Mariana Sousa', cargo: 'Brand Voice', fase: 'Qualidade', titulo: 'Consistência de marca' },
  { id: 'carla', nome: 'Carla Nunes', cargo: 'Publicação & Agendamento', fase: 'Execução', titulo: 'Calendário de publicação' },
  { id: 'beatriz', nome: 'Beatriz Lima', cargo: 'Community Manager', fase: 'Execução', titulo: 'Engagement e respostas' },
  { id: 'pedro', nome: 'Pedro Alves', cargo: 'Analytics & Performance', fase: 'Performance', titulo: 'Métricas e performance' },
  { id: 'antonio', nome: 'António Mendes', cargo: 'Growth Hacker', fase: 'Performance', titulo: 'Tática de crescimento' },
]

async function obterUtilizador(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) return null

  return data.user
}

function fallbackConteudo(agente: any, nicho: string, plataforma: string, objetivo: string) {
  return `${agente.titulo}

Nicho: ${nicho}
Plataforma: ${plataforma}
Objetivo: ${objetivo}

Plano prático:
1. Criar um conteúdo com hook forte.
2. Adaptar a mensagem ao público-alvo.
3. Usar CTA claro.
4. Preparar publicação para ${plataforma}.
5. Medir resultados e otimizar.

Este conteúdo ficou preparado para aprovação pela Equipa AdPulse.`
}

async function gerarAgente(agente: any, nicho: string, plataforma: string, objetivo: string) {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackConteudo(agente, nicho, plataforma, objetivo)
  }

  try {
    const resposta = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 700,
        messages: [
          {
            role: 'user',
            content: `
És ${agente.nome}, ${agente.cargo}, da Equipa AdPulse.

Cria a tua parte da campanha do dia.

Nicho: ${nicho}
Plataforma: ${plataforma}
Objetivo: ${objetivo}

Tarefa: ${agente.titulo}

Regras:
- Português de Portugal.
- Conteúdo prático.
- Sem texto genérico.
- Pronto para aprovação.
`,
          },
        ],
      }),
    })

    if (!resposta.ok) {
      return fallbackConteudo(agente, nicho, plataforma, objetivo)
    }

    const data = await resposta.json()
    return data.choices?.[0]?.message?.content || fallbackConteudo(agente, nicho, plataforma, objetivo)
  } catch {
    return fallbackConteudo(agente, nicho, plataforma, objetivo)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' })
  }

  try {
    const utilizador = await obterUtilizador(req)

    if (!utilizador?.id) {
      return res.status(401).json({ erro: 'Sessão inválida.' })
    }

    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('plano')
      .eq('id', utilizador.id)
      .single()

    if (perfil?.plano !== 'agencia') {
      return res.status(403).json({
        erro: 'A Equipa AdPulse está disponível apenas no plano Agência.',
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
        estado: 'concluido',
      })
      .select()
      .single()

    if (execucaoError || !execucao) {
      return res.status(500).json({
        erro: 'Erro ao criar execução.',
        detalhe: execucaoError?.message,
      })
    }

    const conteudos = await Promise.all(
      AGENTES.map(async (agente) => {
        const conteudo = await gerarAgente(agente, nicho, plataforma, objetivo)

        return {
          execucao_id: execucao.id,
          utilizador_id: utilizador.id,
          agente_id: agente.id,
          agente_nome: agente.nome,
          agente_cargo: agente.cargo,
          fase: agente.fase,
          titulo: agente.titulo,
          conteudo,
          estado: 'aguarda_aprovacao',
        }
      })
    )

    const { data: tarefas, error: tarefasError } = await supabaseAdmin
      .from('equipa_adpulse_tarefas')
      .insert(conteudos)
      .select()

    if (tarefasError) {
      return res.status(500).json({
        erro: 'Erro ao gravar tarefas.',
        detalhe: tarefasError.message,
      })
    }

    return res.status(200).json({
      sucesso: true,
      tarefas,
    })
  } catch (error: any) {
    return res.status(500).json({
      erro: 'Erro ao executar Equipa AdPulse.',
      detalhe: error?.message || String(error),
    })
  }
}
