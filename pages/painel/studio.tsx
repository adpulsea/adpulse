// ============================================
// AdPulse — AI Content Studio + Assistente Guiado
// ============================================

import Head from 'next/head'
import { useEffect, useState } from 'react'
import {
  Sparkles,
  Save,
  Loader,
  Wand2,
  CheckCircle,
  Copy,
  Package,
} from 'lucide-react'
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
  titulo?: string
}

type Especialista = {
  id: string
  nome: string
  cargo: string
  emoji: string
  descricao: string
}

const MODOS = [
  { id: 'normal', label: 'Normal', emoji: '✨' },
  { id: 'viral', label: 'Viral', emoji: '🔥' },
  { id: 'autoridade', label: 'Autoridade', emoji: '👑' },
  { id: 'polemico', label: 'Polémico', emoji: '⚡' },
  { id: 'educativo', label: 'Educativo', emoji: '🎓' },
]

const OBJETIVOS = [
  'Ganhar seguidores',
  'Vender mais',
  'Gerar engagement',
  'Educar audiência',
  'Promover produto/serviço',
  'Criar autoridade',
]

const ESPECIALISTAS: Especialista[] = [
  {
    id: 'estratega',
    nome: 'Sofia Martins',
    cargo: 'Estratega de Conteúdo',
    emoji: '🧠',
    descricao: 'Cria planos de conteúdo com foco em crescimento.',
  },
  {
    id: 'copywriter',
    nome: 'João Silva',
    cargo: 'Copywriter Viral',
    emoji: '✍️',
    descricao: 'Cria hooks fortes, legendas e CTAs irresistíveis.',
  },
  {
    id: 'designer',
    nome: 'Ana Costa',
    cargo: 'Diretora Criativa',
    emoji: '🎨',
    descricao: 'Transforma ideias em carrosséis e sugestões visuais.',
  },
  {
    id: 'viral',
    nome: 'Rui Ferreira',
    cargo: 'Analista Viral',
    emoji: '📈',
    descricao: 'Cria conteúdos com maior potencial de partilha.',
  },
]

function normalizarResultado(data: any): ResultadoIA {
  return {
    hook: data?.hook || 'Hook não gerado.',
    legenda: data?.legenda || data?.mensagem || 'Legenda não gerada.',
    hashtags: Array.isArray(data?.hashtags) ? data.hashtags : [],
    slides: Array.isArray(data?.slides) ? data.slides : [],
    upgrade: data?.upgrade || false,
    mensagem: data?.mensagem,
    usadas: data?.usadas,
    limite: data?.limite,
  }
}

