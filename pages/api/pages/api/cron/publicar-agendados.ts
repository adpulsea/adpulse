import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization
  const secret = process.env.CRON_SECRET

  if (secret && auth !== `Bearer ${secret}`) {
    return res.status(401).json({ erro: 'Não autorizado.' })
  }

  try {
    const agora = new Date().toISOString()

    const { data: tarefas, error } = await supabaseAdmin
      .from('equipa_adpulse_tarefas')
      .select('*')
      .eq('estado', 'agendado')
      .lte('data_publicacao', agora)
      .limit(20)

    if (error) {
      return res.status(500).json({ erro: error.message })
    }

    if (!tarefas || tarefas.length === 0) {
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Sem publicações pendentes.',
        total: 0,
      })
    }

    const ids = tarefas.map((t) => t.id)

    await supabaseAdmin
      .from('equipa_adpulse_tarefas')
      .update({
        estado: 'publicado',
        publicado_em: agora,
      })
      .in('id', ids)

    return res.status(200).json({
      sucesso: true,
      total: ids.length,
      publicados: ids,
    })
  } catch (error: any) {
    return res.status(500).json({
      erro: error?.message || 'Erro ao publicar agendados.',
    })
  }
}
