// ============================================
// AdPulse — API: Agente Research & Intelligence
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { foco } = req.body

  const prompt = `És o Agente de Research & Intelligence da AdPulse — uma plataforma SaaS portuguesa de criação de conteúdo viral com IA para criadores, empreendedores e agências.

A tua missão: gerar um relatório semanal com as últimas novidades relevantes para a AdPulse nas seguintes áreas:

1. **Novidades de IA** — novos modelos, ferramentas, APIs (OpenAI, Anthropic, Google, Meta, etc.)
2. **Tendências virais** — formatos, temas e estratégias em alta no Instagram, TikTok, YouTube
3. **Análise de concorrentes** — o que Buffer, Later, Hootsuite, Metricool, Canva, etc. estão a lançar
4. **Oportunidades para a AdPulse** — funcionalidades que podemos adicionar, melhorias, lacunas do mercado

${foco ? `FOCO ESPECIAL DESTA SEMANA: ${foco}` : ''}

Para cada item, indica:
- Título claro e direto
- Descrição do que é e porque importa
- Impacto para a AdPulse: "alto", "medio" ou "baixo"
- Ação sugerida: o que a AdPulse deve fazer com esta informação

Responde APENAS com JSON válido:
{
  "resumo_executivo": "2-3 frases resumindo os pontos mais importantes desta semana para a AdPulse",
  "ia": [
    {
      "titulo": "...",
      "descricao": "...",
      "impacto": "alto",
      "acao_sugerida": "..."
    }
  ],
  "tendencias": [...],
  "concorrentes": [...],
  "oportunidades": [...]
}

Cria 3-4 items por categoria. Sê específico, prático e relevante para uma startup SaaS de criação de conteúdo com IA.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
      temperature: 0.7,
    })

    const texto = completion.choices[0]?.message?.content || ''
    const jsonLimpo = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const relatorio = JSON.parse(jsonLimpo)
      return res.status(200).json({ relatorio })
    } catch {
      return res.status(500).json({ erro: 'Erro ao processar resposta da IA' })
    }
  } catch (err: any) {
    console.error('Erro OpenAI:', err.message)
    return res.status(500).json({ erro: 'Erro na IA. Verifica os créditos OpenAI.' })
  }
}
