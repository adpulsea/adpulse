// ============================================
// AdPulse — AI Content Studio
// ============================================

import Head from 'next/head'
import { useState } from 'react'
import { Sparkles, Save, Loader } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

type ResultadoIA = {
  hook: string
  legenda: string
  hashtags: string[]
  slides?: { tipo: string; conteudo: string }[]
  upgrade?: boolean
  mensagem?: string
  usadas?: number
  limite?: number
}

const MODOS = [
  { id: 'normal', label: 'Normal', emoji: '✨' },
  { id: 'viral', label: 'Viral', emoji: '🔥' },
  { id: 'autoridade', label: 'Autoridade', emoji: '👑' },
  { id: 'polemico', label: 'Polémico', emoji: '⚡' },
  { id: 'educativo', label: 'Educativo', emoji: '🎓' },
]

export default function StudioConteudo() {
  const { utilizador } = useAuth()

  const [topico, setTopico] = useState('')
  const [formato] = useState('post')
  const [plataforma] = useState('instagram')
  const [modo, setModo] = useState('normal')

  const [resultado, setResultado] = useState<ResultadoIA | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const iniciarCheckout = async (plano: 'pro' | 'agencia') => {
    if (!utilizador?.email || !utilizador?.id) {
      window.location.href = '/auth/login'
      return
    }

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plano,
          email: utilizador.email,
          utilizadorId: utilizador.id,
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setMensagem('Erro ao abrir checkout.')
    }
  }

  const gerarConteudo = async () => {
    if (!topico.trim()) return

    setCarregando(true)
    setMensagem('')
    setResultado(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch('/api/ia/gerar-conteudo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          topico,
          formato,
          plataforma,
          modo,
          tom: 'Informal',
        }),
      })

      const data = await res.json()

      setResultado({
        hook: data.hook || 'Hook não gerado.',
        legenda: data.legenda || data.mensagem || 'Legenda não gerada.',
        hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
        slides: Array.isArray(data.slides) ? data.slides : [],
        upgrade: data.upgrade || false,
        mensagem: data.mensagem,
        usadas: data.usadas,
        limite: data.limite,
      })
    } catch {
      setMensagem('Erro ao gerar conteúdo.')
    } finally {
      setCarregando(false)
    }
  }

  const guardarNaBiblioteca = async () => {
    if (!resultado || !utilizador) return

    if (resultado.upgrade) {
      setMensagem('Não podes guardar uma mensagem de limite. Faz upgrade para continuares.')
      return
    }

    setGuardando(true)
    setMensagem('')

    try {
      const { error } = await supabase.from('conteudos_guardados').insert({
        utilizador_id: utilizador.id,
        topico,
        formato,
        plataforma,
        modo,
        hook: resultado.hook,
        legenda: resultado.legenda,
        hashtags: resultado.hashtags,
        slides: resultado.slides || [],
      })

      if (error) throw error

      setMensagem('✅ Conteúdo guardado na biblioteca.')
    } catch {
      setMensagem('❌ Erro ao guardar conteúdo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <Head>
        <title>AI Content Studio — AdPulse</title>
      </Head>

      <LayoutPainel titulo="AI Content Studio">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          <div className="card flex flex-col gap-4">
            <textarea
              value={topico}
              onChange={(e) => setTopico(e.target.value)}
              placeholder="Sobre o que queres criar conteúdo?"
              className="input-campo"
              rows={3}
            />

            <div className="flex gap-2 flex-wrap">
              {MODOS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModo(m.id)}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: modo === m.id ? '#7c7bfa' : '#111',
                    color: modo === m.id ? '#fff' : '#aaa',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={gerarConteudo}
              disabled={carregando || !topico.trim()}
              className="btn-primario justify-center"
              style={{
                opacity: carregando || !topico.trim() ? 0.6 : 1,
                cursor: carregando || !topico.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {carregando ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  A gerar...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Gerar conteúdo
                </>
              )}
            </button>
          </div>

          {resultado && (
            <div className="card flex flex-col gap-4">
              <div>
                <h3 className="font-semibold mb-2">Hook</h3>
                <p>{resultado.hook}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Legenda</h3>
                <p className="whitespace-pre-line">{resultado.legenda}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Hashtags</h3>
                <p>{resultado.hashtags?.join(' ')}</p>
              </div>

              {resultado.upgrade && (
                <div
                  className="p-4 rounded-xl text-center flex flex-col gap-3"
                  style={{
                    background: 'rgba(124,123,250,0.08)',
                    border: '1px solid rgba(124,123,250,0.25)',
                  }}
                >
                  <p className="text-sm font-semibold">
                    🔒 Atingiste o limite do plano gratuito
                  </p>

                  <p
                    className="text-xs"
                    style={{ color: 'var(--cor-texto-muted)' }}
                  >
                    Faz upgrade para desbloquear gerações ilimitadas e continuar a criar hoje.
                  </p>

                  <button
                    onClick={() => iniciarCheckout('pro')}
                    className="w-full py-3 rounded-xl font-semibold"
                    style={{
                      background: 'var(--cor-marca)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    🚀 Fazer upgrade para Pro
                  </button>
                </div>
              )}

              {!resultado.upgrade && (
                <button
                  onClick={guardarNaBiblioteca}
                  disabled={guardando}
                  className="btn-primario justify-center"
                  style={{
                    opacity: guardando ? 0.7 : 1,
                    cursor: guardando ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Save size={16} />
                  {guardando ? 'A guardar...' : 'Guardar na biblioteca'}
                </button>
              )}
            </div>
          )}

          {mensagem && (
            <p
              className="text-sm text-center"
              style={{
                color: mensagem.startsWith('✅')
                  ? 'var(--cor-sucesso)'
                  : mensagem.startsWith('❌')
                    ? 'var(--cor-erro)'
                    : 'var(--cor-texto-muted)',
              }}
            >
              {mensagem}
            </p>
          )}
        </div>
      </LayoutPainel>
    </>
  )
}
