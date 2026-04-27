import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { fazerLogin } from '@/lib/auth'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Entrar na AdPulse</h1>

          {erro && <p style={{ color: '#f87171' }}>{erro}</p>}

          <input
            type="email"
            placeholder="O teu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: 14,
              borderRadius: 12,
              border: '1px solid #333',
              background: '#0f0f18',
              color: 'white',
            }}
          />

          <input
            type="password"
            placeholder="A tua password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: 14,
              borderRadius: 12,
              border: '1px solid #333',
              background: '#0f0f18',
              color: 'white',
            }}
          />

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
              cursor: 'pointer',
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
            }}
          >
            Ainda não tens conta? Criar conta grátis
          </button>
        </form>
      </main>
    </>
  )
}
