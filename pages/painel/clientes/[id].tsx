// ============================================
// AdPulse — Detalhe do Cliente / Base Agência
// ============================================

import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Save,
  Loader,
  FolderOpen,
  Library,
  CalendarDays,
  Bot,
  Megaphone,
  ImageIcon,
  CheckCircle,
  Sparkles,
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
  temas_principais: string
  temas_proibidos: string
  frases_usar: string
  frases_evitar: string
  horarios_preferidos: string
  tipos_conteudo: string
  promocoes_recorrentes: string
  datas_importantes: string
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

function arrayParaTexto(valor: string[] | null | undefined) {
  if (!Array.isArray(valor)) return ''
  return valor.join(' ')
}

function hashtagsArray(valor: string) {
  return valor
    .split(/\s+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
}

export default function ClienteDetalhePage() {
  const router = useRouter()
  const { id } = router.query
  const { utilizador } = useAuth()

  const clienteId = typeof id === 'string' ? id : ''

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
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

  const [temasPrincipais, setTemasPrincipais] = useState('')
  const [temasProibidos, setTemasProibidos] = useState('')
  const [frasesUsar, setFrasesUsar] = useState('')
  const [frasesEvitar, setFrasesEvitar] = useState('')
  const [horariosPreferidos, setHorariosPreferidos] = useState('')
  const [tiposConteudo, setTiposConteudo] = useState('')
  const [promocoesRecorrentes, setPromocoesRecorrentes] = useState('')
  const [datasImportantes, setDatasImportantes] = useState('')

  const [totais, setTotais] = useState({
    campanhas: 0,
    biblioteca: 0,
    posts: 0,
    imagens: 0,
  })

  useEffect(() => {
    if (!utilizador || !clienteId) return
    carregarCliente()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilizador, clienteId])

  const mostrarMensagem = (texto: string) => {
    setMensagem(texto)
    setTimeout(() => setMensagem(''), 3500)
  }

  const preencherFormulario = (c: Cliente) => {
    setNome(c.nome || '')
    setNicho(c.nicho || '')
    setDescricao(c.descricao || '')
    setPublicoAlvo(c.publico_alvo || '')
    setTomVoz(c.tom_voz || '')
    setObjetivo(c.objetivo || '')
    setPlataformas(c.plataformas || ['instagram'])
    setHashtagsFixas(arrayParaTexto(c.hashtags_fixas))
    setCtaPadrao(c.cta_padrao || '')
    setWebsite(c.website || '')
    setCoresMarca(c.cores_marca || '')
    setNotas(c.notas || '')

    setTemasPrincipais(c.temas_principais || '')
    setTemasProibidos(c.temas_proibidos || '')
    setFrasesUsar(c.frases_usar || '')
    setFrasesEvitar(c.frases_evitar || '')
    setHorariosPreferidos(c.horarios_preferidos || '')
    setTiposConteudo(c.tipos_conteudo || '')
    setPromocoesRecorrentes(c.promocoes_recorrentes || '')
    setDatasImportantes(c.datas_importantes || '')
  }

  const carregarTotais = async () => {
    if (!utilizador || !clienteId) return

    const [campanhasResp, bibliotecaResp, postsResp, imagensResp] = await Promise.all([
      supabase
        .from('campanhas')
        .select('*', { count: 'exact', head: true })
        .eq('utilizador_id', utilizador.id)
        .eq('cliente_id', clienteId),

      supabase
        .from('conteudos_guardados')
        .select('*', { count: 'exact', head: true })
        .eq('utilizador_id', utilizador.id)
        .eq('cliente_id', clienteId),

      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('utilizador_id', utilizador.id)
        .eq('cliente_id', clienteId),

      supabase
        .from('conteudos_guardados')
        .select('*', { count: 'exact', head: true })
        .eq('utilizador_id', utilizador.id)
        .eq('cliente_id', clienteId)
        .not('imagem_url', 'is', null),
    ])

    setTotais({
      campanhas: campanhasResp.count || 0,
      biblioteca: bibliotecaResp.count || 0,
      posts: postsResp.count || 0,
      imagens: imagensResp.count || 0,
    })
  }

  const carregarCliente = async () => {
    if (!utilizador || !clienteId) return

    setCarregando(true)
    setErro('')

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .eq('utilizador_id', utilizador.id)
      .single()

    if (error || !data) {
      console.error(error)
      setErro('Cliente não encontrado.')
      setCliente(null)
      setCarregando(false)
      return
    }

    setCliente(data)
    preencherFormulario(data)
    setCarregando(false)
    carregarTotais()
  }

  const togglePlataforma = (p: string) => {
    setPlataformas((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    )
  }

  const guardarCliente = async () => {
    if (!utilizador || !clienteId) return

    if (!nome.trim()) {
      alert('O nome do cliente é obrigatório.')
      return
    }

    setSalvando(true)

    const { data, error } = await supabase
      .from('clientes')
      .update({
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

        temas_principais: temasPrincipais.trim(),
        temas_proibidos: temasProibidos.trim(),
        frases_usar: frasesUsar.trim(),
        frases_evitar: frasesEvitar.trim(),
        horarios_preferidos: horariosPreferidos.trim(),
        tipos_conteudo: tiposConteudo.trim(),
        promocoes_recorrentes: promocoesRecorrentes.trim(),
        datas_importantes: datasImportantes.trim(),
      })
      .eq('id', clienteId)
      .eq('utilizador_id', utilizador.id)
      .select('*')
      .single()

    if (error) {
      console.error(error)
      alert(error.message || 'Erro ao guardar cliente.')
      setSalvando(false)
      return
    }

    setCliente(data)
    setSalvando(false)
    mostrarMensagem('Base do cliente atualizada.')
  }

  const irPara = (rota: string) => {
    router.push(rota)
  }

  if (carregando) {
    return (
      <>
        <Head>
          <title>Cliente — AdPulse</title>
        </Head>

        <LayoutPainel titulo="Cliente">
          <div className="flex items-center justify-center py-20">
            <Loader size={28} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
          </div>
        </LayoutPainel>
      </>
    )
  }

  if (!cliente) {
    return (
      <>
        <Head>
          <title>Cliente não encontrado — AdPulse</title>
        </Head>

        <LayoutPainel titulo="Cliente">
          <div className="card text-center py-14">
            <h2 className="text-xl font-bold mb-2">Cliente não encontrado</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--cor-texto-muted)' }}>
              {erro || 'Este cliente não existe ou não pertence à tua conta.'}
            </p>

            <Link href="/painel/clientes" className="btn-primario inline-flex">
              Voltar aos clientes
            </Link>
          </div>
        </LayoutPainel>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{cliente.nome} — AdPulse</title>
      </Head>

      <LayoutPainel titulo={cliente.nome}>
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-5">
            <Link
              href="/painel/clientes"
              className="inline-flex items-center gap-2 text-sm mb-4"
              style={{ color: 'var(--cor-texto-muted)' }}
            >
              <ArrowLeft size={15} />
              Voltar aos clientes
            </Link>

            <div
              className="card"
              style={{
                background:
                  'linear-gradient(135deg, rgba(124,123,250,0.12), rgba(244,114,182,0.08))',
                border: '1px solid rgba(124,123,250,0.25)',
              }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1
                    className="text-2xl md:text-3xl font-bold mb-2"
                    style={{ fontFamily: 'var(--fonte-display)' }}
                  >
                    {cliente.nome}
                  </h1>

                  <p className="text-sm max-w-2xl" style={{ color: 'var(--cor-texto-muted)' }}>
                    {cliente.descricao || cliente.objetivo || 'Configura a base deste cliente para a AdPulse trabalhar melhor.'}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {(cliente.plataformas || []).map((p) => (
                      <span
                        key={p}
                        className="text-xs px-2 py-1 rounded-full capitalize"
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
                </div>

                <button
                  onClick={guardarCliente}
                  disabled={salvando}
                  className="btn-primario"
                  style={salvando ? { opacity: 0.7 } : {}}
                >
                  {salvando ? (
                    <>
                      <Loader size={14} className="animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Guardar base
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {mensagem && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{
                background: 'rgba(34,197,94,0.10)',
                color: '#22c55e',
                border: '1px solid rgba(34,197,94,0.25)',
              }}
            >
              <CheckCircle size={16} />
              {mensagem}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <MetricCard label="Campanhas" value={totais.campanhas} icon={<Megaphone size={18} />} />
            <MetricCard label="Biblioteca" value={totais.biblioteca} icon={<Library size={18} />} />
            <MetricCard label="Calendário" value={totais.posts} icon={<CalendarDays size={18} />} />
            <MetricCard label="Imagens" value={totais.imagens} icon={<ImageIcon size={18} />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
            <ActionCard
              icon={<Megaphone size={20} />}
              title="Campanhas"
              text="Criar campanhas para este cliente."
              onClick={() => irPara(`/painel/campanhas?cliente_id=${cliente.id}`)}
            />
            <ActionCard
              icon={<CalendarDays size={20} />}
              title="Calendário"
              text="Ver posts planeados deste cliente."
              onClick={() => irPara(`/painel/calendario?cliente_id=${cliente.id}`)}
            />
            <ActionCard
              icon={<Library size={20} />}
              title="Biblioteca"
              text="Ver conteúdos e imagens deste cliente."
              onClick={() => irPara(`/painel/biblioteca?cliente_id=${cliente.id}`)}
            />
            <ActionCard
              icon={<Bot size={20} />}
              title="Equipa AdPulse"
              text="Gerar conteúdo com contexto do cliente."
              onClick={() => irPara(`/painel/equipa-adpulse?cliente_id=${cliente.id}`)}
            />
          </div>

          <div className="card mb-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} style={{ color: 'var(--cor-marca)' }} />
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--fonte-display)' }}
              >
                Base de publicação do cliente
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo label="Nome do cliente">
                <input
                  className="input-campo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </Campo>

              <Campo label="Nicho / área">
                <input
                  className="input-campo"
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  placeholder="Ex: restaurante, fitness, imobiliária..."
                />
              </Campo>

              <Campo label="Público-alvo">
                <input
                  className="input-campo"
                  value={publicoAlvo}
                  onChange={(e) => setPublicoAlvo(e.target.value)}
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
                />
              </Campo>

              <Campo label="CTA padrão">
                <input
                  className="input-campo"
                  value={ctaPadrao}
                  onChange={(e) => setCtaPadrao(e.target.value)}
                />
              </Campo>

              <Campo label="Website / link">
                <input
                  className="input-campo"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </Campo>

              <Campo label="Cores da marca">
                <input
                  className="input-campo"
                  value={coresMarca}
                  onChange={(e) => setCoresMarca(e.target.value)}
                />
              </Campo>
            </div>

            <Campo label="Descrição do negócio">
              <textarea
                rows={4}
                className="input-campo resize-none"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </Campo>

            <Campo label="Plataformas do cliente">
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
              />
            </Campo>
          </div>

          <div className="card mb-6">
            <h2
              className="text-xl font-bold mb-5"
              style={{ fontFamily: 'var(--fonte-display)' }}
            >
              Regras e memória do cliente
            </h2>

            <Campo label="Temas principais">
              <textarea
                rows={3}
                className="input-campo resize-none"
                value={temasPrincipais}
                onChange={(e) => setTemasPrincipais(e.target.value)}
                placeholder="Assuntos que este cliente fala com frequência..."
              />
            </Campo>

            <Campo label="Temas proibidos">
              <textarea
                rows={3}
                className="input-campo resize-none"
                value={temasProibidos}
                onChange={(e) => setTemasProibidos(e.target.value)}
                placeholder="Assuntos que a AdPulse deve evitar..."
              />
            </Campo>

            <Campo label="Frases que deve usar">
              <textarea
                rows={3}
                className="input-campo resize-none"
                value={frasesUsar}
                onChange={(e) => setFrasesUsar(e.target.value)}
                placeholder="Expressões, slogans ou frases habituais..."
              />
            </Campo>

            <Campo label="Frases que deve evitar">
              <textarea
                rows={3}
                className="input-campo resize-none"
                value={frasesEvitar}
                onChange={(e) => setFrasesEvitar(e.target.value)}
                placeholder="Termos ou expressões proibidas..."
              />
            </Campo>

            <Campo label="Horários preferidos">
              <textarea
                rows={2}
                className="input-campo resize-none"
                value={horariosPreferidos}
                onChange={(e) => setHorariosPreferidos(e.target.value)}
                placeholder="Ex: segunda a sexta às 12h e 19h..."
              />
            </Campo>

            <Campo label="Tipos de conteúdo preferidos">
              <textarea
                rows={3}
                className="input-campo resize-none"
                value={tiposConteudo}
                onChange={(e) => setTiposConteudo(e.target.value)}
                placeholder="Ex: reels educativos, stories de bastidores, posts promocionais..."
              />
            </Campo>

            <Campo label="Promoções recorrentes">
              <textarea
                rows={3}
                className="input-campo resize-none"
                value={promocoesRecorrentes}
                onChange={(e) => setPromocoesRecorrentes(e.target.value)}
                placeholder="Promoções, campanhas mensais, ofertas..."
              />
            </Campo>

            <Campo label="Datas importantes">
              <textarea
                rows={3}
                className="input-campo resize-none"
                value={datasImportantes}
                onChange={(e) => setDatasImportantes(e.target.value)}
                placeholder="Aniversários, eventos, datas comemorativas..."
              />
            </Campo>

            <Campo label="Notas gerais">
              <textarea
                rows={4}
                className="input-campo resize-none"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Tudo o que a AdPulse deve saber antes de criar conteúdo..."
              />
            </Campo>

            <div className="flex justify-end mt-5">
              <button
                onClick={guardarCliente}
                disabled={salvando}
                className="btn-primario"
                style={salvando ? { opacity: 0.7 } : {}}
              >
                {salvando ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Guardar base do cliente
                  </>
                )}
              </button>
            </div>
          </div>
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

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="card text-center">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
        style={{
          background: 'rgba(124,123,250,0.12)',
          color: 'var(--cor-marca)',
          border: '1px solid rgba(124,123,250,0.25)',
        }}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--cor-marca)' }}>
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
        {label}
      </div>
    </div>
  )
}

function ActionCard({
  icon,
  title,
  text,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  text: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="card-hover text-left"
      style={{ cursor: 'pointer' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{
          background: 'rgba(124,123,250,0.12)',
          color: 'var(--cor-marca)',
          border: '1px solid rgba(124,123,250,0.25)',
        }}
      >
        {icon}
      </div>

      <div className="font-bold mb-1">{title}</div>
      <div className="text-xs leading-relaxed" style={{ color: 'var(--cor-texto-muted)' }}>
        {text}
      </div>
    </button>
  )
}
