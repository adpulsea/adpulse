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

function getPriceId(plano: string) {
  if (plano === 'pro') {
    return process.env.STRIPE_PRICE_PRO || ''
  }

  if (plano === 'agencia') {
    return process.env.STRIPE_PRICE_AGENCIA || ''
  }

  return ''
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
        erro: 'STRIPE_SECRET_KEY não está configurada na Vercel.',
      })
    }

    const token = getBearerToken(req)

    if (!token) {
      return res.status(401).json({
        erro: 'Tens de iniciar sessão antes de fazer upgrade.',
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

    const plano = String(req.body?.plano || '').toLowerCase()
    const priceId = getPriceId(plano)

    if (!priceId) {
      return res.status(400).json({
        erro: `Preço Stripe não encontrado para o plano: ${plano}`,
      })
    }

    const baseUrl = getBaseUrl(req)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email || undefined,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/painel?pagamento=sucesso&plano=${plano}`,
      cancel_url: `${baseUrl}/precos?pagamento=cancelado`,
      metadata: {
        user_id: user.id,
        email: user.email || '',
        plano,
        origem: 'adpulse',
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          email: user.email || '',
          plano,
          origem: 'adpulse',
        },
      },
      allow_promotion_codes: true,
    })

    return res.status(200).json({
      url: session.url,
    })
  } catch (error: any) {
    console.error('Erro Stripe Checkout:', error)

    return res.status(500).json({
      erro: error?.message || 'Erro ao criar checkout Stripe.',
    })
  }
}
