// ============================================
// AdPulse — API: Gerar Conteúdo com IA
// ============================================
// Endpoint: POST /api/ia/gerar-conteudo
// Verifica o limite diário antes de chamar a OpenAI.

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Cliente Supabase com a service role key (acesso total, só no servidor)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' })
  }

  const { topico, plataforma, tom, formato } = req.body

  // Validar campos obrigatórios
  if (!topico || !plataforma) {
    return res.status(400).json({ mensagem: 'Tópico e plataforma são obrigatórios' })
  }

  // Verificar autenticação (token JWT do Supabase no header)
  const token = req.headers.authorization?.replace('Bearer ', '')
  let utilizadorId: string | null = null

  if (token) {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    utilizadorId = user?.id || null
  }

  // Verificar limite de gerações diárias
  if (utilizadorId) {
    const hoje = new Date().toISOString().split('T')[0]
    const { count } = await supabaseAdmin
      .from('geracoes_ai')
      .select('*', { count: 'exact', head: true })
      .eq('utilizador_id', utilizadorId)
      .eq('data_geracao', hoje)

    // Buscar plano do utilizador
    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('plano')
      .eq('id', utilizadorId)
      .single()

    const limites: Record<string, number> = { gratuito: 3, pro: 999, agencia: 9999 }
    const limite = limites[perfil?.plano || 'gratuito']

    if ((count || 0) >= limite) {
      return res.status(429).json({
        mensagem: `Limite diário atingido. Tens ${count}/${limite} gerações hoje.`,
        upgrade: true,
      })
    }
  }

  try {
    // Construir o prompt para o ChatGPT
    const prompt = `És um especialista em marketing de conteúdo viral para redes sociais em português.

Cria conteúdo para a plataforma: ${plataforma}
Formato: ${formato || 'post'}
Tom: ${tom || 'informal'}
Tópico: ${topico}

Responde APENAS com um JSON válido (sem markdown, sem explicações) com esta estrutura exata:
{
  "hook": "gancho inicial forte com menos de 150 caracteres",
  "legenda": "legenda completa com emojis, quebras de linha com \\n, e CTA no final",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8"],
  "slides": [
    { "tipo": "Hook", "conteudo": "texto do slide 1" },
    { "tipo": "Problema", "conteudo": "texto do slide 2" },
    { "tipo": "Solução", "conteudo": "texto do slide 3" },
    { "tipo": "CTA", "conteudo": "texto do slide final" }
  ]
}

Regras:
- Hook deve começar com uma pergunta, estatística chocante, ou afirmação controversa
- A legenda deve ter 3-5 parágrafos com emojis naturais
- Hashtags relevantes para ${plataforma} e para o nicho "${topico}"
- Conteúdo em português europeu (Portugal)`

    // Chamar a API da OpenAI
    const respostaOpenAI = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',       // modelo mais rápido e barato
        max_tokens: 1000,
        temperature: 0.8,           // um pouco criativo
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!respostaOpenAI.ok) {
      throw new Error(`OpenAI respondeu com status ${respostaOpenAI.status}`)
    }

    const dadosOpenAI = await respostaOpenAI.json()
    const textoResposta = dadosOpenAI.choices[0]?.message?.content || '{}'

    // Limpar e fazer parse do JSON
    const textoLimpo = textoResposta.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const conteudoGerado = JSON.parse(textoLimpo)

    // Guardar no Supabase para controlo de limites
    if (utilizadorId) {
      await supabaseAdmin.from('geracoes_ai').insert({
        utilizador_id: utilizadorId,
        tipo: 'legenda',
        prompt_entrada: topico,
        resultado: textoResposta,
        tokens_usados: dadosOpenAI.usage?.total_tokens || 0,
        data_geracao: new Date().toISOString().split('T')[0],
      })
    }

    return res.status(200).json(conteudoGerado)

  } catch (erro) {
    console.error('Erro na API de geração:', erro)
    return res.status(500).json({ mensagem: 'Erro ao gerar conteúdo. Tenta novamente.' })
  }
}
