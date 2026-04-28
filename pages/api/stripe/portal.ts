import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { utilizadorId } = req.body

    if (!utilizadorId) {
      return res.status(400).json({ error: 'Utilizador em falta.' })
    }

    const { data: perfil, error } = await supabase
      .from('perfis')
      .select('stripe_customer_id')
      .eq('id', utilizadorId)
      .single()

    if (error || !perfil?.stripe_customer_id) {
      return res.status(400).json({
        error: 'Cliente Stripe não encontrado.',
      })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://adpulse-pf3b.vercel.app'

    const session = await stripe.billingPortal.sessions.create({
      customer: perfil.stripe_customer_id,
      return_url: `${siteUrl}/painel`,
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Erro portal Stripe:', error)
    return res.status(500).json({ error: 'Erro ao abrir gestão de plano.' })
  }
}
