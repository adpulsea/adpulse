// ============================================
// AdPulse — Detalhe da Campanha
// Versão estável para voltar a abrir campanhas
// ============================================

import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Plus,
  Copy,
  Trash2,
  Loader,
  CheckCircle,
  CalendarDays,
  Sparkles,
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

type Campanha = {
  id: string
  nome: string
  descricao: string | null
  plataformas: string[] | null
  total_posts: number | null
  criado_em: string
}

type ConteudoCampanha = {
  id: string
  utilizador_id: string
  campanha_id: string
  tipo: string | null
  titulo: string | null
  texto: string | null
  legenda: string | null
  hashtags: string | null
  plataforma: string | null
  formato: string | null
  data_publicacao: string | null
  hora_publicacao: string | null
  estado: string | null
  imagem_url: string | null
  criado_em: string
}

const FORM_INICIAL = {
  tipo: 'post',
  titulo: '',
  texto: '',
  legenda: '',
  hashtags: '',
  plataforma: 'instagram',
  formato: 'Post',
  data_publicacao: '',
  hora_publicacao: '',
  estado: 'rascunho',
  imagem_url: '',
}

const COR_PLATAFORMA: Record<string, string> = {
  instagram: '#E1306C',
  tiktok: '#00f2ea',
  youtube: '#FF0000',
  linkedin: '#0077B5',
}

const COR_ESTADO: Record<string, string> = {
  rascunho: '#94a3b8',
  pronto: '#60a5fa',
  publicado: '#22c55e',
}

function criarTituloAutomatico(form: typeof FORM_INICIAL) {
  const base =
    form.titulo.trim() ||
    form.texto.trim() ||
    form.legenda.trim() ||
    form.hashtags.trim() ||
    form.imagem_url.trim()

  if (!base) return 'Conteúdo sem título'

  const limpo = base.replace(/\s+/g, ' ').trim()
  return limpo.length > 60 ? `${limpo.slice(0, 60)}...` : limpo
}

function temConteudo(form: typeof FORM_INICIAL) {
  return Boolean(
    form.titulo.trim() ||
      form.texto.trim() ||
      form.legenda.trim() ||
      form.hashtags.trim() ||
      form.imagem_url.trim()
  )
}

