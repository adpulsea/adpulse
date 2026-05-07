import Head from 'next/head'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  Copy,
  X,
  Send,
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import ExportarPDF from '@/components/ExportarPDF'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

type Post = {
  id: string
  titulo: string
  legenda?: string
  hashtags?: string[] | string
  hook?: string
  plataforma: string
  formato: string
  estado: 'rascunho' | 'agendado' | 'publicado'
  hora_publicacao?: string
  imagem_url?: string
  criado_em: string
  dia: number
  mes: number
  ano: number
  origem?: 'posts' | 'equipa_adpulse'
  tarefa_id?: string
  agente_nome?: string
  agente_cargo?: string
  fase?: string
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const COR_ESTADO: Record<string, string> = {
  rascunho: '#94a3b8',
  agendado: '#60a5fa',
  publicado: '#22c55e',
}

const COR_FORMATO: Record<string, string> = {
  Post: '#7c7bfa',
  Reel: '#ec4899',
  Story: '#f59e0b',
  Carrossel: '#a855f7',
  Short: '#ef4444',
}

function plataformaLabel(plataforma?: string) {
  if (!plataforma) return 'Instagram'
  if (plataforma === 'instagram') return 'Instagram'
  if (plataforma === 'tiktok') return 'TikTok'
  if (plataforma === 'youtube') return 'YouTube'
  if (plataforma === 'linkedin') return 'LinkedIn'
  return plataforma
}

function formatarData(valor: string) {
  return new Date(valor).toLocaleDateString('pt-PT')
}

function formatarDataHora(valor: string) {
  return new Date(valor).toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function extrairHora(valor: string, fallback?: string) {
  if (fallback) return fallback
  return new Date(valor).toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const atualizar = () => {
      setIsMobile(window.innerWidth < 768)
    }

    atualizar()
    window.addEventListener('resize', atualizar)

    return () => window.removeEventListener('resize', atualizar)
  }, [])

  return isMobile
}

