import Head from 'next/head'
import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  CalendarDays,
  ImageIcon,
  Bot,
  TrendingUp,
  BarChart3,
  Check,
  Zap,
  PlayCircle,
  Star,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Content Studio',
    text: 'Gera ideias, hooks, legendas e posts para redes sociais em segundos.',
  },
  {
    icon: ImageIcon,
    title: 'Imagem com IA',
    text: 'Cria imagens relacionadas com o conteúdo para acompanhar os teus posts.',
  },
  {
    icon: CalendarDays,
    title: 'Calendário Editorial',
    text: 'Organiza publicações, horários e conteúdos planeados num só lugar.',
  },
  {
    icon: Bot,
    title: 'Equipa AdPulse',
    text: 'Uma equipa de agentes IA para estratégia, copy, design, revisão e planeamento.',
  },
  {
    icon: TrendingUp,
    title: 'Viral Lab',
    text: 'Descobre oportunidades, temas e tendências para criares com mais direção.',
  },
  {
    icon: BarChart3,
    title: 'Creator Analyzer',
    text: 'Analisa perfis, melhora posicionamento e identifica pontos de crescimento.',
  },
]

const PASSOS = [
  {
    title: 'Escolhe o teu objetivo',
    text: 'Define nicho, plataforma e objetivo do conteúdo.',
  },
  {
    title: 'A IA cria o conteúdo',
    text: 'A AdPulse gera post, legenda, hashtags, imagem e sugestões.',
  },
  {
    title: 'Planeia no calendário',
    text: 'Guarda, organiza e prepara as publicações para cada canal.',
  },
]

const TESTEMUNHOS = [
  {
    nome: 'Ana Silva',
    cargo: 'Criadora de conteúdo',
    texto: 'A AdPulse ajudou-me a transformar ideias soltas em posts prontos para publicar.',
  },
  {
    nome: 'Pedro Costa',
    cargo: 'Empreendedor',
    texto: 'Poupei horas por semana a criar conteúdos e a organizar o calendário.',
  },
  {
    nome: 'Maria João',
    cargo: 'Gestora de redes sociais',
    texto: 'A equipa IA facilita muito o planeamento de campanhas para vários clientes.',
  },
]

const PLANOS = [
  {
    nome: 'Gratuito',
    preco: '0€',
    subtitulo: 'Para começar e experimentar',
    href: '/auth/registar',
    cta: 'Começar grátis',
    destaque: '',
    features: [
      '3 gerações por dia',
      'AI Content Studio básico',
      'Calendário de conteúdo',
      '1 workspace',
      'Biblioteca de média básica',
    ],
  },
  {
    nome: 'Pro',
    preco: '19€',
    subtitulo: 'Para criadores e negócios',
    href: '/precos',
    cta: 'Ver plano Pro',
    destaque: 'Mais popular',
    features: [
      'Gerações ilimitadas',
      'Equipa AdPulse',
      'Geração de imagens',
      'Calendário editorial',
      'Viral Lab',
      'Creator Analyzer',
    ],
  },
  {
    nome: 'Agência',
    preco: '49€',
    subtitulo: 'Para equipas e social media managers',
    href: '/precos',
    cta: 'Ver plano Agência',
    destaque: '',
    features: [
      'Tudo do Pro',
      'Campanhas GOD MODE',
      'Fluxo multi-cliente',
      'Relatórios para clientes',
      'Suporte prioritário',
      'Planeamento avançado',
    ],
  },
]

