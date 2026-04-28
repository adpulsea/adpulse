// ============================================
// AdPulse — API: Gerar Conteúdo com IA (MODOS)
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

function respostaSegura(dados: any) {
  return {
    hook: typeof dados?.hook === 'string' ? dados.hook : 'Hook não gerado.',
    legenda: typeof dados?.legenda === 'string' ? dados.legenda : 'Legenda não gerada.',
    hashtags: Array.isArray(dados?.hashtags) ? dados.hashtags : [],
    slides: Array.isArray(dados?.slides)
      ? dados.slides
      : [
          { tipo: 'Hook', conteudo: dados?.hook || 'Hook principal' },
          { tipo: 'Conteúdo', conteudo: dados?.legenda || 'Legenda principal' },
        ],
  }
}

// 🎯 MODOS DE CONTEÚDO
const modos = {
  normal: `
Conteúdo equilibrado, claro e envolvente.
`,

  viral: `
Conteúdo EXTREMAMENTE viral.

- Começa com choque, curiosidade ou polémica
- Frases curtas e agressivas
- Linguagem emocional
- Focado em parar o scroll
- CTA forte para comentar ou guardar
`,

  autoridade: `
Conteúdo de autoridade.

- Tom confiante
- Ensina algo valioso
- Mostra experiência
- Dá dicas práticas
`,

  polemico: `
Conteúdo polémico.

- Afirmação controversa
- Pode gerar debate
- Contraria crenças comuns
- Incentiva comentários
`,

  educativo: `
Conteúdo educativo.

- Explica passo a passo
- Simples e claro
- Focado em ensinar
`,
}

// 🧠 PROMPTS POR FORMATO
const promptPorFormato = {
  reel: `Cria um REEL curto e impactante.`,
  carrossel: `Cria um CARROSSEL com vários slides estruturados.`,
  post: `Cria um POST com legenda envolvente.`,
  story: `Cria um STORY direto e rápido.`,
  short: `Cria um SHORT rápido e dinâmico.`,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' })
  }

  try {
    const { topico, plataforma, tom, formato, modo = 'normal' } = req.body

    if (!topico || !plataforma) {
      return res.status(400).json({
        mensagem: 'Tópico e plataforma são obrigatórios',
        ...respostaSegura({}),
      })
    }

    const promptBase =
      promptPorFormato[formato as keyof typeof promptPorFormato] || promptPorFormato.post

    const modoSelecionado = modos[modo as keyof typeof modos] || modos.normal

    const prompt = `
És um especialista em conteúdo viral para redes sociais em PORTUGAL.

⚠️ REGRAS:
- Usar português europeu (tu, teu, começa, faz)
- Nunca usar português do Brasil
- Linguagem moderna, direta e impactante

Plataforma: ${plataforma}
Formato: ${formato}
Tom: ${tom}
Tópico: ${topico}

🎯 MODO:
${modoSelecionado}

📱 FORMATO:
${promptBase}

Responde APENAS com JSON:

{
  "hook": "",
  "legenda": "",
  "hashtags": ["#","#","#","#","#","#","#","#"],
  "slides": [
    {"tipo":"Hook","conteudo":""},
    {"tipo":"Problema","conteudo":""},
    {"tipo":"Solução","conteudo":""},
    {"tipo":"CTA","conteudo":""}
  ]
}
`

    const respostaOpenAI = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.9,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!respostaOpenAI.ok) {
      const erroTexto = await respostaOpenAI.text()

      return res.status(500).json({
        mensagem: 'Erro OpenAI',
        detalhe: erroTexto,
        ...respostaSegura({}),
      })
    }

    const dadosOpenAI = await respostaOpenAI.json()
    const textoResposta = dadosOpenAI.choices?.[0]?.message?.content || '{}'

    const textoLimpo = textoResposta
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let conteudoGerado: any = {}

    try {
      conteudoGerado = JSON.parse(textoLimpo)
    } catch {
      conteudoGerado = {
        hook: 'Erro ao interpretar resposta',
        legenda: textoResposta,
        hashtags: [],
        slides: [{ tipo: 'Erro', conteudo: textoResposta }],
      }
    }

    return res.status(200).json(respostaSegura(conteudoGerado))
  } catch (erro) {
    return res.status(500).json({
      mensagem: 'Erro interno',
      detalhe: erro instanceof Error ? erro.message : String(erro),
      ...respostaSegura({}),
    })
  }
}
