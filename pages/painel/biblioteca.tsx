// ============================================
// AdPulse — Biblioteca de Conteúdos
// ============================================

import Head from 'next/head'
import { useEffect, useState } from 'react'
import {
  Copy,
  Trash2,
  CheckCircle,
  Loader,
  Search,
  Hash,
  FileText,
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

type ConteudoGuardado = {
  id: string
  utilizador_id: string
  topico: string
  formato: string
  plataforma: string
  tom?: string
  modo: string
  hook: string
  legenda: string
  hashtags: string[]
  slides: { tipo: string; conteudo: string }[]
  criado_em: string
}

export default function BibliotecaPage() {
  const { utilizador } = useAuth()

  const [conteudos, setConteudos] = useState<ConteudoGuardado[]>([])
  const [pesquisa, setPesquisa] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!utilizador) return
    carregarConteudos()
  }, [utilizador])

  async function carregarConteudos() {
    setCarregando(true)
    setErro('')

    const { data, error } = await supabase
      .from('conteudos_guardados')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) {
      setErro('Erro ao carregar biblioteca.')
      setCarregando(false)
      return
    }

    setConteudos(data || [])
    setCarregando(false)
  }

  async function apagarConteudo(id: string) {
    const confirmar = window.confirm('Tens a certeza que queres apagar este conteúdo?')
    if (!confirmar) return

    const { error } = await supabase
      .from('conteudos_guardados')
      .delete()
      .eq('id', id)

    if (error) {
      setErro('Erro ao apagar conteúdo.')
      return
    }

    setConteudos((prev) => prev.filter((item) => item.id !== id))
  }

  function copiarTexto(texto: string, id: string) {
    navigator.clipboard.writeText(texto || '')
    setCopiado(id)

    setTimeout(() => {
      setCopiado(null)
    }, 2000)
  }

  const conteudosFiltrados = conteudos.filter((item) => {
    const texto = `${item.topico} ${item.hook} ${item.legenda} ${item.formato} ${item.plataforma} ${item.modo}`.toLowerCase()
    return texto.includes(pesquisa.toLowerCase())
  })

  return (
    <>
      <Head>
        <title>Biblioteca — AdPulse</title>
      </Head>

      <LayoutPainel titulo="Biblioteca">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div
            className="card"
            style={{
              background:
                'linear-gradient(135deg, rgba(124,123,250,0.1), rgba(244,114,182,0.08))',
              border: '1px solid rgba(124,123,250,0.2)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  background: 'rgba(124,123,250,0.15)',
                  border: '1px solid rgba(124,123,250,0.3)',
                }}
              >
                📚
              </div>

              <div>
                <h2
                  className="font-bold text-xl"
                  style={{ fontFamily: 'var(--fonte-display)' }}
                >
                  Biblioteca de Conteúdos
                </h2>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--cor-texto-muted)' }}
                >
                  Todos os conteúdos guardados no AI Content Studio.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--cor-texto-fraco)' }}
              />

              <input
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Pesquisar por tópico, formato, plataforma ou legenda..."
                className="input-campo pl-11"
              />
            </div>
          </div>

          {erro && (
            <div
              className="p-4 rounded-xl text-sm"
              style={{
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                color: 'var(--cor-erro)',
              }}
            >
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3">
              <Loader
                size={28}
                className="animate-spin"
                style={{ color: 'var(--cor-marca)' }}
              />
              <p style={{ color: 'var(--cor-texto-muted)' }}>
                A carregar biblioteca...
              </p>
            </div>
          ) : conteudosFiltrados.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-center">
              <FileText size={36} style={{ color: 'var(--cor-texto-fraco)' }} />

              <h3
                className="font-semibold text-lg"
                style={{ fontFamily: 'var(--fonte-display)' }}
              >
                Nenhum conteúdo encontrado
              </h3>

              <p
                className="text-sm"
                style={{ color: 'var(--cor-texto-muted)' }}
              >
                Guarda conteúdos no AI Content Studio para aparecerem aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {conteudosFiltrados.map((item) => {
                const textoCompleto = `${item.hook}

${item.legenda}

${(item.hashtags || []).join(' ')}`

                return (
                  <div key={item.id} className="card flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className="text-xs px-2.5 py-1 rounded-full"
                            style={{
                              background: 'rgba(124,123,250,0.12)',
                              color: 'var(--cor-marca)',
                              border: '1px solid rgba(124,123,250,0.25)',
                            }}
                          >
                            {item.formato || 'conteúdo'}
                          </span>

                          <span
                            className="text-xs px-2.5 py-1 rounded-full"
                            style={{
                              background: 'rgba(96,165,250,0.12)',
                              color: 'var(--cor-info)',
                              border: '1px solid rgba(96,165,250,0.25)',
                            }}
                          >
                            {item.plataforma || 'plataforma'}
                          </span>

                          <span
                            className="text-xs px-2.5 py-1 rounded-full"
                            style={{
                              background: 'rgba(244,114,182,0.12)',
                              color: '#f472b6',
                              border: '1px solid rgba(244,114,182,0.25)',
                            }}
                          >
                            {item.modo || 'normal'}
                          </span>
                        </div>

                        <p
                          className="text-xs mb-2"
                          style={{ color: 'var(--cor-texto-fraco)' }}
                        >
                          {new Date(item.criado_em).toLocaleDateString('pt-PT')}
                        </p>

                        <h3
                          className="font-semibold text-base"
                          style={{ fontFamily: 'var(--fonte-display)' }}
                        >
                          {item.topico || 'Conteúdo sem tópico'}
                        </h3>
                      </div>

                      <button
                        onClick={() => apagarConteudo(item.id)}
                        className="p-2 rounded-xl"
                        style={{
                          background: 'rgba(248,113,113,0.1)',
                          color: 'var(--cor-erro)',
                          border: '1px solid rgba(248,113,113,0.2)',
                          cursor: 'pointer',
                        }}
                        title="Apagar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div>
                      <p
                        className="text-xs font-semibold mb-1"
                        style={{ color: 'var(--cor-marca)' }}
                      >
                        Hook
                      </p>
                      <p className="text-sm leading-relaxed">{item.hook}</p>
                    </div>

                    <div>
                      <p
                        className="text-xs font-semibold mb-1"
                        style={{ color: 'var(--cor-texto-muted)' }}
                      >
                        Legenda
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {item.legenda}
                      </p>
                    </div>

                    {(item.hashtags || []).length > 0 && (
                      <div>
                        <p
                          className="text-xs font-semibold mb-2 flex items-center gap-1"
                          style={{ color: 'var(--cor-info)' }}
                        >
                          <Hash size={13} />
                          Hashtags
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {item.hashtags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                background: 'rgba(96,165,250,0.12)',
                                color: 'var(--cor-info)',
                                border: '1px solid rgba(96,165,250,0.2)',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(item.slides || []).length > 0 && (
                      <div>
                        <p
                          className="text-xs font-semibold mb-2"
                          style={{ color: 'var(--cor-texto-muted)' }}
                        >
                          Slides
                        </p>

                        <div className="flex flex-col gap-2">
                          {item.slides.map((slide, index) => (
                            <div
                              key={index}
                              className="p-3 rounded-xl"
                              style={{
                                background: 'var(--cor-elevado)',
                                border: '1px solid var(--cor-borda)',
                              }}
                            >
                              <p
                                className="text-xs font-semibold mb-1"
                                style={{ color: 'var(--cor-marca)' }}
                              >
                                {slide.tipo}
                              </p>
                              <p className="text-xs">{slide.conteudo}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => copiarTexto(textoCompleto, item.id)}
                      className="btn-primario justify-center flex items-center gap-2"
                    >
                      {copiado === item.id ? (
                        <>
                          <CheckCircle size={16} />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copiar conteúdo
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </LayoutPainel>
    </>
  )
}
