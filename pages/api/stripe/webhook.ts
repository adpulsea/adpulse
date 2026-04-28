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

async function atualizarPlano({
  utilizadorId,
  email,
  plano,
}: {
  utilizadorId?: string | null
  email?: string | null
  plano: string
}) {
  if (utilizadorId) {
    const { data, error } = await supabase
      .from('perfis')
      .update({ plano })
      .eq('id', utilizadorId)
      .select()

    if (error) throw error

    if (data && data.length > 0) {
      console.log(`✅ Plano atualizado por ID: ${utilizadorId} → ${plano}`)
      return
    }
  }

  if (email) {
    const { data, error } = await supabase
      .from('perfis')
      .update({ plano })
      .eq('email', email)
      .select()

    if (error) throw error

    if (data && data.length > 0) {
      console.log(`✅ Plano atualizado por email: ${email} → ${plano}`)
      return
    }
  }

  console.log('⚠️ Nenhum perfil encontrado para atualizar:', {
    utilizadorId,
    email,
    plano,
  })
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
    console.error('Erro assinatura webhook:', err.message)
    return res.status(400).json({ erro: err.message })
  }

  try {
    if (evento.type === 'checkout.session.completed') {
      const session = evento.data.object as Stripe.Checkout.Session

      const utilizadorId = session.metadata?.utilizadorId || null
      const plano = session.metadata?.plano || 'pro'
      const email = session.customer_email || session.customer_details?.email || null

      console.log('✅ checkout.session.completed:', {
        utilizadorId,
        plano,
        email,
        metadata: session.metadata,
      })

      await atualizarPlano({ utilizadorId, email, plano })
    }

    if (evento.type === 'customer.subscription.updated') {
      const subscription = evento.data.object as Stripe.Subscription

      const utilizadorId = subscription.metadata?.utilizadorId || null
      const plano = subscription.metadata?.plano || 'pro'

      console.log('✅ customer.subscription.updated:', {
        utilizadorId,
        plano,
        metadata: subscription.metadata,
      })

      await atualizarPlano({ utilizadorId, plano })
    }

    if (evento.type === 'customer.subscription.deleted') {
      const subscription = evento.data.object as Stripe.Subscription
      const utilizadorId = subscription.metadata?.utilizadorId || null

      console.log('⚠️ customer.subscription.deleted:', {
        utilizadorId,
        metadata: subscription.metadata,
      })

      await atualizarPlano({ utilizadorId, plano: 'gratuito' })
    }

    return res.status(200).json({ recebido: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return res.status(500).json({ erro: 'Erro ao processar webhook.' })
  }
}
