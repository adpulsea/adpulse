// ============================================
// AdPulse — Clientes / Workspaces Agência
// ============================================

import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Plus,
  FolderOpen,
  Loader,
  Trash2,
  Search,
  Users,
  ArrowRight,
  Building2,
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

type Cliente = {
  id: string
  utilizador_id: string
  nome: string
  nicho: string
  descricao: string
  publico_alvo: string
  tom_voz: string
  objetivo: string
  plataformas: string[]
  hashtags_fixas: string[]
  cta_padrao: string
  website: string
  cores_marca: string
  notas: string
  ativo: boolean
  criado_em: string
}

const PLATAFORMAS = ['instagram', 'tiktok', 'youtube', 'linkedin', 'facebook']

const COR_PLATAFORMA: Record<string, string> = {
  instagram: '#E1306C',
  tiktok: '#00f2ea',
  youtube: '#FF0000',
  linkedin: '#0077B5',
  facebook: '#1877F2',
}

export default function ClientesPage() {
  const router = useRouter()
  const { utilizador } = useAuth()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [criando, setCriando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [pesquisa, setPesquisa] = useState('')
  const [erro, setErro] = useState('')

  const [nome, setNome] = useState('')
  const [nicho, setNicho] = useState('')
  const [descricao, setDescricao] = useState('')
  const [publicoAlvo, setPublicoAlvo] = useState('')
  const [tomVoz, setTomVoz] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [plataformas, setPlataformas] = useState<string[]>(['instagram'])
  const [hashtagsFixas, setHashtagsFixas] = useState('')
  const [ctaPadrao, setCtaPadrao] = useState('')
  const [website, setWebsite] = useState('')
  const [coresMarca, setCoresMarca] = useState('')
  const [notas, setNotas] = useState('')

  useEffect(() => {
    if (!utilizador) return
    carregarClientes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilizador])

  const limparFormulario = () => {
    setNome('')
    setNicho('')
    setDescricao('')
    setPublicoAlvo('')
    setTomVoz('')
    setObjetivo('')
    setPlataformas(['instagram'])
    setHashtagsFixas('')
    setCtaPadrao('')
    setWebsite('')
    setCoresMarca('')
    setNotas('')
  }

  const carregarClientes = async () => {
    if (!utilizador) return

    setCarregando(true)
    setErro('')

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('utilizador_id', utilizador.id)
      .eq('ativo', true)
      .order('criado_em', { ascending: false })

    if (error) {
      console.error(error)
      setErro('Erro ao carregar clientes.')
      setCarregando(false)
      return
    }

    setClientes(data || [])
    setCarregando(false)
  }

  const togglePlataforma = (p: string) => {
    setPlataformas((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    )
  }

  const hashtagsArray = (valor: string) => {
    return valor
      .split(/\s+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
  }

  const criarCliente = async () => {
    if (!utilizador) {
      alert('Sessão não encontrada. Faz login novamente.')
      return
    }

    if (!nome.trim()) {
      alert('Escreve o nome do cliente.')
      return
    }

    setSalvando(true)

    const { data, error } = await supabase
      .from('clientes')
      .insert({
        utilizador_id: utilizador.id,
        nome: nome.trim(),
        nicho: nicho.trim(),
        descricao: descricao.trim(),
        publico_alvo: publicoAlvo.trim(),
        tom_voz: tomVoz.trim(),
        objetivo: objetivo.trim(),
        plataformas: plataformas.length ? plataformas : ['instagram'],
        hashtags_fixas: hashtagsArray(hashtagsFixas),
        cta_padrao: ctaPadrao.trim(),
        website: website.trim(),
        cores_marca: coresMarca.trim(),
        notas: notas.trim(),
        ativo: true,
      })
      .select('*')
      .single()

    if (error) {
      console.error(error)
      alert(error.message || 'Erro ao criar cliente.')
      setSalvando(false)
      return
    }

    limparFormulario()
    setCriando(false)
    setSalvando(false)

    if (data?.id) {
      router.push(`/painel/clientes/${data.id}`)
    } else {
      carregarClientes()
    }
  }

  const apagarCliente = async (id: string) => {
    if (!confirm('Queres arquivar este cliente? Os conteúdos não serão apagados.')) return

    const { error } = await supabase
      .from('clientes')
      .update({ ativo: false })
      .eq('id', id)
      .eq('utilizador_id', utilizador?.id)

    if (error) {
      alert(error.message || 'Erro ao arquivar cliente.')
      return
    }

    setClientes((prev) => prev.filter((cliente) => cliente.id !== id))
  }

  const filtrados = clientes.filter((cliente) => {
    const texto = `${cliente.nome} ${cliente.nicho} ${cliente.descricao} ${cliente.publico_alvo} ${cliente.objetivo}`.toLowerCase()
    return texto.includes(pesquisa.toLowerCase())
  })

  return (
    <>
      <Head>
        <title>Clientes — AdPulse</title>
      </Head>

      <LayoutPainel titulo="Clientes">
        <div className="max-w-6xl mx-auto w-full">
          <div
            className="card mb-6"
            style={{
              background:
                'linear-gradient(135deg, rgba(124,123,250,0.12), rgba(244,114,182,0.08))',
              border: '1px solid rgba(124,123,250,0.25)',
            }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(124,123,250,0.16)',
                    border: '1px solid rgba(124,123,250,0.3)',
                  }}
                >
                  <Users size={26} style={{ color: 'var(--cor-marca)' }} />
                </div>

                <div>
                  <h1
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: 'var(--fonte-display)' }}
                  >
                    Clientes
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                    Cria pastas de clientes com base de publicação, campanhas, calendário e biblioteca.
                  </p>
                </div>
              </div>

              <button onClick={() => setCriando(true)} className="btn-primario">
                <Plus size={16} />
                Novo cliente
              </button>
            </div>
          </div>

          <div className="card mb-6">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--cor-texto-fraco)' }}
              />
              <input
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Pesquisar cliente, nicho, objetivo ou público..."
                className="input-campo pl-11"
              />
            </div>
          </div>

          {erro && (
            <div
              className="mb-6 p-4 rounded-xl text-sm"
              style={{
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                color: 'var(--cor-erro)',
              }}
            >
              {erro}
            </div>
          )}

          {criando && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{
                background: 'rgba(0,0,0,0.72)',
                backdropFilter: 'blur(5px)',
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setCriando(false)
              }}
            >
              <div className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h2
                      className="text-xl font-bold"
                      style={{ fontFamily: 'var(--fonte-display)' }}
                    >
                      Novo cliente
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                      Cria a base que a AdPulse vai usar para gerar conteúdo deste cliente.
                    </p>
                  </div>

                  <button onClick={() => setCriando(false)} className="btn-secundario">
                    Fechar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Campo label="Nome do cliente">
                    <input
                      className="input-campo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Restaurante Mar Azul"
                    />
                  </Campo>

                  <Campo label="Nicho / área">
                    <input
                      className="input-campo"
                      value={nicho}
                      onChange={(e) => setNicho(e.target.value)}
                      placeholder="Ex: Restaurante, fitness, estética..."
                    />
                  </Campo>

                  <Campo label="Público-alvo">
                    <input
                      className="input-campo"
                      value={publicoAlvo}
                      onChange={(e) => setPublicoAlvo(e.target.value)}
                      placeholder="Ex: famílias, turistas, jovens adultos..."
                    />
                  </Campo>

                  <Campo label="Tom de voz">
                    <input
                      className="input-campo"
                      value={tomVoz}
                      onChange={(e) => setTomVoz(e.target.value)}
                      placeholder="Ex: próximo, premium, divertido..."
                    />
                  </Campo>

                  <Campo label="Objetivo principal">
                    <input
                      className="input-campo"
                      value={objetivo}
                      onChange={(e) => setObjetivo(e.target.value)}
                      placeholder="Ex: reservas, leads, vendas..."
                    />
                  </Campo>

                  <Campo label="CTA padrão">
                    <input
                      className="input-campo"
                      value={ctaPadrao}
                      onChange={(e) => setCtaPadrao(e.target.value)}
                      placeholder="Ex: Reserva já / Envia mensagem..."
                    />
                  </Campo>

                  <Campo label="Website / link">
                    <input
                      className="input-campo"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                    />
                  </Campo>

                  <Campo label="Cores da marca">
                    <input
                      className="input-campo"
                      value={coresMarca}
                      onChange={(e) => setCoresMarca(e.target.value)}
                      placeholder="Ex: azul, branco, dourado..."
                    />
                  </Campo>
                </div>

                <Campo label="Descrição do negócio">
                  <textarea
                    rows={3}
                    className="input-campo resize-none"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="O que este cliente faz, vende e representa..."
                  />
                </Campo>

                <Campo label="Plataformas">
                  <div className="flex flex-wrap gap-2">
                    {PLATAFORMAS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlataforma(p)}
                        className="px-3 py-1.5 rounded-xl text-sm transition-all capitalize"
                        style={{
                          background: plataformas.includes(p)
                            ? `${COR_PLATAFORMA[p]}18`
                            : 'var(--cor-elevado)',
                          border: `1px solid ${
                            plataformas.includes(p)
                              ? COR_PLATAFORMA[p] + '50'
                              : 'var(--cor-borda)'
                          }`,
                          color: plataformas.includes(p)
                            ? COR_PLATAFORMA[p]
                            : 'var(--cor-texto-muted)',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </Campo>

                <Campo label="Hashtags fixas">
                  <textarea
                    rows={2}
                    className="input-campo resize-none"
                    value={hashtagsFixas}
                    onChange={(e) => setHashtagsFixas(e.target.value)}
                    placeholder="#marca #nicho #local..."
                  />
                </Campo>

                <Campo label="Notas importantes">
                  <textarea
                    rows={3}
                    className="input-campo resize-none"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Preferências, restrições, detalhes que a IA deve saber..."
                  />
                </Campo>

                <div className="flex justify-end gap-3 mt-5 flex-wrap">
                  <button onClick={() => setCriando(false)} className="btn-secundario">
                    Cancelar
                  </button>

                  <button
                    onClick={criarCliente}
                    disabled={salvando || !nome.trim()}
                    className="btn-primario"
                    style={salvando || !nome.trim() ? { opacity: 0.65 } : {}}
                  >
                    {salvando ? (
                      <>
                        <Loader size={14} className="animate-spin" />
                        A criar...
                      </>
                    ) : (
                      <>
                        <Plus size={15} />
                        Criar cliente
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {carregando ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3">
              <Loader size={28} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
              <p style={{ color: 'var(--cor-texto-muted)' }}>A carregar clientes...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="card flex flex-col items-center justify-center text-center py-16">
              <FolderOpen size={38} style={{ color: 'var(--cor-texto-fraco)' }} />
              <h3
                className="font-semibold text-lg mt-4 mb-2"
                style={{ fontFamily: 'var(--fonte-display)' }}
              >
                Nenhum cliente encontrado
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--cor-texto-muted)' }}>
                Cria o primeiro cliente para organizar campanhas, imagens e calendário.
              </p>
              <button onClick={() => setCriando(true)} className="btn-primario">
                <Plus size={16} />
                Criar cliente
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className="card-hover cursor-pointer group relative"
                  onClick={() => router.push(`/painel/clientes/${cliente.id}`)}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      apagarCliente(cliente.id)
                    }}
                    className="absolute top-4 right-4 p-1.5 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10"
                    style={{
                      color: 'var(--cor-erro)',
                      background: 'rgba(248,113,113,0.08)',
                      border: '1px solid rgba(248,113,113,0.18)',
                    }}
                    title="Arquivar cliente"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'rgba(124,123,250,0.12)',
                        border: '1px solid rgba(124,123,250,0.25)',
                      }}
                    >
                      <Building2 size={20} style={{ color: 'var(--cor-marca)' }} />
                    </div>

                    <div className="min-w-0 pr-7">
                      <h3 className="font-bold truncate">{cliente.nome}</h3>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--cor-texto-muted)' }}>
                        {cliente.nicho || 'Sem nicho definido'}
                      </p>
                    </div>
                  </div>

                  <p
                    className="text-sm line-clamp-2 mb-4"
                    style={{ color: 'var(--cor-texto-muted)' }}
                  >
                    {cliente.descricao || cliente.objetivo || 'Cliente pronto para configurar.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(cliente.plataformas || []).map((p) => (
                      <span
                        key={p}
                        className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{
                          background: `${COR_PLATAFORMA[p] || 'var(--cor-marca)'}18`,
                          color: COR_PLATAFORMA[p] || 'var(--cor-marca)',
                          border: `1px solid ${COR_PLATAFORMA[p] || 'var(--cor-marca)'}30`,
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
                      {new Date(cliente.criado_em).toLocaleDateString('pt-PT')}
                    </span>

                    <span
                      className="text-xs flex items-center gap-1"
                      style={{ color: 'var(--cor-marca)' }}
                    >
                      Entrar <ArrowRight size={12} />
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

function Campo({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <label className="label-campo">{label}</label>
      {children}
    </div>
  )
}
