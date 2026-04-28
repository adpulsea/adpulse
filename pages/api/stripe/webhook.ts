import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const config = {
  api: {
    bodyParser: false,
  },
}

async function lerBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function atualizarPlanoPorMetadata(metadata?: Stripe.Metadata | null) {
  const utilizadorId = metadata?.utilizadorId
  const plano = metadata?.plano

  if (!utilizadorId || !plano) return

  const { error } = await supabase
    .from('perfis')
    .update({ plano })
    .eq('id', utilizadorId)

  if (error) {
    console.error('Erro ao atualizar plano:', error)
  } else {
    console.log(`✅ Plano ${plano} ativado para ${utilizadorId}`)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const body = await lerBody(req)
  const sig = req.headers['stripe-signature'] as string

  let evento: Stripe.Event

  try {
    evento = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook erro:', err.message)
    return res.status(400).json({ erro: `Webhook Error: ${err.message}` })
  }

  try {
    switch (evento.type) {
      case 'checkout.session.completed': {
        const session = evento.data.object as Stripe.Checkout.Session
        await atualizarPlanoPorMetadata(session.metadata)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = evento.data.object as Stripe.Subscription
        await atualizarPlanoPorMetadata(subscription.metadata)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = evento.data.object as Stripe.Subscription
        const utilizadorId = subscription.metadata?.utilizadorId

        if (utilizadorId) {
          await supabase
            .from('perfis')
            .update({ plano: 'gratuito' })
            .eq('id', utilizadorId)

          console.log(`⚠️ Plano revogado para ${utilizadorId}`)
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = evento.data.object as Stripe.Invoice
        console.log('❌ Pagamento falhado:', invoice.customer)
        break
      }
    }

    return res.status(200).json({ recebido: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return res.status(500).json({ erro: 'Erro ao processar webhook.' })
  }
}
