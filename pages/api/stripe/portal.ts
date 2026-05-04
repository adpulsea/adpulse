import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : null

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

function getBaseUrl(req: NextApiRequest) {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ''

  if (envUrl) return envUrl.replace(/\/$/, '')

  const host = req.headers.host
  const protocol = host?.includes('localhost') ? 'http' : 'https'

  return `${protocol}://${host}`
}

function getBearerToken(req: NextApiRequest) {
  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) return ''
  return auth.replace('Bearer ', '').trim()
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      erro: 'Método não permitido.',
    })
  }

  try {
    if (!stripe) {
      return res.status(500).json({
        erro: 'STRIPE_SECRET_KEY não está configurada.',
      })
    }

    const token = getBearerToken(req)

    if (!token) {
      return res.status(401).json({
        erro: 'Tens de iniciar sessão para gerir o plano.',
      })
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return res.status(401).json({
        erro: 'Sessão inválida. Faz login novamente.',
      })
    }

    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from('perfis')
      .select('id, plano, estado_assinatura, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (perfilError || !perfil) {
      return res.status(404).json({
        erro: 'Perfil não encontrado.',
      })
    }

    if (!perfil.stripe_customer_id) {
      return res.status(400).json({
        erro: 'Este utilizador ainda não tem cliente Stripe associado. Faz upgrade primeiro.',
      })
    }

    const baseUrl = getBaseUrl(req)

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: perfil.stripe_customer_id,
      return_url: `${baseUrl}/painel?portal=voltar`,
    })

    return res.status(200).json({
      url: portalSession.url,
    })
  } catch (error: any) {
    console.error('Erro ao abrir portal Stripe:', error)

    return res.status(500).json({
      erro: error?.message || 'Erro ao abrir gestão de plano.',
    })
  }
}
