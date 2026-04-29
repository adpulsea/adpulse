import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const AGENTES = [
  { id: 'sofia', agente: 'Sofia Martins', cargo: 'Estratégia de Conteúdo', tipo: 'Plano de conteúdo' },
  { id: 'joao', agente: 'João Silva', cargo: 'Copywriter & Hooks', tipo: 'Copywriting' },
  { id: 'ana', agente: 'Ana Costa', cargo: 'Designer Visual', tipo: 'Briefing visual' },
  { id: 'miguel', agente: 'Miguel Santos', cargo: 'Revisor de Conteúdo', tipo: 'Revisão' },
  { id: 'rui', agente: 'Rui Ferreira', cargo: 'Research & Tendências', tipo: 'Tendências' },
  { id: 'carla', agente: 'Carla Nunes', cargo: 'Publicação & Agendamento', tipo: 'Calendário' },
  { id: 'tiago', agente: 'Tiago Rocha', cargo: 'SEO & Hashtags', tipo: 'Hashtags' },
  { id: 'beatriz', agente: 'Beatriz Lima', cargo: 'Community Manager', tipo: 'Engagement' },
  { id: 'ines', agente: 'Inês Rodrigues', cargo: 'Video Content Specialist', tipo: 'Guião de vídeo' },
  { id: 'pedro', agente: 'Pedro Alves', cargo: 'Analytics & Performance', tipo: 'Performance' },
  { id: 'mariana', agente: 'Mariana Sousa', cargo: 'Brand Voice', tipo: 'Brand Voice' },
  { id: 'antonio', agente: 'António Mendes', cargo: 'Growth Hacker', tipo: 'Growth' },
  { id: 'explorador', agente: 'Explorador', cargo: 'Chief Intelligence Officer', tipo: 'Intelligence' },
]

function limparJson(texto: string) {
  return texto.replace(/```json/g, '').replace(/```/g, '').trim()
}

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

function gerarFallback(nicho: string, plataforma: string, objetivo: string) {
  return AGENTES.map((a) => ({
    agente_id: a.id,
    agente: a.agente,
    cargo: a.cargo,
    tipo: a.tipo,
    titulo: `${a.tipo} — conteúdo do dia`,
    conteudo: `${a.agente} preparou uma tarefa para ${plataforma} sobre "${nicho}" com o objetivo de ${objetivo}.

Este conteúdo deve ser revisto e aprovado antes de publicação.

Sugestão:
- Criar ângulo forte
- Adaptar ao público-alvo
- Usar CTA claro
- Publicar no melhor horário`,
  }))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' })
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return res.status(500).json({ erro: 'NEXT_PUBLIC_SUPABASE_URL não configurada.' })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ erro: 'SUPABASE_SERVICE_ROLE_KEY não configurada.' })
    }

    const utilizador = await obterUtilizador(req)

    if (!utilizador?.id) {
      return res.status(401).json({ erro: 'Sessão inválida. Faz login novamente.' })
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

    if (!perfil || perfil.plano !== 'agencia') {
      return res.status(403).json({
        erro: 'A Equipa AdPulse está disponível apenas no plano Agência.',
        planoAtual: perfil?.plano || 'desconhecido',
        upgrade: true,
      })
    }

    const {
      nicho = 'marketing digital e criação de conteúdo',
      plataforma = 'instagram',
      objetivo = 'criar conteúdo do dia',
    } = req.body || {}

    let tarefasGeradas: any[] = []

    if (process.env.OPENAI_API_KEY) {
      const prompt = `
És a Equipa AdPulse, composta por 13 agentes IA especialistas em criação de conteúdo.

Cria um pacote completo de conteúdo para:
Nicho: ${nicho}
Plataforma: ${plataforma}
Objetivo: ${objetivo}

Cria exatamente 13 objetos, um por agente.

Agentes obrigatórios:
1. Sofia Martins — Estratégia de Conteúdo
2. João Silva — Copywriter & Hooks
3. Ana Costa — Designer Visual
4. Miguel Santos — Revisor de Conteúdo
5. Rui Ferreira — Research & Tendências
6. Carla Nunes — Publicação & Agendamento
7. Tiago Rocha — SEO & Hashtags
8. Beatriz Lima — Community Manager
9. Inês Rodrigues — Video Content Specialist
10. Pedro Alves — Analytics & Performance
11. Mariana Sousa — Brand Voice
12. António Mendes — Growth Hacker
13. Explorador — Chief Intelligence Officer

Responde APENAS com JSON válido, sem markdown:

[
  {
    "agente": "Sofia Martins",
    "cargo": "Estratégia de Conteúdo",
    "tipo": "Plano de conteúdo",
    "titulo": "Plano de conteúdo do dia",
    "conteudo": "conteúdo completo, prático e pronto a usar"
  }
]

Regras:
- Português de Portugal.
- Nada genérico.
- Conteúdo acionável.
- Cada agente tem um papel diferente.
- Output pronto a usar.
`

      const resposta = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.8,
          max_tokens: 3500,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (resposta.ok) {
        const dados = await resposta.json()
        const texto = dados.choices?.[0]?.message?.content || '[]'

        try {
          tarefasGeradas = JSON.parse(limparJson(texto))
        } catch {
          tarefasGeradas = []
        }
      }
    }

    if (!Array.isArray(tarefasGeradas) || tarefasGeradas.length === 0) {
      tarefasGeradas = gerarFallback(nicho, plataforma, objetivo)
    }

    const linhas = tarefasGeradas.map((t: any, index: number) => {
      const agenteBase =
        AGENTES.find((a) => a.agente === t.agente) ||
        AGENTES[index] ||
        AGENTES[0]

      return {
        utilizador_id: utilizador.id,
        agente_id: agenteBase.id,
        agente: t.agente || agenteBase.agente,
        cargo: t.cargo || agenteBase.cargo,
        tipo: t.tipo || agenteBase.tipo,
        titulo: t.titulo || `${agenteBase.tipo} — conteúdo do dia`,
        descricao: t.tipo || agenteBase.tipo,
        conteudo: t.conteudo || '',
        resultado: t.conteudo || '',
        estado: 'aguarda_aprovacao',
        origem: 'equipa_adpulse',
      }
    })

    const { data, error } = await supabaseAdmin
      .from('agentes_tarefas')
      .insert(linhas)
      .select()

    if (error) {
      return res.status(500).json({
        erro: 'Erro ao gravar tarefas no Supabase.',
        detalhe: error.message,
        codigo: error.code,
      })
    }

    return res.status(200).json({
      sucesso: true,
      total: data?.length || 0,
      tarefas: data,
    })
  } catch (error: any) {
    return res.status(500).json({
      erro: 'Erro inesperado ao gerar conteúdo da Equipa AdPulse.',
      detalhe: error?.message || String(error),
    })
  }
}