export default function DetalheCampanha() {
  const router = useRouter()
  const { id } = router.query
  const { utilizador } = useAuth()

  const campanhaId = typeof id === 'string' ? id : ''

  const [campanha, setCampanha] = useState<Campanha | null>(null)
  const [conteudos, setConteudos] = useState<ConteudoCampanha[]>([])
  const [carregando, setCarregando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [form, setForm] = useState(FORM_INICIAL)

  useEffect(() => {
    if (!utilizador || !campanhaId) return
    carregarDados()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilizador, campanhaId])

  const mostrarMensagem = (texto: string) => {
    setMensagem(texto)
    setTimeout(() => setMensagem(''), 3500)
  }

  const carregarDados = async () => {
    if (!utilizador || !campanhaId) return

    setCarregando(true)

    try {
      const campanhaResp = await supabase
        .from('campanhas')
        .select('*')
        .eq('id', campanhaId)
        .eq('utilizador_id', utilizador.id)
        .single()

      if (campanhaResp.error) {
        console.error('Erro campanha:', campanhaResp.error)
        setCampanha(null)
        setConteudos([])
        setCarregando(false)
        return
      }

      const conteudosResp = await supabase
        .from('campanha_conteudos')
        .select('*')
        .eq('campanha_id', campanhaId)
        .eq('utilizador_id', utilizador.id)
        .order('criado_em', { ascending: false })

      if (conteudosResp.error) {
        console.error('Erro conteúdos:', conteudosResp.error)
      }

      setCampanha(campanhaResp.data || null)
      setConteudos(conteudosResp.data || [])
    } catch (error) {
      console.error('Erro geral campanha:', error)
      setCampanha(null)
      setConteudos([])
    }

    setCarregando(false)
  }

  const guardarConteudo = async () => {
    if (!utilizador || !campanhaId) return

    if (!temConteudo(form)) {
      alert('Escreve pelo menos texto, legenda, hashtags, título ou imagem antes de guardar.')
      return
    }

    setSalvando(true)

    const tituloFinal = criarTituloAutomatico(form)

    const { data, error } = await supabase
      .from('campanha_conteudos')
      .insert({
        utilizador_id: utilizador.id,
        campanha_id: campanhaId,
        tipo: form.tipo,
        titulo: tituloFinal,
        texto: form.texto.trim(),
        legenda: form.legenda.trim(),
        hashtags: form.hashtags.trim(),
        plataforma: form.plataforma,
        formato: form.formato,
        data_publicacao: form.data_publicacao || null,
        hora_publicacao: form.hora_publicacao,
        estado: form.estado,
        imagem_url: form.imagem_url.trim(),
      })
      .select('*')
      .single()

    if (error) {
      console.error(error)
      alert(error.message || 'Erro ao guardar conteúdo.')
      setSalvando(false)
      return
    }

    const novaLista = [data, ...conteudos]
    setConteudos(novaLista)

    await supabase
      .from('campanhas')
      .update({ total_posts: novaLista.length })
      .eq('id', campanhaId)

    setForm(FORM_INICIAL)
    setFormAberto(false)
    setSalvando(false)
    mostrarMensagem('Conteúdo guardado.')
  }

  const apagarConteudo = async (conteudoId: string) => {
    if (!confirm('Queres apagar este conteúdo?')) return

    const { error } = await supabase
      .from('campanha_conteudos')
      .delete()
      .eq('id', conteudoId)

    if (error) {
      alert(error.message || 'Erro ao apagar conteúdo.')
      return
    }

    const novaLista = conteudos.filter((c) => c.id !== conteudoId)
    setConteudos(novaLista)

    await supabase
      .from('campanhas')
      .update({ total_posts: novaLista.length })
      .eq('id', campanhaId)

    mostrarMensagem('Conteúdo apagado.')
  }

  const atualizarEstado = async (conteudoId: string, estado: string) => {
    const { data, error } = await supabase
      .from('campanha_conteudos')
      .update({ estado })
      .eq('id', conteudoId)
      .select('*')
      .single()

    if (error) {
      alert(error.message || 'Erro ao atualizar estado.')
      return
    }

    setConteudos((atuais) =>
      atuais.map((c) => (c.id === conteudoId ? data : c))
    )
  }

  const copiarTexto = async (texto: string) => {
    await navigator.clipboard.writeText(texto || '')
    mostrarMensagem('Copiado.')
  }

  const copiarTudo = async (conteudo: ConteudoCampanha) => {
    const texto = `Título:
${conteudo.titulo || ''}

Texto:
${conteudo.texto || ''}

Legenda:
${conteudo.legenda || ''}

Hashtags:
${conteudo.hashtags || ''}

Imagem:
${conteudo.imagem_url || 'Sem imagem'}`

    await copiarTexto(texto)
  }

  if (carregando) {
    return (
      <>
        <Head>
          <title>Campanha — AdPulse</title>
        </Head>

        <LayoutPainel titulo="Campanha">
          <div className="flex items-center justify-center py-20">
            <Loader size={26} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
          </div>
        </LayoutPainel>
      </>
    )
  }

  if (!campanha) {
    return (
      <>
        <Head>
          <title>Campanha não encontrada — AdPulse</title>
        </Head>

        <LayoutPainel titulo="Campanha">
          <div className="card text-center py-14">
            <h2 className="text-xl font-bold mb-2">Campanha não encontrada</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--cor-texto-muted)' }}>
              A campanha não foi encontrada ou não pertence à tua conta.
            </p>

            <Link href="/painel/campanhas" className="btn-primario inline-flex">
              Voltar às campanhas
            </Link>
          </div>
        </LayoutPainel>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{campanha.nome} — AdPulse</title>
      </Head>

      <LayoutPainel titulo="Campanha">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-5">
            <Link
              href="/painel/campanhas"
              className="inline-flex items-center gap-2 text-sm mb-4"
              style={{ color: 'var(--cor-texto-muted)' }}
            >
              <ArrowLeft size={15} />
              Voltar às campanhas
            </Link>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1
                  className="text-2xl md:text-3xl font-bold mb-2"
                  style={{ fontFamily: 'var(--fonte-display)' }}
                >
                  {campanha.nome}
                </h1>

                {campanha.descricao && (
                  <p className="text-sm max-w-2xl" style={{ color: 'var(--cor-texto-muted)' }}>
                    {campanha.descricao}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {(campanha.plataformas || []).map((p) => (
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

              <button onClick={() => setFormAberto(true)} className="btn-primario">
                <Plus size={16} />
                Adicionar conteúdo
              </button>
            </div>
          </div>

          {mensagem && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'rgba(34,197,94,0.10)',
                color: '#22c55e',
                border: '1px solid rgba(34,197,94,0.25)',
              }}
            >
              {mensagem}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <MetricCard label="Conteúdos" value={conteudos.length} />
            <MetricCard label="Prontos" value={conteudos.filter((c) => c.estado === 'pronto').length} />
            <MetricCard label="Publicados" value={conteudos.filter((c) => c.estado === 'publicado').length} />
            <MetricCard label="Stories" value={conteudos.filter((c) => c.tipo === 'story').length} />
          </div>

          {formAberto && (
            <div className="card mb-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-bold text-lg">Adicionar conteúdo</h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                    O título é opcional. A AdPulse cria um automaticamente.
                  </p>
                </div>

                <button onClick={() => setFormAberto(false)} className="btn-secundario">
                  Fechar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Campo label="Título opcional">
                  <input
                    className="input-campo"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    placeholder="Opcional"
                  />
                </Campo>

                <Campo label="Tipo">
                  <select
                    className="input-campo"
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  >
                    <option value="post">Post Feed</option>
                    <option value="story">Story</option>
                    <option value="reel">Reel</option>
                    <option value="imagem">Imagem</option>
                  </select>
                </Campo>

                <Campo label="Plataforma">
                  <select
                    className="input-campo"
                    value={form.plataforma}
                    onChange={(e) => setForm({ ...form, plataforma: e.target.value })}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </Campo>

                <Campo label="Formato">
                  <input
                    className="input-campo"
                    value={form.formato}
                    onChange={(e) => setForm({ ...form, formato: e.target.value })}
                    placeholder="Post, Story, Reel..."
                  />
                </Campo>

                <Campo label="Data">
                  <input
                    type="date"
                    className="input-campo"
                    value={form.data_publicacao}
                    onChange={(e) => setForm({ ...form, data_publicacao: e.target.value })}
                  />
                </Campo>

                <Campo label="Hora">
                  <input
                    type="time"
                    className="input-campo"
                    value={form.hora_publicacao}
                    onChange={(e) => setForm({ ...form, hora_publicacao: e.target.value })}
                  />
                </Campo>
              </div>

              <Campo label="Texto para imagem / criativo">
                <textarea
                  rows={5}
                  className="input-campo resize-none"
                  value={form.texto}
                  onChange={(e) => setForm({ ...form, texto: e.target.value })}
                  placeholder="Texto que vai aparecer na imagem..."
                />
              </Campo>

              <Campo label="Legenda">
                <textarea
                  rows={6}
                  className="input-campo resize-none"
                  value={form.legenda}
                  onChange={(e) => setForm({ ...form, legenda: e.target.value })}
                  placeholder="Legenda pronta para publicar..."
                />
              </Campo>

              <Campo label="Hashtags">
                <textarea
                  rows={3}
                  className="input-campo resize-none"
                  value={form.hashtags}
                  onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
                  placeholder="#adpulse #marketingdigital..."
                />
              </Campo>

              <Campo label="URL da imagem">
                <input
                  className="input-campo"
                  value={form.imagem_url}
                  onChange={(e) => setForm({ ...form, imagem_url: e.target.value })}
                  placeholder="Cola aqui a URL da imagem se existir"
                />
              </Campo>

              <div className="flex gap-3 justify-end flex-wrap mt-5">
                <button onClick={() => setFormAberto(false)} className="btn-secundario">
                  Cancelar
                </button>

                <button
                  onClick={guardarConteudo}
                  disabled={salvando || !temConteudo(form)}
                  className="btn-primario"
                  style={salvando || !temConteudo(form) ? { opacity: 0.65 } : {}}
                >
                  {salvando ? (
                    <>
                      <Loader size={14} className="animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} />
                      Guardar conteúdo
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {conteudos.length === 0 ? (
            <div className="card text-center py-14">
              <CalendarDays
                size={34}
                className="mx-auto mb-4"
                style={{ color: 'var(--cor-marca)' }}
              />
              <h3 className="font-bold text-lg mb-2">Ainda não há conteúdos nesta campanha</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--cor-texto-muted)' }}>
                Adiciona posts, stories, legendas e conteúdos para deixar tudo preparado.
              </p>
              <button onClick={() => setFormAberto(true)} className="btn-primario">
                <Plus size={16} />
                Adicionar primeiro conteúdo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {conteudos.map((conteudo) => (
                <div key={conteudo.id} className="card">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge texto={conteudo.tipo || 'post'} cor="var(--cor-marca)" />
                        <Badge texto={conteudo.estado || 'rascunho'} cor={COR_ESTADO[conteudo.estado || 'rascunho'] || '#94a3b8'} />
                        <Badge texto={conteudo.plataforma || 'instagram'} cor={COR_PLATAFORMA[conteudo.plataforma || 'instagram'] || 'var(--cor-marca)'} />
                      </div>

                      <h3 className="font-bold text-lg mb-1">
                        {conteudo.titulo || 'Conteúdo sem título'}
                      </h3>

                      {(conteudo.data_publicacao || conteudo.hora_publicacao) && (
                        <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
                          {conteudo.data_publicacao || 'Sem data'} ·{' '}
                          {conteudo.hora_publicacao || 'Sem hora'}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={conteudo.estado || 'rascunho'}
                        onChange={(e) => atualizarEstado(conteudo.id, e.target.value)}
                        className="input-campo"
                        style={{ width: 140, padding: '8px 10px' }}
                      >
                        <option value="rascunho">rascunho</option>
                        <option value="pronto">pronto</option>
                        <option value="publicado">publicado</option>
                      </select>

                      <button onClick={() => copiarTudo(conteudo)} className="btn-secundario">
                        <Copy size={14} />
                        Copiar tudo
                      </button>

                      <button
                        onClick={() => apagarConteudo(conteudo.id)}
                        className="btn-secundario"
                        style={{ color: '#f87171' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <BlocoConteudo
                      titulo="Texto do criativo"
                      valor={conteudo.texto || ''}
                      onCopiar={() => copiarTexto(conteudo.texto || '')}
                    />

                    <BlocoConteudo
                      titulo="Legenda"
                      valor={conteudo.legenda || ''}
                      onCopiar={() => copiarTexto(conteudo.legenda || '')}
                    />

                    <BlocoConteudo
                      titulo="Hashtags"
                      valor={conteudo.hashtags || ''}
                      onCopiar={() => copiarTexto(conteudo.hashtags || '')}
                    />
                  </div>

                  {conteudo.imagem_url && (
                    <div className="mt-4">
                      <p className="text-xs mb-2" style={{ color: 'var(--cor-texto-muted)' }}>
                        Imagem
                      </p>
                      <img
                        src={conteudo.imagem_url}
                        alt={conteudo.titulo || 'Imagem'}
                        className="rounded-xl max-h-80 object-contain"
                        style={{
                          border: '1px solid var(--cor-borda)',
                          background: '#050510',
                          maxWidth: '100%',
                        }}
                      />
                    </div>
                  )}
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

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-bold" style={{ color: 'var(--cor-marca)' }}>
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
        {label}
      </div>
    </div>
  )
}

function Badge({ texto, cor }: { texto: string; cor: string }) {
  return (
    <span
      className="text-xs px-2 py-1 rounded-full capitalize"
      style={{
        background: `${cor}18`,
        color: cor,
        border: `1px solid ${cor}35`,
      }}
    >
      {texto}
    </span>
  )
}

function BlocoConteudo({
  titulo,
  valor,
  onCopiar,
}: {
  titulo: string
  valor: string
  onCopiar: () => void
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid var(--cor-borda)',
        minHeight: 160,
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-semibold" style={{ color: 'var(--cor-marca)' }}>
          {titulo}
        </p>

        <button onClick={onCopiar} className="btn-secundario" style={{ padding: '6px 8px' }}>
          <Copy size={13} />
        </button>
      </div>

      <div
        className="text-sm whitespace-pre-wrap"
        style={{ color: 'var(--cor-texto-muted)', lineHeight: 1.6 }}
      >
        {valor || '—'}
      </div>
    </div>
  )
}
