import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

function safeText(value: any, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function escapeXml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
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

function wrapText(text: string, maxChars: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim()
    } else {
      if (current) lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)
  return lines
}

function criarImagemAdPulse({
  titulo,
  textoCriativo,
  legenda,
  cta,
  plataforma,
  formato,
}: {
  titulo: string
  textoCriativo: string
  legenda: string
  cta: string
  plataforma: string
  formato: string
}) {
  const headline = safeText(textoCriativo, titulo).slice(0, 90)
  const apoio = safeText(legenda, 'Cria conteúdo melhor com IA.').slice(0, 180)
  const chamada = safeText(cta, 'Experimenta a AdPulse').slice(0, 60)

  const headlineLines = wrapText(headline, 20).slice(0, 4)
  const apoioLines = wrapText(apoio, 48).slice(0, 4)

  const headlineSvg = headlineLines
    .map((line, index) => {
      const y = 320 + index * 78
      return `<text x="90" y="${y}" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="64" font-weight="900">${escapeXml(line)}</text>`
    })
    .join('\n')

  const apoioSvg = apoioLines
    .map((line, index) => {
      const y = 650 + index * 38
      return `<text x="90" y="${y}" fill="#D1D5DB" font-family="Arial, sans-serif" font-size="28" font-weight="500">${escapeXml(line)}</text>`
    })
    .join('\n')

  const svg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1080" fill="#070711"/>

  <defs>
    <radialGradient id="glow1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(850 190) rotate(120) scale(520)">
      <stop stop-color="#7C7BFA" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#7C7BFA" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="glow2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(160 900) rotate(30) scale(520)">
      <stop stop-color="#F472B6" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#F472B6" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="card" x1="72" y1="72" x2="1008" y2="1008" gradientUnits="userSpaceOnUse">
      <stop stop-color="#17172A"/>
      <stop offset="1" stop-color="#0B0B16"/>
    </linearGradient>

    <linearGradient id="button" x1="90" y1="860" x2="500" y2="940" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C7BFA"/>
      <stop offset="1" stop-color="#F472B6"/>
    </linearGradient>
  </defs>

  <rect width="1080" height="1080" fill="url(#glow1)"/>
  <rect width="1080" height="1080" fill="url(#glow2)"/>

  <rect x="54" y="54" width="972" height="972" rx="42" fill="url(#card)" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

  <circle cx="905" cy="165" r="110" fill="#7C7BFA" opacity="0.14"/>
  <circle cx="160" cy="920" r="150" fill="#F472B6" opacity="0.10"/>

  <rect x="90" y="90" width="180" height="48" rx="24" fill="rgba(124,123,250,0.18)" stroke="rgba(124,123,250,0.45)"/>
  <text x="118" y="122" fill="#C4B5FD" font-family="Arial, sans-serif" font-size="22" font-weight="800">⚡ AdPulse</text>

  <text x="90" y="205" fill="#A5B4FC" font-family="Arial, sans-serif" font-size="24" font-weight="800">
    ${escapeXml(plataforma.toUpperCase())} • ${escapeXml(formato.toUpperCase())}
  </text>

  ${headlineSvg}

  <line x1="90" y1="575" x2="520" y2="575" stroke="#7C7BFA" stroke-width="6" stroke-linecap="round"/>

  ${apoioSvg}

  <rect x="90" y="850" width="520" height="86" rx="24" fill="url(#button)"/>
  <text x="130" y="904" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="30" font-weight="900">
    ${escapeXml(chamada)}
  </text>

  <text x="90" y="990" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="22" font-weight="600">
    Criado com IA na AdPulse
  </text>

  <rect x="740" y="820" width="210" height="120" rx="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.10)"/>
  <text x="785" y="890" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="52" font-weight="900">IA</text>
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

  try {
    const titulo = safeText(req.body?.titulo, 'Conteúdo AdPulse')
    const legenda = safeText(req.body?.legenda, '')
    const conteudo = safeText(req.body?.conteudo, '')
    const textoCriativo = safeText(req.body?.texto_criativo, titulo)
    const cta = safeText(req.body?.cta, 'Experimenta a AdPulse')
    const plataforma = safeText(req.body?.plataforma, 'Instagram')
    const formato = safeText(req.body?.formato, 'Post')

    const buffer = criarImagemAdPulse({
      titulo,
      textoCriativo,
      legenda: legenda || conteudo,
      cta,
      plataforma,
      formato,
    })

    const filename = `posts/${Date.now()}-${slugify(titulo || textoCriativo)}.svg`

    const publicUrl = await guardarNoSupabase(
      buffer,
      filename,
      'image/svg+xml'
    )

    return res.status(200).json({
      imagem: publicUrl,
      imagem_url: publicUrl,
      modo: 'template_adpulse',
      mensagem: 'Imagem criada com texto exato.',
    })
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Erro ao gerar imagem.',
    })
  }
}
