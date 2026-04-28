// ============================================
// AdPulse — API: Gerar Conteúdo com IA
// Com proteção backend + limite gratuito 3/dia
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

type ConteudoIA = {
  hook: string
  legenda: string
  hashtags: string[]
  slides: { tipo: string; conteudo: string }[]
}

const modos = {
  normal: `
Conteúdo equilibrado, claro e envolvente.
`,
  viral: `
Conteúdo extremamente viral.
- Começa com choque, curiosidade ou polémica
- Frases curtas e fortes
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

const promptPorFormato = {
  reel: `Cria um REEL curto, rápido e impactante.`,
  carrossel: `Cria um CARROSSEL com slides claros e estruturados.`,
  post: `Cria um POST com legenda envolvente.`,
  story: `Cria um STORY curto e direto.`,
  short: `Cria um SHORT rápido e dinâmico.`,
}

function respostaSegura(dados: any): ConteudoIA {
  return {
    hook: typeof dados?.hook === 'string' ? dados.hook : 'Hook não gerado.',
    legenda: typeof dados?.legenda === 'string' ? dados.legenda : 'Legenda não gerada.',
    hashtags: Array.isArray(dados?.hashtags) ? dados.hashtags : [],
    slides:
      Array.isArray(dados?.slides) && dados.slides.length > 0
        ? dados.slides
        : [
            { tipo: 'Hook', conteudo: dados?.hook || 'Hook principal' },
            { tipo: 'Conteúdo', conteudo: dados?.legenda || 'Conteúdo principal' },
          ],
  }
}

function hojeISO() {
  return new Date().toISOString().split('T')[0]
}

async function obterUtilizador(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return null
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) return null

  return user
}

async function verificarLimiteBackend(utilizadorId: string) {
  const hoje = hojeISO()

  const { data: perfil } = await supabaseAdmin
    .from('perfis')
    .select('plano, limite_geracoes_dia')
    .eq('id', utilizadorId)
    .single()

  const plano = perfil?.plano || 'gratuito'

  if (plano === 'pro' || plano === 'agencia') {
    return {
      podeGerar: true,
      plano,
      limite: 999999,
      usadas: 0,
    }
  }

  const limite = perfil?.limite_geracoes_dia || 3

  const { data: limiteHoje } = await supabaseAdmin
    .from('limites_utilizacao')
    .select('*')
    .eq('utilizador_id', utilizadorId)
    .eq('data_limite', hoje)
    .maybeSingle()

  const usadas = limiteHoje?.geracoes_conteudo || 0

  return {
    podeGerar: usadas < limite,
    plano,
    limite,
    usadas,
  }
}

async function registarUtilizacao(utilizadorId: string) {
  const hoje = hojeISO()

  const { data: limiteHoje } = await supabaseAdmin
    .from('limites_utilizacao')
    .select('*')
    .eq('utilizador_id', utilizadorId)
    .eq('data_limite', hoje)
    .maybeSingle()

  if (!limiteHoje) {
    await supabaseAdmin.from('limites_utilizacao').insert({
      utilizador_id: utilizadorId,
      data_limite: hoje,
      geracoes_conteudo: 1,
      geracoes_imagem: 0,
    })

    return
  }

  await supabaseAdmin
    .from('limites_utilizacao')
    .update({
      geracoes_conteudo: (limiteHoje.geracoes_conteudo || 0) + 1,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', limiteHoje.id)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' })
  }

  try {
    const utilizador = await obterUtilizador(req)

    if (!utilizador?.id) {
      return res.status(401).json({
        mensagem: 'Tens de iniciar sessão para gerar conteúdo.',
        ...respostaSegura({}),
      })
    }

    const { topico, plataforma, tom, formato, modo = 'normal' } = req.body

    if (!topico || !plataforma) {
      return res.status(400).json({
        mensagem: 'Tópico e plataforma são obrigatórios.',
        ...respostaSegura({}),
      })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        mensagem: 'OPENAI_API_KEY não configurada.',
        ...respostaSegura({}),
      })
    }

    const limite = await verificarLimiteBackend(utilizador.id)

    if (!limite.podeGerar) {
      return res.status(429).json({
        mensagem: `Limite diário atingido. Usaste ${limite.usadas}/${limite.limite} gerações do plano gratuito.`,
        upgrade: true,
        plano: limite.plano,
        usadas: limite.usadas,
        limite: limite.limite,
        ...respostaSegura({
          hook: 'Limite diário atingido',
          legenda: 'Faz upgrade para Pro para desbloquear gerações ilimitadas.',
          hashtags: [],
          slides: [{ tipo: 'Upgrade', conteudo: 'Faz upgrade para continuares a gerar conteúdo hoje.' }],
        }),
      })
    }

    const promptBase =
      promptPorFormato[formato as keyof typeof promptPorFormato] || promptPorFormato.post

    const modoSelecionado = modos[modo as keyof typeof modos] || modos.normal

    const prompt = `
És um especialista em marketing de conteúdo viral para redes sociais em PORTUGAL.

REGRAS OBRIGATÓRIAS:
- Escreve em português europeu.
- Nunca uses português do Brasil.
- Usa: tu, teu, começa, faz, descobre.
- Evita linguagem genérica.
- Conteúdo direto, moderno e prático.

Plataforma: ${plataforma}
Formato: ${formato || 'post'}
Tom: ${tom || 'Informal'}
Tópico/Nicho: ${topico}

MODO:
${modoSelecionado}

FORMATO:
${promptBase}

Responde APENAS com JSON válido, sem markdown:

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
        temperature: 0.85,
        max_tokens: 1100,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!respostaOpenAI.ok) {
      const erroTexto = await respostaOpenAI.text()

      return res.status(500).json({
        mensagem: 'Erro da OpenAI ao gerar conteúdo.',
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
        hook: 'Conteúdo gerado',
        legenda: textoResposta,
        hashtags: [],
        slides: [{ tipo: 'Conteúdo', conteudo: textoResposta }],
      }
    }

    const conteudoSeguro = respostaSegura(conteudoGerado)

    await registarUtilizacao(utilizador.id)

    await supabaseAdmin.from('geracoes_ai').insert({
      utilizador_id: utilizador.id,
      tipo: 'legenda',
      prompt_entrada: topico,
      resultado: JSON.stringify(conteudoSeguro),
      tokens_usados: dadosOpenAI.usage?.total_tokens || 0,
      data_geracao: hojeISO(),
    })

    return res.status(200).json({
      ...conteudoSeguro,
      limite: {
        plano: limite.plano,
        usadasAntes: limite.usadas,
        usadasDepois: limite.usadas + 1,
        limite: limite.limite,
      },
    })
  } catch (erro) {
    console.error('Erro geral gerar-conteudo:', erro)

    return res.status(500).json({
      mensagem: 'Erro interno ao gerar conteúdo.',
      detalhe: erro instanceof Error ? erro.message : String(erro),
      ...respostaSegura({}),
    })
  }
}
