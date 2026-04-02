// ============================================
// AdPulse — API: Webhook do Stripe
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const config = {
  api: {
    bodyParser: false,
  },
}

async function lerBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const body = await lerBody(req)
  const sig  = req.headers['stripe-signature'] as string

  let evento: Stripe.Event

  try {
    evento = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook erro:', err.message)
    return res.status(400).json({ erro: `Webhook Error: ${err.message}` })
  }

  switch (evento.type) {

    case 'checkout.session.completed': {
      const session = evento.data.object as Stripe.Checkout.Session
      const { utilizadorId, plano } = session.metadata || {}
      if (utilizadorId && plano) {
        await supabase.from('perfis').update({ plano }).eq('id', utilizadorId)
        console.log(`✅ Plano ${plano} ativado para ${utilizadorId}`)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = evento.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
      if (customer.email) {
        await supabase.from('perfis').update({ plano: 'gratuito' }).eq('email', customer.email)
        console.log(`⚠️ Subscrição cancelada para ${customer.email}`)
      }
      break
    }

    case 'invoice.payment_failed': {
      console.log('❌ Pagamento falhado')
      break
    }
  }

  return res.status(200).json({ recebido: true })
}