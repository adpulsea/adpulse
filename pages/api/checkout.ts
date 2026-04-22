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
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1TP4NXRqDKHnwMBRyLei4eHU",
          quantity: 1,
        },
      ],
      success_url:
        "https://adpulse-pf3b-git-master-adpulsea-3423s-projects.vercel.app",
      cancel_url:
        "https://adpulse-pf3b-git-master-adpulsea-3423s-projects.vercel.app",
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Erro ao criar checkout" })
  }
}
