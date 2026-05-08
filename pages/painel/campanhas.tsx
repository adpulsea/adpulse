// ============================================
// AdPulse — Detalhe da Campanha
// Preparar posts, stories, legendas, imagens e conteúdos
// Com editar campanha + nova campanha + gerar imagem
// Permite guardar sem título manual
// ============================================

import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Plus,
  Copy,
  Trash2,
  Loader,
  CheckCircle,
  Send,
  CalendarDays,
  Instagram,
  FileText,
  ImageIcon,
  MessageSquare,
  Edit3,
  Sparkles,
  X,
  FolderOpen,
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

type Campanha = {
  id: string
  nome: string
  descricao: string
  plataformas: string[]
  total_posts: number
  criado_em: string
}

type ConteudoCampanha = {
  id: string
  utilizador_id: string
  campanha_id: string
  tipo: string
  titulo: string
  texto: string
  legenda: string
  hashtags: string
  plataforma: string
  formato: string
  data_publicacao: string | null
  hora_publicacao: string
  estado: string
  imagem_url: string
  criado_em: string
}

const TIPOS = [
  { id: 'post', label: 'Post Feed', icon: FileText },
  { id: 'story', label: 'Story', icon: MessageSquare },
  { id: 'reel', label: 'Reel', icon: Instagram },
  { id: 'imagem', label: 'Imagem', icon: ImageIcon },
]

const ESTADOS = ['rascunho', 'pronto', 'publicado']

const COR_ESTADO: Record<string, string> = {
  rascunho: '#94a3b8',
  pronto: '#60a5fa',
  publicado: '#22c55e',
}

