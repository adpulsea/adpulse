import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
})

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end()
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: "price_1TP4NXRqDKHnwMBRyLei4eHU",
        quantity: 1,
      },
    ],
    success_url: "https://adpulse-pf3b-git-master-adpulsea-3423s-projects.vercel.app/dashboard",
    cancel_url: "https://adpulse-pf3b-git-master-adpulsea-3423s-projects.vercel.app/pricing",
  })

  res.status(200).json({ url: session.url })
}
