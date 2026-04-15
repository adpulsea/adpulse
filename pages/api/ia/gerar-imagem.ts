// ============================================
// AdPulse — API: Gerar Imagem com DALL-E 3
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { prompt, tamanho = '1024x1024', qualidade = 'standard', estilo = 'vivid' } = req.body
  if (!prompt) return res.status(400).json({ erro: 'Prompt em falta' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ erro: 'OPENAI_API_KEY não configurada' })

  try {
    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: tamanho,      // 1024x1024 | 1024x1792 | 1792x1024
        quality: qualidade, // standard | hd
        style: estilo,      // vivid | natural
        response_format: 'url',
      }),
    })

    const data = await resp.json()

    if (data.error) {
      console.error('DALL-E erro:', data.error)
      return res.status(400).json({ erro: data.error.message })
    }

    const url = data.data?.[0]?.url
    const promptRevisto = data.data?.[0]?.revised_prompt

    return res.status(200).json({ url, promptRevisto })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: 'Erro ao gerar imagem' })
  }
}
