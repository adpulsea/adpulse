import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RecuperarPassword() {
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const enviarRecuperacao = async (e: React.FormEvent) => {
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
      setMensagem('Email de recuperação enviado. Verifica a tua caixa de entrada.')
    }

    setCarregando(false)
  }

  return (
    <>
      <Head>
        <title>Recuperar password — AdPulse</title>
      </Head>

      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--cor-fundo)', color: 'var(--cor-texto)' }}
      >
        <div className="card w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2">Recuperar password</h1>

          <p className="text-sm mb-6" style={{ color: 'var(--cor-texto-muted)' }}>
            Escreve o teu email e vamos enviar um link para redefinir a tua password.
          </p>

          <form onSubmit={enviarRecuperacao} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="o.teu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-campo"
              required
            />

            <button
              type="submit"
              className="btn-primario justify-center py-3"
              disabled={carregando}
            >
              {carregando ? 'A enviar...' : 'Enviar email de recuperação'}
            </button>
          </form>

          {mensagem && (
            <p className="text-sm mt-4" style={{ color: '#34d399' }}>
              {mensagem}
            </p>
          )}

          {erro && (
            <p className="text-sm mt-4" style={{ color: '#f87171' }}>
              {erro}
            </p>
          )}

          <Link
            href="/auth/login"
            className="block text-sm mt-6"
            style={{ color: 'var(--cor-marca)' }}
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    </>
  )
}
