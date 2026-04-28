import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(200).json({
      hook: 'Método errado',
      legenda: 'Esta API só aceita POST.',
      hashtags: [],
      slides: [{ tipo: 'Erro', conteudo: 'Método errado' }],
    })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(200).json({
      hook: 'Erro OpenAI',
      legenda: 'OPENAI_API_KEY não existe no Vercel.',
      hashtags: [],
      slides: [{ tipo: 'Erro', conteudo: 'OPENAI_API_KEY não existe no Vercel.' }],
    })
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
        messages: [{ role: 'user', content: 'Responde apenas: teste ok' }],
        max_tokens: 20,
      }),
    })

    const texto = await resposta.text()

    if (!resposta.ok) {
      return res.status(200).json({
        hook: `Erro OpenAI status ${resposta.status}`,
        legenda: texto,
        hashtags: [],
        slides: [{ tipo: 'Erro OpenAI', conteudo: texto }],
      })
    }

    return res.status(200).json({
      hook: 'OpenAI ligada com sucesso',
      legenda: texto,
      hashtags: ['#teste'],
      slides: [{ tipo: 'Sucesso', conteudo: texto }],
    })
  } catch (error) {
    return res.status(200).json({
      hook: 'Erro interno',
      legenda: error instanceof Error ? error.message : String(error),
      hashtags: [],
      slides: [{ tipo: 'Erro interno', conteudo: error instanceof Error ? error.message : String(error) }],
    })
  }
}
