// ============================================
// AdPulse — Página de Login
// ============================================

import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Zap, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { fazerLogin } from '@/lib/auth'

export default function PaginaLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [verPassword, setVerPass] = useState(false)

  const aoSubmeter = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      await fazerLogin(email, password)
      router.push('/painel')
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
          setErro('Email ou password incorretos. Tenta novamente.')
        } else if (err.message.includes('Email not confirmed')) {
          setErro('Confirma o teu email antes de fazer login.')
        } else {
          setErro('Ocorreu um erro. Tenta novamente.')
        }
      } else {
        setErro('Ocorreu um erro. Tenta novamente.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      <Head>
        <title>Entrar — AdPulse</title>
      </Head>

      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{ background: 'var(--cor-fundo)' }}
      >
        {/* Background (não bloqueia cliques) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="efeito-glow w-96 h-96 top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'rgba(124, 123, 250, 0.12)' }}
          />
        </div>

        {/* Container PRINCIPAL (z alto) */}
        <div className="w-full max-w-md relative z-50">

          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: 'var(--cor-marca)' }}
              >
                <Zap size={20} className="text-white" fill="white" />
              </div>

              <span
                className="text-xl font-bold"
                style={{
                  fontFamily: 'var(--fonte-display)',
                  color: 'var(--cor-texto)',
                }}
              >
                AdPulse
              </span>
            </Link>

            <h1
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--fonte-display)' }}
            >
              Bem-vindo de volta
            </h1>

            <p style={{ color: 'var(--cor-texto-muted)' }}>
              Entra na tua conta para continuar
            </p>
          </div>

          <div className="card">
            <form onSubmit={aoSubmeter} className="flex flex-col gap-5">

              {erro && (
                <div
                  className="flex items-start gap-3 p-4 rounded-xl text-sm"
                  style={{
                    background: 'rgba(248, 113, 113, 0.1)',
                    border: '1px solid rgba(248, 113, 113, 0.3)',
                    color: 'var(--cor-erro)',
                  }}
                >
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  {erro}
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="label-campo">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--cor-texto-fraco)' }}
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="o.teu@email.com"
                    className="input-campo pl-11"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password + Forgot */}
              <div>
                <div className="flex items-center justify-between mb-2 relative z-50">
                  <label htmlFor="password" className="label-campo mb-0">
                    Password
                  </label>

                  <Link
                    href="/auth/recuperar-password"
                    className="text-xs"
                    style={{
                      color: 'var(--cor-marca)',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      position: 'relative',
                      zIndex: 999
                    }}
                  >
                    Esqueceste a password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--cor-texto-fraco)' }}
                  />

                  <input
                    id="password"
                    type={verPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="A tua password"
                    className="input-campo pl-11 pr-11"
                    required
                    autoComplete="current-password"
                    minLength={6}
                  />

                  <button
                    type="button"
                    onClick={() => setVerPass(!verPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{
                      color: 'var(--cor-texto-fraco)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {verPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primario justify-center py-3"
                disabled={carregando}
                style={carregando ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
              >
                {carregando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    A entrar...
                  </>
                ) : (
                  <>
                    Entrar <ArrowRight size={16} />
                  </>
                )}
              </button>

            </form>
          </div>

          <p
            className="text-center text-sm mt-6"
            style={{ color: 'var(--cor-texto-muted)' }}
          >
            Ainda não tens conta?{' '}
            <Link
              href="/auth/registar"
              style={{ color: 'var(--cor-marca)' }}
              className="font-medium hover:underline"
            >
              Criar conta grátis
            </Link>
          </p>

        </div>
      </div>
    </>
  )
}
