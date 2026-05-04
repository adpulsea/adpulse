import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : null

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

function buffer(readable: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    readable.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })

    readable.on('end', () => {
      resolve(Buffer.concat(chunks))
    })

    readable.on('error', reject)
  })
}

function planoFromPrice(priceId?: string | null) {
  if (!priceId) return 'free'

  if (priceId === process.env.STRIPE_PRICE_PRO) {
    return 'pro'
  }

  if (priceId === process.env.STRIPE_PRICE_AGENCIA) {
    return 'agencia'
  }

  return 'pro'
}

async function atualizarPerfil({
  userId,
  plano,
  estado,
  customerId,
  subscriptionId,
  priceId,
}: {
  userId: string
  plano: string
  estado: string
  customerId?: string | null
  subscriptionId?: string | null
  priceId?: string | null
}) {
  if (!userId) return

  const { error } = await supabaseAdmin
    .from('perfis')
    .update({
      plano,
      estado_assinatura: estado,
      stripe_customer_id: customerId || null,
      stripe_subscription_id: subscriptionId || null,
      stripe_price_id: priceId || null,
      plano_atualizado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Erro ao atualizar perfil:', error)
    throw error
  }
}

async function processarCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId =
    session.metadata?.user_id ||
    session.client_reference_id ||
    ''

  const plano = session.metadata?.plano || 'pro'

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id || null

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id || null

  let priceId: string | null = null
  let estado = 'active'

  if (subscriptionId && stripe) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    priceId = subscription.items.data[0]?.price?.id || null
    estado = subscription.status || 'active'
  }

  await atualizarPerfil({
    userId,
    plano,
    estado,
    customerId,
    subscriptionId,
    priceId,
  })
}

async function processarSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id || ''
  const planoMetadata = subscription.metadata?.plano || ''
  const priceId = subscription.items.data[0]?.price?.id || null
  const plano = planoMetadata || planoFromPrice(priceId)

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id || null

  await atualizarPerfil({
    userId,
    plano,
    estado: subscription.status,
    customerId,
    subscriptionId: subscription.id,
    priceId,
  })
}

async function processarSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id || ''

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id || null

  await atualizarPerfil({
    userId,
    plano: 'free',
    estado: 'canceled',
    customerId,
    subscriptionId: subscription.id,
    priceId: subscription.items.data[0]?.price?.id || null,
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      erro: 'Método não permitido.',
    })
  }

  if (!stripe) {
    return res.status(500).json({
      erro: 'STRIPE_SECRET_KEY não configurada.',
    })
  }

  if (!webhookSecret) {
    return res.status(500).json({
      erro: 'STRIPE_WEBHOOK_SECRET não configurada.',
    })
  }

  const signature = req.headers['stripe-signature']

  if (!signature || Array.isArray(signature)) {
    return res.status(400).json({
      erro: 'Assinatura Stripe inválida.',
    })
  }

  let event: Stripe.Event

  try {
    const rawBody = await buffer(req)

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    )
  } catch (error: any) {
    console.error('Erro ao validar webhook Stripe:', error?.message)

    return res.status(400).json({
      erro: `Webhook inválido: ${error?.message}`,
    })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await processarCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await processarSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await processarSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_failed': {
        console.log('Pagamento falhou:', event.id)
        break
      }

      case 'invoice.paid': {
        console.log('Fatura paga:', event.id)
        break
      }

      default:
        console.log(`Evento Stripe ignorado: ${event.type}`)
    }

    return res.status(200).json({
      received: true,
    })
  } catch (error: any) {
    console.error('Erro ao processar webhook Stripe:', error)

    return res.status(500).json({
      erro: error?.message || 'Erro ao processar webhook.',
    })
  }
}
