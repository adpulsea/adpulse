import type { NextApiRequest, NextApiResponse } from 'next'

type Resposta =
  | {
      url: string
      imagem_url: string
      imageUrl: string
      image_url: string
    }
  | {
      erro: string
    }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Resposta>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      erro: 'Método não permitido. Usa POST.',
    })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return res.status(500).json({
      erro: 'OPENAI_API_KEY não está configurada na Vercel.',
    })
  }

  const { prompt, texto, plataforma, formato, estilo } = req.body || {}

  const textoPrincipal = String(texto || '').trim()
  const promptRecebido = String(prompt || '').trim()

  if (!promptRecebido && !textoPrincipal) {
    return res.status(400).json({
      erro: 'Falta o texto ou prompt para gerar a imagem.',
    })
  }

  const promptFinal =
    promptRecebido ||
    `
Cria uma imagem premium para redes sociais da marca AdPulse.

Texto principal:
"${textoPrincipal}"

Estilo visual:
- fundo escuro quase preto
- neon roxo, violeta e rosa
- estética SaaS premium
- glow subtil
- interface moderna
- cards arredondados
- alto contraste
- texto grande, legível e central
- composição pronta para publicar no Instagram

Plataforma: ${plataforma || 'Instagram'}
Formato: ${formato || 'Post'}
Estilo: ${estilo || 'adpulse_premium_dark_neon'}

Não uses texto pequeno.
Não cries elementos confusos.
Não inventes preços.
Mantém a imagem profissional e limpa.
`

  try {
    const resposta = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: promptFinal,
        size: '1024x1024',
        n: 1,
      }),
    })

    const data = await resposta.json()

    if (!resposta.ok) {
      console.error('Erro OpenAI Images:', data)

      return res.status(500).json({
        erro:
          data?.error?.message ||
          'Erro ao gerar imagem com a OpenAI.',
      })
    }

    const base64 = data?.data?.[0]?.b64_json

    if (!base64) {
      return res.status(500).json({
        erro: 'A imagem foi gerada, mas a API não devolveu base64.',
      })
    }

    const dataUrl = `data:image/png;base64,${base64}`

    return res.status(200).json({
      url: dataUrl,
      imagem_url: dataUrl,
      imageUrl: dataUrl,
      image_url: dataUrl,
    })
  } catch (error: any) {
    console.error('Erro /api/ia/gerar-imagem:', error)

    return res.status(500).json({
      erro: error?.message || 'Erro interno ao gerar imagem.',
    })
  }
}
