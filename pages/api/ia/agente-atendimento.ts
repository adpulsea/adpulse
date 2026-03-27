// ============================================
// AdPulse — API: Agente de Atendimento/Vendas
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { mensagens, sistema } = req.body

  if (!mensagens || !sistema) {
    return res.status(400).json({ erro: 'Parâmetros em falta' })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      messages: [
        { role: 'system', content: sistema },
        ...mensagens,
      ],
    })

    const resposta = completion.choices[0]?.message?.content || 'Não consegui gerar uma resposta.'
    return res.status(200).json({ resposta })
  } catch (erro: any) {
    console.error('Erro agente:', erro)
    return res.status(500).json({ erro: 'Erro interno' })
  }
}