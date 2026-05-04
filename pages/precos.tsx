import Head from 'next/head'
import { useState } from 'react'
import { Check, Loader2, Sparkles, Zap } from 'lucide-react'

type Plano = 'pro' | 'agencia'

export default function Precos() {
  const [loading, setLoading] = useState<Plano | null>(null)
  const [erro, setErro] = useState('')

  const fazerCheckout = async (plano: Plano) => {
    setErro('')
    setLoading(plano)

    try {
      const resp = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plano }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data?.erro || data?.error || 'Erro ao iniciar pagamento.')
      }

      if (!data?.url) {
        throw new Error('A Stripe não devolveu o link de pagamento.')
      }

      window.location.href = data.url
    } catch (e: any) {
      setErro(e?.message || 'Erro ao abrir checkout.')
      setLoading(null)
    }
  }

  return (
    <>
      <Head>
        <title>Preços — AdPulse</title>
        <meta
          name="description"
          content="Escolhe o plano da AdPulse para criar posts, imagens, campanhas e calendários de conteúdo com inteligência artificial."
        />
      </Head>

      <main
        style={{
          minHeight: '100vh',
          background:
            'radial-gradient(circle at top, rgba(124,123,250,0.22), transparent 35%), #070711',
          color: '#fff',
          padding: '48px 20px',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <header style={{ textAlign: 'center', marginBottom: 42 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 13px',
                borderRadius: 999,
                background: 'rgba(124,123,250,0.14)',
                border: '1px solid rgba(124,123,250,0.35)',
                color: '#c4b5fd',
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 18,
              }}
            >
              <Sparkles size={15} />
              Acesso fundador AdPulse
            </div>

            <h1
              style={{
                fontSize: 'clamp(36px, 6vw, 68px)',
                lineHeight: 1,
                margin: 0,
                letterSpacing: '-0.05em',
                fontWeight: 950,
              }}
            >
              Cria conteúdo com IA.
              <br />
              Planeia. Publica melhor.
            </h1>

            <p
              style={{
                maxWidth: 720,
                margin: '22px auto 0',
                color: '#a1a1aa',
                fontSize: 18,
                lineHeight: 1.65,
              }}
            >
              A AdPulse ajuda-te a criar posts, imagens, campanhas e calendário
              editorial para redes sociais em minutos.
            </p>
          </header>

          {erro && (
            <div
              style={{
                maxWidth: 720,
                margin: '0 auto 22px',
                padding: 14,
                borderRadius: 14,
                background: 'rgba(248,113,113,0.12)',
                border: '1px solid rgba(248,113,113,0.35)',
                color: '#fca5a5',
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              {erro}
            </div>
          )}

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 22,
            }}
          >
            <PlanoCard
              icon={<Zap size={24} />}
              nome="AdPulse Pro"
              preco="19€"
              descricao="Para criadores, empreendedores e pequenos negócios que querem criar conteúdo com IA."
              destaque="Mais escolhido"
              features={[
                'Post rápido com IA',
                'Geração de imagens',
                'Calendário de conteúdo',
                'Equipa AdPulse',
                'Histórico e planeamento',
                'Preparação para Instagram, TikTok, LinkedIn e YouTube',
              ]}
              loading={loading === 'pro'}
              disabled={!!loading}
              onClick={() => fazerCheckout('pro')}
            />

            <PlanoCard
              icon={<Sparkles size={24} />}
              nome="AdPulse Agência"
              preco="49€"
              descricao="Para agências, social media managers e equipas que gerem mais conteúdos e campanhas."
              destaque="Para equipas"
              features={[
                'Tudo do plano Pro',
                'Campanhas GOD MODE',
                'Fluxo de equipa IA',
                'Planeamento mensal',
                'Mais capacidade para clientes',
                'Suporte prioritário na fase beta',
              ]}
              loading={loading === 'agencia'}
              disabled={!!loading}
              onClick={() => fazerCheckout('agencia')}
            />
          </section>

          <div
            style={{
              marginTop: 34,
              padding: 18,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#a1a1aa',
              fontSize: 14,
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            Durante a fase de acesso fundador, a AdPulse está focada em criação,
            imagem, calendário e preparação de conteúdos. A publicação automática
            real no Instagram será ativada após ligação completa à Meta API.
          </div>
        </div>
      </main>
    </>
  )
}

function PlanoCard({
  icon,
  nome,
  preco,
  descricao,
  destaque,
  features,
  loading,
  disabled,
  onClick,
}: {
  icon: React.ReactNode
  nome: string
  preco: string
  descricao: string
  destaque: string
  features: string[]
  loading: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <div
      style={{
        position: 'relative',
        padding: 26,
        borderRadius: 24,
        background:
          'linear-gradient(180deg, rgba(17,17,31,0.98), rgba(10,10,18,0.98))',
        border: '1px solid rgba(124,123,250,0.28)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 11px',
          borderRadius: 999,
          background: 'rgba(124,123,250,0.14)',
          color: '#c4b5fd',
          fontSize: 12,
          fontWeight: 800,
          marginBottom: 20,
        }}
      >
        {icon}
        {destaque}
      </div>

      <h2 style={{ fontSize: 28, margin: 0, fontWeight: 950 }}>{nome}</h2>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 7 }}>
        <span style={{ fontSize: 52, fontWeight: 950, letterSpacing: '-0.06em' }}>
          {preco}
        </span>
        <span style={{ color: '#a1a1aa', fontWeight: 700 }}>/ mês</span>
      </div>

      <p style={{ color: '#a1a1aa', lineHeight: 1.6, minHeight: 70 }}>
        {descricao}
      </p>

      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          width: '100%',
          marginTop: 12,
          padding: '14px 16px',
          borderRadius: 14,
          border: 'none',
          background: disabled
            ? 'rgba(124,123,250,0.45)'
            : 'linear-gradient(135deg, #7c7bfa, #f472b6)',
          color: '#fff',
          fontWeight: 900,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          fontSize: 15,
        }}
      >
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            A abrir checkout...
          </>
        ) : (
          'Fazer upgrade'
        )}
      </button>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '24px 0 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 13,
        }}
      >
        {features.map((feature) => (
          <li
            key={feature}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              color: '#e5e7eb',
              fontSize: 14,
              lineHeight: 1.4,
            }}
          >
            <Check size={17} color="#22c55e" style={{ marginTop: 1 }} />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}
