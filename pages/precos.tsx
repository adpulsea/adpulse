// ============================================
// AdPulse — Página de Preços
// ============================================

import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  Zap, Check, X, Loader, Star, ArrowRight, Crown
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const PLANOS = [
  {
    id: 'gratuito',
    nome: 'Gratuito',
    preco: 0,
    precoAnual: 0,
    descricao: 'Para começar e experimentar',
    cor: '#8888aa',
    icone: '🆓',
    funcionalidades: [
      { texto: '3 gerações por dia', incluido: true },
      { texto: 'AI Content Studio básico', incluido: true },
      { texto: 'Calendário de conteúdo', incluido: true },
      { texto: '1 workspace', incluido: true },
      { texto: 'Biblioteca de média (500MB)', incluido: true },
      { texto: 'Gerações ilimitadas', incluido: false },
      { texto: 'Viral Lab completo', incluido: false },
      { texto: 'Creator Analyzer', incluido: false },
      { texto: 'Automação de DMs', incluido: false },
      { texto: 'Suporte prioritário', incluido: false },
    ],
    cta: 'Começar grátis',
    destaque: false,
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: 19,
    precoAnual: 15,
    descricao: 'Para criadores a crescer',
    cor: '#7c7bfa',
    icone: '⚡',
    funcionalidades: [
      { texto: 'Gerações ilimitadas por dia', incluido: true },
      { texto: 'AI Content Studio completo', incluido: true },
      { texto: 'Calendário com geração automática', incluido: true },
      { texto: 'Workspaces ilimitados', incluido: true },
      { texto: 'Biblioteca de média (10GB)', incluido: true },
      { texto: 'Viral Lab completo', incluido: true },
      { texto: 'Creator Analyzer', incluido: true },
      { texto: 'Automação de DMs e comentários', incluido: true },
      { texto: 'Agentes IA (suporte + vendas)', incluido: true },
      { texto: 'Suporte prioritário (4h)', incluido: true },
    ],
    cta: 'Começar Pro',
    destaque: true,
  },
  {
    id: 'agencia',
    nome: 'Agência',
    preco: 49,
    precoAnual: 39,
    descricao: 'Para agências e equipas',
    cor: '#c084fc',
    icone: '🏢',
    funcionalidades: [
      { texto: 'Tudo do plano Pro', incluido: true },
      { texto: 'Até 5 subcontas de clientes', incluido: true },
      { texto: 'Biblioteca de média (50GB)', incluido: true },
      { texto: 'Relatórios PDF para clientes', incluido: true },
      { texto: 'Painel de gestão de clientes', incluido: true },
      { texto: 'API access', incluido: true },
      { texto: 'Onboarding personalizado', incluido: true },
      { texto: 'Gestor de conta dedicado', incluido: true },
      { texto: 'Faturação empresarial', incluido: true },
      { texto: 'Suporte dedicado (1h)', incluido: true },
    ],
    cta: 'Começar Agência',
    destaque: false,
  },
]

const TESTEMUNHOS = [
  { nome: 'Ana Silva', cargo: 'Criadora de conteúdo', texto: 'Em 30 dias cresci 5k seguidores no Instagram. A IA gera conteúdo melhor que eu!', avatar: 'AS', estrelas: 5 },
  { nome: 'Pedro Costa', cargo: 'Empreendedor', texto: 'Poupei 10h por semana de planeamento. O calendário automático é incrível.', avatar: 'PC', estrelas: 5 },
  { nome: 'Maria João', cargo: 'Gestora de redes sociais', texto: 'Giro 8 clientes com a AdPulse. Não imagino trabalhar sem isto.', avatar: 'MJ', estrelas: 5 },
]

