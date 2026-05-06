import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

function adminToken() {
  const password = process.env.ADMIN_PASSWORD || ''
  return crypto.createHash('sha256').update(password).digest('hex')
}

function isAdmin(req: NextApiRequest) {
  const cookieToken = req.cookies?.admin_session || ''
  const expectedToken = adminToken()

  return Boolean(expectedToken && cookieToken === expectedToken)
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdmin(req)) {
    return res.status(401).json({
      erro: 'Acesso reservado ao administrador.',
    })
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('leads_prospeccao')
        .select('*')
        .order('data_criacao', { ascending: false })

      if (error) throw error

      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      const payload = req.body || {}

      const { data, error } = await supabaseAdmin
        .from('leads_prospeccao')
        .insert({
          nome: payload.nome || '',
          username_instagram: payload.username_instagram || '',
          link_perfil: payload.link_perfil || '',
          nicho: payload.nicho || '',
          localizacao: payload.localizacao || '',
          tipo_lead: payload.tipo_lead || 'pequeno_negocio',
          origem: payload.origem || 'instagram',
          problema_identificado: payload.problema_identificado || '',
          oportunidade_adpulse: payload.oportunidade_adpulse || '',
          score: Number(payload.score || 0),
          comentario_sugerido: payload.comentario_sugerido || '',
          mensagem_sugerida: payload.mensagem_sugerida || '',
          follow_up_sugerido: payload.follow_up_sugerido || '',
          estado: payload.estado || 'novo',
          resposta: payload.resposta || '',
          proximo_passo: payload.proximo_passo || '',
          notas: payload.notas || '',
        })
        .select('*')
        .single()

      if (error) throw error

      return res.status(200).json(data)
    }

    if (req.method === 'PATCH') {
      const { id, ...updates } = req.body || {}

      if (!id) {
        return res.status(400).json({
          erro: 'ID do lead em falta.',
        })
      }

      const { data, error } = await supabaseAdmin
        .from('leads_prospeccao')
        .update({
          ...updates,
          data_atualizacao: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error

      return res.status(200).json(data)
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {}

      if (!id) {
        return res.status(400).json({
          erro: 'ID do lead em falta.',
        })
      }

      const { error } = await supabaseAdmin
        .from('leads_prospeccao')
        .delete()
        .eq('id', id)

      if (error) throw error

      return res.status(200).json({
        ok: true,
      })
    }

    return res.status(405).json({
      erro: 'Método não permitido.',
    })
  } catch (error: any) {
    console.error('Erro API admin/leads:', error)

    return res.status(500).json({
      erro: error?.message || 'Erro interno.',
    })
  }
}
