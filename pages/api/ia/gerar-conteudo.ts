// ============================================
// AdPulse — API: Gerar Conteúdo com IA
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
          { tipo: 'Hook', conteudo: typeof dados?.hook === 'string' ? dados.hook : 'Hook principal' },
          { tipo: 'Legenda', conteudo: typeof dados?.legenda === 'string' ? dados.legenda : 'Legenda principal' },
        ],
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' })
  }

  try {
    const { topico, plataforma, tom, formato } = req.body

    if (!topico || !plataforma) {
      return res.status(400).json({
        mensagem: 'Tópico e plataforma são obrigatórios',
        ...respostaSegura({}),
      })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        mensagem: 'OPENAI_API_KEY não está configurada no Vercel.',
        ...respostaSegura({}),
      })
    }

    const token = req.headers.authorization?.replace('Bearer ', '')
    let utilizadorId: string | null = null

    if (token) {
      const {
        data: { user },
      } = await supabaseAdmin.auth.getUser(token)

      utilizadorId = user?.id || null
    }

    if (utilizadorId) {
      const hoje = new Date().toISOString().split('T')[0]

      const { count } = await supabaseAdmin
        .from('geracoes_ai')
        .select('*', { count: 'exact', head: true })
        .eq('utilizador_id', utilizadorId)
        .eq('data_geracao', hoje)

      const { data: perfil } = await supabaseAdmin
        .from('perfis')
        .select('plano')
        .eq('id', utilizadorId)
        .single()

      const limites: Record<string, number> = {
        gratuito: 3,
        pro: 999,
        agencia: 9999,
      }

      const limite = limites[perfil?.plano || 'gratuito'] || 3

      if ((count || 0) >= limite) {
        return res.status(429).json({
          mensagem: `Limite diário atingido. Tens ${count}/${limite} gerações hoje.`,
          upgrade: true,
          ...respostaSegura({}),
        })
      }
    }

    const prompt = `
És um especialista em marketing de conteúdo viral para redes sociais em português de Portugal.

Cria conteúdo para:
Plataforma: ${plataforma}
Formato: ${formato || 'post'}
Tom: ${tom || 'informal'}
Tópico: ${topico}

Responde APENAS com JSON válido, sem markdown, sem explicações.

Estrutura obrigatória:
{
  "hook": "gancho inicial forte com menos de 150 caracteres",
  "legenda": "legenda completa com emojis, quebras de linha com \\n e CTA no final",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8"],
  "slides": [
    { "tipo": "Hook", "conteudo": "texto do slide 1" },
    { "tipo": "Problema", "conteudo": "texto do slide 2" },
    { "tipo": "Solução", "conteudo": "texto do slide 3" },
    { "tipo": "CTA", "conteudo": "texto do slide final" }
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
        max_tokens: 1000,
        temperature: 0.8,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!respostaOpenAI.ok) {
      const detalhe = await respostaOpenAI.text()
      console.error('Erro OpenAI:', detalhe)

      return res.status(500).json({
        mensagem: 'Erro da OpenAI ao gerar conteúdo.',
        ...respostaSegura({}),
      })
    }

    const dadosOpenAI = await respostaOpenAI.json()
    const textoResposta = dadosOpenAI.choices?.[0]?.message?.content || '{}'
    const textoLimpo = textoResposta
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    let conteudoGerado: any = {}

    try {
      conteudoGerado = JSON.parse(textoLimpo)
    } catch {
      conteudoGerado = {
        hook: 'Conteúdo gerado, mas o formato veio inválido.',
        legenda: textoResposta,
        hashtags: [],
        slides: [{ tipo: 'Conteúdo', conteudo: textoResposta }],
      }
    }

    const conteudoSeguro = respostaSegura(conteudoGerado)

    if (utilizadorId) {
      await supabaseAdmin.from('geracoes_ai').insert({
        utilizador_id: utilizadorId,
        tipo: 'legenda',
        prompt_entrada: topico,
        resultado: JSON.stringify(conteudoSeguro),
        tokens_usados: dadosOpenAI.usage?.total_tokens || 0,
        data_geracao: new Date().toISOString().split('T')[0],
      })
    }

    return res.status(200).json(conteudoSeguro)
  } catch (erro) {
    console.error('Erro na API de geração:', erro)

    return res.status(500).json({
      mensagem: 'Erro ao gerar conteúdo. Tenta novamente.',
      ...respostaSegura({}),
    })
  }
}
