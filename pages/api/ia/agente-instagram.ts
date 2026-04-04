// ============================================
// AdPulse — API: Agente Instagram
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const DIAS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']
const FORMATOS = ['Reel', 'Carrossel', 'Post', 'Reel', 'Story', 'Carrossel', 'Reel']
const HORAS = ['09:00', '12:00', '18:00', '09:00', '18:00', '11:00', '19:00']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { objetivo, foco } = req.body

  const prompt = `És o agente de conteúdo do Instagram da AdPulse — uma plataforma SaaS portuguesa de criação de conteúdo viral com IA para criadores, empreendedores e agências.

SOBRE A ADPULSE:
- Plataforma de IA que gera legendas, hooks, hashtags e calendários de conteúdo
- Tom: moderno, inspirador, próximo, mas profissional
- Público: criadores de conteúdo portugueses e brasileiros, empreendedores, agências de marketing
- Preços: Gratuito (3 ger/dia), Pro (19€/mês), Agência (49€/mês)
- Site: adpulse-pf3b.vercel.app

OBJETIVO DESTA SEMANA: ${objetivo}
${foco ? `FOCO ESPECIAL: ${foco}` : ''}

Cria um plano semanal completo para o Instagram da AdPulse com 7 posts (um por dia).

Responde APENAS com JSON válido neste formato exato:
{
  "estrategia": "descrição da estratégia geral da semana em 2-3 frases",
  "objetivo_semana": "objetivo específico e mensurável da semana",
  "dica_crescimento": "1 dica de crescimento orgânico específica para esta semana",
  "posts": [
    {
      "dia": "Segunda-feira",
      "hora": "09:00",
      "formato": "Reel",
      "tema": "tema do post em 1 frase",
      "hook": "gancho inicial poderoso para os primeiros 3 segundos",
      "legenda": "legenda completa do post com emojis e call-to-action (150-300 palavras)",
      "hashtags": ["#adpulse", "#criacaodeconteudo", ...mais 8-12 hashtags relevantes],
      "sugestao_imagem": "descrição detalhada do visual ideal para este post",
      "score_viral": 85
    }
  ]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.8,
    })

    const texto = completion.choices[0]?.message?.content || ''

    // Limpar e parsear JSON
    const jsonLimpo = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const plano = JSON.parse(jsonLimpo)

      // Garantir que cada post tem dia, hora e formato corretos
      if (plano.posts) {
        plano.posts = plano.posts.map((p: any, i: number) => ({
          ...p,
          dia: p.dia || DIAS[i],
          hora: p.hora || HORAS[i],
          formato: p.formato || FORMATOS[i],
          score_viral: p.score_viral || Math.floor(Math.random() * 20 + 70),
        }))
      }

      return res.status(200).json({ plano })
    } catch {
      return res.status(500).json({ erro: 'Erro ao processar resposta da IA' })
    }
  } catch (err: any) {
    console.error('Erro OpenAI:', err.message)
    return res.status(500).json({ erro: 'Erro na IA. Verifica os créditos OpenAI.' })
  }
}
