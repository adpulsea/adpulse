import Head from 'next/head'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function NovaPassword() {
  const [password, setPassword] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const atualizarPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensagem('')
    setErro('')
    setCarregando(true)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setErro('Erro ao atualizar password.')
    } else {
      setMensagem('Password atualizada com sucesso!')
    }

    setCarregando(false)
  }

  return (
    <>
      <Head>
        <title>Nova Password — AdPulse</title>
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
          onSubmit={atualizarPassword}
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
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>
            Nova password
          </h1>

          <input
            type="password"
            placeholder="Nova password"
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
            {carregando ? 'A atualizar...' : 'Atualizar password'}
          </button>

          {mensagem && <p style={{ color: '#34d399' }}>{mensagem}</p>}
          {erro && <p style={{ color: '#f87171' }}>{erro}</p>}
        </form>
      </main>
    </>
  )
}
