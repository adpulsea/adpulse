import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

function safeText(value: any, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60)
}

function criarSvgFallback(titulo: string, subtitulo: string) {
  const safeTitulo = titulo.replace(/&/g, '&amp;').slice(0, 32)
  const safeSub = subtitulo.replace(/&/g, '&amp;').slice(0, 240)

  const svg = `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" rx="40" fill="#090B14"/>
    <rect x="36" y="36" width="952" height="952" rx="34" fill="url(#bg)" stroke="rgba(255,255,255,0.12)"/>
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
        <stop stop-color="#12152A"/>
        <stop offset="1" stop-color="#0B1020"/>
      </linearGradient>
      <linearGradient id="accent" x1="160" y1="120" x2="860" y2="860" gradientUnits="userSpaceOnUse">
        <stop stop-color="#7C7BFA"/>
        <stop offset="1" stop-color="#EC4899"/>
      </linearGradient>
    </defs>

    <circle cx="860" cy="190" r="140" fill="url(#accent)" opacity="0.18"/>
    <circle cx="160" cy="860" r="180" fill="url(#accent)" opacity="0.10"/>

    <text x="90" y="120" fill="#A5B4FC" font-family="Arial, sans-serif" font-size="28" font-weight="700">
      AdPulse
    </text>

    <text x="90" y="250" fill="white" font-family="Arial, sans-serif" font-size="66" font-weight="800">
      ${safeTitulo}
    </text>

    <foreignObject x="90" y="320" width="820" height="340">
      <div xmlns="http://www.w3.org/1999/xhtml" style="
        color:#E5E7EB;
        font-family: Arial, sans-serif;
        font-size:32px;
        line-height:1.35;
        font-weight:600;
      ">
        ${safeSub}
      </div>
    </foreignObject>

    <rect x="90" y="820" width="300" height="74" rx="18" fill="#7C7BFA"/>
    <text x="128" y="868" fill="white" font-family="Arial, sans-serif" font-size="28" font-weight="700">
      Experimenta a AdPulse
    </text>
  </svg>
  `.trim()

  return Buffer.from(svg)
}

async function guardarNoSupabase(buffer: Buffer, filename: string, contentType: string) {
  const bucket = 'adpulse-posts'

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType,
      upsert: true,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filename)

  return data.publicUrl
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  const titulo = safeText(req.body?.titulo, 'Conteúdo AdPulse')
  const conteudo = safeText(req.body?.conteudo, '')
  const legenda = safeText(req.body?.legenda, '')
  const textoCriativo = safeText(req.body?.texto_criativo, titulo)
  const promptImagem = safeText(req.body?.prompt_imagem, '')
  const plataforma = safeText(req.body?.plataforma, 'instagram')
  const formato = safeText(req.body?.formato, 'Post')

  const apiKey = process.env.OPENAI_API_KEY

  const promptFinal = `
Cria uma imagem quadrada premium para ${plataforma}, formato ${formato}.
Estilo visual:
- dark mode
- look SaaS moderno
- profissional
- clean
- alto contraste
- toque futurista
- visual publicitário
- tipografia forte
- layout pronto para redes sociais

Título principal:
"${textoCriativo}"

Contexto:
${titulo}

Informação de apoio:
${legenda || conteudo}

Direção adicional:
${promptImagem || 'Usa composição moderna com headline forte, bloco de texto curto e CTA visual.'}

Incluir visualmente:
- headline forte
- design elegante
- CTA discreto
- sensação de produto premium
- estética compatível com Instagram
`.trim()

  try {
    let buffer: Buffer
    let contentType = 'image/png'
    let modo = 'openai'

    if (!apiKey) {
      buffer = criarSvgFallback(textoCriativo, legenda || conteudo || 'Criativo gerado pela AdPulse.')
      contentType = 'image/svg+xml'
      modo = 'fallback'
    } else {
      const openaiResp = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          size: '1024x1024',
          prompt: promptFinal,
        }),
      })

      const data = await openaiResp.json()

      if (!openaiResp.ok || !data?.data?.[0]?.b64_json) {
        buffer = criarSvgFallback(textoCriativo, legenda || conteudo || 'Criativo gerado pela AdPulse.')
        contentType = 'image/svg+xml'
        modo = 'fallback'
      } else {
        buffer = Buffer.from(data.data[0].b64_json, 'base64')
      }
    }

    const extensao = contentType === 'image/svg+xml' ? 'svg' : 'png'
    const filename = `posts/${Date.now()}-${slugify(titulo || textoCriativo)}.${extensao}`

    const publicUrl = await guardarNoSupabase(buffer, filename, contentType)

    return res.status(200).json({
      imagem: publicUrl,
      imagem_url: publicUrl,
      modo,
      prompt_usado: promptFinal,
    })
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Erro ao gerar e guardar imagem.',
    })
  }
}
