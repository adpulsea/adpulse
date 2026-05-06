import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

function adminToken() {
  const password = process.env.ADMIN_PASSWORD || ''
  return crypto.createHash('sha256').update(password).digest('hex')
}

function isAdmin(req: NextApiRequest) {
  const cookieToken = req.cookies?.admin_session || ''
  const expectedToken = adminToken()

  return Boolean(expectedToken && cookieToken === expectedToken)
}

function extrairJson(texto: string) {
  try {
    return JSON.parse(texto)
  } catch {
    const match = texto.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('A IA não devolveu JSON válido.')
    return JSON.parse(match[0])
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdmin(req)) {
    return res.status(401).json({
      erro: 'Acesso reservado ao administrador.',
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      erro: 'Método não permitido.',
    })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return res.status(500).json({
      erro: 'OPENAI_API_KEY não está configurada na Vercel.',
    })
  }

  const {
    nome,
    username_instagram,
    link_perfil,
    nicho,
    localizacao,
    observacao,
  } = req.body || {}

  if (!username_instagram && !nome && !observacao) {
    return res.status(400).json({
      erro: 'Preenche pelo menos o perfil, nome ou observação.',
    })
  }

  const prompt = `
Tu és a Sofia Growth Agent da AdPulse.

A tua função é preparar uma análise humana, respeitosa e útil para potenciais clientes da AdPulse.

A AdPulse é uma plataforma SaaS com IA para criar posts, imagens e calendários de conteúdo para redes sociais. Ajuda creators, pequenos negócios, freelancers, social media managers e agências a publicar com mais consistência e menos esforço.

Nunca escrevas de forma agressiva, robótica ou parecida com spam.
Não prometas resultados garantidos.
Não inventes factos específicos que não foram fornecidos.
Não digas que visitaste o perfil se a informação não foi dada.
Escreve em português de Portugal, tom tranquilo, confiante, humano e profissional.

Dados do potencial lead:
Nome: ${nome || 'não indicado'}
Instagram: ${username_instagram || 'não indicado'}
Link: ${link_perfil || 'não indicado'}
Nicho: ${nicho || 'não indicado'}
Localização: ${localizacao || 'não indicada'}
Observação da Ana: ${observacao || 'não indicada'}

Cria uma análise e abordagem personalizada.

Devolve apenas JSON válido, sem markdown, neste formato exato:

{
  "problema_identificado": "texto curto e útil",
  "oportunidade_adpulse": "texto curto e útil",
  "score": 0,
  "comentario_sugerido": "comentário natural para deixar num post",
  "mensagem_sugerida": "mensagem privada personalizada, humana e curta",
  "follow_up_sugerido": "follow-up educado para enviar 2 ou 3 dias depois",
  "proximo_passo": "próximo passo recomendado para a Ana"
}

O score deve ser entre 0 e 100.
Se os dados forem poucos, usa um score moderado e diz no próximo passo que é preciso validar o perfil antes de contactar.
`

  try {
    const resposta = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: prompt,
        temperature: 0.7,
      }),
    })

    const data = await resposta.json()

    if (!resposta.ok) {
      console.error('Erro OpenAI:', data)
      return res.status(500).json({
        erro: data?.error?.message || 'Erro ao gerar lead com IA.',
      })
    }

    const texto =
      data?.output_text ||
      data?.output?.[0]?.content?.[0]?.text ||
      ''

    if (!texto) {
      return res.status(500).json({
        erro: 'A IA não devolveu texto.',
      })
    }

    const json = extrairJson(texto)

    return res.status(200).json({
      problema_identificado: json.problema_identificado || '',
      oportunidade_adpulse: json.oportunidade_adpulse || '',
      score: Number(json.score || 50),
      comentario_sugerido: json.comentario_sugerido || '',
      mensagem_sugerida: json.mensagem_sugerida || '',
      follow_up_sugerido: json.follow_up_sugerido || '',
      proximo_passo: json.proximo_passo || '',
    })
  } catch (error: any) {
    console.error('Erro gerar-lead:', error)

    return res.status(500).json({
      erro: error?.message || 'Erro interno ao gerar lead.',
    })
  }
}