export default function Home() {
  return (
    <>
      <Head>
        <title>AdPulse — Cria conteúdo para redes sociais com IA</title>
        <meta
          name="description"
          content="A AdPulse ajuda criadores, negócios e social media managers a criar posts, imagens e calendários de conteúdo com inteligência artificial."
        />
      </Head>

      <main
        style={{
          minHeight: '100vh',
          background:
            'radial-gradient(circle at top, rgba(124,123,250,0.22), transparent 34%), #070711',
          color: '#fff',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          overflow: 'hidden',
        }}
      >
        <Navbar />

        <section
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            padding: '82px 20px 72px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              background: 'rgba(124,123,250,0.14)',
              border: '1px solid rgba(124,123,250,0.35)',
              color: '#c4b5fd',
              fontSize: 13,
              fontWeight: 900,
              marginBottom: 22,
            }}
          >
            <Sparkles size={15} />
            Plataforma de conteúdo com IA
          </div>

          <h1
            style={{
              fontSize: 'clamp(44px, 8vw, 92px)',
              lineHeight: 0.92,
              margin: 0,
              fontWeight: 950,
              letterSpacing: '-0.075em',
            }}
          >
            Cria posts, imagens
            <br />
            e calendários com IA.
          </h1>

          <p
            style={{
              maxWidth: 760,
              margin: '24px auto 0',
              color: '#b8b8c8',
              fontSize: 19,
              lineHeight: 1.7,
            }}
          >
            A AdPulse ajuda criadores, negócios e social media managers a criar
            conteúdo para Instagram, TikTok, LinkedIn e YouTube sem perder horas
            a planear.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 14,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: 34,
            }}
          >
            <Link href="/auth/registar" style={primaryCtaStyle}>
              Começar grátis
              <ArrowRight size={17} />
            </Link>

            <Link href="/precos" style={secondaryCtaStyle}>
              Ver planos
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
              marginTop: 30,
              color: '#a1a1aa',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <MiniBadge text="Post rápido" />
            <MiniBadge text="Imagem IA" />
            <MiniBadge text="Calendário" />
            <MiniBadge text="Equipa AdPulse" />
          </div>

          <HeroPreview />
        </section>

        <Section label="Funcionalidades" title="Tudo o que precisas para criar melhor">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 18,
            }}
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon

              return (
                <div key={feature.title} style={featureCardStyle}>
                  <div style={featureIconStyle}>
                    <Icon size={20} />
                  </div>
                  <h3 style={cardTitleStyle}>{feature.title}</h3>
                  <p style={cardTextStyle}>{feature.text}</p>
                </div>
              )
            })}
          </div>
        </Section>

        <Section label="Como funciona" title="Em 3 passos simples">
          <div
            style={{
              maxWidth: 760,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {PASSOS.map((passo, index) => (
              <div key={passo.title} style={stepStyle}>
                <div style={stepNumberStyle}>0{index + 1}</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>
                    {passo.title}
                  </h3>
                  <p style={{ margin: '6px 0 0', color: '#a1a1aa', lineHeight: 1.55 }}>
                    {passo.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Prova social" title="O que dizem os criadores">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            {TESTEMUNHOS.map((item) => (
              <div key={item.nome} style={testimonialStyle}>
                <div style={{ color: '#fbbf24', marginBottom: 12 }}>
                  ★★★★★
                </div>
                <p style={{ color: '#c7c7d4', lineHeight: 1.65, margin: 0 }}>
                  “{item.texto}”
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
                  <div style={avatarStyle}>
                    {item.nome
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 900 }}>{item.nome}</div>
                    <div style={{ color: '#8b8ba7', fontSize: 12 }}>{item.cargo}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Preços" title="Simples e transparente">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
              gap: 22,
              alignItems: 'stretch',
            }}
          >
            {PLANOS.map((plano) => (
              <PricingCard key={plano.nome} plano={plano} />
            ))}
          </div>
        </Section>

        <section
          style={{
            maxWidth: 820,
            margin: '0 auto',
            padding: '38px 20px 86px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              borderRadius: 26,
              padding: 34,
              background:
                'linear-gradient(180deg, rgba(124,123,250,0.16), rgba(17,17,31,0.96))',
              border: '1px solid rgba(124,123,250,0.35)',
              boxShadow: '0 30px 90px rgba(0,0,0,0.35)',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(28px, 5vw, 44px)',
                margin: 0,
                fontWeight: 950,
                letterSpacing: '-0.05em',
              }}
            >
              Pronto para criar conteúdo com IA?
            </h2>
            <p
              style={{
                color: '#a1a1aa',
                lineHeight: 1.65,
                margin: '14px auto 24px',
                maxWidth: 560,
              }}
            >
              Começa grátis e cria o teu primeiro post em minutos. Faz upgrade
              quando quiseres desbloquear mais capacidade.
            </p>
            <Link href="/auth/registar" style={primaryCtaStyle}>
              Criar conta grátis
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}

function Navbar() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'rgba(7,7,17,0.78)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 950,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              background: '#7c7bfa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={17} fill="white" />
          </div>
          AdPulse
        </Link>

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            color: '#a1a1aa',
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          <Link href="#funcionalidades" style={navLinkStyle}>
            Funcionalidades
          </Link>
          <Link href="#precos" style={navLinkStyle}>
            Preços
          </Link>
          <Link href="/auth/login" style={navLinkStyle}>
            Entrar
          </Link>
          <Link href="/auth/registar" style={navButtonStyle}>
            Começar grátis
          </Link>
        </nav>
      </div>
    </header>
  )
}

