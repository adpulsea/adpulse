// ============================================
// AdPulse — API: Remoção de Fundo (Remove.bg)
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { imageBase64 } = req.body
  if (!imageBase64) return res.status(400).json({ erro: 'Imagem em falta' })

  const apiKey = process.env.REMOVEBG_API_KEY
  if (!apiKey) return res.status(500).json({ erro: 'REMOVEBG_API_KEY não configurada' })

  try {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_file_b64: base64Data,
        size: 'auto',
      }),
    })

    if (!response.ok) {
      const erro = await response.text()
      console.error('Remove.bg erro:', erro)
      return res.status(response.status).json({ erro: 'Erro na remoção de fundo' })
    }

    const buffer = await response.arrayBuffer()
    const base64Result = Buffer.from(buffer).toString('base64')

    return res.status(200).json({ resultado: `data:image/png;base64,${base64Result}` })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: 'Erro interno' })
  }
}
