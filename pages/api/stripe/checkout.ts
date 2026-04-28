import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_IDS: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  agencia: process.env.STRIPE_PRICE_AGENCIA,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { plano, email, utilizadorId } = req.body

    if (!plano || !email || !utilizadorId) {
      return res.status(400).json({
        error: 'Faltam dados: plano, email ou utilizadorId.',
      })
    }

    const priceId = PRICE_IDS[plano]

    if (!priceId) {
      return res.status(400).json({
        error: 'Price ID inválido ou não configurado no Vercel.',
      })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://adpulse-pf3b.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        utilizadorId,
        plano,
      },
      subscription_data: {
        metadata: {
          utilizadorId,
          plano,
        },
      },
      success_url: `${siteUrl}/painel?sucesso_plano=true`,
      cancel_url: `${siteUrl}/painel?cancelado_plano=true`,
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Erro checkout Stripe:', error)
    return res.status(500).json({ error: 'Erro ao criar checkout.' })
  }
}
