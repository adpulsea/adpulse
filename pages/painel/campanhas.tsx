// ============================================
// AdPulse — Gestão de Campanhas
// Página principal estável e clicável
// ============================================

import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import {
  Plus,
  FolderOpen,
  Trash2,
  Loader,
  ArrowRight,
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

type Campanha = {
  id: string
  nome: string
  descricao: string | null
  plataformas: string[] | null
  total_posts: number | null
  criado_em: string
}

const COR_PLATAFORMA: Record<string, string> = {
  instagram: '#E1306C',
  tiktok: '#00f2ea',
  youtube: '#FF0000',
  linkedin: '#0077B5',
}

export default function Campanhas() {
  const router = useRouter()
  const { utilizador } = useAuth()

  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [carregando, setCarregando] = useState(true)
  const [criandoCampanha, setCriandoCampanha] = useState(false)

  const [nomeCampanha, setNomeCampanha] = useState('')
  const [descricaoCampanha, setDescricaoCampanha] = useState('')
  const [plataformasSelecionadas, setPlataformasSelecionadas] = useState<string[]>(['instagram'])
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!utilizador) {
      const timer = setTimeout(() => {
        setCarregando(false)
      }, 2500)

      return () => clearTimeout(timer)
    }

    buscarCampanhas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilizador])

  const buscarCampanhas = async () => {
    if (!utilizador) {
      setCarregando(false)
      return
    }

    setCarregando(true)

    try {
      const { data, error } = await supabase
        .from('campanhas')
        .select('*')
        .eq('utilizador_id', utilizador.id)
        .order('criado_em', { ascending: false })

      if (error) {
        console.error('Erro ao buscar campanhas:', error)
        setCampanhas([])
        setCarregando(false)
        return
      }

      const campanhasBase = data || []

      const campanhasComTotais = await Promise.all(
        campanhasBase.map(async (campanha: Campanha) => {
          try {
            const { count, error: countError } = await supabase
              .from('campanha_conteudos')
              .select('*', { count: 'exact', head: true })
              .eq('campanha_id', campanha.id)
              .eq('utilizador_id', utilizador.id)

            if (countError) {
              return {
                ...campanha,
                total_posts: campanha.total_posts || 0,
              }
            }

            return {
              ...campanha,
              total_posts: count || 0,
            }
          } catch {
            return {
              ...campanha,
              total_posts: campanha.total_posts || 0,
            }
          }
        })
      )

      setCampanhas(campanhasComTotais)
    } catch (error) {
      console.error('Erro geral ao carregar campanhas:', error)
      setCampanhas([])
    }

    setCarregando(false)
  }

  const togglePlataforma = (p: string) => {
    setPlataformasSelecionadas((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const criarCampanha = async () => {
    if (!nomeCampanha.trim()) {
      alert('Escreve o nome da campanha.')
      return
    }

    if (!utilizador) {
      alert('Sessão não encontrada. Faz login novamente.')
      return
    }

    setSalvando(true)

    try {
      const { data, error } = await supabase
        .from('campanhas')
        .insert({
          utilizador_id: utilizador.id,
          nome: nomeCampanha.trim(),
          descricao: descricaoCampanha.trim(),
          plataformas: plataformasSelecionadas.length ? plataformasSelecionadas : ['instagram'],
          total_posts: 0,
        })
        .select('*')
        .single()

      if (error) {
        alert(error.message || 'Erro ao criar campanha.')
        setSalvando(false)
        return
      }

      setNomeCampanha('')
      setDescricaoCampanha('')
      setPlataformasSelecionadas(['instagram'])
      setCriandoCampanha(false)
      setSalvando(false)

      if (data?.id) {
        router.push(`/painel/campanhas/${data.id}`)
      } else {
        buscarCampanhas()
      }
    } catch (error: any) {
      alert(error?.message || 'Erro ao criar campanha.')
      setSalvando(false)
    }
  }

  const apagarCampanha = async (id: string) => {
    if (!confirm('Tens a certeza que queres apagar esta campanha?')) return

    try {
      await supabase.from('campanha_conteudos').delete().eq('campanha_id', id)

      const { error } = await supabase
        .from('campanhas')
        .delete()
        .eq('id', id)

      if (error) {
        alert(error.message || 'Erro ao apagar campanha.')
        return
      }

      setCampanhas((prev) => prev.filter((c) => c.id !== id))
    } catch (error: any) {
      alert(error?.message || 'Erro ao apagar campanha.')
    }
  }

  const abrirCampanha = (id: string) => {
    router.push(`/painel/campanhas/${id}`)
  }

  return (
    <>
      <Head>
        <title>Campanhas — AdPulse</title>
      </Head>

      <LayoutPainel titulo="Campanhas">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: 'var(--fonte-display)' }}
              >
                Campanhas
              </h1>

              <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                {campanhas.length} campanha{campanhas.length !== 1 ? 's' : ''} ativa
                {campanhas.length !== 1 ? 's' : ''}
              </p>

              <p className="text-xs mt-1" style={{ color: 'var(--cor-texto-fraco)' }}>
                Organiza posts, stories, legendas e conteúdos preparados para publicar.
              </p>
            </div>

            <button onClick={() => setCriandoCampanha(true)} className="btn-primario">
              <Plus size={16} />
              Nova campanha
            </button>
          </div>

          {criandoCampanha && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{
                background: 'rgba(0,0,0,0.72)',
                backdropFilter: 'blur(5px)',
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setCriandoCampanha(false)
              }}
            >
              <div className="card w-full max-w-md" style={{ minWidth: 0 }}>
                <h3
                  className="font-semibold text-lg mb-4"
                  style={{ fontFamily: 'var(--fonte-display)' }}
                >
                  Nova campanha
                </h3>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="label-campo">Nome da campanha</label>
                    <input
                      value={nomeCampanha}
                      onChange={(e) => setNomeCampanha(e.target.value)}
                      placeholder="Ex: Conteúdo para amanhã"
                      className="input-campo"
                    />
                  </div>

                  <div>
                    <label className="label-campo">Descrição</label>
                    <textarea
                      value={descricaoCampanha}
                      onChange={(e) => setDescricaoCampanha(e.target.value)}
                      placeholder="Ex: Preparar posts e stories para publicar amanhã."
                      rows={3}
                      className="input-campo resize-none"
                    />
                  </div>

                  <div>
                    <label className="label-campo">Plataformas</label>

                    <div className="flex flex-wrap gap-2">
                      {['instagram', 'tiktok', 'youtube', 'linkedin'].map((p) => (
                        <button
                          type="button"
                          key={p}
                          onClick={() => togglePlataforma(p)}
                          className="px-3 py-1.5 rounded-xl text-sm transition-all capitalize"
                          style={{
                            background: plataformasSelecionadas.includes(p)
                              ? `${COR_PLATAFORMA[p]}18`
                              : 'var(--cor-elevado)',
                            border: `1px solid ${
                              plataformasSelecionadas.includes(p)
                                ? COR_PLATAFORMA[p] + '50'
                                : 'var(--cor-borda)'
                            }`,
                            color: plataformasSelecionadas.includes(p)
                              ? COR_PLATAFORMA[p]
                              : 'var(--cor-texto-muted)',
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCriandoCampanha(false)}
                      className="btn-secundario flex-1 justify-center"
                    >
                      Cancelar
                    </button>

                    <button
                      onClick={criarCampanha}
                      disabled={salvando || !nomeCampanha.trim()}
                      className="btn-primario flex-1 justify-center"
                      style={salvando || !nomeCampanha.trim() ? { opacity: 0.6 } : {}}
                    >
                      {salvando ? (
                        <>
                          <Loader size={14} className="animate-spin" />
                          A criar...
                        </>
                      ) : (
                        <>
                          <Plus size={15} />
                          Criar e abrir
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {carregando ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader
                size={26}
                className="animate-spin"
                style={{ color: 'var(--cor-marca)' }}
              />
              <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                A carregar campanhas...
              </p>
            </div>
          ) : !utilizador ? (
            <div className="card text-center py-14">
              <h3 className="font-semibold text-lg mb-2">Sessão não encontrada</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--cor-texto-muted)' }}>
                Faz login novamente para veres as tuas campanhas.
              </p>
              <button onClick={() => router.push('/auth/login')} className="btn-primario">
                Ir para login
              </button>
            </div>
          ) : campanhas.length === 0 ? (
            <div className="card flex flex-col items-center justify-center text-center py-16">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(124,123,250,0.1)',
                  border: '1px solid rgba(124,123,250,0.2)',
                }}
              >
                <FolderOpen size={28} style={{ color: 'var(--cor-marca)' }} />
              </div>

              <h3
                className="font-semibold text-lg mb-2"
                style={{ fontFamily: 'var(--fonte-display)' }}
              >
                Sem campanhas ainda
              </h3>

              <p className="text-sm mb-6" style={{ color: 'var(--cor-texto-muted)' }}>
                Cria a tua primeira campanha para preparar conteúdos, stories e legendas.
              </p>

              <button onClick={() => setCriandoCampanha(true)} className="btn-primario">
                <Plus size={16} />
                Criar primeira campanha
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campanhas.map((campanha) => (
                <div
                  key={campanha.id}
                  className="card-hover group relative cursor-pointer"
                  onClick={() => abrirCampanha(campanha.id)}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      apagarCampanha(campanha.id)
                    }}
                    className="absolute top-4 right-4 p-1.5 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10"
                    style={{ color: 'var(--cor-texto-fraco)' }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = 'var(--cor-erro)'
                      e.currentTarget.style.background = 'rgba(248,113,113,0.1)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = 'var(--cor-texto-fraco)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                    aria-label="Apagar campanha"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'rgba(124,123,250,0.12)',
                        border: '1px solid rgba(124,123,250,0.2)',
                      }}
                    >
                      <FolderOpen size={18} style={{ color: 'var(--cor-marca)' }} />
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <h3 className="font-semibold truncate">{campanha.nome}</h3>

                      {campanha.descricao && (
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: 'var(--cor-texto-muted)' }}
                        >
                          {campanha.descricao}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(campanha.plataformas || []).map((p) => (
                      <span
                        key={p}
                        className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{
                          background: `${COR_PLATAFORMA[p] || 'var(--cor-marca)'}18`,
                          color: COR_PLATAFORMA[p] || 'var(--cor-marca)',
                          border: `1px solid ${
                            COR_PLATAFORMA[p] || 'var(--cor-marca)'
                          }30`,
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid var(--cor-borda)' }}
                  >
                    <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
                      {campanha.total_posts || 0} conteúdo
                      {(campanha.total_posts || 0) !== 1 ? 's' : ''}
                    </span>

                    <span
                      className="text-xs flex items-center gap-1"
                      style={{ color: 'var(--cor-marca)' }}
                    >
                      Abrir <ArrowRight size={12} />
                    </span>
                  </div>

                  <div className="mt-2">
                    <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
                      Criada em {new Date(campanha.criado_em).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </LayoutPainel>
    </>
  )
}
