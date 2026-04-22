import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
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
    success_url: "https://TEU-DOMINIO/dashboard",
    cancel_url: "https://TEU-DOMINIO/pricing",
  })

  res.status(200).json({ url: session.url })
}