function HeroPreview() {
  return (
    <div
      style={{
        maxWidth: 980,
        margin: '54px auto 0',
        borderRadius: 28,
        border: '1px solid rgba(255,255,255,0.11)',
        background:
          'linear-gradient(180deg, rgba(20,20,38,0.95), rgba(10,10,18,0.98))',
        padding: 18,
        boxShadow: '0 30px 120px rgba(0,0,0,0.42)',
      }}
    >
      <div
        style={{
          borderRadius: 20,
          background: '#0b0b15',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: 14,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={dotStyle('#ef4444')} />
          <span style={dotStyle('#f59e0b')} />
          <span style={dotStyle('#22c55e')} />
          <span style={{ color: '#8b8ba7', fontSize: 12, marginLeft: 8 }}>
            /painel/agentes
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            padding: 20,
          }}
        >
          <div style={previewCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c4b5fd', fontWeight: 900 }}>
              <Bot size={18} />
              Equipa AdPulse
            </div>
            <h3 style={{ fontSize: 24, margin: '18px 0 8px', lineHeight: 1.1 }}>
              Post rápido criado com IA
            </h3>
            <p style={{ color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>
              Ideia, legenda, hashtags, CTA e imagem preparados para publicação.
            </p>
          </div>

          <div style={previewCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#86efac', fontWeight: 900 }}>
              <CalendarDays size={18} />
              Calendário
            </div>
            <h3 style={{ fontSize: 24, margin: '18px 0 8px', lineHeight: 1.1 }}>
              Planeamento organizado
            </h3>
            <p style={{ color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>
              Guarda conteúdos com ou sem imagem e prepara a semana com clareza.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children: React.ReactNode
}) {
  const id = label === 'Funcionalidades' ? 'funcionalidades' : label === 'Preços' ? 'precos' : undefined

  return (
    <section
      id={id}
      style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '72px 20px',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 34 }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '6px 12px',
              borderRadius: 999,
              background: 'rgba(124,123,250,0.14)',
              color: '#a5b4fc',
              fontSize: 12,
              fontWeight: 900,
              marginBottom: 14,
            }}
          >
            {label}
          </div>
          <h2
            style={{
              fontSize: 'clamp(30px, 5vw, 48px)',
              margin: 0,
              fontWeight: 950,
              letterSpacing: '-0.05em',
            }}
          >
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  )
}

function MiniBadge({ text }: { text: string }) {
  return (
    <span
      style={{
        padding: '8px 12px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.09)',
        background: 'rgba(255,255,255,0.04)',
      }}
    >
      {text}
    </span>
  )
}

function PricingCard({ plano }: { plano: typeof PLANOS[number] }) {
  const isPro = plano.nome === 'Pro'

  return (
    <div
      style={{
        position: 'relative',
        padding: 24,
        borderRadius: 22,
        background: isPro
          ? 'linear-gradient(180deg, rgba(31,28,59,0.98), rgba(15,15,28,0.98))'
          : '#10101a',
        border: isPro
          ? '1px solid rgba(124,123,250,0.72)'
          : '1px solid rgba(255,255,255,0.10)',
        boxShadow: isPro ? '0 24px 80px rgba(124,123,250,0.18)' : 'none',
      }}
    >
      {plano.destaque && (
        <div
          style={{
            position: 'absolute',
            top: -14,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 12px',
            borderRadius: 999,
            background: '#7c7bfa',
            color: '#fff',
            fontSize: 11,
            fontWeight: 950,
          }}
        >
          {plano.destaque}
        </div>
      )}

      <h3 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>{plano.nome}</h3>
      <p style={{ color: '#8b8ba7', margin: '8px 0 20px', fontSize: 14 }}>
        {plano.subtitulo}
      </p>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span
          style={{
            fontSize: 48,
            fontWeight: 950,
            letterSpacing: '-0.07em',
            color: isPro ? '#8b7cff' : '#fff',
          }}
        >
          {plano.preco}
        </span>
        {plano.nome !== 'Gratuito' && (
          <span style={{ color: '#9ca3af', fontWeight: 800 }}>/mês</span>
        )}
      </div>

      <Link
        href={plano.href}
        style={{
          marginTop: 20,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '13px 14px',
          borderRadius: 13,
          textDecoration: 'none',
          fontWeight: 950,
          color: '#fff',
          background: isPro ? '#7c7bfa' : 'rgba(255,255,255,0.07)',
          border: isPro ? 'none' : '1px solid rgba(255,255,255,0.10)',
        }}
      >
        {plano.cta}
        <ArrowRight size={15} />
      </Link>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '22px 0 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 11,
        }}
      >
        {plano.features.map((feature) => (
          <li
            key={feature}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 9,
              color: '#e5e7eb',
              fontSize: 14,
              lineHeight: 1.4,
            }}
          >
            <Check size={16} color="#22c55e" style={{ marginTop: 1 }} />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

const primaryCtaStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '14px 20px',
  borderRadius: 14,
  background: 'linear-gradient(135deg, #7c7bfa, #f472b6)',
  color: '#fff',
  textDecoration: 'none',
  fontWeight: 950,
  boxShadow: '0 18px 50px rgba(124,123,250,0.25)',
}

const secondaryCtaStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '14px 20px',
  borderRadius: 14,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff',
  textDecoration: 'none',
  fontWeight: 950,
}

const navLinkStyle = {
  color: '#a1a1aa',
  textDecoration: 'none',
}

const navButtonStyle = {
  color: '#fff',
  background: '#7c7bfa',
  padding: '9px 13px',
  borderRadius: 10,
  textDecoration: 'none',
}

const featureCardStyle = {
  borderRadius: 18,
  padding: 20,
  background: '#10101a',
  border: '1px solid rgba(255,255,255,0.10)',
}

const featureIconStyle = {
  width: 42,
  height: 42,
  borderRadius: 13,
  background: 'rgba(124,123,250,0.15)',
  color: '#a5b4fc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
}

const cardTitleStyle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 950,
}

const cardTextStyle = {
  margin: '8px 0 0',
  color: '#a1a1aa',
  lineHeight: 1.6,
  fontSize: 14,
}

const stepStyle = {
  display: 'flex',
  gap: 15,
  padding: 18,
  borderRadius: 18,
  background: '#10101a',
  border: '1px solid rgba(255,255,255,0.10)',
}

const stepNumberStyle = {
  width: 38,
  height: 38,
  borderRadius: 12,
  background: 'rgba(124,123,250,0.16)',
  color: '#a5b4fc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 950,
  flexShrink: 0,
}

const testimonialStyle = {
  borderRadius: 20,
  padding: 22,
  background: '#10101a',
  border: '1px solid rgba(255,255,255,0.10)',
}

const avatarStyle = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: '#312e81',
  color: '#c4b5fd',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: 950,
}

const previewCardStyle = {
  borderRadius: 18,
  padding: 20,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  textAlign: 'left' as const,
}

function dotStyle(color: string) {
  return {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: color,
  }
}
