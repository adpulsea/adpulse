// ============================================
// AdPulse — API: Variações de Legenda
// ============================================
// Endpoint: POST /api/ia/variacoes-legenda

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' })
  }

  const { topico, plataforma } = req.body

  if (!topico) {
    return res.status(400).json({ mensagem: 'Tópico é obrigatório' })
  }

  try {
    const prompt = `Cria 3 variações diferentes de legendas para ${plataforma || 'redes sociais'} sobre o tema: "${topico}"

Cada legenda deve ter um tom diferente (ex: inspirador, humorístico, educativo).
Responde APENAS com um array JSON de 3 strings (sem markdown):
["legenda 1 completa com \\n e emojis", "legenda 2 completa", "legenda 3 completa"]

Cada legenda deve:
- Ter 3-5 parágrafos
- Incluir emojis de forma natural
- Terminar com um CTA (call to action)
- Estar em português europeu`

    const respostaOpenAI = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 800,
        temperature: 0.9,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const dadosOpenAI = await respostaOpenAI.json()
    const textoResposta = dadosOpenAI.choices[0]?.message?.content || '[]'
    const textoLimpo = textoResposta.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const variacoes = JSON.parse(textoLimpo)

    return res.status(200).json(variacoes)
  } catch (erro) {
    console.error('Erro nas variações de legenda:', erro)
    return res.status(500).json({ mensagem: 'Erro ao gerar variações.' })
  }
}