export default function Calendario() {
  const hoje = new Date()
  const { utilizador } = useAuth()
  const isMobile = useMobile()

  const [mesAtual, setMesAtual] = useState(hoje.getMonth())
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear())
  const [posts, setPosts] = useState<Post[]>([])
  const [carregando, setCarregando] = useState(true)
  const [postAberto, setPostAberto] = useState<Post | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [publicandoId, setPublicandoId] = useState<string | null>(null)

  const mostrarMensagem = (texto: string) => {
    setMensagem(texto)
    setTimeout(() => setMensagem(''), 4500)
  }

  const carregarPosts = async () => {
    if (!utilizador) return

    setCarregando(true)

    const inicioMes = new Date(anoAtual, mesAtual, 1).toISOString()
    const fimMes = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59).toISOString()

    const [{ data: postsData }, { data: tarefasData }] = await Promise.all([
      supabase
        .from('posts')
        .select('*')
        .eq('utilizador_id', utilizador.id)
        .gte('criado_em', inicioMes)
        .lte('criado_em', fimMes)
        .order('criado_em', { ascending: true }),

      supabase
        .from('equipa_adpulse_tarefas')
        .select('*')
        .eq('utilizador_id', utilizador.id)
        .not('data_publicacao', 'is', null)
        .gte('data_publicacao', inicioMes)
        .lte('data_publicacao', fimMes)
        .order('data_publicacao', { ascending: true }),
    ])

    const postsNormais: Post[] = (postsData || []).map((p: any) => {
      const d = new Date(p.criado_em)

      return {
        id: p.id,
        titulo: p.titulo || 'Post sem título',
        legenda: p.legenda || '',
        hashtags: p.hashtags || [],
        hook: p.hook || '',
        plataforma: p.plataforma || 'instagram',
        formato: p.formato || 'Post',
        estado: p.estado || 'rascunho',
        hora_publicacao: p.hora_publicacao || extrairHora(p.criado_em),
        imagem_url: p.imagem_url || '',
        criado_em: p.criado_em,
        dia: d.getDate(),
        mes: d.getMonth(),
        ano: d.getFullYear(),
        origem: 'posts',
      }
    })

    const postsEquipa: Post[] = (tarefasData || []).map((t: any) => {
      const d = new Date(t.data_publicacao)

      return {
        id: `equipa_${t.id}`,
        tarefa_id: t.id,
        titulo: t.titulo || 'Conteúdo Equipa AdPulse',
        legenda: t.legenda_publicacao || t.conteudo || '',
        hashtags: t.hashtags || [],
        plataforma: t.plataforma_publicacao || 'instagram',
        formato: 'Post',
        estado: t.estado === 'publicado' ? 'publicado' : 'agendado',
        hora_publicacao: extrairHora(t.data_publicacao),
        imagem_url: t.imagem_url || t.image_url || '',
        criado_em: t.data_publicacao,
        dia: d.getDate(),
        mes: d.getMonth(),
        ano: d.getFullYear(),
        origem: 'equipa_adpulse',
        agente_nome: t.agente_nome,
        agente_cargo: t.agente_cargo,
        fase: t.fase,
      }
    })

    setPosts([...postsNormais, ...postsEquipa])
    setCarregando(false)
  }

  useEffect(() => {
    carregarPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilizador, mesAtual, anoAtual])

  const navegarMes = (direcao: number) => {
    let novoMes = mesAtual + direcao
    let novoAno = anoAtual

    if (novoMes < 0) {
      novoMes = 11
      novoAno--
    }

    if (novoMes > 11) {
      novoMes = 0
      novoAno++
    }

    setMesAtual(novoMes)
    setAnoAtual(novoAno)
  }

  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate()
  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay()

  const postsNoDia = (dia: number) =>
    posts.filter((p) => p.dia === dia && p.mes === mesAtual && p.ano === anoAtual)

  const postsOrdenados = [...posts].sort(
    (a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()
  )

  const apagarPost = async (post: Post) => {
    if (!confirm('Queres remover este agendamento?')) return

    if (post.origem === 'equipa_adpulse' && post.tarefa_id) {
      await supabase
        .from('equipa_adpulse_tarefas')
        .update({
          estado: 'aprovado',
          data_publicacao: null,
        })
        .eq('id', post.tarefa_id)

      setPosts((prev) => prev.filter((p) => p.id !== post.id))
      setPostAberto(null)
      mostrarMensagem('Agendamento removido.')
      return
    }

    await supabase.from('posts').delete().eq('id', post.id)
    setPosts((prev) => prev.filter((p) => p.id !== post.id))
    setPostAberto(null)
    mostrarMensagem('Post removido.')
  }

  const copiarPost = async (post: Post) => {
    const hashtags = Array.isArray(post.hashtags)
      ? post.hashtags.join(' ')
      : post.hashtags || ''

    const texto = `Título:
${post.titulo}

Legenda:
${post.legenda || ''}

Hashtags:
${hashtags}

Imagem:
${post.imagem_url || 'Sem imagem'}`

    await navigator.clipboard.writeText(texto)
    mostrarMensagem('Conteúdo copiado.')
  }

  const publicarPost = async (post: Post) => {
    if (!post.imagem_url) {
      alert('Este conteúdo ainda não tem imagem. Gera uma imagem antes de publicar.')
      return
    }

    if (post.estado === 'publicado') {
      mostrarMensagem('Este conteúdo já está marcado como publicado.')
      return
    }

    setPublicandoId(post.id)

    try {
      const body =
        post.origem === 'equipa_adpulse' && post.tarefa_id
          ? { tarefa_id: post.tarefa_id }
          : { post_id: post.id }

      const resp = await fetch('/api/ia/publicar-instagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data?.erro || data?.error || 'Erro ao publicar.')
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, estado: 'publicado' }
            : p
        )
      )

      setPostAberto((prev) =>
        prev && prev.id === post.id
          ? { ...prev, estado: 'publicado' }
          : prev
      )

      if (data?.modo === 'simulado') {
        mostrarMensagem('Publicado em modo simulado. Quando ligares a Meta API, passa a publicação real.')
      } else {
        mostrarMensagem('Publicado no Instagram com sucesso.')
      }
    } catch (e: any) {
      alert(e?.message || 'Erro ao publicar no Instagram.')
    } finally {
      setPublicandoId(null)
    }
  }

  const postsMes = posts.filter((p) => p.mes === mesAtual && p.ano === anoAtual)

  return (
    <>
      <Head>
        <title>Calendário — AdPulse</title>
      </Head>

      <LayoutPainel titulo="Calendário de Conteúdo">
        <div style={{ maxWidth: 1250, margin: '0 auto', width: '100%' }}>
          <div style={topbarStyle(isMobile)}>
            <div style={monthNavStyle(isMobile)}>
              <button onClick={() => navegarMes(-1)} style={iconButtonStyle}>
                <ChevronLeft size={18} />
              </button>

              <h2 style={monthTitleStyle(isMobile)}>
                {MESES[mesAtual]} {anoAtual}
              </h2>

              <button onClick={() => navegarMes(1)} style={iconButtonStyle}>
                <ChevronRight size={18} />
              </button>

              <button
                onClick={() => {
                  setMesAtual(hoje.getMonth())
                  setAnoAtual(hoje.getFullYear())
                }}
                style={secondaryButtonStyle}
              >
                Hoje
              </button>
            </div>

            <div style={actionsStyle(isMobile)}>
              <button onClick={carregarPosts} style={primaryButtonStyle}>
                Atualizar
              </button>

              <ExportarPDF mesAtual={mesAtual} anoAtual={anoAtual} />
            </div>
          </div>

          {mensagem && (
            <div style={successStyle}>
              {mensagem}
            </div>
          )}

          <div style={statsGridStyle}>
            <StatCard label="Posts planeados" value={carregando ? '...' : String(postsMes.length)} />
            <StatCard label="Agendados" value={carregando ? '...' : String(postsMes.filter((p) => p.estado === 'agendado').length)} />
            <StatCard label="Publicados" value={carregando ? '...' : String(postsMes.filter((p) => p.estado === 'publicado').length)} />
            <StatCard label="Com imagem" value={carregando ? '...' : String(postsMes.filter((p) => !!p.imagem_url).length)} />
          </div>

          {isMobile ? (
            <div style={mobileCalendarBoxStyle}>
              <div style={mobileCalendarHeaderStyle}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
                  Dias do mês
                </h3>
                <span style={badgeStyle}>{postsMes.length} conteúdos</span>
              </div>

              <div style={mobileDaysListStyle}>
                {Array.from({ length: diasNoMes }, (_, index) => index + 1).map((dia) => {
                  const psDia = postsNoDia(dia)
                  const dataDia = new Date(anoAtual, mesAtual, dia)
                  const nomeSemana = DIAS_SEMANA[dataDia.getDay()]
                  const isHoje =
                    dia === hoje.getDate() &&
                    mesAtual === hoje.getMonth() &&
                    anoAtual === hoje.getFullYear()

                  return (
                    <div key={dia} style={mobileDayStyle(isHoje)}>
                      <div style={mobileDayHeaderStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={mobileDayNumberStyle(isHoje)}>{dia}</span>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: 14 }}>
                              {nomeSemana}, {dia} de {MESES[mesAtual]}
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.62 }}>
                              {psDia.length === 0
                                ? 'Sem conteúdos planeados'
                                : `${psDia.length} conteúdo${psDia.length > 1 ? 's' : ''} planeado${psDia.length > 1 ? 's' : ''}`}
                            </div>
                          </div>
                        </div>

                        <Plus size={15} style={{ opacity: 0.5 }} />
                      </div>

                      {psDia.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                          {psDia.map((post) => (
                            <button
                              key={post.id}
                              onClick={() => setPostAberto(post)}
                              style={mobilePostCardStyle(post)}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                <span style={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {post.origem === 'equipa_adpulse' ? '🤖 ' : ''}
                                  {post.imagem_url ? '🖼️ ' : ''}
                                  {post.titulo}
                                </span>
                                <span style={{ fontSize: 11, opacity: 0.75, flexShrink: 0 }}>
                                  {post.hora_publicacao}
                                </span>
                              </div>

                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                                <span style={estadoBadgeStyle(post.estado)}>{post.estado}</span>
                                <span style={miniMetaBadgeStyle}>{plataformaLabel(post.plataforma)}</span>
                                <span style={miniMetaBadgeStyle}>{post.formato}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={calendarBoxStyle}>
              <div style={weekHeaderStyle}>
                {DIAS_SEMANA.map((dia) => (
                  <div key={dia} style={weekCellStyle}>
                    {dia}
                  </div>
                ))}
              </div>

              <div style={calendarGridStyle}>
                {Array.from({ length: primeiroDia }).map((_, index) => (
                  <div key={`empty-${index}`} style={emptyDayStyle} />
                ))}

                {Array.from({ length: diasNoMes }, (_, index) => index + 1).map((dia) => {
                  const psDia = postsNoDia(dia)
                  const isHoje =
                    dia === hoje.getDate() &&
                    mesAtual === hoje.getMonth() &&
                    anoAtual === hoje.getFullYear()

                  return (
                    <div key={dia} style={dayCellStyle(isHoje)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={dayNumberStyle(isHoje)}>{dia}</span>
                        <Plus size={12} style={{ opacity: 0.45 }} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                        {psDia.slice(0, 4).map((post) => (
                          <button
                            key={post.id}
                            onClick={() => setPostAberto(post)}
                            style={postMiniStyle(post)}
                          >
                            <span style={{ fontSize: 10, opacity: 0.75 }}>{post.hora_publicacao}</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {post.origem === 'equipa_adpulse' ? '🤖 ' : ''}
                              {post.imagem_url ? '🖼️ ' : ''}
                              {post.titulo}
                            </span>
                          </button>
                        ))}

                        {psDia.length > 4 && (
                          <div style={{ fontSize: 11, opacity: 0.65 }}>
                            +{psDia.length - 4} mais
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={planningBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                  📋 Planeamento do mês
                </h3>
                <p style={{ fontSize: 13, opacity: 0.7 }}>
                  Tudo o que está planeado, incluindo imagem, legenda e horário.
                </p>
              </div>

              <span style={badgeStyle}>
                {postsOrdenados.length} itens
              </span>
            </div>

            {postsOrdenados.length === 0 ? (
              <div style={{ opacity: 0.7, fontSize: 14 }}>
                Ainda não tens conteúdos planeados para este mês.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {postsOrdenados.map((post) => (
                  <div key={post.id} style={planningRowStyle(isMobile)}>
                    <div style={planningDateStyle(isMobile)}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{formatarData(post.criado_em)}</div>
                      <div style={{ opacity: 0.65, fontSize: 12 }}>{post.hora_publicacao}</div>
                    </div>

                    <div style={planningPlatformStyle(isMobile)}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{plataformaLabel(post.plataforma)}</div>
                      <div style={{ opacity: 0.65, fontSize: 12 }}>{post.formato}</div>
                    </div>

                    <div style={planningImageWrapStyle(isMobile)}>
                      {post.imagem_url ? (
                        <img
                          src={post.imagem_url}
                          alt={post.titulo}
                          style={{
                            width: isMobile ? 72 : 58,
                            height: isMobile ? 72 : 58,
                            objectFit: 'cover',
                            borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: '#050510',
                          }}
                        />
                      ) : (
                        <div style={noImageStyle(isMobile)}>
                          sem imagem
                        </div>
                      )}
                    </div>

                    <div style={planningTitleWrapStyle(isMobile)}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                        {post.origem === 'equipa_adpulse' ? '🤖 ' : ''}
                        {post.titulo}
                      </div>
                      <div style={{ opacity: 0.65, fontSize: 12 }}>
                        {post.origem === 'equipa_adpulse'
                          ? `${post.agente_nome || 'Equipa AdPulse'}${post.fase ? ` • ${post.fase}` : ''}`
                          : 'Post manual / Post rápido'}
                      </div>
                    </div>

                    <span style={estadoBadgeStyle(post.estado)}>
                      {post.estado}
                    </span>

                    <div style={planningButtonsStyle(isMobile)}>
                      <button onClick={() => setPostAberto(post)} style={smallButtonStyle('#7c7bfa', isMobile)}>
                        <Eye size={13} />
                        Ver
                      </button>

                      <button onClick={() => copiarPost(post)} style={smallButtonStyle('#151523', isMobile)}>
                        <Copy size={13} />
                        Copiar
                      </button>

                      <button
                        onClick={() => publicarPost(post)}
                        disabled={post.estado === 'publicado' || !post.imagem_url || publicandoId === post.id}
                        style={{
                          ...smallButtonStyle('#22c55e', isMobile),
                          opacity: post.estado === 'publicado' || !post.imagem_url || publicandoId === post.id ? 0.55 : 1,
                          cursor: post.estado === 'publicado' || !post.imagem_url || publicandoId === post.id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Send size={13} />
                        {publicandoId === post.id
                          ? 'A publicar...'
                          : post.estado === 'publicado'
                            ? 'Publicado'
                            : 'Publicar'}
                      </button>

                      <button onClick={() => apagarPost(post)} style={smallButtonStyle('#ef4444', isMobile)}>
                        <Trash2 size={13} />
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </LayoutPainel>

      {postAberto && (
        <ModalConteudo
          post={postAberto}
          publicando={publicandoId === postAberto.id}
          isMobile={isMobile}
          onFechar={() => setPostAberto(null)}
          onCopiar={copiarPost}
          onApagar={apagarPost}
          onPublicar={publicarPost}
        />
      )}
    </>
  )
}

function ModalConteudo({
  post,
  publicando,
  isMobile,
  onFechar,
  onCopiar,
  onApagar,
  onPublicar,
}: {
  post: Post
  publicando: boolean
  isMobile: boolean
  onFechar: () => void
  onCopiar: (post: Post) => void
  onApagar: (post: Post) => void
  onPublicar: (post: Post) => void
}) {
  const hashtags = Array.isArray(post.hashtags)
    ? post.hashtags.join(' ')
    : post.hashtags || ''

  return (
    <div style={modalOverlayStyle}>
      <div style={modalBoxStyle(isMobile)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, marginBottom: 6 }}>
              {post.origem === 'equipa_adpulse' ? '🤖 Conteúdo da Equipa AdPulse' : 'Conteúdo planeado'}
            </h3>
            <p style={{ fontSize: 13, opacity: 0.7 }}>
              {formatarDataHora(post.criado_em)} • {plataformaLabel(post.plataforma)} • {post.estado}
            </p>
          </div>

          <button onClick={onFechar} style={closeButtonStyle}>
            <X size={18} />
          </button>
        </div>

        {post.imagem_url ? (
          <div style={modalImageWrapStyle}>
            <img
              src={post.imagem_url}
              alt={post.titulo}
              style={{
                width: '100%',
                maxHeight: isMobile ? 420 : 560,
                objectFit: 'contain',
                background: '#050510',
                display: 'block',
              }}
            />
          </div>
        ) : (
          <div style={modalNoImageStyle}>
            Este conteúdo ainda não tem imagem guardada.
          </div>
        )}

        <div style={modalInfoGridStyle}>
          <InfoBox label="Título" value={post.titulo} />
          <InfoBox label="Plataforma" value={plataformaLabel(post.plataforma)} />
          <InfoBox label="Formato" value={post.formato || 'Post'} />
          <InfoBox label="Hora" value={post.hora_publicacao || '--:--'} />
        </div>

        <ContentBox label="Legenda / Conteúdo" value={post.legenda || 'Sem legenda.'} />

        {post.hook && (
          <ContentBox label="Texto do criativo / Hook" value={post.hook} />
        )}

        {hashtags && (
          <ContentBox label="Hashtags" value={hashtags} />
        )}

        {post.imagem_url && (
          <ContentBox label="URL da imagem" value={post.imagem_url} />
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={() => onCopiar(post)} style={smallButtonStyle('#7c7bfa', isMobile)}>
            <Copy size={14} />
            Copiar
          </button>

          <button
            onClick={() => onPublicar(post)}
            disabled={post.estado === 'publicado' || !post.imagem_url || publicando}
            style={{
              ...smallButtonStyle('#22c55e', isMobile),
              opacity: post.estado === 'publicado' || !post.imagem_url || publicando ? 0.55 : 1,
              cursor: post.estado === 'publicado' || !post.imagem_url || publicando ? 'not-allowed' : 'pointer',
            }}
          >
            <Send size={14} />
            {publicando
              ? 'A publicar...'
              : post.estado === 'publicado'
                ? 'Publicado'
                : 'Publicar agora'}
          </button>

          <button onClick={() => onApagar(post)} style={smallButtonStyle('#ef4444', isMobile)}>
            <Trash2 size={14} />
            Remover
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={statCardStyle}>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#7c7bfa' }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoBoxStyle}>
      <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 6 }}>{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  )
}

function ContentBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={contentBoxStyle}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>{label}</div>
      <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.6, wordBreak: 'break-word' }}>
        {value}
      </div>
    </div>
  )
}

function dayCellStyle(isHoje: boolean): CSSProperties {
  return {
    minHeight: 128,
    padding: 10,
    borderRight: '1px solid rgba(255,255,255,0.08)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: isHoje ? 'rgba(124,123,250,0.08)' : 'transparent',
    minWidth: 0,
  }
}

function dayNumberStyle(isHoje: boolean): CSSProperties {
  return {
    width: 26,
    height: 26,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isHoje ? '#7c7bfa' : 'transparent',
    color: isHoje ? '#fff' : 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: 800,
  }
}

function postMiniStyle(post: Post): CSSProperties {
  const cor = COR_FORMATO[post.formato] || '#7c7bfa'

  return {
    display: 'flex',
    gap: 5,
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    border: `1px solid ${cor}55`,
    background: `${cor}22`,
    color: '#fff',
    padding: '5px 6px',
    borderRadius: 8,
    fontSize: 11,
    cursor: 'pointer',
    textAlign: 'left',
  }
}

function mobilePostCardStyle(post: Post): CSSProperties {
  const cor = COR_FORMATO[post.formato] || '#7c7bfa'

  return {
    width: '100%',
    border: `1px solid ${cor}55`,
    background: `${cor}18`,
    color: '#fff',
    padding: 12,
    borderRadius: 14,
    fontSize: 13,
    cursor: 'pointer',
    textAlign: 'left',
  }
}

function estadoBadgeStyle(estado: string): CSSProperties {
  const cor = COR_ESTADO[estado] || '#94a3b8'

  return {
    padding: '6px 9px',
    borderRadius: 999,
    background: `${cor}20`,
    color: cor,
    border: `1px solid ${cor}55`,
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'capitalize',
  }
}

function smallButtonStyle(background: string, isMobile = false): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: isMobile ? '10px 12px' : '8px 10px',
    borderRadius: 10,
    border: background === '#151523' ? '1px solid rgba(255,255,255,0.12)' : 'none',
    background,
    color: '#fff',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
    flex: isMobile ? '1 1 calc(50% - 8px)' : undefined,
  }
}

function topbarStyle(isMobile: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: isMobile ? 'stretch' : 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 20,
    flexDirection: isMobile ? 'column' : 'row',
  }
}

function monthNavStyle(isMobile: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: isMobile ? 'space-between' : 'flex-start',
    width: isMobile ? '100%' : undefined,
  }
}

function actionsStyle(isMobile: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    width: isMobile ? '100%' : undefined,
  }
}

function monthTitleStyle(isMobile: boolean): CSSProperties {
  return {
    minWidth: isMobile ? 140 : 190,
    textAlign: 'center',
    fontSize: isMobile ? 17 : 20,
    fontWeight: 800,
    flex: isMobile ? 1 : undefined,
  }
}

function mobileDayStyle(isHoje: boolean): CSSProperties {
  return {
    borderRadius: 16,
    border: isHoje
      ? '1px solid rgba(124,123,250,0.55)'
      : '1px solid rgba(255,255,255,0.10)',
    background: isHoje ? 'rgba(124,123,250,0.12)' : '#141624',
    padding: 14,
  }
}

function mobileDayNumberStyle(isHoje: boolean): CSSProperties {
  return {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isHoje ? '#7c7bfa' : 'rgba(255,255,255,0.06)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 900,
    flexShrink: 0,
  }
}

function planningRowStyle(isMobile: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: isMobile ? 'stretch' : 'center',
    gap: isMobile ? 12 : 14,
    flexWrap: 'wrap',
    flexDirection: isMobile ? 'column' : 'row',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#141624',
    padding: isMobile ? 14 : 12,
    width: '100%',
    boxSizing: 'border-box',
  }
}

function planningDateStyle(isMobile: boolean): CSSProperties {
  return {
    width: isMobile ? '100%' : 130,
  }
}

function planningPlatformStyle(isMobile: boolean): CSSProperties {
  return {
    width: isMobile ? '100%' : 110,
  }
}

function planningImageWrapStyle(isMobile: boolean): CSSProperties {
  return {
    width: isMobile ? '100%' : 80,
  }
}

function planningTitleWrapStyle(isMobile: boolean): CSSProperties {
  return {
    flex: 1,
    minWidth: isMobile ? '100%' : 220,
  }
}

function planningButtonsStyle(isMobile: boolean): CSSProperties {
  return {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    width: isMobile ? '100%' : undefined,
  }
}

function noImageStyle(isMobile: boolean): CSSProperties {
  return {
    width: isMobile ? 72 : 58,
    height: isMobile ? 72 : 58,
    borderRadius: 10,
    border: '1px dashed rgba(255,255,255,0.20)',
    color: 'rgba(255,255,255,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    textAlign: 'center',
  }
}

function modalBoxStyle(isMobile: boolean): CSSProperties {
  return {
    width: '100%',
    maxWidth: isMobile ? '100%' : 900,
    maxHeight: isMobile ? '92vh' : '90vh',
    overflowY: 'auto',
    borderRadius: isMobile ? 16 : 20,
    border: '1px solid rgba(255,255,255,0.12)',
    background: '#0e0f17',
    padding: isMobile ? 16 : 22,
    color: '#fff',
  }
}

const iconButtonStyle: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#151523',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
}

const secondaryButtonStyle: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#151523',
  color: '#fff',
  fontWeight: 800,
  cursor: 'pointer',
}

const primaryButtonStyle: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 12,
  border: 'none',
  background: '#7c7bfa',
  color: '#fff',
  fontWeight: 800,
  cursor: 'pointer',
}

const successStyle: CSSProperties = {
  marginBottom: 18,
  padding: 14,
  borderRadius: 12,
  background: 'rgba(34,197,94,0.10)',
  border: '1px solid rgba(34,197,94,0.28)',
  color: '#22c55e',
  fontSize: 14,
}

const statsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: 12,
  marginBottom: 20,
}

const statCardStyle: CSSProperties = {
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#0e0f17',
  padding: 16,
  textAlign: 'center',
}

const calendarBoxStyle: CSSProperties = {
  borderRadius: 18,
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#0e0f17',
  width: '100%',
  maxWidth: '100%',
}

const weekHeaderStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  borderBottom: '1px solid rgba(255,255,255,0.10)',
}

const weekCellStyle: CSSProperties = {
  padding: 12,
  textAlign: 'center',
  fontSize: 12,
  opacity: 0.7,
  fontWeight: 800,
  minWidth: 0,
}

const calendarGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
}

const emptyDayStyle: CSSProperties = {
  minHeight: 128,
  padding: 10,
  borderRight: '1px solid rgba(255,255,255,0.08)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(0,0,0,0.18)',
  minWidth: 0,
}

const mobileCalendarBoxStyle: CSSProperties = {
  borderRadius: 18,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#0e0f17',
  padding: 14,
}

const mobileCalendarHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  marginBottom: 14,
  flexWrap: 'wrap',
}

const mobileDaysListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const mobileDayHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
}

const miniMetaBadgeStyle: CSSProperties = {
  padding: '5px 8px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: 'rgba(255,255,255,0.78)',
  fontSize: 11,
  fontWeight: 800,
}

const planningBoxStyle: CSSProperties = {
  marginTop: 22,
  borderRadius: 18,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#0e0f17',
  padding: 18,
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
}

const badgeStyle: CSSProperties = {
  padding: '6px 10px',
  borderRadius: 999,
  background: 'rgba(124,123,250,0.16)',
  color: '#a5b4fc',
  fontSize: 12,
  fontWeight: 900,
  height: 'fit-content',
}

const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  background: 'rgba(0,0,0,0.75)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 12,
}

const closeButtonStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#151523',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
}

const modalImageWrapStyle: CSSProperties = {
  marginTop: 18,
  marginBottom: 18,
  borderRadius: 16,
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#050510',
}

const modalNoImageStyle: CSSProperties = {
  marginTop: 18,
  marginBottom: 18,
  borderRadius: 16,
  border: '1px dashed rgba(255,255,255,0.20)',
  background: '#111320',
  color: 'rgba(255,255,255,0.55)',
  padding: 24,
  textAlign: 'center',
}

const modalInfoGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 12,
}

const infoBoxStyle: CSSProperties = {
  padding: 12,
  borderRadius: 12,
  background: '#141624',
  border: '1px solid rgba(255,255,255,0.06)',
}

const contentBoxStyle: CSSProperties = {
  padding: 14,
  borderRadius: 12,
  background: '#141624',
  border: '1px solid rgba(255,255,255,0.06)',
  marginTop: 12,
}
