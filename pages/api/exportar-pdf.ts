// ============================================
// AdPulse — API: Gerar PDF do Plano Semanal
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { utilizador_id, semana_inicio, semana_fim, nome_utilizador, email } = req.body

  if (!utilizador_id) return res.status(400).json({ erro: 'utilizador_id em falta' })

  try {
    // Buscar posts da semana
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('utilizador_id', utilizador_id)
      .gte('criado_em', semana_inicio)
      .lte('criado_em', semana_fim)
      .order('criado_em')

    const { data: perfil } = await supabase
      .from('perfis')
      .select('nome, nome_marca, plano')
      .eq('id', utilizador_id)
      .single()

    const postsData = posts || []
    const nomeExibir = perfil?.nome_marca || perfil?.nome || nome_utilizador || 'Utilizador'
    const totalAgendados = postsData.filter(p => p.estado === 'agendado').length
    const totalRascunhos = postsData.filter(p => p.estado === 'rascunho').length
    const plataformas = [...new Set(postsData.map(p => p.plataforma).filter(Boolean))]

    // Gerar HTML do PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #1a1a2e; background: white; padding: 30px; }
  .header { margin-bottom: 24px; }
  .logo { font-size: 28px; font-weight: 900; color: #7c7bfa; margin-bottom: 4px; }
  .titulo { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
  .subtitulo { font-size: 11px; color: #888; margin-bottom: 16px; }
  .divider { border: none; border-top: 2px solid #7c7bfa; margin-bottom: 20px; }
  .secao { font-size: 14px; font-weight: 700; color: #7c7bfa; margin: 20px 0 10px; }
  .resumo { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .resumo-card { background: #f0eeff; border-radius: 8px; padding: 12px; text-align: center; }
  .resumo-label { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .resumo-valor { font-size: 22px; font-weight: 700; color: #7c7bfa; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th { background: #1a1a2e; color: white; padding: 8px 6px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 8px 6px; border-bottom: 1px solid #eee; vertical-align: middle; }
  tr:nth-child(even) td { background: #f9f9f9; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 600; }
  .badge-agendado { background: #d1fae5; color: #065f46; }
  .badge-rascunho { background: #fef3c7; color: #92400e; }
  .badge-publicado { background: #dbeafe; color: #1e40af; }
  .formato-reel { color: #7c7bfa; font-weight: 600; }
  .formato-carrossel { color: #c084fc; font-weight: 600; }
  .formato-story { color: #f472b6; font-weight: 600; }
  .formato-post { color: #34d399; font-weight: 600; }
  .dicas { margin-top: 20px; }
  .dica { padding: 6px 0; font-size: 10px; color: #333; border-bottom: 1px solid #f0f0f0; }
  .dica:before { content: "→ "; color: #7c7bfa; font-weight: 700; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #eee; font-size: 8px; color: #aaa; text-align: center; }
  .vazio { text-align: center; padding: 30px; color: #aaa; font-style: italic; }
</style>
</head>
<body>

<div class="header">
  <div class="logo">AdPulse</div>
  <div class="titulo">Plano Semanal de Conteúdo</div>
  <div class="subtitulo">${nomeExibir} | ${email || ''} | ${new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
</div>
<hr class="divider">

<div class="secao">Resumo da Semana</div>
<div class="resumo">
  <div class="resumo-card">
    <div class="resumo-label">Total Posts</div>
    <div class="resumo-valor">${postsData.length}</div>
  </div>
  <div class="resumo-card">
    <div class="resumo-label">Agendados</div>
    <div class="resumo-valor">${totalAgendados}</div>
  </div>
  <div class="resumo-card">
    <div class="resumo-label">Rascunhos</div>
    <div class="resumo-valor">${totalRascunhos}</div>
  </div>
  <div class="resumo-card">
    <div class="resumo-label">Plataformas</div>
    <div class="resumo-valor">${plataformas.length}</div>
  </div>
</div>

<div class="secao">Posts da Semana</div>
${postsData.length === 0 ? '<div class="vazio">Nenhum post encontrado para esta semana.</div>' : `
<table>
  <thead>
    <tr>
      <th>Data</th>
      <th>Hora</th>
      <th>Formato</th>
      <th>Título</th>
      <th>Plataforma</th>
      <th>Estado</th>
    </tr>
  </thead>
  <tbody>
    ${postsData.map(p => {
      const data = new Date(p.criado_em)
      const dataStr = data.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: '2-digit' })
      const formatoClass = `formato-${(p.formato || '').toLowerCase()}`
      const estadoClass = p.estado === 'agendado' ? 'badge-agendado' : p.estado === 'publicado' ? 'badge-publicado' : 'badge-rascunho'
      const estadoLabel = p.estado === 'agendado' ? 'Agendado' : p.estado === 'publicado' ? 'Publicado' : 'Rascunho'
      return `
        <tr>
          <td>${dataStr}</td>
          <td>${p.hora_publicacao || '--:--'}</td>
          <td class="${formatoClass}">${p.formato || '-'}</td>
          <td>${p.titulo || '-'}</td>
          <td style="text-transform: capitalize">${p.plataforma || '-'}</td>
          <td><span class="badge ${estadoClass}">${estadoLabel}</span></td>
        </tr>
      `
    }).join('')}
  </tbody>
</table>`}

<div class="dicas">
  <div class="secao">Dicas para esta semana</div>
  <div class="dica">Publica os Reels entre as 09h-10h ou 18h-20h para maior alcance orgânico</div>
  <div class="dica">Responde a todos os comentários nas primeiras 2 horas após publicar</div>
  <div class="dica">Usa entre 5-10 hashtags relevantes por post no Instagram</div>
  <div class="dica">Os Carrosseis geram 3x mais partilhas que posts simples — usa-os a meio da semana</div>
  <div class="dica">Publica Stories todos os dias para manter o algoritmo ativo</div>
</div>

<div class="footer">
  Gerado por AdPulse | adpulse-pf3b.vercel.app | ${new Date().getFullYear()} | Plano ${perfil?.plano || 'gratuito'}
</div>

</body>
</html>`

    return res.status(200).json({ html: htmlContent, total_posts: postsData.length })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: 'Erro ao gerar PDF' })
  }
}
