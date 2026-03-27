// ============================================
// AdPulse — API: Creator Analyzer
// ============================================
// Endpoint: POST /api/ia/creator-analyzer

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' })
  }

  const { nicho, plataforma, seguidores, posts_semana, engagement_medio } = req.body

  if (!nicho || !plataforma || seguidores === undefined) {
    return res.status(400).json({ mensagem: 'Dados insuficientes para análise' })
  }

  try {
    const prompt = `És um estrategista de crescimento em redes sociais especializado em criadores de conteúdo.

Analisa o seguinte perfil de criador:
- Plataforma: ${plataforma}
- Nicho: ${nicho}
- Seguidores: ${seguidores}
- Posts por semana: ${posts_semana}
- Engagement médio: ${engagement_medio}%

Responde APENAS com JSON válido (sem markdown, sem explicações):
{
  "creator_score": 72,
  "pontuacao_engagement": 18,
  "pontuacao_frequencia": 16,
  "pontuacao_formato": 20,
  "pontuacao_crescimento": 18,
  "sugestoes": [
    "Sugestão específica e acionável 1",
    "Sugestão específica e acionável 2",
    "Sugestão específica e acionável 3",
    "Sugestão específica e acionável 4"
  ],
  "plano_30_dias": {
    "fase1": "Descrição do que fazer nos dias 1-10, específico para o nicho e plataforma",
    "fase2": "Descrição do que fazer nos dias 11-20, com base na fase anterior",
    "fase3": "Descrição do que fazer nos dias 21-30, para consolidar e escalar"
  }
}

Regras de pontuação (cada categoria tem máximo 25 pontos):
- pontuacao_engagement: ${engagement_medio}% é bom/mau para ${plataforma} no nicho ${nicho}?
- pontuacao_frequencia: ${posts_semana} posts/semana é suficiente para ${plataforma}?
- pontuacao_formato: baseado no nicho ${nicho}, estão a usar os formatos certos?
- pontuacao_crescimento: ritmo de crescimento estimado com estas métricas
- creator_score: soma das 4 pontuações (0-100)

O plano de 30 dias deve ser específico, prático e adaptado ao nicho "${nicho}" em ${plataforma}.
Responde em português europeu.`

    const respostaOpenAI = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 900,
        temperature: 0.6,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const dadosOpenAI = await respostaOpenAI.json()
    const textoResposta = dadosOpenAI.choices[0]?.message?.content || '{}'
    const textoLimpo = textoResposta.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const analise = JSON.parse(textoLimpo)

    return res.status(200).json(analise)
  } catch (erro) {
    console.error('Erro no Creator Analyzer:', erro)
    return res.status(500).json({ mensagem: 'Erro na análise. Tenta novamente.' })
  }
}
