import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { tarefa_id } = req.body

    if (!tarefa_id) {
      return res.status(400).json({ erro: 'Tarefa inválida' })
    }

    // 🔍 buscar tarefa
    const { data: tarefa } = await supabase
      .from('equipa_adpulse_tarefas')
      .select('*')
      .eq('id', tarefa_id)
      .single()

    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' })
    }

    // ⚠️ AQUI É SIMULAÇÃO (depois ligamos à API real do Instagram)
    console.log('📤 A publicar no Instagram...')
    console.log(tarefa.conteudo)

    // ⏳ simular tempo de publicação
    await new Promise(r => setTimeout(r, 1500))

    // ✅ marcar como publicado
    await supabase
      .from('equipa_adpulse_tarefas')
      .update({
        estado: 'publicado',
        publicado_em: new Date().toISOString(),
      })
      .eq('id', tarefa_id)

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Publicado no Instagram (simulado)',
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: 'Erro ao publicar' })
  }
}