export default function Precos() {
  const { utilizador }        = useAuth()
  const router                = useRouter()
  const [anual, setAnual]     = useState(false)
  const [carregando, setCarr] = useState<string | null>(null)
  const sucesso               = router.query.sucesso === 'true'
  const cancelado             = router.query.cancelado === 'true'

  const fazerCheckout = async (planoId: string) => {
    if (planoId === 'gratuito') {
      router.push(utilizador ? '/painel' : '/auth/registar')
      return
    }
    if (!utilizador) {
      router.push('/auth/registar')
      return
    }
    setCarr(planoId)
    try {
      const r = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plano: planoId,
          email: utilizador.email,
          utilizadorId: utilizador.id,
        }),
      })
      const d = await r.json()
      if (d.url) window.location.href = d.url
    } catch (err) {
      console.error(err)
    } finally {
      setCarr(null)
    }
  }

  const estiloBotao = (p: typeof PLANOS[0]) => {
    if (p.destaque) {
      return {
        background: 'var(--cor-marca)',
        color: '#fff',
        border: 'none',
      }
    }
    return {
      background: `${p.cor}15`,
      color: p.cor,
      border: `1px solid ${p.cor}30`,
    }
  }

  return (
    <>
      <Head><title>Preços — AdPulse</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--cor-fundo)', color: 'var(--cor-texto)' }}>

        {/* Navbar */}
        <nav style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--cor-borda)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--cor-marca)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--fonte-display)', fontWeight: 700, fontSize: 16, color: 'var(--cor-texto)' }}>AdPulse</span>
          </Link>
          <div style={{ display: 'flex', gap: 12 }}>
            {utilizador ? (
              <Link href="/painel" className="btn-primario" style={{ textDecoration: 'none' }}>Ir para o painel</Link>
            ) : (
              <>
                <Link href="/auth/login" style={{ padding: '8px 16px', borderRadius: 10, color: 'var(--cor-texto-muted)', textDecoration: 'none', fontSize: 14 }}>Entrar</Link>
                <Link href="/auth/registar" className="btn-primario" style={{ textDecoration: 'none' }}>Começar grátis</Link>
              </>
            )}
          </div>
        </nav>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>

          {sucesso && (
            <div style={{ marginBottom: 32, padding: '16px 24px', borderRadius: 16, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Check size={20} color="#34d399" />
              <p style={{ color: '#34d399', fontWeight: 600 }}>Pagamento confirmado! O teu plano foi ativado. 🎉</p>
              <Link href="/painel" style={{ marginLeft: 'auto', color: '#34d399', fontSize: 14 }}>Ir para o painel →</Link>
            </div>
          )}

          {cancelado && (
            <div style={{ marginBottom: 32, padding: '16px 24px', borderRadius: 16, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}>
              <p style={{ color: '#f87171' }}>Pagamento cancelado. Podes tentar novamente quando quiseres.</p>
            </div>
          )}

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)', marginBottom: 16 }}>
              <Crown size={14} color="var(--cor-marca)" />
              <span style={{ fontSize: 13, color: 'var(--cor-marca)', fontWeight: 500 }}>Preços simples e transparentes</span>
            </div>
            <h1 style={{ fontFamily: 'var(--fonte-display)', fontSize: 42, fontWeight: 800, marginBottom: 12 }}>
              Escolhe o teu plano
            </h1>
            <p style={{ color: 'var(--cor-texto-muted)', fontSize: 16, maxWidth: 480, margin: '0 auto 24px' }}>
              Começa grátis. Faz upgrade quando estiveres pronto para crescer mais rápido.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '6px', borderRadius: 12, background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
              <button onClick={() => setAnual(false)}
                style={{ padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: !anual ? 'var(--cor-card)' : 'transparent', color: !anual ? 'var(--cor-texto)' : 'var(--cor-texto-muted)' }}>
                Mensal
              </button>
              <button onClick={() => setAnual(true)}
                style={{ padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: anual ? 'var(--cor-card)' : 'transparent', color: anual ? 'var(--cor-texto)' : 'var(--cor-texto-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Anual
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(52,211,153,0.15)', color: '#34d399', fontWeight: 700 }}>-20%</span>
              </button>
            </div>
          </div>

          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 80 }}>
            {PLANOS.map(p => (
              <div key={p.id} style={{
                padding: 28, borderRadius: 24,
                background: p.destaque ? 'linear-gradient(135deg, rgba(124,123,250,0.12), rgba(192,132,252,0.08))' : 'var(--cor-card)',
                border: p.destaque ? '2px solid rgba(124,123,250,0.4)' : '1px solid var(--cor-borda)',
                position: 'relative',
                transform: p.destaque ? 'scale(1.03)' : 'none',
              }}>
                {p.destaque && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: 20, background: 'var(--cor-marca)', color: '#fff', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    ⭐ MAIS POPULAR
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{p.icone}</div>
                  <h3 style={{ fontFamily: 'var(--fonte-display)', fontSize: 20, fontWeight: 700, marginBottom: 4, color: p.cor }}>{p.nome}</h3>
                  <p style={{ fontSize: 13, color: 'var(--cor-texto-muted)' }}>{p.descricao}</p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 42, fontWeight: 800, fontFamily: 'var(--fonte-display)', color: p.cor }}>
                      {p.preco === 0 ? '0€' : `${anual ? p.precoAnual : p.preco}€`}
                    </span>
                    {p.preco > 0 && <span style={{ color: 'var(--cor-texto-muted)', fontSize: 14 }}>/mês</span>}
                  </div>
                  {anual && p.preco > 0 && (
                    <p style={{ fontSize: 12, color: 'var(--cor-sucesso)', marginTop: 4 }}>
                      Faturado anualmente — poupas {(p.preco - p.precoAnual) * 12}€/ano
                    </p>
                  )}
                </div>

                <button
                  onClick={() => fazerCheckout(p.id)}
                  disabled={carregando === p.id}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 12,
                    fontSize: 14, fontWeight: 600,
                    cursor: carregando === p.id ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    marginBottom: 24,
                    opacity: carregando === p.id ? 0.7 : 1,
                    ...estiloBotao(p),
                  }}>
                  {carregando === p.id
                    ? <><Loader size={14} className="animate-spin" /> A processar...</>
                    : <>{p.cta} <ArrowRight size={14} /></>
                  }
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {p.funcionalidades.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: f.incluido ? `${p.cor}15` : 'transparent' }}>
                        {f.incluido ? <Check size={11} color={p.cor} /> : <X size={11} color="var(--cor-texto-fraco)" />}
                      </div>
                      <span style={{ fontSize: 13, color: f.incluido ? 'var(--cor-texto)' : 'var(--cor-texto-fraco)' }}>{f.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Testemunhos */}
          <div style={{ marginBottom: 60 }}>
            <h2 style={{ fontFamily: 'var(--fonte-display)', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>
              O que dizem os nossos utilizadores
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {TESTEMUNHOS.map((t, i) => (
                <div key={i} style={{ padding: 24, borderRadius: 20, background: 'var(--cor-card)', border: '1px solid var(--cor-borda)' }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                    {Array.from({ length: t.estrelas }).map((_, j) => (
                      <Star key={j} size={14} fill="#fbbf24" color="#fbbf24" />
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--cor-texto-muted)', lineHeight: 1.6, marginBottom: 16 }}>"{t.texto}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,123,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--cor-marca)' }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{t.nome}</p>
                      <p style={{ fontSize: 11, color: 'var(--cor-texto-muted)' }}>{t.cargo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA final */}
          <div style={{ textAlign: 'center', padding: '40px', borderRadius: 24, background: 'var(--cor-card)', border: '1px solid var(--cor-borda)' }}>
            <h2 style={{ fontFamily: 'var(--fonte-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              Ainda tens dúvidas?
            </h2>
            <p style={{ color: 'var(--cor-texto-muted)', marginBottom: 20 }}>
              Fala com o nosso agente de suporte — responde em segundos.
            </p>
            <Link href="/painel/agentes/atendimento" className="btn-primario"
              style={{ textDecoration: 'none', display: 'inline-flex' }}>
              Falar com suporte <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
