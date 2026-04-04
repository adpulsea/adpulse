// ============================================
// AdPulse — API Admin: Utilizadores
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const senha = req.headers['x-admin-senha']
  if (senha !== 'adpulse2026') return res.status(401).json({ erro: 'Não autorizado' })

  try {
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - 7)

    const { data: perfis } = await supabaseAdmin
      .from('perfis')
      .select('*')
      .order('criado_em', { ascending: false })

    if (!perfis) return res.status(200).json([])

    const utils = await Promise.all(perfis.map(async p => {
      const [
        { count: totalGeracoes },
        { count: geracoesSemana },
        { count: postsAgendados },
        { count: postsPublicados },
      ] = await Promise.all([
        supabaseAdmin.from('geracoes_ai').select('*', { count: 'exact', head: true }).eq('utilizador_id', p.id),
        supabaseAdmin.from('geracoes_ai').select('*', { count: 'exact', head: true }).eq('utilizador_id', p.id).gte('criado_em', inicioSemana.toISOString()),
        supabaseAdmin.from('posts').select('*', { count: 'exact', head: true }).eq('utilizador_id', p.id).eq('estado', 'agendado'),
        supabaseAdmin.from('posts').select('*', { count: 'exact', head: true }).eq('utilizador_id', p.id).eq('estado', 'publicado'),
      ])

      return {
        id: p.id,
        email: p.email,
        nome: p.nome || p.email?.split('@')[0] || 'Utilizador',
        plano: p.plano || 'gratuito',
        criado_em: p.criado_em,
        total_geracoes: totalGeracoes || 0,
        geracoes_ultima_semana: geracoesSemana || 0,
        posts_agendados: postsAgendados || 0,
        posts_publicados: postsPublicados || 0,
      }
    }))

    return res.status(200).json(utils)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: 'Erro interno' })
  }
}
