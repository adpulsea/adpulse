import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

function adminToken() {
  const password = process.env.ADMIN_PASSWORD || ''
  return crypto.createHash('sha256').update(password).digest('hex')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido.' })
  }

  const adminPassword = process.env.ADMIN_PASSWORD || ''
  const password = String(req.body?.password || '')

  if (!adminPassword) {
    return res.status(500).json({
      erro: 'ADMIN_PASSWORD não está configurada na Vercel.',
    })
  }

  if (password !== adminPassword) {
    return res.status(401).json({
      erro: 'Senha de administrador incorreta.',
    })
  }

  const token = adminToken()

  res.setHeader(
    'Set-Cookie',
    `admin_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`
  )

  return res.status(200).json({
    ok: true,
  })
}
