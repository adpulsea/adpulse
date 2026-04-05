// ============================================
// AdPulse — Página de Referido (/r/[codigo])
// ============================================

import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Zap, Check, ArrowRight, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function PaginaReferido() {
  const router = useRouter()
  const { codigo } = router.query
  const [nomeReferidor, setNome] = useState('')

  useEffect(() => {
    if (!codigo) return

    const carregar = async () => {
      // Guardar código no localStorage para usar no registo
      localStorage.setItem('adpulse_referido_por', codigo as string)

      // Buscar nome do utilizador que referiu
      const { data: ref } = await supabase
        .from('referidos')
        .select('utilizador_id')
        .eq('codigo', codigo)
        .single()

      if (ref) {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('nome, nome_marca')
          .eq('id', ref.utilizador_id)
          .single()
        if (perfil) setNome(perfil.nome_marca || perfil.nome || '')

        // Incrementar contador de referidos
        await supabase.rpc('incrementar_referido', { p_codigo: codigo })
      }
    }
    carregar()
  }, [codigo])

  return (
    <>
      <Head>
        <title>AdPulse — Cria conteúdo viral com IA</title>
        <meta name="description" content="Plataforma de criação de conteúdo com IA para criadores e empreendedores." />
      </Head>
      <div style={{ minHeight: '100vh', background: 'var(--cor-fundo)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>

        {/* Fundo glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'rgba(124,123,250,0.07)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 480, width: '100%', position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--cor-marca)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={22} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--fonte-display)', fontWeight: 700, fontSize: 22, color: 'var(--cor-texto)' }}>AdPulse</span>
            </Link>
          </div>

          {/* Card principal */}
          <div className="card" style={{ textAlign: 'center', padding: 40, marginBottom: 20 }}>

            {/* Badge convite */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)', marginBottom: 24 }}>
              <Sparkles size={14} style={{ color: 'var(--cor-marca)' }} />
              <span style={{ fontSize: 13, color: 'var(--cor-marca)', fontWeight: 500 }}>
                {nomeReferidor ? `${nomeReferidor} convidou-te` : 'Foste convidado'}
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--fonte-display)', fontSize: 28, fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
              Cria conteúdo viral<br />com IA em segundos
            </h1>

            <p style={{ color: 'var(--cor-texto-muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
              A AdPulse gera legendas, hooks e hashtags personalizados para o teu negócio. Experimenta grátis — sem cartão de crédito.
            </p>

            {/* Benefícios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, textAlign: 'left' }}>
              {[
                '3 gerações grátis por dia no plano gratuito',
                'Legendas, hooks e hashtags com IA',
                'Calendário de conteúdo semanal',
                'Agentes IA de suporte e crescimento',
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={11} style={{ color: 'var(--cor-sucesso)' }} />
                  </div>
                  <span style={{ color: 'var(--cor-texto-muted)' }}>{b}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link href="/auth/registar"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: 'var(--cor-marca)', color: '#fff', fontWeight: 600, fontSize: 16, textDecoration: 'none', marginBottom: 12 }}>
              <Sparkles size={18} /> Criar conta grátis <ArrowRight size={16} />
            </Link>

            <p style={{ fontSize: 12, color: 'var(--cor-texto-fraco)' }}>
              Sem cartão de crédito. Cancela quando quiseres.
            </p>
          </div>

          {/* Já tens conta */}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--cor-texto-muted)' }}>
            Já tens conta?{' '}
            <Link href="/auth/login" style={{ color: 'var(--cor-marca)', textDecoration: 'none', fontWeight: 500 }}>
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
