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

async function atualizarPerfil({
  utilizadorId,
  email,
  plano,
  customerId,
  subscriptionId,
  estado,
  renovaEm,
}: {
  utilizadorId?: string | null
  email?: string | null
  plano: string
  customerId?: string | null
  subscriptionId?: string | null
  estado?: string | null
  renovaEm?: string | null
}) {
  const updateData = {
    plano,
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscriptionId || null,
    plano_estado: estado || 'ativo',
    plano_renova_em: renovaEm || null,
  }

  if (utilizadorId) {
    const { data, error } = await supabase
      .from('perfis')
      .update(updateData)
      .eq('id', utilizadorId)
      .select()

    if (error) throw error
    if (data && data.length > 0) {
      console.log(`✅ Perfil atualizado por ID: ${utilizadorId} → ${plano}`)
      return
    }
  }

  if (email) {
    const { data, error } = await supabase
      .from('perfis')
      .update(updateData)
      .eq('email', email)
      .select()

    if (error) throw error
    if (data && data.length > 0) {
      console.log(`✅ Perfil atualizado por email: ${email} → ${plano}`)
      return
    }
  }

  console.log('⚠️ Nenhum perfil encontrado:', {
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
      const customerId =
        typeof session.customer === 'string' ? session.customer : session.customer?.id || null
      const subscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id || null

      let renovaEm: string | null = null
      let estado = 'ativo'

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        estado = subscription.status || 'active'
        if (subscription.current_period_end) {
          renovaEm = new Date(subscription.current_period_end * 1000).toISOString()
        }
      }

      await atualizarPerfil({
        utilizadorId,
        email,
        plano,
        customerId,
        subscriptionId,
        estado,
        renovaEm,
      })
    }

    if (evento.type === 'customer.subscription.updated') {
      const subscription = evento.data.object as Stripe.Subscription

      const utilizadorId = subscription.metadata?.utilizadorId || null
      const plano = subscription.metadata?.plano || 'pro'
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id

      const renovaEm = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null

      await atualizarPerfil({
        utilizadorId,
        plano,
        customerId,
        subscriptionId: subscription.id,
        estado: subscription.status,
        renovaEm,
      })
    }

    if (evento.type === 'customer.subscription.deleted') {
      const subscription = evento.data.object as Stripe.Subscription

      const utilizadorId = subscription.metadata?.utilizadorId || null
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id

      await atualizarPerfil({
        utilizadorId,
        plano: 'gratuito',
        customerId,
        subscriptionId: subscription.id,
        estado: 'cancelado',
        renovaEm: null,
      })
    }

    if (evento.type === 'invoice.payment_failed') {
      const invoice = evento.data.object as Stripe.Invoice
      console.log('❌ Pagamento falhado:', invoice.customer)
    }

    return res.status(200).json({ recebido: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return res.status(500).json({ erro: 'Erro ao processar webhook.' })
  }
}
