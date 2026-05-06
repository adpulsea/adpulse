import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

function adminToken() {
  const password = process.env.ADMIN_PASSWORD || ''
  return crypto.createHash('sha256').update(password).digest('hex')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieToken = req.cookies?.admin_session || ''
  const expectedToken = adminToken()

  if (!expectedToken || cookieToken !== expectedToken) {
    return res.status(401).json({
      autenticado: false,
    })
  }

  return res.status(200).json({
    autenticado: true,
  })
}
