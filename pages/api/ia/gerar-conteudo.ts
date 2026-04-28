import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      mensagem: 'OPENAI_API_KEY não existe no Vercel.',
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
        messages: [
          {
            role: 'user',
            content: 'Responde apenas: teste ok',
          },
        ],
        max_tokens: 20,
      }),
    })

    const texto = await resposta.text()

    if (!resposta.ok) {
      return res.status(500).json({
        mensagem: 'A OpenAI recusou o pedido.',
        status: resposta.status,
        detalhe: texto,
      })
    }

    return res.status(200).json({
      mensagem: 'OpenAI ligada com sucesso.',
      detalhe: texto,
    })
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro interno ao ligar à OpenAI.',
      detalhe: error instanceof Error ? error.message : String(error),
    })
  }
}
