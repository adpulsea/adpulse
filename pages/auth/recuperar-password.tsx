import Head from 'next/head'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RecuperarPassword() {
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensagem('')
    setErro('')
    setCarregando(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://adpulse-pf3b.vercel.app/auth/nova-password',
    })

    if (error) {
      setErro('Não foi possível enviar o email de recuperação.')
    } else {
      setMensagem('Email enviado. Verifica a tua caixa de entrada.')
    }

    setCarregando(false)
  }

  return (
    <>
      <Head>
        <title>Recuperar password — AdPulse</title>
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
          onSubmit={enviar}
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
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Recuperar password</h1>

          <p style={{ color: '#aaa' }}>
            Escreve o teu email e vamos enviar um link para criares uma nova password.
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
            {carregando ? 'A enviar...' : 'Enviar email de recuperação'}
          </button>

          {mensagem && <p style={{ color: '#34d399' }}>{mensagem}</p>}
          {erro && <p style={{ color: '#f87171' }}>{erro}</p>}

          <button
            type="button"
            onClick={() => {
              window.location.href = '/auth/login'
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#aaa',
              cursor: 'pointer',
            }}
          >
            Voltar ao login
          </button>
        </form>
      </main>
    </>
  )
}
