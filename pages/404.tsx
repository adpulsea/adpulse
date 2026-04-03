// ============================================
// AdPulse — Página 404
// ============================================

import Head from 'next/head'
import Link from 'next/link'
import { Zap, Home, ArrowLeft, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Pagina404() {
  const { utilizador } = useAuth()

  return (
    <>
      <Head><title>Página não encontrada — AdPulse</title></Head>
      <div style={{
        minHeight: '100vh', background: 'var(--cor-fundo)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>

        {/* Fundo com glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'rgba(124,123,250,0.06)', filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 48 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--cor-marca)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--fonte-display)', fontWeight: 700, fontSize: 18, color: 'var(--cor-texto)' }}>AdPulse</span>
        </Link>

        {/* 404 grande */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <p style={{
            fontSize: 'clamp(100px, 20vw, 160px)',
            fontWeight: 800, fontFamily: 'var(--fonte-display)',
            background: 'linear-gradient(135deg, #7c7bfa, #c084fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1, letterSpacing: -4,
          }}>
            404
          </p>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '120%', height: '120%',
            background: 'radial-gradient(ellipse, rgba(124,123,250,0.15), transparent 70%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Mensagem */}
        <h1 style={{
          fontFamily: 'var(--fonte-display)', fontSize: 'clamp(20px, 4vw, 28px)',
          fontWeight: 700, color: 'var(--cor-texto)', marginBottom: 12,
        }}>
          Esta página perdeu-se no feed 😅
        </h1>
        <p style={{
          color: 'var(--cor-texto-muted)', fontSize: 16, maxWidth: 420,
          lineHeight: 1.6, marginBottom: 40,
        }}>
          A página que procuras não existe ou foi movida. Mas não te preocupes — temos muito conteúdo viral à tua espera!
        </p>

        {/* Botões */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href={utilizador ? '/painel' : '/'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 12,
              background: 'var(--cor-marca)', color: '#fff',
              fontWeight: 600, fontSize: 14, textDecoration: 'none',
            }}>
            <Home size={16} />
            {utilizador ? 'Ir para o painel' : 'Ir para o início'}
          </Link>

          {utilizador && (
            <Link href="/painel/studio"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 12,
                background: 'rgba(124,123,250,0.1)',
                border: '1px solid rgba(124,123,250,0.3)',
                color: 'var(--cor-marca)',
                fontWeight: 600, fontSize: 14, textDecoration: 'none',
              }}>
              <Sparkles size={16} />
              Criar conteúdo
            </Link>
          )}
        </div>

        {/* Links úteis */}
        <div style={{ marginTop: 48, display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Dashboard', href: '/painel' },
            { label: 'Preços', href: '/precos' },
            { label: 'Suporte', href: '/painel/agentes/atendimento' },
          ].map(l => (
            <Link key={l.href} href={l.href}
              style={{ fontSize: 13, color: 'var(--cor-texto-muted)', textDecoration: 'none' }}
              onMouseOver={e => (e.currentTarget.style.color = 'var(--cor-marca)')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--cor-texto-muted)')}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
