// ============================================
// AdPulse — Página de Registo
// ============================================

import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Zap, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { criarConta } from '@/lib/auth'

export default function PaginaRegistar() {
  const router = useRouter()
  const [nome, setNome]                       = useState('')
  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')
  const [confirmarPassword, setConfirmarPass] = useState('')
  const [erro, setErro]                       = useState('')
  const [sucesso, setSucesso]                 = useState(false)
  const [carregando, setCarregando]           = useState(false)
  const [verPassword, setVerPass]             = useState(false)
  const [verConfirmar, setVerConfirmar]       = useState(false)

  const aoSubmeter = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    if (password !== confirmarPassword) { setErro('As passwords não coincidem.'); return }
    if (password.length < 8) { setErro('A password deve ter pelo menos 8 caracteres.'); return }
    setCarregando(true)
    try {
      await criarConta(email, password, nome)
      setSucesso(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('already registered')) {
          setErro('Este email já está registado. Tenta fazer login.')
        } else {
          setErro('Ocorreu um erro ao criar a conta. Tenta novamente.')
        }
      }
    } finally {
      setCarregando(false)
    }
  }

  if (sucesso) {
    return (
      <>
        <Head><title>Conta criada — AdPulse</title></Head>
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cor-fundo)' }}>
          <div className="card max-w-md w-full text-center p-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              <CheckCircle size={32} style={{ color: 'var(--cor-sucesso)' }} />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--fonte-display)' }}>Conta criada!</h1>
            <p className="mb-6" style={{ color: 'var(--cor-texto-muted)' }}>
              Enviámos um email de confirmação para <strong style={{ color: 'var(--cor-texto)' }}>{email}</strong>.
              Clica no link para ativar a tua conta e depois configuramos o teu perfil.
            </p>
            <Link href="/onboarding" className="btn-primario justify-center">
              Configurar perfil <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>Criar conta grátis — AdPulse</title></Head>
      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--cor-fundo)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="efeito-glow w-96 h-96 top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'rgba(192, 132, 252, 0.1)' }} />
        </div>
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: 'var(--cor-marca)' }}>
                <Zap size={20} className="text-white" fill="white" />
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: 'var(--fonte-display)', color: 'var(--cor-texto)' }}>AdPulse</span>
            </Link>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--fonte-display)' }}>Começa hoje, é grátis</h1>
            <p style={{ color: 'var(--cor-texto-muted)' }}>Sem cartão de crédito. Sem compromissos.</p>
          </div>
          <div className="card">
            <form onSubmit={aoSubmeter} className="flex flex-col gap-5">
              {erro && (
                <div className="flex items-start gap-3 p-4 rounded-xl text-sm"
                  style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)', color: 'var(--cor-erro)' }}>
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{erro}
                </div>
              )}
              <div>
                <label htmlFor="nome" className="label-campo">Nome</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--cor-texto-fraco)' }} />
                  <input id="nome" type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="O teu nome" className="input-campo pl-11" required autoComplete="name" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="label-campo">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--cor-texto-fraco)' }} />
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="o.teu@email.com" className="input-campo pl-11" required autoComplete="email" />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="label-campo">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--cor-texto-fraco)' }} />
                  <input id="password" type={verPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="input-campo pl-11 pr-11" required minLength={8} autoComplete="new-password" />
                  <button type="button" onClick={() => setVerPass(!verPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--cor-texto-fraco)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {verPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmarPassword" className="label-campo">Confirmar password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--cor-texto-fraco)' }} />
                  <input id="confirmarPassword" type={verConfirmar ? 'text' : 'password'} value={confirmarPassword} onChange={e => setConfirmarPass(e.target.value)} placeholder="Repete a password" className="input-campo pl-11 pr-11" required minLength={8} autoComplete="new-password" />
                  <button type="button" onClick={() => setVerConfirmar(!verConfirmar)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--cor-texto-fraco)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {verConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-center" style={{ color: 'var(--cor-texto-fraco)' }}>
                Ao criar uma conta, aceitas os nossos{' '}
                <a href="#" style={{ color: 'var(--cor-marca)' }}>Termos de Serviço</a> e{' '}
                <a href="#" style={{ color: 'var(--cor-marca)' }}>Política de Privacidade</a>.
              </p>
              <button type="submit" className="btn-primario justify-center py-3" disabled={carregando} style={carregando ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>
                {carregando ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> A criar conta...</>
                ) : (
                  <>Criar conta grátis <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </div>
          <p className="text-center text-sm mt-6" style={{ color: 'var(--cor-texto-muted)' }}>
            Já tens conta?{' '}
            <Link href="/auth/login" style={{ color: 'var(--cor-marca)' }} className="font-medium hover:underline">Fazer login</Link>
          </p>
        </div>
      </div>
    </>
  )
}