import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : null

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
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/painel?pagamento=sucesso&plano=${plano}`,
      cancel_url: `${baseUrl}/precos?pagamento=cancelado`,
      metadata: {
        plano,
        origem: 'adpulse',
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
