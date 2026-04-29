import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

function limparJson(texto: string) {
  return texto.replace(/```json/g, '').replace(/```/g, '').trim()
}

async function obterUtilizador(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) return null

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token)

  return user || null
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

    if (!perfil || perfil.plano !== 'agencia') {
      return res.status(403).json({
        erro: 'A Equipa AdPulse está disponível apenas no plano Agência.',
        upgrade: true,
      })
    }

    const {
      nicho = 'marketing digital',
      plataforma = 'instagram',
      objetivo = 'criar conteúdo do dia',
    } = req.body

    const prompt = `
És a Equipa AdPulse, composta por 13 agentes IA especialistas em criação de conteúdo.

Cria um pacote completo de conteúdo para:

Nicho: ${nicho}
Plataforma: ${plataforma}
Objetivo: ${objetivo}

Cada agente deve criar uma tarefa prática, profissional e pronta para aprovação.

Agentes:
1. Sofia Martins — Estratégia de Conteúdo
2. João Silva — Copywriter & Hooks
3. Ana Costa — Designer Visual
4. Miguel Santos — Revisor de Conteúdo
5. Rui Ferreira — Research & Tendências
6. Carla Nunes — Publicação & Agendamento
7. Pedro Alves — SEO & Hashtags
8. Mariana Lopes — Storytelling
9. Bruno Costa — Performance & Conversão
10. Inês Ramos — Branding
11. Tiago Sousa — Scripts de Vídeo
12. Diana Melo — Planeamento Semanal
13. André Pinto — Otimização Viral

Responde APENAS com JSON válido, sem markdown, neste formato:

[
  {
    "agente": "Sofia Martins",
    "cargo": "Estratégia de Conteúdo",
    "tipo": "Plano de conteúdo",
    "titulo": "Plano de conteúdo do dia",
    "conteudo": "conteúdo completo"
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
        temperature: 0.85,
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!resposta.ok) {
      const detalhe = await resposta.text()
      return res.status(500).json({ erro: 'Erro da OpenAI.', detalhe })
    }

    const dados = await resposta.json()
    const texto = dados.choices?.[0]?.message?.content || '[]'

    let tarefas = []

    try {
      tarefas = JSON.parse(limparJson(texto))
    } catch {
      tarefas = [
        {
          agente: 'Sofia Martins',
          cargo: 'Estratégia de Conteúdo',
          tipo: 'Plano de conteúdo',
          titulo: 'Plano de conteúdo do dia',
          conteudo: texto,
        },
      ]
    }

    const linhas = tarefas.map((t: any) => ({
      utilizador_id: utilizador.id,
      agente: t.agente,
      cargo: t.cargo,
      tipo: t.tipo,
      titulo: t.titulo,
      conteudo: t.conteudo,
      estado: 'aguarda_aprovacao',
      origem: 'equipa_adpulse',
    }))

    const { data, error } = await supabaseAdmin
      .from('agentes_tarefas')
      .insert(linhas)
      .select()

    if (error) throw error

    return res.status(200).json({
      sucesso: true,
      tarefas: data,
    })
  } catch (error) {
    console.error('Erro agentes-gerar:', error)

    return res.status(500).json({
      erro: 'Erro ao gerar conteúdo da Equipa AdPulse.',
    })
  }
}
