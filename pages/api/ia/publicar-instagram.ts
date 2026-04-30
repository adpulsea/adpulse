import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

function limparLegenda(texto?: string | null) {
  return (texto || '').trim().slice(0, 2200)
}

async function publicarNaMetaInstagram({
  imageUrl,
  caption,
}: {
  imageUrl: string
  caption: string
}) {
  const accessToken = process.env.META_ACCESS_TOKEN
  const instagramBusinessId = process.env.INSTAGRAM_BUSINESS_ID

  if (!accessToken || !instagramBusinessId) {
    return {
      modo: 'simulado',
      mensagem: 'Publicado em modo simulado. Falta META_ACCESS_TOKEN ou INSTAGRAM_BUSINESS_ID.',
    }
  }

  const criarMediaUrl = `https://graph.facebook.com/v19.0/${instagramBusinessId}/media`

  const mediaResp = await fetch(criarMediaUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      caption,
      access_token: accessToken,
    }),
  })

  const mediaData = await mediaResp.json()

  if (!mediaResp.ok || !mediaData?.id) {
    throw new Error(mediaData?.error?.message || 'Erro ao criar media container no Instagram.')
  }

  const publishUrl = `https://graph.facebook.com/v19.0/${instagramBusinessId}/media_publish`

  const publishResp = await fetch(publishUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      creation_id: mediaData.id,
      access_token: accessToken,
    }),
  })

  const publishData = await publishResp.json()

  if (!publishResp.ok || !publishData?.id) {
    throw new Error(publishData?.error?.message || 'Erro ao publicar no Instagram.')
  }

  return {
    modo: 'real',
    instagram_post_id: publishData.id,
    mensagem: 'Publicado no Instagram com sucesso.',
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido.' })
  }

  try {
    const { tarefa_id, post_id } = req.body

    if (!tarefa_id && !post_id) {
      return res.status(400).json({ erro: 'Falta tarefa_id ou post_id.' })
    }

    let origem: 'tarefa' | 'post' = 'tarefa'
    let item: any = null

    if (post_id) {
      origem = 'post'

      const { data, error } = await supabaseAdmin
        .from('posts')
        .select('*')
        .eq('id', post_id)
        .single()

      if (error || !data) {
        return res.status(404).json({ erro: 'Post não encontrado.' })
      }

      item = data
    } else {
      origem = 'tarefa'

      const { data, error } = await supabaseAdmin
        .from('equipa_adpulse_tarefas')
        .select('*')
        .eq('id', tarefa_id)
        .single()

      if (error || !data) {
        return res.status(404).json({ erro: 'Tarefa não encontrada.' })
      }

      item = data
    }

    const imageUrl =
      item.imagem_url ||
      item.image_url ||
      item.media_url ||
      null

    if (!imageUrl) {
      return res.status(400).json({
        erro: 'Este conteúdo ainda não tem imagem_url pública. Gera uma imagem primeiro.',
      })
    }

    const caption = limparLegenda(
      item.legenda ||
      item.legenda_publicacao ||
      item.conteudo ||
      item.titulo
    )

    const resultado = await publicarNaMetaInstagram({
      imageUrl,
      caption,
    })

    const publicado_em = new Date().toISOString()

    if (origem === 'post') {
      await supabaseAdmin
        .from('posts')
        .update({
          estado: 'publicado',
          publicado_em,
        })
        .eq('id', post_id)
    } else {
      await supabaseAdmin
        .from('equipa_adpulse_tarefas')
        .update({
          estado: 'publicado',
          publicado_em,
        })
        .eq('id', tarefa_id)
    }

    return res.status(200).json({
      sucesso: true,
      ...resultado,
      publicado_em,
    })
  } catch (error: any) {
    return res.status(500).json({
      erro: error?.message || 'Erro ao publicar no Instagram.',
    })
  }
}
