// ============================================
// AdPulse — API: Executar tarefa de agente IA
// ============================================
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { prompt_sistema, tarefa } = req.body

    if (!prompt_sistema || !tarefa) {
      return res.status(400).json({ error: 'Dados em falta' })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prompt_sistema,
          },
          {
            role: 'user',
            content: tarefa,
          },
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Erro OpenAI:', data)
      return res.status(500).json({ error: 'Erro na OpenAI' })
    }

    const resultado =
      data.choices?.[0]?.message?.content || 'Sem resposta da IA.'

    return res.status(200).json({ resultado })
  } catch (error) {
    console.error('Erro servidor:', error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
