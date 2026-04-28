// ============================================
// AdPulse — API: Gerar Conteúdo com IA (FINAL)
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Cliente admin (server only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Garantir resposta segura (nunca undefined)
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
        mensagem: 'OPENAI_API_KEY não configurada.',
        ...respostaSegura({}),
      })
    }

    // 🔐 Obter utilizador (se autenticado)
    const token = req.headers.authorization?.replace('Bearer ', '')
    let utilizadorId: string | null = null

    if (token) {
      const {
        data: { user },
      } = await supabaseAdmin.auth.getUser(token)

      utilizadorId = user?.id || null
    }

    // 🚫 Limite diário
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

      const limite = limites[perfil?.plano || 'gratuito']

      if ((count || 0) >= limite) {
        return res.status(429).json({
          mensagem: `Limite diário atingido (${count}/${limite})`,
          upgrade: true,
          ...respostaSegura({}),
        })
      }
    }

    // 🧠 Prompt IA
    const prompt = `
És um especialista em conteúdo viral para redes sociais.

Cria conteúdo para:
Plataforma: ${plataforma}
Formato: ${formato || 'post'}
Tom: ${tom || 'informal'}
Tópico: ${topico}

Responde APENAS com JSON válido:

{
  "hook": "gancho forte",
  "legenda": "legenda com emojis e CTA",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8"],
  "slides": [
    {"tipo":"Hook","conteudo":"..."},
    {"tipo":"Problema","conteudo":"..."},
    {"tipo":"Solução","conteudo":"..."},
    {"tipo":"CTA","conteudo":"..."}
  ]
}
`

    // 🤖 Chamada OpenAI
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
      const erroTexto = await respostaOpenAI.text()

      return res.status(500).json({
        mensagem: 'Erro OpenAI',
        detalhe: erroTexto,
        ...respostaSegura({}),
      })
    }

    const dadosOpenAI = await respostaOpenAI.json()
    const textoResposta = dadosOpenAI.choices?.[0]?.message?.content || '{}'

    // 🔧 Limpar resposta
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

    const conteudoSeguro = respostaSegura(conteudoGerado)

    // 💾 Guardar no Supabase
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
    return res.status(500).json({
      mensagem: 'Erro interno',
      detalhe: erro instanceof Error ? erro.message : String(erro),
      ...respostaSegura({}),
    })
  }
}
