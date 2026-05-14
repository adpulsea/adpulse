import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Eye, EyeOff } from 'lucide-react'
import { fazerLogin } from '@/lib/auth'

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      await fazerLogin(email, password)
      router.push('/painel')
    } catch {
      setErro('Email ou password incorretos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      <Head>
        <title>Entrar — AdPulse</title>
      </Head>

      <main
        style={{
          minHeight: '100vh',
          background: '#0a0a0f',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <form
          onSubmit={entrar}
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#11111a',
            border: '1px solid #26263a',
            borderRadius: 20,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
              Entrar na AdPulse
            </h1>

            <p style={{ margin: 0, color: '#8f8faa', fontSize: 14 }}>
              Acede ao teu painel e continua a criar conteúdo com IA.
            </p>
          </div>

          {erro && (
            <p
              style={{
                color: '#f87171',
                background: 'rgba(248,113,113,0.10)',
                border: '1px solid rgba(248,113,113,0.25)',
                padding: '10px 12px',
                borderRadius: 12,
                margin: 0,
                fontSize: 14,
              }}
            >
              {erro}
            </p>
          )}

          <input
            type="email"
            placeholder="O teu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              padding: 14,
              borderRadius: 12,
              border: '1px solid #33334a',
              background: '#0f0f18',
              color: 'white',
              outline: 'none',
              fontSize: 14,
            }}
          />

          <div style={{ position: 'relative' }}>
            <input
              type={mostrarPassword ? 'text' : 'password'}
              placeholder="A tua password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '14px 46px 14px 14px',
                borderRadius: 12,
                border: '1px solid #33334a',
                background: '#0f0f18',
                color: 'white',
                outline: 'none',
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />

            <button
              type="button"
              onClick={() => setMostrarPassword((atual) => !atual)}
              aria-label={mostrarPassword ? 'Esconder password' : 'Mostrar password'}
              title={mostrarPassword ? 'Esconder password' : 'Mostrar password'}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 28,
                height: 28,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: '#8f8faa',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/auth/recuperar-password'
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#7c7bfa',
              cursor: 'pointer',
              textAlign: 'left',
              padding: 0,
              fontSize: 14,
              width: 'fit-content',
            }}
          >
            Esqueceste a password?
          </button>

          <button
            type="submit"
            disabled={carregando}
            style={{
              padding: 14,
              borderRadius: 12,
              border: 'none',
              background: '#7c7bfa',
              color: 'white',
              fontWeight: 700,
              cursor: carregando ? 'not-allowed' : 'pointer',
              opacity: carregando ? 0.75 : 1,
              fontSize: 15,
            }}
          >
            {carregando ? 'A entrar...' : 'Entrar'}
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/auth/registar'
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#aaa',
              cursor: 'pointer',
              marginTop: 8,
              fontSize: 14,
            }}
          >
            Ainda não tens conta? Criar conta grátis
          </button>
        </form>
      </main>
    </>
  )
}
