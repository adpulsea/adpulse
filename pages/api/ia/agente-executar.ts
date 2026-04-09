// ============================================
// AdPulse — API: Executar tarefa de agente IA
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { prompt_sistema, tarefa, historico = [] } = req.body
  if (!prompt_sistema || !tarefa) return res.status(400).json({ erro: 'Dados em falta' })

  const mensagens = [
    ...historico,
    { role: 'user', content: tarefa },
  ]

  // Tentar Anthropic primeiro — se falhar (sem créditos), usa OpenAI
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          system: prompt_sistema,
          messages: mensagens,
        }),
      })
      const data = await resp.json()
      if (!data.error) {
        const resultado = data.content?.[0]?.text || 'Tarefa concluída.'
        return res.status(200).json({ resultado })
      }
      console.warn('Anthropic sem créditos, a usar OpenAI:', data.error.message)
    } catch (err) {
      console.warn('Anthropic erro, a usar OpenAI:', err)
    }
  }

  // Fallback OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
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
      if (data.error) throw new Error(data.error.message)
      const resultado = data.choices?.[0]?.message?.content || 'Tarefa concluída.'
      return res.status(200).json({ resultado })
    } catch (err) {
      console.error('OpenAI erro:', err)
    }
  }

  return res.status(500).json({ erro: 'Nenhuma API disponível. Verifica os créditos.' })
}
