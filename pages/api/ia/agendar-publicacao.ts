import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ erro: 'Sessão inválida.' })
    }

    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token)

    if (!user) {
      return res.status(401).json({ erro: 'Utilizador não autenticado.' })
    }

    const { tarefa_id, data_publicacao, plataforma = 'instagram', legenda } = req.body

    if (!tarefa_id || !data_publicacao) {
      return res.status(400).json({ erro: 'Faltam dados para agendar.' })
    }

    const { data, error } = await supabaseAdmin
      .from('equipa_adpulse_tarefas')
      .update({
        estado: 'agendado',
        data_publicacao,
        plataforma_publicacao: plataforma,
        legenda_publicacao: legenda || null,
      })
      .eq('id', tarefa_id)
      .eq('utilizador_id', user.id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ erro: error.message })
    }

    return res.status(200).json({
      sucesso: true,
      tarefa: data,
    })
  } catch (error: any) {
    return res.status(500).json({
      erro: error?.message || 'Erro ao agendar publicação.',
    })
  }
}
