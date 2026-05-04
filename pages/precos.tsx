import Head from 'next/head'
import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Check,
  X,
  Zap,
  Building2,
  Sparkles,
  ArrowRight,
  Loader2,
  Star,
} from 'lucide-react'

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

  const comecarGratis = () => {
    window.location.href = '/auth/registar'
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
            'radial-gradient(circle at top, rgba(124,123,250,0.24), transparent 36%), #070711',
          color: '#fff',
          padding: '56px 20px',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <header style={{ textAlign: 'center', marginBottom: 48 }}>
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
                fontWeight: 900,
                marginBottom: 18,
              }}
            >
              <Sparkles size={15} />
              Acesso fundador AdPulse
            </div>

            <h1
              style={{
                fontSize: 'clamp(42px, 7vw, 76px)',
                lineHeight: 0.95,
                margin: 0,
                letterSpacing: '-0.06em',
                fontWeight: 950,
              }}
            >
              Escolhe o teu plano
            </h1>

            <p
              style={{
                maxWidth: 650,
                margin: '20px auto 0',
                color: '#a1a1aa',
                fontSize: 17,
                lineHeight: 1.65,
              }}
            >
              Começa grátis. Faz upgrade quando estiveres pronto para criar mais conteúdo,
              organizar melhor o calendário e crescer com IA.
            </p>

            <div
              style={{
                display: 'inline-flex',
                marginTop: 24,
                padding: 5,
                borderRadius: 12,
                background: '#11111c',
                border: '1px solid rgba(255,255,255,0.10)',
                gap: 4,
              }}
            >
              <span
                style={{
                  padding: '8px 18px',
                  borderRadius: 9,
                  background: '#181827',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                Mensal
              </span>
              <span
                style={{
                  padding: '8px 18px',
                  borderRadius: 9,
                  color: '#8b8ba7',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                Anual <strong style={{ color: '#22c55e' }}>-20%</strong>
              </span>
            </div>
          </header>

          {erro && (
            <div
              style={{
                maxWidth: 760,
                margin: '0 auto 24px',
                padding: 16,
                borderRadius: 14,
                background: 'rgba(248,113,113,0.12)',
                border: '1px solid rgba(248,113,113,0.35)',
                color: '#fecaca',
                fontSize: 14,
                textAlign: 'center',
                fontWeight: 700,
              }}
            >
              {erro}
            </div>
          )}

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: 24,
              alignItems: 'stretch',
            }}
          >
            <PlanoCard
              icon={<span style={{ fontSize: 22 }}>🆓</span>}
              nome="Gratuito"
              subtitulo="Para começar e experimentar"
              preco="0€"
              botao="Começar grátis"
              destaque=""
              features={[
                { texto: '3 gerações por dia', ativo: true },
                { texto: 'AI Content Studio básico', ativo: true },
                { texto: 'Calendário de conteúdo', ativo: true },
                { texto: '1 workspace', ativo: true },
                { texto: 'Biblioteca de média (500MB)', ativo: true },
                { texto: 'Gerações ilimitadas', ativo: false },
                { texto: 'Viral Lab completo', ativo: false },
                { texto: 'Creator Analyzer', ativo: false },
                { texto: 'Automação de DMs', ativo: false },
                { texto: 'Suporte prioritário', ativo: false },
              ]}
              onClick={comecarGratis}
              loading={false}
              disabled={!!loading}
              variant="free"
            />

            <PlanoCard
              icon={<Zap size={24} />}
              nome="Pro"
              subtitulo="Para criadores a crescer"
              preco="19€"
              botao="Começar Pro"
              destaque="MAIS POPULAR"
              features={[
                { texto: 'Gerações ilimitadas por dia', ativo: true },
                { texto: 'AI Content Studio completo', ativo: true },
                { texto: 'Calendário com geração automática', ativo: true },
                { texto: 'Workspaces ilimitados', ativo: true },
                { texto: 'Biblioteca de média (10GB)', ativo: true },
                { texto: 'Viral Lab completo', ativo: true },
                { texto: 'Creator Analyzer', ativo: true },
                { texto: 'Automação de DMs e comentários', ativo: true },
                { texto: 'Agentes IA', ativo: true },
                { texto: 'Suporte prioritário', ativo: true },
              ]}
              onClick={() => fazerCheckout('pro')}
              loading={loading === 'pro'}
              disabled={!!loading}
              variant="pro"
            />

            <PlanoCard
              icon={<Building2 size={24} />}
              nome="Agência"
              subtitulo="Para agências e equipas"
              preco="49€"
              botao="Começar Agência"
              destaque=""
              features={[
                { texto: 'Tudo do plano Pro', ativo: true },
                { texto: 'Até 5 subcontas de clientes', ativo: true },
                { texto: 'Biblioteca de média (50GB)', ativo: true },
                { texto: 'Relatórios PDF para clientes', ativo: true },
                { texto: 'Painel de gestão de clientes', ativo: true },
                { texto: 'API access', ativo: true },
                { texto: 'Onboarding personalizado', ativo: true },
                { texto: 'Gestor de conta dedicado', ativo: true },
                { texto: 'Faturação empresarial', ativo: true },
                { texto: 'Suporte dedicado', ativo: true },
              ]}
              onClick={() => fazerCheckout('agencia')}
              loading={loading === 'agencia'}
              disabled={!!loading}
              variant="agencia"
            />
          </section>

          <section style={{ marginTop: 70 }}>
            <h2
              style={{
                textAlign: 'center',
                fontSize: 30,
                fontWeight: 950,
                letterSpacing: '-0.03em',
                marginBottom: 28,
              }}
            >
              O que dizem os nossos utilizadores
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 20,
              }}
            >
              <Testemunho
                nome="Ana Silva"
                cargo="Criadora de conteúdo"
                texto="Em 30 dias cresci 5k seguidores no Instagram. A IA gera conteúdo melhor que eu."
              />
              <Testemunho
                nome="Pedro Costa"
                cargo="Empreendedor"
                texto="Poupei 10h por semana de planeamento. O calendário automático é incrível."
              />
              <Testemunho
                nome="Maria João"
                cargo="Gestora de redes sociais"
                texto="Giro 8 clientes com a AdPulse. Não imagino trabalhar sem isto."
              />
            </div>
          </section>

          <div
            style={{
              marginTop: 42,
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
            Nesta fase, a AdPulse está focada em criação de posts, imagens,
            campanhas, calendário editorial e preparação de conteúdos. A publicação
            automática real no Instagram será ativada após ligação completa à Meta API.
          </div>
        </div>
      </main>
    </>
  )
}

