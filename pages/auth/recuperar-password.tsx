import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function RecuperarPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviarEmail(e: React.FormEvent) {
    e.preventDefault()
    setMensagem('')
    setErro('')
    setCarregando(true)

    const redirectTo = `${window.location.origin}/auth/nova-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      setErro('Erro ao enviar email. Verifica se o email está correto.')
      setCarregando(false)
      return
    }

    setMensagem('Email enviado com sucesso. Verifica a tua caixa de entrada.')

    setTimeout(() => {
      router.push('/auth/login')
    }, 2500)
  }

  return (
    <>
      <Head>
        <title>Recuperar Password — AdPulse</title>
      </Head>

      <main style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <form onSubmit={enviarEmail} style={{
          width: '100%',
          maxWidth: 420,
          background: '#11111a',
          border: '1px solid #26263a',
          borderRadius: 20,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>
            Recuperar password
          </h1>

          <p style={{ color: '#aaa', fontSize: 14 }}>
            Escreve o teu email. Vamos enviar-te um link para criares uma nova password.
          </p>

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

          <button type="submit" disabled={carregando} style={{
            padding: 14,
            borderRadius: 12,
            border: 'none',
            background: '#7c7bfa',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
          }}>
            {carregando ? 'A enviar...' : 'Enviar email'}
          </button>

          {mensagem && <p style={{ color: '#34d399' }}>{mensagem}</p>}
          {erro && <p style={{ color: '#f87171' }}>{erro}</p>}

          <button
            type="button"
            onClick={() => router.push('/auth/login')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#aaa',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Voltar ao login
          </button>
        </form>
      </main>
    </>
  )
}
