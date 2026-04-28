import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function NovaPassword() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    async function verificarSessao() {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        setErro('Link inválido ou expirado. Pede uma nova recuperação de password.')
      }
    }

    verificarSessao()
  }, [])

  async function atualizarPassword(e: React.FormEvent) {
    e.preventDefault()
    setMensagem('')
    setErro('')

    if (password.length < 8) {
      setErro('A password deve ter pelo menos 8 caracteres.')
      return
    }

    setCarregando(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setErro('Erro ao atualizar password. Tenta pedir um novo link.')
      setCarregando(false)
      return
    }

    setMensagem('Password atualizada com sucesso.')

    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
  }

  return (
    <>
      <Head>
        <title>Nova Password — AdPulse</title>
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
        <form onSubmit={atualizarPassword} style={{
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
            Nova password
          </h1>

          <div style={{ position: 'relative' }}>
            <input
              type={verPassword ? 'text' : 'password'}
              placeholder="Nova password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={{
                width: '100%',
                padding: '14px 46px 14px 14px',
                borderRadius: 12,
                border: '1px solid #333',
                background: '#0f0f18',
                color: 'white',
              }}
            />

            <button
              type="button"
              onClick={() => setVerPassword(!verPassword)}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" disabled={carregando} style={{
            padding: 14,
            borderRadius: 12,
            border: 'none',
            background: '#7c7bfa',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
          }}>
            {carregando ? 'A atualizar...' : 'Atualizar password'}
          </button>

          {mensagem && <p style={{ color: '#34d399' }}>{mensagem}</p>}
          {erro && <p style={{ color: '#f87171' }}>{erro}</p>}
        </form>
      </main>
    </>
  )
}
