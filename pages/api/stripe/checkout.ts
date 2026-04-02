// ============================================
// AdPulse — API: Criar sessão de checkout Stripe
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const PRECOS: Record<string, string> = {
  pro:     process.env.STRIPE_PRICE_PRO!,
  agencia: process.env.STRIPE_PRICE_AGENCIA!,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { plano, email, utilizadorId } = req.body

  if (!plano || !PRECOS[plano]) {
    return res.status(400).json({ erro: 'Plano inválido' })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: PRECOS[plano],
          quantity: 1,
        },
      ],
      metadata: {
        utilizadorId,
        plano,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/painel?sucesso=true&plano=${plano}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/precos?cancelado=true`,
    })

    return res.status(200).json({ url: session.url })
  } catch (erro: any) {
    console.error('Erro Stripe:', erro)
    return res.status(500).json({ erro: 'Erro ao criar sessão de pagamento' })
  }
}
