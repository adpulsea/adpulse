// ============================================
// AdPulse — API: Email de Boas-vindas
// ============================================

import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, nome } = req.body

  if (!email) return res.status(400).json({ erro: 'Email em falta' })

  const primeiroNome = nome?.split(' ')[0] || email.split('@')[0]

  try {
    await resend.emails.send({
      from: 'AdPulse <onboarding@resend.dev>',
      to: email,
      subject: '🚀 Bem-vindo à AdPulse — começa a criar conteúdo viral!',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'DM Sans',Arial,sans-serif;color:#f0f0f5;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:40px;height:40px;border-radius:12px;background:#7c7bfa;display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-size:20px;font-weight:800;">⚡</span>
        </div>
        <span style="font-size:22px;font-weight:800;color:#f0f0f5;">AdPulse</span>
      </div>
    </div>

    <!-- Card principal -->
    <div style="background:#111118;border:1px solid #22222e;border-radius:24px;padding:40px;margin-bottom:24px;">

      <!-- Saudação -->
      <h1 style="font-size:26px;font-weight:800;color:#f0f0f5;margin:0 0 8px;line-height:1.3;">
        Olá, ${primeiroNome}! 👋
      </h1>
      <p style="font-size:16px;color:#8888aa;margin:0 0 32px;line-height:1.6;">
        A tua conta AdPulse está ativa. Estás a um passo de criar conteúdo viral com IA!
      </p>

      <!-- Divisor -->
      <div style="height:1px;background:#22222e;margin-bottom:32px;"></div>

      <!-- O que podes fazer -->
      <p style="font-size:13px;font-weight:600;color:#7c7bfa;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">
        O que podes fazer agora
      </p>

      ${[
        { emoji: '✨', titulo: 'Gerar conteúdo com IA', desc: 'Cria legendas, hooks e hashtags em segundos para Instagram, TikTok e mais.' },
        { emoji: '📅', titulo: 'Planear o teu calendário', desc: 'Organiza toda a tua semana de conteúdo num só lugar.' },
        { emoji: '🖼️', titulo: 'Carregar as tuas imagens', desc: 'Guarda todas as tuas fotos e vídeos na Biblioteca de Média.' },
        { emoji: '🤖', titulo: 'Falar com os nossos agentes', desc: 'Tens dúvidas? O nosso agente de suporte responde em segundos.' },
      ].map(item => `
        <div style="display:flex;gap:14px;margin-bottom:20px;align-items:flex-start;">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(124,123,250,0.12);border:1px solid rgba(124,123,250,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;">
            ${item.emoji}
          </div>
          <div>
            <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#f0f0f5;">${item.titulo}</p>
            <p style="margin:0;font-size:13px;color:#8888aa;line-height:1.5;">${item.desc}</p>
          </div>
        </div>
      `).join('')}

      <!-- Divisor -->
      <div style="height:1px;background:#22222e;margin:32px 0;"></div>

      <!-- Plano gratuito info -->
      <div style="background:rgba(124,123,250,0.06);border:1px solid rgba(124,123,250,0.15);border-radius:14px;padding:20px;margin-bottom:32px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#7c7bfa;">🆓 Plano Gratuito ativo</p>
        <p style="margin:0;font-size:13px;color:#8888aa;line-height:1.5;">
          Tens 3 gerações por dia. Quando estiveres pronto para crescer mais rápido, faz upgrade para o plano Pro por apenas 19€/mês.
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;">
        <a href="https://adpulse-pf3b.vercel.app/painel"
          style="display:inline-block;padding:14px 32px;background:#7c7bfa;color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:600;">
          Entrar no painel →
        </a>
      </div>
    </div>

    <!-- Dica rápida -->
    <div style="background:#111118;border:1px solid #22222e;border-radius:16px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#fbbf24;">💡 Dica para começar</p>
      <p style="margin:0;font-size:13px;color:#8888aa;line-height:1.6;">
        Vai ao <strong style="color:#f0f0f5;">AI Content Studio</strong> e escreve sobre o que é o teu negócio ou nicho. A IA gera uma legenda completa com hashtags em menos de 30 segundos!
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;">
      <p style="margin:0 0 12px;font-size:13px;color:#555566;">
        Recebeste este email porque criaste uma conta na AdPulse.
      </p>
      <div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;">
        <a href="https://adpulse-pf3b.vercel.app/termos" style="font-size:12px;color:#555566;text-decoration:none;">Termos de Serviço</a>
        <a href="https://adpulse-pf3b.vercel.app/privacidade" style="font-size:12px;color:#555566;text-decoration:none;">Política de Privacidade</a>
        <a href="https://adpulse-pf3b.vercel.app/painel/agentes/atendimento" style="font-size:12px;color:#555566;text-decoration:none;">Suporte</a>
      </div>
      <p style="margin:16px 0 0;font-size:12px;color:#333344;">
        © 2026 AdPulse. Todos os direitos reservados.
      </p>
    </div>

  </div>
</body>
</html>
      `,
    })

    return res.status(200).json({ sucesso: true })
  } catch (erro: any) {
    console.error('Erro ao enviar email:', erro)
    return res.status(500).json({ erro: 'Erro ao enviar email' })
  }
}
