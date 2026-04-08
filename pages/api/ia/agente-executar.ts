// ============================================
// AdPulse — API: Executar tarefa de agente IA
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { prompt_sistema, tarefa, historico = [] } = req.body
  if (!prompt_sistema || !tarefa) return res.status(400).json({ erro: 'Dados em falta' })

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ erro: 'API key não configurada' })

  try {
    const mensagens = [
      ...historico,
      { role: 'user', content: tarefa },
    ]

    // Tentar Anthropic primeiro
    if (process.env.ANTHROPIC_API_KEY) {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 1500,
          system: prompt_sistema,
          messages: mensagens,
        }),
      })
      const data = await resp.json()
      const resultado = data.content?.[0]?.text || 'Tarefa concluída.'
      return res.status(200).json({ resultado })
    }

    // Fallback OpenAI
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: prompt_sistema },
          ...mensagens,
        ],
      }),
    })
    const data = await resp.json()
    const resultado = data.choices?.[0]?.message?.content || 'Tarefa concluída.'
    return res.status(200).json({ resultado })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: 'Erro ao executar agente' })
  }
}
