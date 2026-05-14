// ============================================
// AdPulse — Biblioteca de Conteúdos e Imagens
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
  ImageIcon,
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
  hashtags: string[] | string
  slides: { tipo: string; conteudo: string }[] | null
  imagem_url?: string | null
  origem?: string | null
  campanha_id?: string | null
  criado_em: string
}

function normalizarHashtags(valor: string[] | string | null | undefined) {
  if (Array.isArray(valor)) return valor
  if (!valor) return []
  return String(valor)
    .split(' ')
    .map((tag) => tag.trim())
    .filter(Boolean)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilizador])

  async function carregarConteudos() {
    if (!utilizador) return

    setCarregando(true)
    setErro('')

    const { data, error } = await supabase
      .from('conteudos_guardados')
      .select('*')
      .eq('utilizador_id', utilizador.id)
      .order('criado_em', { ascending: false })

    if (error) {
      console.error(error)
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
    const hashtagsTexto = normalizarHashtags(item.hashtags).join(' ')
    const texto = `${item.topico || ''} ${item.hook || ''} ${item.legenda || ''} ${item.formato || ''} ${item.plataforma || ''} ${item.modo || ''} ${item.origem || ''} ${hashtagsTexto}`.toLowerCase()

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
                  Conteúdos, legendas e imagens guardadas na AdPulse.
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
                placeholder="Pesquisar por tópico, formato, plataforma, legenda ou imagem..."
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
                Guarda conteúdos ou gera imagens nas campanhas para aparecerem aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {conteudosFiltrados.map((item) => {
                const hashtags = normalizarHashtags(item.hashtags)
                const slides = item.slides || []

                const textoCompleto = `${item.hook || ''}

${item.legenda || ''}

${hashtags.join(' ')}

${item.imagem_url ? `Imagem: ${item.imagem_url}` : ''}`

                const eImagem = Boolean(item.imagem_url)

                return (
                  <div key={item.id} className="card flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                            style={{
                              background: 'rgba(124,123,250,0.12)',
                              color: 'var(--cor-marca)',
                              border: '1px solid rgba(124,123,250,0.25)',
                            }}
                          >
                            {eImagem && <ImageIcon size={12} />}
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
                            {item.origem === 'campanha'
                              ? 'campanha'
                              : item.modo || 'normal'}
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

                    {item.imagem_url && (
                      <div>
                        <img
                          src={item.imagem_url}
                          alt={item.topico || 'Imagem gerada'}
                          style={{
                            width: '100%',
                            maxHeight: 420,
                            objectFit: 'contain',
                            borderRadius: 16,
                            border: '1px solid var(--cor-borda)',
                            background: '#050510',
                          }}
                        />
                      </div>
                    )}

                    {item.hook && (
                      <div>
                        <p
                          className="text-xs font-semibold mb-1"
                          style={{ color: 'var(--cor-marca)' }}
                        >
                          Hook / Texto criativo
                        </p>
                        <p className="text-sm leading-relaxed whitespace-pre-line">
                          {item.hook}
                        </p>
                      </div>
                    )}

                    {item.legenda && (
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
                    )}

                    {hashtags.length > 0 && (
                      <div>
                        <p
                          className="text-xs font-semibold mb-2 flex items-center gap-1"
                          style={{ color: 'var(--cor-info)' }}
                        >
                          <Hash size={13} />
                          Hashtags
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {hashtags.map((tag, index) => (
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

                    {slides.length > 0 && (
                      <div>
                        <p
                          className="text-xs font-semibold mb-2"
                          style={{ color: 'var(--cor-texto-muted)' }}
                        >
                          Slides
                        </p>

                        <div className="flex flex-col gap-2">
                          {slides.map((slide, index) => (
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
