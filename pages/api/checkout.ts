import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(301).json({
    error: 'Endpoint antigo. Usa /api/stripe/checkout.',
  })
}
