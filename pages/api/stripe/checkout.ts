import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end()
  }

  try {
    const { plano, email, utilizadorId } = req.body

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],

      line_items: [
        {
          price:
            plano === "pro"
              ? process.env.STRIPE_PRICE_PRO
              : process.env.STRIPE_PRICE_AGENCIA,
          quantity: 1,
        },
      ],

      customer_email: email,

      metadata: {
        utilizadorId,
        plano,
      },

      success_url:
        "https://adpulse-pf3b.vercel.app/precos?sucesso=true",

      cancel_url:
        "https://adpulse-pf3b.vercel.app/precos?cancelado=true",
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Erro ao criar checkout" })
  }
}