export default function StudioConteudo() {
  const { utilizador } = useAuth()

  const [modoInterface, setModoInterface] = useState<'rapido' | 'assistente'>('rapido')

  const [topico, setTopico] = useState('')
  const [formato, setFormato] = useState('post')
  const [plataforma, setPlataforma] = useState('instagram')
  const [modo, setModo] = useState('normal')

  const [objetivo, setObjetivo] = useState('Ganhar seguidores')
  const [nicho, setNicho] = useState('')
  const [especialista, setEspecialista] = useState('estratega')
  const [quantidade, setQuantidade] = useState(5)

  const [resultado, setResultado] = useState<ResultadoIA | null>(null)
  const [pacote, setPacote] = useState<ResultadoIA[]>([])

  const [carregando, setCarregando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [copiado, setCopiado] = useState<string | null>(null)

  useEffect(() => {
    const ideia = localStorage.getItem('adpulse_ideia')

    if (ideia) {
      setModoInterface('rapido')
      setTopico(ideia)
      setModo('viral')
      localStorage.removeItem('adpulse_ideia')
    }
  }, [])

  const iniciarCheckout = async (plano: 'pro' | 'agencia') => {
    if (!utilizador?.email || !utilizador?.id) {
      window.location.href = '/auth/login'
      return
    }

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
  }

  const gerarConteudoUnico = async (tema: string) => {
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
        topico: tema,
        formato,
        plataforma,
        modo,
        tom: 'Informal',
      }),
    })

    const data = await res.json()
    return normalizarResultado(data)
  }

  const gerarConteudoRapido = async () => {
    if (!topico.trim()) return

    setCarregando(true)
    setMensagem('')
    setResultado(null)
    setPacote([])

    try {
      const conteudo = await gerarConteudoUnico(topico)
      setResultado(conteudo)
    } catch {
      setMensagem('Erro ao gerar conteúdo.')
    } finally {
      setCarregando(false)
    }
  }

  const gerarPacoteAssistente = async () => {
    if (!nicho.trim()) return

    setCarregando(true)
    setMensagem('')
    setResultado(null)
    setPacote([])

    const esp = ESPECIALISTAS.find((e) => e.id === especialista)

    const temas = Array.from({ length: quantidade }).map((_, i) => {
      return `
Objetivo: ${objetivo}
Nicho: ${nicho}
Especialista: ${esp?.nome} — ${esp?.cargo}
Tarefa: cria o conteúdo ${i + 1} de ${quantidade} para este pacote.
O conteúdo deve ser diferente dos anteriores, útil, forte e pronto a publicar.
`
    })

    try {
      const resultados: ResultadoIA[] = []

      for (const tema of temas) {
        const conteudo = await gerarConteudoUnico(tema)

        if (conteudo.upgrade) {
          setResultado(conteudo)
          break
        }

        resultados.push({
          ...conteudo,
          titulo: `${esp?.emoji} Conteúdo ${resultados.length + 1}`,
        })
      }

      setPacote(resultados)
    } catch {
      setMensagem('Erro ao gerar pacote.')
    } finally {
      setCarregando(false)
    }
  }

  const guardarNaBiblioteca = async (item?: ResultadoIA) => {
    const conteudo = item || resultado

    if (!conteudo || !utilizador) return

    if (conteudo.upgrade) {
      setMensagem('Não podes guardar uma mensagem de limite. Faz upgrade para continuares.')
      return
    }

    setGuardando(true)
    setMensagem('')

    try {
      const { error } = await supabase.from('conteudos_guardados').insert({
        utilizador_id: utilizador.id,
        topico: modoInterface === 'assistente' ? nicho : topico,
        formato,
        plataforma,
        modo,
        hook: conteudo.hook,
        legenda: conteudo.legenda,
        hashtags: conteudo.hashtags,
        slides: conteudo.slides || [],
      })

      if (error) throw error

      setMensagem('✅ Conteúdo guardado na biblioteca.')
    } catch {
      setMensagem('❌ Erro ao guardar conteúdo.')
    } finally {
      setGuardando(false)
    }
  }

  const guardarPacote = async () => {
    if (!utilizador || pacote.length === 0) return

    setGuardando(true)
    setMensagem('')

    try {
      const linhas = pacote.map((conteudo) => ({
        utilizador_id: utilizador.id,
        topico: nicho,
        formato,
        plataforma,
        modo,
        hook: conteudo.hook,
        legenda: conteudo.legenda,
        hashtags: conteudo.hashtags,
        slides: conteudo.slides || [],
      }))

      const { error } = await supabase.from('conteudos_guardados').insert(linhas)

      if (error) throw error

      setMensagem(`✅ Pacote com ${pacote.length} conteúdos guardado na biblioteca.`)
    } catch {
      setMensagem('❌ Erro ao guardar pacote.')
    } finally {
      setGuardando(false)
    }
  }

  const copiar = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 1500)
  }

  return (
    <>
      <Head>
        <title>AI Content Studio — AdPulse</title>
      </Head>

      <LayoutPainel titulo="AI Content Studio">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="card flex gap-2">
            <button
              onClick={() => setModoInterface('rapido')}
              className="flex-1 py-3 rounded-xl font-semibold"
              style={{
                background: modoInterface === 'rapido' ? 'var(--cor-marca)' : 'var(--cor-elevado)',
                color: modoInterface === 'rapido' ? '#fff' : 'var(--cor-texto-muted)',
                border: 'none',
              }}
            >
              ⚡ Modo rápido
            </button>

            <button
              onClick={() => setModoInterface('assistente')}
              className="flex-1 py-3 rounded-xl font-semibold"
              style={{
                background: modoInterface === 'assistente' ? 'var(--cor-marca)' : 'var(--cor-elevado)',
                color: modoInterface === 'assistente' ? '#fff' : 'var(--cor-texto-muted)',
                border: 'none',
              }}
            >
              🤖 Assistente guiado
            </button>
          </div>

          {modoInterface === 'rapido' && (
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
                    }}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>

              <button
                onClick={gerarConteudoRapido}
                disabled={carregando || !topico.trim()}
                className="btn-primario justify-center"
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
          )}

          {modoInterface === 'assistente' && (
            <div className="card flex flex-col gap-5">
              <div>
                <h2 className="font-bold text-xl" style={{ fontFamily: 'var(--fonte-display)' }}>
                  🤖 Assistente guiado AdPulse
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                  Escolhe o objetivo, o especialista e o nicho. A equipa IA cria um pacote completo de conteúdos.
                </p>
              </div>

              <div>
                <label className="text-xs mb-2 block" style={{ color: 'var(--cor-texto-muted)' }}>
                  Objetivo
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {OBJETIVOS.map((obj) => (
                    <button
                      key={obj}
                      onClick={() => setObjetivo(obj)}
                      className="px-3 py-3 rounded-xl text-sm text-left"
                      style={{
                        background: objetivo === obj ? 'rgba(124,123,250,0.18)' : 'var(--cor-elevado)',
                        color: objetivo === obj ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                        border: `1px solid ${objetivo === obj ? 'rgba(124,123,250,0.35)' : 'var(--cor-borda)'}`,
                      }}
                    >
                      {obj}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs mb-2 block" style={{ color: 'var(--cor-texto-muted)' }}>
                  Especialista IA
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ESPECIALISTAS.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setEspecialista(e.id)}
                      className="p-4 rounded-xl text-left"
                      style={{
                        background: especialista === e.id ? 'rgba(124,123,250,0.18)' : 'var(--cor-elevado)',
                        border: `1px solid ${especialista === e.id ? 'rgba(124,123,250,0.35)' : 'var(--cor-borda)'}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{e.emoji}</span>
                        <div>
                          <p className="font-semibold text-sm">{e.nome}</p>
                          <p className="text-xs" style={{ color: 'var(--cor-marca)' }}>
                            {e.cargo}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs mt-2" style={{ color: 'var(--cor-texto-muted)' }}>
                        {e.descricao}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs mb-2 block" style={{ color: 'var(--cor-texto-muted)' }}>
                    Nicho / tema
                  </label>
                  <input
                    value={nicho}
                    onChange={(e) => setNicho(e.target.value)}
                    placeholder="Ex: motivação para atletas, negócios, restauração..."
                    className="input-campo w-full"
                  />
                </div>

                <div>
                  <label className="text-xs mb-2 block" style={{ color: 'var(--cor-texto-muted)' }}>
                    Plataforma
                  </label>
                  <select
                    value={plataforma}
                    onChange={(e) => setPlataforma(e.target.value)}
                    className="input-campo w-full"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs mb-2 block" style={{ color: 'var(--cor-texto-muted)' }}>
                    Quantidade
                  </label>
                  <select
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="input-campo w-full"
                  >
                    <option value={3}>3 conteúdos</option>
                    <option value={5}>5 conteúdos</option>
                    <option value={10}>10 conteúdos</option>
                  </select>
                </div>
              </div>

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
                    }}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>

              <button
                onClick={gerarPacoteAssistente}
                disabled={carregando || !nicho.trim()}
                className="btn-primario justify-center py-4"
              >
                {carregando ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    A equipa AdPulse está a trabalhar...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Gerar pacote com a equipa IA
                  </>
                )}
              </button>
            </div>
          )}

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

                  <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
                    Faz upgrade para desbloquear gerações ilimitadas e continuar a criar hoje.
                  </p>

                  <button
                    onClick={() => iniciarCheckout('pro')}
                    className="w-full py-3 rounded-xl font-semibold"
                    style={{
                      background: 'var(--cor-marca)',
                      color: '#fff',
                      border: 'none',
                    }}
                  >
                    🔥 Desbloquear gerações ilimitadas
                  </button>
                </div>
              )}

              {!resultado.upgrade && (
                <button
                  onClick={() => guardarNaBiblioteca()}
                  disabled={guardando}
                  className="btn-primario justify-center"
                >
                  <Save size={16} />
                  {guardando ? 'A guardar...' : 'Guardar na biblioteca'}
                </button>
              )}
            </div>
          )}

          {pacote.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Pacote gerado
                </h2>

                <button
                  onClick={guardarPacote}
                  disabled={guardando}
                  className="btn-primario"
                >
                  <Package size={16} />
                  {guardando ? 'A guardar...' : 'Guardar pacote'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pacote.map((item, i) => {
                  const textoCompleto = `${item.hook}\n\n${item.legenda}\n\n${item.hashtags.join(' ')}`

                  return (
                    <div key={i} className="card flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            background: 'rgba(124,123,250,0.12)',
                            color: 'var(--cor-marca)',
                          }}
                        >
                          {item.titulo || `Conteúdo ${i + 1}`}
                        </span>

                        <button
                          onClick={() => copiar(textoCompleto, `pacote-${i}`)}
                          className="text-xs flex items-center gap-1"
                          style={{
                            color: copiado === `pacote-${i}` ? 'var(--cor-sucesso)' : 'var(--cor-texto-muted)',
                          }}
                        >
                          {copiado === `pacote-${i}` ? (
                            <>
                              <CheckCircle size={13} />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              Copiar
                            </>
                          )}
                        </button>
                      </div>

                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--cor-marca)' }}>
                          Hook
                        </p>
                        <p className="text-sm">{item.hook}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--cor-texto-muted)' }}>
                          Legenda
                        </p>
                        <p className="text-sm whitespace-pre-line">{item.legenda}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--cor-texto-muted)' }}>
                          Hashtags
                        </p>
                        <p className="text-xs">{item.hashtags.join(' ')}</p>
                      </div>

                      <button
                        onClick={() => guardarNaBiblioteca(item)}
                        disabled={guardando}
                        className="btn-primario justify-center"
                      >
                        <Save size={15} />
                        Guardar este conteúdo
                      </button>
                    </div>
                  )
                })}
              </div>
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
