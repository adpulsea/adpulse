import Head from 'next/head'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { CreditCard, Loader2, ArrowLeft, ExternalLink } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { supabase } from '@/lib/supabase'

export default function GerirPlano() {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [plano, setPlano] = useState('')

  useEffect(() => {
    carregarPerfil()
  }, [])

  const carregarPerfil = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) return

    const { data } = await supabase
      .from('perfis')
      .select('plano, estado_assinatura')
      .eq('id', session.user.id)
      .single()

    if (data?.plano) {
      setPlano(data.plano)
    }
  }

  const abrirPortal = async () => {
    setErro('')
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Tens de iniciar sessão para gerir o plano.')
      }

      const resp = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data?.erro || data?.error || 'Erro ao abrir portal Stripe.')
      }

      if (!data?.url) {
        throw new Error('A Stripe não devolveu o link do portal.')
      }

      window.location.href = data.url
    } catch (e: any) {
      setErro(e?.message || 'Erro ao abrir gestão de plano.')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Gerir Plano — AdPulse</title>
      </Head>

      <LayoutPainel titulo="Gerir Plano">
        <div style={containerStyle}>
          <div style={cardStyle}>
            <div style={iconWrapStyle}>
              <CreditCard size={30} />
            </div>

            <h1 style={titleStyle}>Gerir plano e faturação</h1>

            <p style={textStyle}>
              Aqui podes abrir a área segura da Stripe para gerir a tua assinatura,
              método de pagamento, faturas e cancelamento.
            </p>

            <div style={planBoxStyle}>
              <span style={{ opacity: 0.7 }}>Plano atual</span>
              <strong style={{ textTransform: 'capitalize' }}>
                {plano || 'A carregar...'}
              </strong>
            </div>

            {erro && (
              <div style={errorStyle}>
                {erro}
              </div>
            )}

            <div style={actionsStyle}>
              <button
                onClick={() => {
                  window.location.href = '/painel'
                }}
                style={secondaryButtonStyle}
              >
                <ArrowLeft size={16} />
                Voltar ao painel
              </button>

              <button
                onClick={abrirPortal}
                disabled={loading}
                style={{
                  ...primaryButtonStyle,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} />
                    A abrir...
                  </>
                ) : (
                  <>
                    <ExternalLink size={16} />
                    Abrir gestão na Stripe
                  </>
                )}
              </button>
            </div>

            <div style={noteStyle}>
              Se ainda estás no plano gratuito ou se o pagamento foi feito antes do webhook
              estar ativo, pode ser necessário fazer novo upgrade ou associar manualmente o
              cliente Stripe ao teu perfil.
            </div>
          </div>
        </div>
      </LayoutPainel>
    </>
  )
}

const containerStyle: CSSProperties = {
  maxWidth: 760,
  margin: '0 auto',
  padding: '40px 20px',
}

const cardStyle: CSSProperties = {
  borderRadius: 24,
  border: '1px solid rgba(124,123,250,0.28)',
  background:
    'linear-gradient(180deg, rgba(17,17,31,0.98), rgba(10,10,18,0.98))',
  padding: 30,
  color: '#fff',
  boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
}

const iconWrapStyle: CSSProperties = {
  width: 62,
  height: 62,
  borderRadius: 18,
  background: 'rgba(124,123,250,0.16)',
  color: '#a5b4fc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20,
}

const titleStyle: CSSProperties = {
  fontSize: 32,
  lineHeight: 1.1,
  fontWeight: 950,
  margin: 0,
  letterSpacing: '-0.04em',
}

const textStyle: CSSProperties = {
  color: '#a1a1aa',
  fontSize: 15,
  lineHeight: 1.65,
  marginTop: 14,
}

const planBoxStyle: CSSProperties = {
  marginTop: 22,
  padding: 16,
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#111320',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
}

const errorStyle: CSSProperties = {
  marginTop: 18,
  padding: 14,
  borderRadius: 14,
  background: 'rgba(248,113,113,0.12)',
  border: '1px solid rgba(248,113,113,0.35)',
  color: '#fecaca',
  fontSize: 14,
  lineHeight: 1.5,
}

const actionsStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  marginTop: 24,
}

const primaryButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '12px 16px',
  borderRadius: 12,
  border: 'none',
  background: '#7c7bfa',
  color: '#fff',
  fontWeight: 900,
  cursor: 'pointer',
}

const secondaryButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#151523',
  color: '#fff',
  fontWeight: 900,
  cursor: 'pointer',
}

const noteStyle: CSSProperties = {
  marginTop: 22,
  padding: 14,
  borderRadius: 14,
  background: 'rgba(245,158,11,0.10)',
  border: '1px solid rgba(245,158,11,0.25)',
  color: '#fbbf24',
  fontSize: 13,
  lineHeight: 1.55,
}
