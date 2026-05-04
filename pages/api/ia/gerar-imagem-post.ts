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

function escapeXml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function detectarTema(texto: string) {
  const t = texto.toLowerCase()

  if (t.includes('marketing') || t.includes('campanha') || t.includes('clientes')) {
    return {
      emoji: '📣',
      label: 'Marketing',
      cor1: '#7C7BFA',
      cor2: '#F472B6',
      icone: 'MKT',
    }
  }

  if (t.includes('crescer') || t.includes('crescimento') || t.includes('audiência') || t.includes('seguidores')) {
    return {
      emoji: '📈',
      label: 'Crescimento',
      cor1: '#22C55E',
      cor2: '#7C7BFA',
      icone: 'UP',
    }
  }

  if (t.includes('venda') || t.includes('vender') || t.includes('negócio') || t.includes('proposta')) {
    return {
      emoji: '💼',
      label: 'Negócio',
      cor1: '#F59E0B',
      cor2: '#7C7BFA',
      icone: '€',
    }
  }

  if (t.includes('ia') || t.includes('inteligência artificial') || t.includes('automação')) {
    return {
      emoji: '🤖',
      label: 'IA',
      cor1: '#06B6D4',
      cor2: '#7C7BFA',
      icone: 'AI',
    }
  }

  if (t.includes('conteúdo') || t.includes('post') || t.includes('reel') || t.includes('criativo')) {
    return {
      emoji: '🎨',
      label: 'Conteúdo',
      cor1: '#EC4899',
      cor2: '#7C7BFA',
      icone: 'POST',
    }
  }

  return {
    emoji: '⚡',
    label: 'AdPulse',
    cor1: '#7C7BFA',
    cor2: '#F472B6',
    icone: 'IA',
  }
}

