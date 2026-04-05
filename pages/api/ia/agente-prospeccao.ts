// ============================================
// AdPulse — API: Agente de Prospeção
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { palavras_chave } = req.body

  const prompt = `És o agente de prospeção da AdPulse — uma plataforma SaaS portuguesa de criação de conteúdo viral com IA.

A AdPulse ajuda criadores, empreendedores e agências a criar legendas, hooks, hashtags e calendários de conteúdo com IA.

A tua missão: simular a descoberta de 8-10 leads reais em Twitter/X, Reddit e LinkedIn que possam beneficiar da AdPulse.

Para cada lead, cria uma mensagem genuína e útil que:
- Resolve o problema da pessoa com uma dica real
- Menciona a AdPulse de forma natural no final
- Não parece spam — parece ajuda genuína
- É em português (Portugal ou Brasil)
- Máximo 3-4 frases

Palavras-chave monitorizadas: ${palavras_chave.join(', ')}

Responde APENAS com JSON válido:
{
  "leads": [
    {
      "id": "lead_1",
      "nome": "Nome da pessoa",
      "handle": "handle_sem_arroba",
      "plataforma": "twitter",
      "texto": "o que a pessoa escreveu (realista, em português)",
      "url": "https://twitter.com/handle_sem_arroba/status/123456789",
      "data": "há 2 horas",
      "relevancia": 85,
      "categoria": "dificuldade_conteudo",
      "mensagem_sugerida": "mensagem personalizada para esta pessoa mencionando a AdPulse de forma natural"
    }
  ]
}

Categorias possíveis: "dificuldade_conteudo", "quer_crescer", "procura_ferramenta"
Plataformas: "twitter", "reddit", "linkedin"
Cria leads variados nas 3 plataformas com diferentes categorias.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
      temperature: 0.9,
    })

    const texto = completion.choices[0]?.message?.content || ''
    const jsonLimpo = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const dados = JSON.parse(jsonLimpo)
      return res.status(200).json(dados)
    } catch {
      return res.status(500).json({ erro: 'Erro ao processar resposta da IA' })
    }
  } catch (err: any) {
    console.error('Erro OpenAI:', err.message)
    return res.status(500).json({ erro: 'Erro na IA. Verifica os créditos OpenAI.' })
  }
}
