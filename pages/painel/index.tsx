// ============================================
// AdPulse — Dashboard Principal (dados reais)
// ============================================

import Head from 'next/head'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp, Zap, Eye, ArrowUpRight, ArrowDownRight,
  Plus, Sparkles, ChevronRight, Send, FileText,
  Calendar, Image as ImageIcon
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import TourBoasVindas from '@/components/TourBoasVindas'

// ---- Tipos ----
type Metricas = {
  totalGeracoes: number
  geracoesHoje: number
  totalPosts: number
  postsPublicados: number
  postsAgendados: number
  totalCampanhas: number
  totalFicheiros: number
  plano: string
}

type PostSemana = {
  id: string
  titulo: string
  formato: string
  hora_publicacao?: string
  estado: string
  plataforma: string
  criado_em: string
  dia: number
}

// ---- Gráfico SVG ----
function GraficoCrescimento({ dados }: { dados: number[] }) {
  if (dados.length === 0) return null
  const max = Math.max(...dados, 1)
  const min = Math.min(...dados, 0)
  const h = 120, w = 600, pad = 10

  const pontos = dados.map((v, i) => {
    const x = pad + (i / Math.max(dados.length - 1, 1)) * (w - pad * 2)
    const y = pad + ((max - v) / Math.max(max - min, 1)) * (h - pad * 2)
    return `${x},${y}`
  })

  const caminhoLinha = `M ${pontos.join(' L ')}`
  const caminhoArea = `M ${pontos[0]} L ${pontos.join(' L ')} L ${w - pad},${h} L ${pad},${h} Z`
  const ultimoX = parseFloat(pontos[pontos.length - 1].split(',')[0])
  const ultimoY = parseFloat(pontos[pontos.length - 1].split(',')[1])

  const labels = dados.length > 7
    ? ['Início', '', '', 'Meio', '', '', 'Hoje']
    : dados.map((_, i) => i === 0 ? 'Início' : i === dados.length - 1 ? 'Hoje' : '')

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${w} ${h + 20}`} width="100%" style={{ minWidth: 280 }}>
        <defs>
          <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7c7bfa" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#7c7bfa" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={caminhoArea} fill="url(#gradArea)" />
        <path d={caminhoLinha} fill="none" stroke="#7c7bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={ultimoX} cy={ultimoY} r="4" fill="#7c7bfa" />
        <circle cx={ultimoX} cy={ultimoY} r="8" fill="#7c7bfa" fillOpacity="0.2"/>
        {['Início', 'Meio', 'Hoje'].map((label, i) => (
          <text key={label} x={pad + (i / 2) * (w - pad * 2)} y={h + 16}
            textAnchor="middle" fontSize="10" fill="var(--cor-texto-fraco)"
            fontFamily="var(--fonte-corpo)">
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
}

const DIAS_SEMANA_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const COR_TIPO: Record<string, string> = {
  Reel: '#7c7bfa', Carrossel: '#c084fc', Story: '#f472b6', Post: '#34d399', Short: '#fbbf24',
}

export default function Dashboard() {
  const { utilizador } = useAuth()
  const [metricas, setMetricas]     = useState<Metricas | null>(null)
  const [postsSemana, setPostsSem]  = useState<PostSemana[]>([])
  const [geracoesDias, setGerDias]  = useState<number[]>([])
  const [carregando, setCarr]       = useState(true)
  const [mostrarTour, setTour]      = useState(false)

  const nomeUtilizador = utilizador?.user_metadata?.nome
    || utilizador?.email?.split('@')[0] || 'criador'

  useEffect(() => {
    if (!utilizador) return

    const carregar = async () => {
      setCarr(true)
      const hoje = new Date()
      const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
      const inicio30Dias = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 30).toISOString()
      const inicioSemana = new Date(hoje)
      inicioSemana.setDate(hoje.getDate() - hoje.getDay())
      inicioSemana.setHours(0, 0, 0, 0)
      const fimSemana = new Date(inicioSemana)
      fimSemana.setDate(inicioSemana.getDate() + 6)
      fimSemana.setHours(23, 59, 59, 999)

      // Carregar tudo em paralelo
      const [
        { count: totalGeracoes },
        { count: geracoesHoje },
        { count: totalPosts },
        { count: postsPublicados },
        { count: postsAgendados },
        { count: totalCampanhas },
        { count: totalFicheiros },
        { data: perfilData },
        { data: postsSemanaData },
        { data: geracoesData },
      ] = await Promise.all([
        supabase.from('geracoes_ai').select('*', { count: 'exact', head: true }).eq('utilizador_id', utilizador.id),
        supabase.from('geracoes_ai').select('*', { count: 'exact', head: true }).eq('utilizador_id', utilizador.id).gte('criado_em', inicioHoje),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('utilizador_id', utilizador.id),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('utilizador_id', utilizador.id).eq('estado', 'publicado'),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('utilizador_id', utilizador.id).eq('estado', 'agendado'),
        supabase.from('campanhas').select('*', { count: 'exact', head: true }).eq('utilizador_id', utilizador.id),
        supabase.from('ficheiros_media').select('*', { count: 'exact', head: true }).eq('utilizador_id', utilizador.id),
        supabase.from('perfis').select('plano').eq('id', utilizador.id).single(),
        supabase.from('posts').select('*').eq('utilizador_id', utilizador.id).gte('criado_em', inicioSemana.toISOString()).lte('criado_em', fimSemana.toISOString()),
        supabase.from('geracoes_ai').select('criado_em').eq('utilizador_id', utilizador.id).gte('criado_em', inicio30Dias).order('criado_em'),
      ])

      setMetricas({
        totalGeracoes: totalGeracoes || 0,
        geracoesHoje: geracoesHoje || 0,
        totalPosts: totalPosts || 0,
        postsPublicados: postsPublicados || 0,
        postsAgendados: postsAgendados || 0,
        totalCampanhas: totalCampanhas || 0,
        totalFicheiros: totalFicheiros || 0,
        plano: perfilData?.plano || 'gratuito',
      })

      // Posts da semana com dia da semana
      if (postsSemanaData) {
        setPostsSem(postsSemanaData.map(p => ({
          ...p,
          dia: new Date(p.criado_em).getDay(),
        })))
      }

      // Gráfico — gerações por dia nos últimos 30 dias
      if (geracoesData) {
        const contagem: Record<string, number> = {}
        geracoesData.forEach(g => {
          const dia = new Date(g.criado_em).toLocaleDateString('pt-PT')
          contagem[dia] = (contagem[dia] || 0) + 1
        })
        setGerDias(Object.values(contagem))
      }

      setCarr(false)

      // ---- Notificações automáticas de posts agendados ----
      const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59).toISOString()
      const { data: postsHoje } = await supabase
        .from('posts')
        .select('id, titulo, hora_publicacao, plataforma')
        .eq('utilizador_id', utilizador.id)
        .eq('estado', 'agendado')
        .gte('criado_em', inicioHoje)
        .lte('criado_em', fimHoje)

      if (postsHoje && postsHoje.length > 0) {
        for (const post of postsHoje) {
          // Verificar se já existe notificação para este post hoje
          const chaveNotif = `notif_post_${post.id}_${hoje.toLocaleDateString('pt-PT')}`
          const jaNotificado = localStorage.getItem(chaveNotif)
          if (!jaNotificado) {
            await supabase.from('notificacoes').insert({
              utilizador_id: utilizador.id,
              titulo: `📅 Post agendado para hoje`,
              mensagem: `"${post.titulo}" está agendado para as ${post.hora_publicacao || '??:??'} no ${post.plataforma}. Está na hora de publicar!`,
              tipo: 'aviso',
              lida: false,
              link: `/painel/publicar?id=${post.id}`,
            })
            localStorage.setItem(chaveNotif, 'true')
          }
        }
      }
    }

    carregar()

    // Mostrar tour na primeira visita
    const tourVisto = localStorage.getItem('adpulse_tour_visto')
    if (!tourVisto) setTour(true)
  }, [utilizador])

  const limiteGeracoes = metricas?.plano === 'gratuito' ? 3 : 999
  const geracoesRestantes = Math.max(0, limiteGeracoes - (metricas?.geracoesHoje || 0))

  return (
    <>
      <Head><title>Dashboard — AdPulse</title></Head>
      <LayoutPainel titulo="Dashboard">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Saudação */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--fonte-display)' }}>
                Olá, {nomeUtilizador} 👋
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                Aqui está um resumo do teu crescimento esta semana.
              </p>
            </div>
            <Link href="/painel/studio" className="btn-primario hidden sm:inline-flex">
              <Sparkles size={16} /> Criar conteúdo
            </Link>
          </div>

          {/* Alertas dinâmicos */}
          <div className="flex flex-col gap-2">
            {metricas?.plano === 'gratuito' && metricas.geracoesHoje >= 2 && (
              <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <span style={{ color: 'var(--cor-texto-muted)' }}>
                  ⚠️ Usaste {metricas.geracoesHoje} das {limiteGeracoes} gerações grátis de hoje
                </span>
                <Link href="/precos" className="text-xs font-medium whitespace-nowrap flex items-center gap-1"
                  style={{ color: 'var(--cor-marca)' }}>
                  Fazer upgrade <ChevronRight size={12} />
                </Link>
              </div>
            )}
            {(metricas?.postsAgendados || 0) > 0 && (
              <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(124,123,250,0.08)', border: '1px solid rgba(124,123,250,0.15)' }}>
                <span style={{ color: 'var(--cor-texto-muted)' }}>
                  📅 Tens {metricas?.postsAgendados} {metricas?.postsAgendados === 1 ? 'post agendado' : 'posts agendados'} — não te esqueças de publicar!
                </span>
                <Link href="/painel/calendario" className="text-xs font-medium whitespace-nowrap flex items-center gap-1"
                  style={{ color: 'var(--cor-marca)' }}>
                  Ver calendário <ChevronRight size={12} />
                </Link>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(124,123,250,0.08)', border: '1px solid rgba(124,123,250,0.15)' }}>
              <span style={{ color: 'var(--cor-texto-muted)' }}>
                🔥 "POV" e "dia na vida" estão em alta no TikTok hoje
              </span>
              <Link href="/painel/studio" className="text-xs font-medium whitespace-nowrap flex items-center gap-1"
                style={{ color: 'var(--cor-marca)' }}>
                Criar conteúdo <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* Métricas reais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                titulo: 'Conteúdos gerados',
                valor: carregando ? '...' : metricas?.totalGeracoes.toString() || '0',
                sub: `${metricas?.geracoesHoje || 0} hoje`,
                icone: Zap, cor: '#7c7bfa',
                variacao: metricas && metricas.geracoesHoje > 0 ? metricas.geracoesHoje : 0,
              },
              {
                titulo: 'Posts criados',
                valor: carregando ? '...' : metricas?.totalPosts.toString() || '0',
                sub: `${metricas?.postsPublicados || 0} publicados`,
                icone: FileText, cor: '#c084fc',
                variacao: metricas?.postsPublicados || 0,
              },
              {
                titulo: 'Posts agendados',
                valor: carregando ? '...' : metricas?.postsAgendados.toString() || '0',
                sub: 'para publicar',
                icone: Calendar, cor: '#34d399',
                variacao: 0,
              },
              {
                titulo: 'Ficheiros na biblioteca',
                valor: carregando ? '...' : metricas?.totalFicheiros.toString() || '0',
                sub: 'imagens e vídeos',
                icone: ImageIcon, cor: '#fbbf24',
                variacao: 0,
              },
            ].map((m) => {
              const Icone = m.icone
              return (
                <div key={m.titulo} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${m.cor}18`, border: `1px solid ${m.cor}30` }}>
                      <Icone size={18} style={{ color: m.cor }} />
                    </div>
                    {m.variacao > 0 && (
                      <div className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--cor-sucesso)' }}>
                        <ArrowUpRight size={14} /> {m.variacao}
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--fonte-display)' }}>{m.valor}</p>
                  <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>{m.titulo}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--cor-texto-fraco)' }}>{m.sub}</p>
                </div>
              )
            })}
          </div>

          {/* Gráfico + Ações rápidas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Gráfico de gerações */}
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Gerações de conteúdo
                </h3>
                <span className="badge-marca text-xs">Últimos 30 dias</span>
              </div>
              {geracoesDias.length > 0 ? (
                <GraficoCrescimento dados={geracoesDias} />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Zap size={28} style={{ color: 'var(--cor-texto-fraco)', marginBottom: 8, opacity: 0.3 }} />
                  <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                    Ainda não geraste conteúdo
                  </p>
                  <Link href="/painel/studio" className="btn-primario mt-4 text-xs">
                    <Sparkles size={14} /> Gerar agora
                  </Link>
                </div>
              )}
            </div>

            {/* Ações rápidas */}
            <div className="card">
              <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--fonte-display)' }}>
                Ações rápidas
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Gerar conteúdo com IA', href: '/painel/studio', icone: Sparkles, cor: '#7c7bfa' },
                  { label: 'Ver calendário', href: '/painel/calendario', icone: Calendar, cor: '#34d399' },
                  { label: 'Carregar imagens', href: '/painel/media', icone: ImageIcon, cor: '#fbbf24' },
                  { label: 'Ver Viral Lab', href: '/painel/viral-lab', icone: TrendingUp, cor: '#c084fc' },
                ].map(a => {
                  const Icone = a.icone
                  return (
                    <Link key={a.href} href={a.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                      style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)', textDecoration: 'none' }}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = a.cor + '50'; (e.currentTarget as HTMLElement).style.color = a.cor }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--cor-borda)'; (e.currentTarget as HTMLElement).style.color = 'var(--cor-texto-muted)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${a.cor}15` }}>
                        <Icone size={14} style={{ color: a.cor }} />
                      </div>
                      <span className="flex-1">{a.label}</span>
                      <ChevronRight size={14} />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Calendário da semana + Sugestões */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Calendário semana real */}
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Calendário desta semana
                </h3>
                <Link href="/painel/calendario" className="text-xs flex items-center gap-1"
                  style={{ color: 'var(--cor-marca)' }}>
                  Ver tudo <ChevronRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {DIAS_SEMANA_LABELS.map((dia, i) => {
                  const postsDia = postsSemana.filter(p => p.dia === i)
                  return (
                    <div key={dia} className="text-center">
                      <p className="text-xs mb-2 font-medium" style={{ color: 'var(--cor-texto-muted)' }}>{dia}</p>
                      {postsDia.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {postsDia.slice(0, 2).map(p => (
                            <Link key={p.id} href={`/painel/publicar?id=${p.id}`}>
                              <div className="aspect-square rounded-xl flex flex-col items-center justify-center p-1 gap-0.5 cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ background: `${COR_TIPO[p.formato] || '#7c7bfa'}20`, border: `1px solid ${COR_TIPO[p.formato] || '#7c7bfa'}40` }}>
                                <span className="font-bold" style={{ color: COR_TIPO[p.formato] || '#7c7bfa', fontSize: 8 }}>{p.formato}</span>
                                <span style={{ color: 'var(--cor-texto-fraco)', fontSize: 8 }}>{p.hora_publicacao || '--:--'}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <Link href="/painel/calendario">
                          <div className="aspect-square rounded-xl flex items-center justify-center text-xs cursor-pointer transition-all hover:scale-105"
                            style={{ border: '1px dashed var(--cor-borda-clara)', color: 'var(--cor-texto-fraco)' }}>
                            <Plus size={14} />
                          </div>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sugestões IA */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} style={{ color: 'var(--cor-marca)' }} />
                <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Sugestões da IA
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { titulo: 'Tendência: "Rotina da manhã"', descricao: 'Alto engagement esta semana no seu nicho', score: 92 },
                  { titulo: '"O erro que me custou 1000€"', descricao: 'Hooks de erro pessoal têm 3x mais partilhas', score: 87 },
                  { titulo: 'Tutorial passo-a-passo curto', descricao: 'Reels de tutorial entre 30-45s estão a viralizar', score: 81 },
                ].map((s, i) => (
                  <Link key={i} href="/painel/viral-lab" style={{ textDecoration: 'none' }}>
                    <div className="p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                      style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium leading-tight">{s.titulo}</p>
                        <span className="text-xs font-bold flex-shrink-0 px-1.5 py-0.5 rounded-lg"
                          style={{
                            background: s.score >= 90 ? 'rgba(52,211,153,0.15)' : 'rgba(124,123,250,0.15)',
                            color: s.score >= 90 ? 'var(--cor-sucesso)' : 'var(--cor-marca)',
                          }}>
                          {s.score}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{s.descricao}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </LayoutPainel>

      {mostrarTour && (
        <TourBoasVindas
          nome={nomeUtilizador.split(' ')[0]}
          onFechar={() => {
            setTour(false)
            localStorage.setItem('adpulse_tour_visto', 'true')
          }}
        />
      )}
    </>
  )
}
