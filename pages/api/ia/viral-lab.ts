// ============================================
// AdPulse — API: Viral Lab
// ============================================
// Endpoint: POST /api/ia/viral-lab

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' })
  }

  const { conteudo, plataforma, nicho } = req.body

  if (!conteudo) {
    return res.status(400).json({ mensagem: 'Conteúdo é obrigatório' })
  }

  try {
    const prompt = `És um especialista em marketing viral em redes sociais.

Analisa o seguinte conteúdo para ${plataforma || 'redes sociais'} no nicho de ${nicho || 'geral'}:

"${conteudo}"

Responde APENAS com JSON válido (sem markdown, sem explicações):
{
  "score": 78,
  "hook": 18,
  "trend": 20,
  "nicho": 22,
  "formato": 18,
  "sugestoes": [
    "Sugestão específica 1 para melhorar",
    "Sugestão específica 2",
    "Sugestão específica 3"
  ],
  "hooks_alternativos": [
    "Hook alternativo 1 mais forte",
    "Hook alternativo 2 diferente",
    "Hook alternativo 3 controverso"
  ]
}

Regras de pontuação (cada dimensão tem máximo 25 pontos):
- hook: força do gancho inicial para prender atenção nos primeiros 2 segundos
- trend: alinhamento com tendências atuais da plataforma ${plataforma}
- nicho: relevância e especificidade para o nicho ${nicho}
- formato: adequação ao formato e comprimento ideal da plataforma
- score: soma total das 4 dimensões (0-100)

As sugestões devem ser específicas e acionáveis.
Os hooks alternativos devem ser mais fortes que o original.
Responde em português europeu.`

    const respostaOpenAI = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 800,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const dadosOpenAI = await respostaOpenAI.json()
    const textoResposta = dadosOpenAI.choices[0]?.message?.content || '{}'
    const textoLimpo = textoResposta.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const analise = JSON.parse(textoLimpo)

    return res.status(200).json(analise)
  } catch (erro) {
    console.error('Erro no Viral Lab:', erro)
    return res.status(500).json({ mensagem: 'Erro na análise. Tenta novamente.' })
  }
}