const COR_PLATAFORMA: Record<string, string> = {
  instagram: '#E1306C',
  tiktok: '#00f2ea',
  youtube: '#FF0000',
  linkedin: '#0077B5',
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

function limparTexto(valor: string) {
  return String(valor || '').trim()
}

function cortarTitulo(valor: string) {
  const limpo = limparTexto(valor).replace(/\s+/g, ' ')
  if (!limpo) return ''
  return limpo.length > 58 ? `${limpo.slice(0, 58)}...` : limpo
}

function gerarTituloAutomatico(form: typeof FORM_INICIAL) {
  const tituloManual = limparTexto(form.titulo)

  if (tituloManual) return tituloManual

  const origem =
    limparTexto(form.texto) ||
    limparTexto(form.legenda) ||
    limparTexto(form.hashtags) ||
    limparTexto(form.imagem_url)

  const titulo = cortarTitulo(origem)

  if (titulo) return titulo

  return `Conteúdo ${form.tipo || 'campanha'}`
}

function temConteudoPreenchido(form: typeof FORM_INICIAL) {
  return Boolean(
    limparTexto(form.titulo) ||
      limparTexto(form.texto) ||
      limparTexto(form.legenda) ||
      limparTexto(form.hashtags) ||
      limparTexto(form.imagem_url)
  )
}

export default function DetalheCampanha() {
  const router = useRouter()
  const { id } = router.query
  const { utilizador } = useAuth()

  const [campanha, setCampanha] = useState<Campanha | null>(null)
  const [conteudos, setConteudos] = useState<ConteudoCampanha[]>([])
  const [carregando, setCarregando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [modalEditarAberto, setModalEditarAberto] = useState(false)
  const [modalNovaCampanhaAberto, setModalNovaCampanhaAberto] = useState(false)

  const [salvando, setSalvando] = useState(false)
  const [salvandoCampanha, setSalvandoCampanha] = useState(false)
  const [criandoNovaCampanha, setCriandoNovaCampanha] = useState(false)
  const [gerandoImagem, setGerandoImagem] = useState(false)
  const [gerandoImagemConteudoId, setGerandoImagemConteudoId] = useState<string | null>(null)

  const [mensagem, setMensagem] = useState('')
  const [form, setForm] = useState(FORM_INICIAL)

  const [editNome, setEditNome] = useState('')
  const [editDescricao, setEditDescricao] = useState('')
  const [editPlataformas, setEditPlataformas] = useState<string[]>(['instagram'])

  const [novoNome, setNovoNome] = useState('')
  const [novaDescricao, setNovaDescricao] = useState('')
  const [novaPlataformas, setNovaPlataformas] = useState<string[]>(['instagram'])

  const campanhaId = typeof id === 'string' ? id : ''
  const podeGuardarConteudo = temConteudoPreenchido(form)

  useEffect(() => {
    if (!utilizador || !campanhaId) return
    carregarCampanha()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilizador, campanhaId])

  const mostrarMensagem = (texto: string) => {
    setMensagem(texto)
    setTimeout(() => setMensagem(''), 3500)
  }

  const carregarCampanha = async () => {
    if (!utilizador || !campanhaId) return

    setCarregando(true)

    const [{ data: campanhaData }, { data: conteudosData }] = await Promise.all([
      supabase
        .from('campanhas')
        .select('*')
        .eq('id', campanhaId)
        .eq('utilizador_id', utilizador.id)
        .single(),

      supabase
        .from('campanha_conteudos')
        .select('*')
        .eq('campanha_id', campanhaId)
        .eq('utilizador_id', utilizador.id)
        .order('criado_em', { ascending: false }),
    ])

    setCampanha(campanhaData || null)
    setConteudos(conteudosData || [])

    if (campanhaData) {
      setEditNome(campanhaData.nome || '')
      setEditDescricao(campanhaData.descricao || '')
      setEditPlataformas(campanhaData.plataformas || ['instagram'])
    }

    setCarregando(false)
  }

  const toggleEditPlataforma = (p: string) => {
    setEditPlataformas((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const toggleNovaPlataforma = (p: string) => {
    setNovaPlataformas((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const guardarEdicaoCampanha = async () => {
    if (!utilizador || !campanha || !editNome.trim()) return

    setSalvandoCampanha(true)

    const { data, error } = await supabase
      .from('campanhas')
      .update({
        nome: editNome.trim(),
        descricao: editDescricao.trim(),
        plataformas: editPlataformas.length ? editPlataformas : ['instagram'],
      })
      .eq('id', campanha.id)
      .eq('utilizador_id', utilizador.id)
      .select('*')
      .single()

    if (error) {
      alert(error.message || 'Erro ao editar campanha.')
      setSalvandoCampanha(false)
      return
    }

    setCampanha(data)
    setModalEditarAberto(false)
    setSalvandoCampanha(false)
    mostrarMensagem('Campanha atualizada.')
  }

  const criarNovaCampanha = async () => {
    if (!utilizador || !novoNome.trim()) return

    setCriandoNovaCampanha(true)

    const { data, error } = await supabase
      .from('campanhas')
      .insert({
        utilizador_id: utilizador.id,
        nome: novoNome.trim(),
        descricao: novaDescricao.trim(),
        plataformas: novaPlataformas.length ? novaPlataformas : ['instagram'],
        total_posts: 0,
      })
      .select('*')
      .single()

    if (error) {
      alert(error.message || 'Erro ao criar nova campanha.')
      setCriandoNovaCampanha(false)
      return
    }

    setNovoNome('')
    setNovaDescricao('')
    setNovaPlataformas(['instagram'])
    setModalNovaCampanhaAberto(false)
    setCriandoNovaCampanha(false)

    router.push(`/painel/campanhas/${data.id}`)
  }

  const criarPromptImagem = ({
    titulo,
    texto,
    plataforma,
    formato,
  }: {
    titulo: string
    texto: string
    plataforma: string
    formato: string
  }) => {
    const textoImagem = limparTexto(texto) || limparTexto(titulo)

    return `
Cria uma imagem premium para Instagram, formato 4:5 ou 1:1, para a marca AdPulse.

Identidade visual obrigatória:
- fundo escuro quase preto / navy profundo
- estilo SaaS premium
- neon roxo, violeta e rosa
- glow subtil
- cards arredondados tipo interface
- visual moderno, tecnológico e limpo
- alto contraste
- tipografia grande e muito legível
- composição profissional para feed de Instagram
- estética semelhante a uma plataforma de IA para criação de conteúdo

Marca:
AdPulse é uma plataforma com IA para criar posts, imagens e calendário de conteúdo para redes sociais.

Texto principal que deve aparecer na imagem:
"${textoImagem}"

Contexto da campanha:
"${campanha?.nome || 'Campanha AdPulse'}"

Descrição:
"${campanha?.descricao || ''}"

Plataforma:
${plataforma || 'instagram'}

Formato:
${formato || 'Post'}

Não uses elementos confusos.
Não coloques texto pequeno demais.
Não inventes preços se não forem pedidos.
Mantém o visual pronto para publicação.
`
  }

  const gerarImagemAdPulse = async () => {
    if (!form.texto.trim() && !form.titulo.trim()) {
      alert('Escreve primeiro o texto para imagem ou o título.')
      return
    }

    setGerandoImagem(true)

    const textoImagem = form.texto.trim() || form.titulo.trim()

    try {
      const res = await fetch('/api/ia/gerar-imagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: criarPromptImagem({
            titulo: form.titulo,
            texto: form.texto,
            plataforma: form.plataforma,
            formato: form.formato,
          }),
          texto: textoImagem,
          plataforma: form.plataforma,
          formato: form.formato,
          estilo: 'adpulse_premium_dark_neon',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.erro || data?.error || 'Erro ao gerar imagem.')
      }

      const imagem =
        data?.url ||
        data?.imagem_url ||
        data?.imageUrl ||
        data?.image_url ||
        data?.data?.[0]?.url ||
        ''

      if (!imagem) {
        throw new Error('A imagem foi gerada, mas a API não devolveu uma URL reconhecida.')
      }

      setForm((atual) => ({
        ...atual,
        imagem_url: imagem,
      }))

      mostrarMensagem('Imagem gerada e adicionada ao conteúdo.')
    } catch (error: any) {
      alert(error?.message || 'Erro ao gerar imagem.')
    } finally {
      setGerandoImagem(false)
    }
  }

  const gerarImagemParaConteudo = async (conteudo: ConteudoCampanha) => {
    if (!conteudo.texto?.trim() && !conteudo.titulo?.trim()) {
      alert('Este conteúdo não tem texto nem título suficiente para gerar imagem.')
      return
    }

    setGerandoImagemConteudoId(conteudo.id)

    const textoImagem = conteudo.texto?.trim() || conteudo.titulo?.trim()

    try {
      const res = await fetch('/api/ia/gerar-imagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: criarPromptImagem({
            titulo: conteudo.titulo,
            texto: conteudo.texto,
            plataforma: conteudo.plataforma,
            formato: conteudo.formato,
          }),
          texto: textoImagem,
          plataforma: conteudo.plataforma,
          formato: conteudo.formato,
          estilo: 'adpulse_premium_dark_neon',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.erro || data?.error || 'Erro ao gerar imagem.')
      }

      const imagem =
        data?.url ||
        data?.imagem_url ||
        data?.imageUrl ||
        data?.image_url ||
        data?.data?.[0]?.url ||
        ''

      if (!imagem) {
        throw new Error('A imagem foi gerada, mas a API não devolveu uma URL reconhecida.')
      }

      const { data: atualizado, error } = await supabase
        .from('campanha_conteudos')
        .update({
          imagem_url: imagem,
        })
        .eq('id', conteudo.id)
        .select('*')
        .single()

      if (error) {
        throw new Error(error.message || 'Imagem gerada, mas não foi possível guardar no Supabase.')
      }

      setConteudos((prev) =>
        prev.map((item) => (item.id === conteudo.id ? atualizado : item))
      )

      mostrarMensagem('Imagem gerada e guardada no conteúdo.')
    } catch (error: any) {
      alert(error?.message || 'Erro ao gerar imagem.')
    } finally {
      setGerandoImagemConteudoId(null)
    }
  }

  const guardarConteudo = async () => {
    if (!utilizador || !campanhaId) return

    if (!podeGuardarConteudo) {
      alert('Adiciona pelo menos texto, legenda, hashtags, imagem ou título antes de guardar.')
      return
    }

    setSalvando(true)

    const tituloFinal = gerarTituloAutomatico(form)

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
      alert(error.message || 'Erro ao guardar conteúdo.')
      setSalvando(false)
      return
    }

    await supabase
      .from('campanhas')
      .update({ total_posts: conteudos.length + 1 })
      .eq('id', campanhaId)

    setConteudos((prev) => [data, ...prev])
    setForm(FORM_INICIAL)
    setFormAberto(false)
    setSalvando(false)
    mostrarMensagem('Conteúdo guardado na campanha.')
  }

  const apagarConteudo = async (conteudoId: string) => {
    if (!confirm('Queres apagar este conteúdo?')) return

    await supabase.from('campanha_conteudos').delete().eq('id', conteudoId)

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

    setConteudos((prev) => prev.map((c) => (c.id === conteudoId ? data : c)))
  }

  const copiarTexto = async (texto: string) => {
    await navigator.clipboard.writeText(texto || '')
    mostrarMensagem('Copiado.')
  }

  const copiarConteudoCompleto = async (c: ConteudoCampanha) => {
    const texto = `Título:
${c.titulo}

Texto:
${c.texto || ''}

Legenda:
${c.legenda || ''}

Hashtags:
${c.hashtags || ''}

Plataforma:
${c.plataforma}

Data:
${c.data_publicacao || ''} ${c.hora_publicacao || ''}

Imagem:
${c.imagem_url || 'Sem imagem'}`

    await copiarTexto(texto)
  }

  const metricas = useMemo(() => {
    return {
      total: conteudos.length,
      prontos: conteudos.filter((c) => c.estado === 'pronto').length,
      publicados: conteudos.filter((c) => c.estado === 'publicado').length,
      stories: conteudos.filter((c) => c.tipo === 'story').length,
    }
  }, [conteudos])

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
              Esta campanha não existe ou não pertence à tua conta.
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

              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setModalEditarAberto(true)} className="btn-secundario">
                  <Edit3 size={15} />
                  Editar campanha
                </button>

                <button onClick={() => setModalNovaCampanhaAberto(true)} className="btn-secundario">
                  <FolderOpen size={15} />
                  Nova campanha
                </button>

                <button onClick={() => setFormAberto(true)} className="btn-primario">
                  <Plus size={16} />
                  Adicionar conteúdo
                </button>
              </div>
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
            <MetricCard label="Conteúdos" value={metricas.total} />
            <MetricCard label="Prontos" value={metricas.prontos} />
            <MetricCard label="Publicados" value={metricas.publicados} />
            <MetricCard label="Stories" value={metricas.stories} />
          </div>

          {formAberto && (
            <div className="card mb-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-bold text-lg">Adicionar conteúdo</h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                    O título é opcional. Se deixares vazio, a AdPulse cria um título automático.
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
                    placeholder="Opcional — a AdPulse pode criar automaticamente"
                  />
                </Campo>

                <Campo label="Tipo">
                  <select
                    className="input-campo"
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  >
                    {TIPOS.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.label}
                      </option>
                    ))}
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
                    placeholder="Post, Story, Reel, Carrossel..."
                  />
                </Campo>

                <Campo label="Data de publicação">
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
                  placeholder="Texto que vai aparecer na imagem, story ou criativo..."
                />

                <div
                  className="mt-3 rounded-xl p-3 flex items-start justify-between gap-3 flex-wrap"
                  style={{
                    background: 'rgba(124,123,250,0.08)',
                    border: '1px solid rgba(124,123,250,0.20)',
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles size={15} style={{ color: 'var(--cor-marca)' }} />
                      Gerar imagem com visual AdPulse
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                      Usa o texto acima e cria uma imagem no estilo escuro, premium e neon da AdPulse.
                    </p>
                  </div>

                  <button
                    onClick={gerarImagemAdPulse}
                    disabled={gerandoImagem}
                    className="btn-primario"
                    style={gerandoImagem ? { opacity: 0.7 } : {}}
                  >
                    {gerandoImagem ? (
                      <>
                        <Loader size={14} className="animate-spin" />
                        A gerar...
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        Gerar imagem
                      </>
                    )}
                  </button>
                </div>
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
                  placeholder="#adpulse #marketingdigital #ia..."
                />
              </Campo>

              <Campo label="URL da imagem">
                <input
                  className="input-campo"
                  value={form.imagem_url}
                  onChange={(e) => setForm({ ...form, imagem_url: e.target.value })}
                  placeholder="A imagem gerada aparece aqui automaticamente."
                />

                {form.imagem_url && (
                  <div className="mt-3">
                    <p className="text-xs mb-2" style={{ color: 'var(--cor-texto-muted)' }}>
                      Pré-visualização da imagem
                    </p>
                    <img
                      src={form.imagem_url}
                      alt={form.titulo || 'Imagem gerada'}
                      className="rounded-xl max-h-80 object-contain"
                      style={{
                        border: '1px solid var(--cor-borda)',
                        background: '#050510',
                        maxWidth: '100%',
                      }}
                    />
                  </div>
                )}
              </Campo>

              <div className="flex gap-3 justify-end flex-wrap mt-5">
                <button onClick={() => setFormAberto(false)} className="btn-secundario">
                  Cancelar
                </button>

                <button
                  onClick={guardarConteudo}
                  disabled={salvando || !podeGuardarConteudo}
                  className="btn-primario"
                  style={salvando || !podeGuardarConteudo ? { opacity: 0.65 } : {}}
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
                        <span
                          className="text-xs px-2 py-1 rounded-full capitalize"
                          style={{
                            background: 'rgba(124,123,250,0.15)',
                            color: 'var(--cor-marca)',
                            border: '1px solid rgba(124,123,250,0.25)',
                          }}
                        >
                          {conteudo.tipo}
                        </span>

                        <span
                          className="text-xs px-2 py-1 rounded-full capitalize"
                          style={{
                            background: `${COR_ESTADO[conteudo.estado] || '#94a3b8'}18`,
                            color: COR_ESTADO[conteudo.estado] || '#94a3b8',
                            border: `1px solid ${COR_ESTADO[conteudo.estado] || '#94a3b8'}35`,
                          }}
                        >
                          {conteudo.estado}
                        </span>

                        <span
                          className="text-xs px-2 py-1 rounded-full capitalize"
                          style={{
                            background: `${COR_PLATAFORMA[conteudo.plataforma] || 'var(--cor-marca)'}18`,
                            color: COR_PLATAFORMA[conteudo.plataforma] || 'var(--cor-marca)',
                            border: `1px solid ${
                              COR_PLATAFORMA[conteudo.plataforma] || 'var(--cor-marca)'
                            }35`,
                          }}
                        >
                          {conteudo.plataforma}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg mb-1">{conteudo.titulo || 'Conteúdo sem título'}</h3>

                      {(conteudo.data_publicacao || conteudo.hora_publicacao) && (
                        <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
                          {conteudo.data_publicacao || 'Sem data'} ·{' '}
                          {conteudo.hora_publicacao || 'Sem hora'}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={conteudo.estado}
                        onChange={(e) => atualizarEstado(conteudo.id, e.target.value)}
                        className="input-campo"
                        style={{ width: 140, padding: '8px 10px' }}
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => gerarImagemParaConteudo(conteudo)}
                        disabled={gerandoImagemConteudoId === conteudo.id}
                        className="btn-primario"
                        style={gerandoImagemConteudoId === conteudo.id ? { opacity: 0.7 } : {}}
                      >
                        {gerandoImagemConteudoId === conteudo.id ? (
                          <>
                            <Loader size={14} className="animate-spin" />
                            A gerar...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            Gerar imagem
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => copiarConteudoCompleto(conteudo)}
                        className="btn-secundario"
                      >
                        <Copy size={14} />
                        Copiar tudo
                      </button>

                      <button
                        onClick={() => atualizarEstado(conteudo.id, 'publicado')}
                        className="btn-secundario"
                        style={{ color: '#22c55e' }}
                      >
                        <Send size={14} />
                        Publicado
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
                      valor={conteudo.texto}
                      onCopiar={() => copiarTexto(conteudo.texto)}
                    />
                    <BlocoConteudo
                      titulo="Legenda"
                      valor={conteudo.legenda}
                      onCopiar={() => copiarTexto(conteudo.legenda)}
                    />
                    <BlocoConteudo
                      titulo="Hashtags"
                      valor={conteudo.hashtags}
                      onCopiar={() => copiarTexto(conteudo.hashtags)}
                    />
                  </div>

                  {conteudo.imagem_url ? (
                    <div className="mt-4">
                      <p className="text-xs mb-2" style={{ color: 'var(--cor-texto-muted)' }}>
                        Imagem
                      </p>
                      <img
                        src={conteudo.imagem_url}
                        alt={conteudo.titulo}
                        className="rounded-xl max-h-80 object-contain"
                        style={{
                          border: '1px solid var(--cor-borda)',
                          background: '#050510',
                          maxWidth: '100%',
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className="mt-4 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap"
                      style={{
                        background: 'rgba(244,114,182,0.06)',
                        border: '1px dashed rgba(244,114,182,0.25)',
                      }}
                    >
                      <div>
                        <p className="text-sm font-semibold">Este conteúdo ainda não tem imagem.</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                          Podes gerar uma imagem diretamente a partir do texto do criativo.
                        </p>
                      </div>

                      <button
                        onClick={() => gerarImagemParaConteudo(conteudo)}
                        disabled={gerandoImagemConteudoId === conteudo.id}
                        className="btn-primario"
                        style={gerandoImagemConteudoId === conteudo.id ? { opacity: 0.7 } : {}}
                      >
                        {gerandoImagemConteudoId === conteudo.id ? (
                          <>
                            <Loader size={14} className="animate-spin" />
                            A gerar...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            Gerar imagem
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </LayoutPainel>

      {modalEditarAberto && (
        <ModalBase onFechar={() => setModalEditarAberto(false)} titulo="Editar campanha">
          <Campo label="Nome da campanha">
            <input
              className="input-campo"
              value={editNome}
              onChange={(e) => setEditNome(e.target.value)}
            />
          </Campo>

          <Campo label="Descrição">
            <textarea
              rows={4}
              className="input-campo resize-none"
              value={editDescricao}
              onChange={(e) => setEditDescricao(e.target.value)}
            />
          </Campo>

          <Campo label="Plataformas">
            <div className="flex flex-wrap gap-2">
              {['instagram', 'tiktok', 'youtube', 'linkedin'].map((p) => (
                <button
                  key={p}
                  onClick={() => toggleEditPlataforma(p)}
                  className="px-3 py-1.5 rounded-xl text-sm transition-all capitalize"
                  style={{
                    background: editPlataformas.includes(p)
                      ? `${COR_PLATAFORMA[p]}18`
                      : 'var(--cor-elevado)',
                    border: `1px solid ${
                      editPlataformas.includes(p)
                        ? COR_PLATAFORMA[p] + '50'
                        : 'var(--cor-borda)'
                    }`,
                    color: editPlataformas.includes(p)
                      ? COR_PLATAFORMA[p]
                      : 'var(--cor-texto-muted)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </Campo>

          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModalEditarAberto(false)} className="btn-secundario">
              Cancelar
            </button>

            <button
              onClick={guardarEdicaoCampanha}
              disabled={salvandoCampanha || !editNome.trim()}
              className="btn-primario"
              style={salvandoCampanha || !editNome.trim() ? { opacity: 0.65 } : {}}
            >
              {salvandoCampanha ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <CheckCircle size={15} />
                  Guardar alterações
                </>
              )}
            </button>
          </div>
        </ModalBase>
      )}

      {modalNovaCampanhaAberto && (
        <ModalBase onFechar={() => setModalNovaCampanhaAberto(false)} titulo="Nova campanha">
          <Campo label="Nome da campanha">
            <input
              className="input-campo"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Conteúdo da próxima semana"
            />
          </Campo>

          <Campo label="Descrição">
            <textarea
              rows={4}
              className="input-campo resize-none"
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              placeholder="Objetivo desta campanha..."
            />
          </Campo>

          <Campo label="Plataformas">
            <div className="flex flex-wrap gap-2">
              {['instagram', 'tiktok', 'youtube', 'linkedin'].map((p) => (
                <button
                  key={p}
                  onClick={() => toggleNovaPlataforma(p)}
                  className="px-3 py-1.5 rounded-xl text-sm transition-all capitalize"
                  style={{
                    background: novaPlataformas.includes(p)
                      ? `${COR_PLATAFORMA[p]}18`
                      : 'var(--cor-elevado)',
                    border: `1px solid ${
                      novaPlataformas.includes(p)
                        ? COR_PLATAFORMA[p] + '50'
                        : 'var(--cor-borda)'
                    }`,
                    color: novaPlataformas.includes(p)
                      ? COR_PLATAFORMA[p]
                      : 'var(--cor-texto-muted)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </Campo>

          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModalNovaCampanhaAberto(false)} className="btn-secundario">
              Cancelar
            </button>

            <button
              onClick={criarNovaCampanha}
              disabled={criandoNovaCampanha || !novoNome.trim()}
              className="btn-primario"
              style={criandoNovaCampanha || !novoNome.trim() ? { opacity: 0.65 } : {}}
            >
              {criandoNovaCampanha ? (
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
        </ModalBase>
      )}
    </>
  )
}

function ModalBase({
  titulo,
  children,
  onFechar,
}: {
  titulo: string
  children: React.ReactNode
  onFechar: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(5px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar()
      }}
    >
      <div className="card w-full max-w-xl" style={{ minWidth: 0 }}>
        <div className="flex items-center justify-between gap-4 mb-5">
          <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--fonte-display)' }}>
            {titulo}
          </h3>

          <button onClick={onFechar} className="btn-secundario" style={{ padding: 8 }}>
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
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
