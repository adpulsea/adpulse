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

export default function Calendario() {
  const hoje = new Date()
  const { utilizador } = useAuth()

  const [mesAtual, setMesAtual] = useState(hoje.getMonth())
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear())
  const [posts, setPosts] = useState<Post[]>([])
  const [carregando, setCarregando] = useState(true)
  const [postAberto, setPostAberto] = useState<Post | null>(null)
  const [mensagem, setMensagem] = useState('')

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
      setMensagem('Agendamento removido.')
      return
    }

    await supabase.from('posts').delete().eq('id', post.id)
    setPosts((prev) => prev.filter((p) => p.id !== post.id))
    setMensagem('Post removido.')
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
    setMensagem('Conteúdo copiado.')
  }

  const postsMes = posts.filter((p) => p.mes === mesAtual && p.ano === anoAtual)

  return (
    <>
      <Head>
        <title>Calendário — AdPulse</title>
      </Head>

      <LayoutPainel titulo="Calendário de Conteúdo">
        <div style={{ maxWidth: 1250, margin: '0 auto' }}>
          <div style={topbarStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => navegarMes(-1)} style={iconButtonStyle}>
                <ChevronLeft size={18} />
              </button>

              <h2 style={{ minWidth: 190, textAlign: 'center', fontSize: 20, fontWeight: 800 }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={carregarPosts}
                style={primaryButtonStyle}
              >
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
                  <div key={post.id} style={planningRowStyle}>
                    <div style={{ width: 130 }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{formatarData(post.criado_em)}</div>
                      <div style={{ opacity: 0.65, fontSize: 12 }}>{post.hora_publicacao}</div>
                    </div>

                    <div style={{ width: 110 }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{plataformaLabel(post.plataforma)}</div>
                      <div style={{ opacity: 0.65, fontSize: 12 }}>{post.formato}</div>
                    </div>

                    <div style={{ width: 80 }}>
                      {post.imagem_url ? (
                        <img
                          src={post.imagem_url}
                          alt={post.titulo}
                          style={{
                            width: 58,
                            height: 58,
                            objectFit: 'cover',
                            borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: '#050510',
                          }}
                        />
                      ) : (
                        <div style={noImageStyle}>
                          sem imagem
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 220 }}>
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

                    <button onClick={() => setPostAberto(post)} style={smallButtonStyle('#7c7bfa')}>
                      <Eye size={13} />
                      Ver
                    </button>

                    <button onClick={() => copiarPost(post)} style={smallButtonStyle('#151523')}>
                      <Copy size={13} />
                      Copiar
                    </button>

                    <button onClick={() => apagarPost(post)} style={smallButtonStyle('#ef4444')}>
                      <Trash2 size={13} />
                      Remover
                    </button>
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
          onFechar={() => setPostAberto(null)}
          onCopiar={copiarPost}
          onApagar={apagarPost}
        />
      )}
    </>
  )
}

function ModalConteudo({
  post,
  onFechar,
  onCopiar,
  onApagar,
}: {
  post: Post
  onFechar: () => void
  onCopiar: (post: Post) => void
  onApagar: (post: Post) => void
}) {
  const hashtags = Array.isArray(post.hashtags)
    ? post.hashtags.join(' ')
    : post.hashtags || ''

  return (
    <div style={modalOverlayStyle}>
      <div style={modalBoxStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>
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
                maxHeight: 560,
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
          <button onClick={() => onCopiar(post)} style={smallButtonStyle('#7c7bfa')}>
            <Copy size={14} />
            Copiar
          </button>

          <button onClick={() => onApagar(post)} style={smallButtonStyle('#ef4444')}>
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

function smallButtonStyle(background: string): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 10px',
    borderRadius: 10,
    border: background === '#151523' ? '1px solid rgba(255,255,255,0.12)' : 'none',
    background,
    color: '#fff',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
  }
}

const topbarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  marginBottom: 20,
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
}

const weekHeaderStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  borderBottom: '1px solid rgba(255,255,255,0.10)',
}

const weekCellStyle: CSSProperties = {
  padding: 12,
  textAlign: 'center',
  fontSize: 12,
  opacity: 0.7,
  fontWeight: 800,
}

const calendarGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
}

const emptyDayStyle: CSSProperties = {
  minHeight: 128,
  padding: 10,
  borderRight: '1px solid rgba(255,255,255,0.08)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(0,0,0,0.18)',
}

const planningBoxStyle: CSSProperties = {
  marginTop: 22,
  borderRadius: 18,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#0e0f17',
  padding: 18,
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

const planningRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  flexWrap: 'wrap',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.08)',
  background: '#141624',
  padding: 12,
}

const noImageStyle: CSSProperties = {
  width: 58,
  height: 58,
  borderRadius: 10,
  border: '1px dashed rgba(255,255,255,0.20)',
  color: 'rgba(255,255,255,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  textAlign: 'center',
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
  padding: 18,
}

const modalBoxStyle: CSSProperties = {
  width: '100%',
  maxWidth: 900,
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#0e0f17',
  padding: 22,
  color: '#fff',
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