function PlanoCard({
  icon,
  nome,
  subtitulo,
  preco,
  botao,
  destaque,
  features,
  onClick,
  loading,
  disabled,
  variant,
}: {
  icon: ReactNode
  nome: string
  subtitulo: string
  preco: string
  botao: string
  destaque: string
  features: { texto: string; ativo: boolean }[]
  onClick: () => void
  loading: boolean
  disabled: boolean
  variant: 'free' | 'pro' | 'agencia'
}) {
  const isPro = variant === 'pro'

  return (
    <div
      style={{
        position: 'relative',
        padding: 28,
        borderRadius: 24,
        background:
          isPro
            ? 'linear-gradient(180deg, rgba(28,26,52,0.98), rgba(17,17,30,0.98))'
            : 'linear-gradient(180deg, rgba(17,17,31,0.98), rgba(10,10,18,0.98))',
        border: isPro
          ? '1px solid rgba(124,123,250,0.75)'
          : '1px solid rgba(255,255,255,0.12)',
        boxShadow: isPro
          ? '0 24px 90px rgba(124,123,250,0.18)'
          : '0 24px 80px rgba(0,0,0,0.30)',
        transform: isPro ? 'translateY(-8px)' : 'none',
      }}
    >
      {destaque && (
        <div
          style={{
            position: 'absolute',
            top: -16,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '7px 14px',
            borderRadius: 999,
            background: '#7c7bfa',
            color: '#fff',
            fontSize: 12,
            fontWeight: 950,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            whiteSpace: 'nowrap',
          }}
        >
          <Star size={13} fill="white" />
          {destaque}
        </div>
      )}

      <div style={{ color: isPro ? '#f59e0b' : '#a78bfa', marginBottom: 16 }}>
        {icon}
      </div>

      <h2 style={{ fontSize: 25, margin: 0, fontWeight: 950 }}>{nome}</h2>

      <p style={{ marginTop: 9, color: '#9ca3af', fontSize: 14 }}>
        {subtitulo}
      </p>

      <div
        style={{
          marginTop: 28,
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 58,
            fontWeight: 950,
            letterSpacing: '-0.08em',
            color: isPro ? '#8b7cff' : variant === 'agencia' ? '#c084fc' : '#d4d4d8',
          }}
        >
          {preco}
        </span>
        {variant !== 'free' && (
          <span style={{ color: '#9ca3af', fontWeight: 700 }}>/mês</span>
        )}
      </div>

      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          width: '100%',
          marginTop: 20,
          padding: '14px 16px',
          borderRadius: 14,
          border: variant === 'free' ? '1px solid rgba(255,255,255,0.13)' : 'none',
          background:
            variant === 'free'
              ? '#181827'
              : disabled
                ? 'rgba(124,123,250,0.45)'
                : variant === 'agencia'
                  ? 'rgba(244,114,182,0.14)'
                  : '#7c7bfa',
          color:
            variant === 'agencia'
              ? '#f0abfc'
              : '#fff',
          fontWeight: 950,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          fontSize: 15,
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {loading ? (
          <>
            <Loader2 size={17} />
            A abrir checkout...
          </>
        ) : (
          <>
            {botao}
            <ArrowRight size={15} />
          </>
        )}
      </button>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '24px 0 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {features.map((feature) => (
          <li
            key={feature.texto}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              color: feature.ativo ? '#f4f4f5' : '#5b5b70',
              fontSize: 14,
              lineHeight: 1.4,
              fontWeight: feature.ativo ? 700 : 500,
            }}
          >
            {feature.ativo ? (
              <Check size={16} color="#22c55e" style={{ marginTop: 1 }} />
            ) : (
              <X size={16} color="#52525b" style={{ marginTop: 1 }} />
            )}
            {feature.texto}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Testemunho({
  nome,
  cargo,
  texto,
}: {
  nome: string
  cargo: string
  texto: string
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.10)',
        background: '#10101a',
        padding: 24,
      }}
    >
      <div style={{ color: '#fbbf24', marginBottom: 14 }}>★★★★★</div>
      <p style={{ color: '#b8b8c8', fontSize: 14, lineHeight: 1.6 }}>
        "{texto}"
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: '#312e81',
            color: '#c4b5fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {nome
            .split(' ')
            .map((p) => p[0])
            .join('')
            .slice(0, 2)}
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 14 }}>{nome}</div>
          <div style={{ color: '#8b8ba7', fontSize: 12 }}>{cargo}</div>
        </div>
      </div>
    </div>
  )
}