function criarSvgFallback({
  titulo,
  legenda,
  plataforma,
  formato,
  nicho,
  objetivo,
}: {
  titulo: string
  legenda: string
  plataforma: string
  formato: string
  nicho: string
  objetivo: string
}) {
  const tema = detectarTema(`${titulo} ${legenda} ${nicho} ${objetivo}`)
  const tituloCurto = titulo.slice(0, 70)
  const subtitulo = legenda.slice(0, 160)

  const svg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1080" fill="#070711"/>

  <defs>
    <radialGradient id="glow1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(820 190) rotate(120) scale(540)">
      <stop stop-color="${tema.cor1}" stop-opacity="0.65"/>
      <stop offset="1" stop-color="${tema.cor1}" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="glow2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(190 900) rotate(30) scale(520)">
      <stop stop-color="${tema.cor2}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${tema.cor2}" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="card" x1="70" y1="70" x2="1010" y2="1010" gradientUnits="userSpaceOnUse">
      <stop stop-color="#17172A"/>
      <stop offset="1" stop-color="#0B0B16"/>
    </linearGradient>

    <linearGradient id="accent" x1="120" y1="180" x2="940" y2="940" gradientUnits="userSpaceOnUse">
      <stop stop-color="${tema.cor1}"/>
      <stop offset="1" stop-color="${tema.cor2}"/>
    </linearGradient>
  </defs>

  <rect width="1080" height="1080" fill="url(#glow1)"/>
  <rect width="1080" height="1080" fill="url(#glow2)"/>

  <rect x="54" y="54" width="972" height="972" rx="44" fill="url(#card)" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

  <circle cx="850" cy="185" r="130" fill="${tema.cor1}" opacity="0.16"/>
  <circle cx="210" cy="860" r="180" fill="${tema.cor2}" opacity="0.12"/>

  <rect x="90" y="90" width="210" height="52" rx="26" fill="rgba(124,123,250,0.18)" stroke="rgba(124,123,250,0.45)"/>
  <text x="120" y="125" fill="#C4B5FD" font-family="Arial, sans-serif" font-size="22" font-weight="800">⚡ AdPulse</text>

  <text x="90" y="210" fill="#A5B4FC" font-family="Arial, sans-serif" font-size="25" font-weight="900">
    ${escapeXml(plataforma.toUpperCase())} • ${escapeXml(formato.toUpperCase())}
  </text>

  <text x="90" y="315" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="62" font-weight="900">
    ${escapeXml(tituloCurto.slice(0, 23))}
  </text>

  <text x="90" y="390" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="62" font-weight="900">
    ${escapeXml(tituloCurto.slice(23, 46))}
  </text>

  <text x="90" y="465" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="62" font-weight="900">
    ${escapeXml(tituloCurto.slice(46, 70))}
  </text>

  <line x1="90" y1="560" x2="560" y2="560" stroke="url(#accent)" stroke-width="7" stroke-linecap="round"/>

  <foreignObject x="90" y="610" width="790" height="220">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:#E5E7EB;font-family:Arial,sans-serif;font-size:31px;line-height:1.35;font-weight:600;">
      ${escapeXml(subtitulo)}
    </div>
  </foreignObject>

  <rect x="90" y="855" width="520" height="88" rx="24" fill="url(#accent)"/>
  <text x="135" y="910" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="31" font-weight="900">
    ${escapeXml(tema.emoji)} ${escapeXml(tema.label)}
  </text>

  <rect x="735" y="805" width="230" height="150" rx="32" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.10)"/>
  <text x="790" y="898" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="58" font-weight="900">${escapeXml(tema.icone)}</text>

  <text x="90" y="990" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="22" font-weight="600">
    Criado com IA na AdPulse
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
  const legenda = safeText(req.body?.legenda, '')
  const conteudo = safeText(req.body?.conteudo, '')
  const textoCriativo = safeText(req.body?.texto_criativo, titulo)
  const promptImagem = safeText(req.body?.prompt_imagem, '')
  const plataforma = safeText(req.body?.plataforma, 'Instagram')
  const formato = safeText(req.body?.formato, 'Post')
  const nicho = safeText(req.body?.nicho, 'marketing digital')
  const objetivo = safeText(req.body?.objetivo, 'crescer audiência')
  const apiKey = process.env.OPENAI_API_KEY

  const promptFinal = `
Cria uma imagem visual para redes sociais relacionada com este conteúdo.

Importante:
- NÃO escrevas texto na imagem.
- NÃO coloques letras, frases, palavras, logotipos nem tipografia.
- A imagem deve ser apenas visual/ilustrativa/fotográfica/gráfica.
- Estilo: moderno, premium, profissional, marketing digital, SaaS, redes sociais.
- Fundo e composição relacionados com o tema.
- Deve funcionar como imagem de apoio para um post.

Contexto:
Título: ${titulo}
Texto criativo: ${textoCriativo}
Legenda: ${legenda || conteudo}
Nicho: ${nicho}
Objetivo: ${objetivo}
Plataforma: ${plataforma}
Formato: ${formato}

Direção adicional:
${promptImagem || 'Imagem moderna relacionada com marketing digital, crescimento e criação de conteúdo.'}
`.trim()

  try {
    if (apiKey) {
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

      if (openaiResp.ok && data?.data?.[0]?.b64_json) {
        const buffer = Buffer.from(data.data[0].b64_json, 'base64')
        const filename = `posts/${Date.now()}-${slugify(titulo || textoCriativo)}.png`
        const publicUrl = await guardarNoSupabase(buffer, filename, 'image/png')

        return res.status(200).json({
          imagem: publicUrl,
          imagem_url: publicUrl,
          modo: 'openai_imagem_relacionada',
          prompt_usado: promptFinal,
        })
      }
    }

    const buffer = criarSvgFallback({
      titulo: textoCriativo || titulo,
      legenda: legenda || conteudo,
      plataforma,
      formato,
      nicho,
      objetivo,
    })

    const filename = `posts/${Date.now()}-${slugify(titulo || textoCriativo)}.svg`
    const publicUrl = await guardarNoSupabase(buffer, filename, 'image/svg+xml')

    return res.status(200).json({
      imagem: publicUrl,
      imagem_url: publicUrl,
      modo: 'fallback_visual_relacionado',
      prompt_usado: promptFinal,
    })
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Erro ao gerar imagem.',
    })
  }
}
