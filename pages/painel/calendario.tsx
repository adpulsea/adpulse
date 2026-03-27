// ============================================
// AdPulse — Calendário de Conteúdo
// ============================================

import Head from 'next/head'
import { useState } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Sparkles,
  Calendar, List, Loader, X, Check,
  Instagram, Youtube, Trash2, Edit3
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'

// ---- Tipos ----
type Post = {
  id: string
  dia: number
  mes: number
  ano: number
  hora: string
  tipo: 'Reel' | 'Carrossel' | 'Story' | 'Post' | 'Short'
  plataforma: 'instagram' | 'tiktok' | 'youtube' | 'linkedin'
  titulo: string
  legenda?: string
  estado: 'rascunho' | 'agendado' | 'publicado'
}

// ---- Constantes ----
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const TIPOS = ['Reel','Carrossel','Story','Post','Short'] as const
const PLATAFORMAS = [
  { id: 'instagram', label: 'Instagram', cor: '#E1306C' },
  { id: 'tiktok',    label: 'TikTok',    cor: '#00f2ea' },
  { id: 'youtube',   label: 'YouTube',   cor: '#FF0000' },
  { id: 'linkedin',  label: 'LinkedIn',  cor: '#0077B5' },
] as const

const COR_TIPO: Record<string, string> = {
  Reel:      '#7c7bfa',
  Carrossel: '#c084fc',
  Story:     '#f472b6',
  Post:      '#34d399',
  Short:     '#fbbf24',
}

const COR_ESTADO: Record<string, string> = {
  rascunho:  '#8888aa',
  agendado:  '#60a5fa',
  publicado: '#34d399',
}

// Posts iniciais de exemplo
const POSTS_INICIAIS: Post[] = [
  { id: '1', dia: new Date().getDate(), mes: new Date().getMonth(), ano: new Date().getFullYear(), hora: '09:00', tipo: 'Reel', plataforma: 'instagram', titulo: 'Dica de produtividade', estado: 'agendado' },
  { id: '2', dia: new Date().getDate() + 2, mes: new Date().getMonth(), ano: new Date().getFullYear(), hora: '18:00', tipo: 'Carrossel', plataforma: 'instagram', titulo: '5 erros a evitar', estado: 'rascunho' },
  { id: '3', dia: new Date().getDate() + 4, mes: new Date().getMonth(), ano: new Date().getFullYear(), hora: '12:00', tipo: 'Story', plataforma: 'tiktok', titulo: 'Bastidores da semana', estado: 'agendado' },
]

// ---- Modal de criação/edição ----
function ModalPost({
  post, dia, mes, ano, onGuardar, onFechar
}: {
  post?: Post
  dia: number
  mes: number
  ano: number
  onGuardar: (p: Post) => void
  onFechar: () => void
}) {
  const [titulo, setTitulo]       = useState(post?.titulo || '')
  const [tipo, setTipo]           = useState<Post['tipo']>(post?.tipo || 'Reel')
  const [plataforma, setPlat]     = useState<Post['plataforma']>(post?.plataforma || 'instagram')
  const [hora, setHora]           = useState(post?.hora || '09:00')
  const [estado, setEstado]       = useState<Post['estado']>(post?.estado || 'rascunho')
  const [legenda, setLegenda]     = useState(post?.legenda || '')
  const [gerando, setGerando]     = useState(false)

  const gerarComIA = async () => {
    if (!titulo.trim()) return
    setGerando(true)
    try {
      const r = await fetch('/api/ia/gerar-conteudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topico: titulo, plataforma, tom: 'Informal', formato: tipo.toLowerCase() }),
      })
      const d = await r.json()
      if (d.legenda) setLegenda(d.legenda)
    } catch { /* silencioso */ }
    finally { setGerando(false) }
  }

  const guardar = () => {
    if (!titulo.trim()) return
    onGuardar({
      id: post?.id || Date.now().toString(),
      dia, mes, ano, hora, tipo, plataforma, titulo, legenda, estado,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: 'var(--cor-card)', border: '1px solid var(--cor-borda)' }}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--fonte-display)' }}>
            {post ? 'Editar post' : `Novo post — ${dia} de ${MESES[mes]}`}
          </h3>
          <button onClick={onFechar} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: 'var(--cor-texto-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Título */}
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--cor-texto-muted)' }}>Tópico / Título</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder="Ex: Dica de produtividade para empreendedores"
            className="input-campo w-full" />
        </div>

        {/* Tipo + Plataforma */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--cor-texto-muted)' }}>Formato</label>
            <div className="flex flex-wrap gap-1.5">
              {TIPOS.map(t => (
                <button key={t} onClick={() => setTipo(t)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: tipo === t ? `${COR_TIPO[t]}20` : 'var(--cor-elevado)',
                    border: `1px solid ${tipo === t ? COR_TIPO[t] + '60' : 'var(--cor-borda)'}`,
                    color: tipo === t ? COR_TIPO[t] : 'var(--cor-texto-muted)',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--cor-texto-muted)' }}>Plataforma</label>
            <div className="flex flex-wrap gap-1.5">
              {PLATAFORMAS.map(p => (
                <button key={p.id} onClick={() => setPlat(p.id as Post['plataforma'])}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: plataforma === p.id ? `${p.cor}20` : 'var(--cor-elevado)',
                    border: `1px solid ${plataforma === p.id ? p.cor + '60' : 'var(--cor-borda)'}`,
                    color: plataforma === p.id ? p.cor : 'var(--cor-texto-muted)',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hora + Estado */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--cor-texto-muted)' }}>Hora de publicação</label>
            <input type="time" value={hora} onChange={e => setHora(e.target.value)}
              className="input-campo w-full" />
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--cor-texto-muted)' }}>Estado</label>
            <div className="flex gap-1.5">
              {(['rascunho','agendado','publicado'] as const).map(e => (
                <button key={e} onClick={() => setEstado(e)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                  style={{
                    background: estado === e ? `${COR_ESTADO[e]}20` : 'var(--cor-elevado)',
                    border: `1px solid ${estado === e ? COR_ESTADO[e] + '60' : 'var(--cor-borda)'}`,
                    color: estado === e ? COR_ESTADO[e] : 'var(--cor-texto-muted)',
                  }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>Legenda (opcional)</label>
            <button onClick={gerarComIA} disabled={gerando || !titulo.trim()}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
              style={{ color: 'var(--cor-marca)', background: 'rgba(124,123,250,0.1)', opacity: gerando || !titulo.trim() ? 0.5 : 1 }}>
              {gerando ? <Loader size={10} className="animate-spin" /> : <Sparkles size={10} />}
              {gerando ? 'A gerar...' : 'Gerar com IA'}
            </button>
          </div>
          <textarea value={legenda} onChange={e => setLegenda(e.target.value)}
            placeholder="Legenda do post..."
            rows={3} className="input-campo w-full resize-none" />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-1">
          <button onClick={onFechar} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
            Cancelar
          </button>
          <button onClick={guardar} disabled={!titulo.trim()}
            className="flex-1 btn-primario py-2.5 justify-center"
            style={!titulo.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
            <Check size={16} /> Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Componente principal ----
export default function Calendario() {
  const hoje = new Date()
  const [mesAtual, setMes]     = useState(hoje.getMonth())
  const [anoAtual, setAno]     = useState(hoje.getFullYear())
  const [vista, setVista]      = useState<'mes' | 'semana'>('mes')
  const [posts, setPosts]      = useState<Post[]>(POSTS_INICIAIS)
  const [modal, setModal]      = useState<{ dia: number, post?: Post } | null>(null)
  const [gerando, setGerando]  = useState(false)

  // Navegar mês
  const navMes = (dir: number) => {
    let m = mesAtual + dir
    let a = anoAtual
    if (m < 0)  { m = 11; a-- }
    if (m > 11) { m = 0;  a++ }
    setMes(m); setAno(a)
  }

  // Dias do mês
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate()
  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay()

  // Posts do mês atual
  const postsDomes = posts.filter(p => p.mes === mesAtual && p.ano === anoAtual)
  const postsNoDia = (dia: number) => postsDomes.filter(p => p.dia === dia)

  // Semana atual
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay())
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicioSemana)
    d.setDate(inicioSemana.getDate() + i)
    return d
  })

  // Gerar semana completa com IA
  const gerarSemana = async () => {
    setGerando(true)
    const topicos = [
      'Dica rápida de produtividade',
      '3 erros que estás a cometer',
      'Tendência da semana no teu nicho',
      'Bastidores do teu trabalho',
      'Pergunta à tua audiência',
    ]
    const novos: Post[] = []
    for (let i = 0; i < 5; i++) {
      const data = new Date(inicioSemana)
      data.setDate(inicioSemana.getDate() + i + 1) // Seg a Sex
      novos.push({
        id: Date.now().toString() + i,
        dia: data.getDate(),
        mes: data.getMonth(),
        ano: data.getFullYear(),
        hora: i % 2 === 0 ? '09:00' : '18:00',
        tipo: (['Reel','Carrossel','Story','Post','Reel'] as const)[i],
        plataforma: 'instagram',
        titulo: topicos[i],
        estado: 'rascunho',
      })
    }
    setPosts(prev => [...prev, ...novos])
    setGerando(false)
  }

  const guardarPost = (p: Post) => {
    setPosts(prev => {
      const existe = prev.find(x => x.id === p.id)
      return existe ? prev.map(x => x.id === p.id ? p : x) : [...prev, p]
    })
    setModal(null)
  }

  const apagarPost = (id: string) => setPosts(prev => prev.filter(p => p.id !== id))

  const corPlataforma = (pl: string) => PLATAFORMAS.find(p => p.id === pl)?.cor || '#7c7bfa'

  return (
    <>
      <Head><title>Calendário — AdPulse</title></Head>
      <LayoutPainel titulo="Calendário de Conteúdo">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            {/* Navegar mês */}
            <button onClick={() => navMes(-1)} className="p-2 rounded-xl transition-colors"
              style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-lg font-semibold min-w-[160px] text-center" style={{ fontFamily: 'var(--fonte-display)' }}>
              {MESES[mesAtual]} {anoAtual}
            </h2>
            <button onClick={() => navMes(1)} className="p-2 rounded-xl transition-colors"
              style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => { setMes(hoje.getMonth()); setAno(hoje.getFullYear()) }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
              style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
              Hoje
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Vista */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--cor-borda)' }}>
              {(['mes','semana'] as const).map(v => (
                <button key={v} onClick={() => setVista(v)}
                  className="px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                  style={{
                    background: vista === v ? 'var(--cor-marca)' : 'var(--cor-elevado)',
                    color: vista === v ? '#fff' : 'var(--cor-texto-muted)',
                  }}>
                  {v === 'mes' ? 'Mês' : 'Semana'}
                </button>
              ))}
            </div>

            {/* Gerar semana */}
            <button onClick={gerarSemana} disabled={gerando}
              className="btn-primario"
              style={gerando ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
              {gerando ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {gerando ? 'A gerar...' : 'Gerar semana com IA'}
            </button>

            {/* Novo post */}
            <button onClick={() => setModal({ dia: hoje.getDate() })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)' }}>
              <Plus size={16} /> Novo post
            </button>
          </div>
        </div>

        {/* Estatísticas do mês */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Posts planeados', valor: postsDomes.length },
            { label: 'Agendados',       valor: postsDomes.filter(p => p.estado === 'agendado').length },
            { label: 'Publicados',      valor: postsDomes.filter(p => p.estado === 'publicado').length },
            { label: 'Rascunhos',       valor: postsDomes.filter(p => p.estado === 'rascunho').length },
          ].map(s => (
            <div key={s.label} className="card text-center py-3">
              <div className="text-2xl font-bold mb-0.5" style={{ fontFamily: 'var(--fonte-display)', color: 'var(--cor-marca)' }}>
                {s.valor}
              </div>
              <div className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Vista Mês */}
        {vista === 'mes' && (
          <div className="card p-0 overflow-hidden">
            {/* Cabeçalho dias da semana */}
            <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--cor-borda)' }}>
              {DIAS_SEMANA.map(d => (
                <div key={d} className="py-3 text-center text-xs font-medium"
                  style={{ color: 'var(--cor-texto-muted)' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Grelha de dias */}
            <div className="grid grid-cols-7">
              {/* Células vazias no início */}
              {Array.from({ length: primeiroDia }).map((_, i) => (
                <div key={`vazio-${i}`} className="min-h-[110px] border-r border-b p-2"
                  style={{ borderColor: 'var(--cor-borda)', background: 'rgba(0,0,0,0.2)' }} />
              ))}

              {/* Dias do mês */}
              {Array.from({ length: diasNoMes }, (_, i) => i + 1).map(dia => {
                const eHoje = dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear()
                const psDia = postsNoDia(dia)
                const col = (primeiroDia + dia - 1) % 7
                const isUltimaCols = col === 6

                return (
                  <div key={dia}
                    className="min-h-[110px] border-b p-2 cursor-pointer transition-colors group"
                    style={{
                      borderColor: 'var(--cor-borda)',
                      borderRight: isUltimaCols ? 'none' : `1px solid var(--cor-borda)`,
                      background: eHoje ? 'rgba(124,123,250,0.05)' : 'transparent',
                    }}
                    onClick={() => setModal({ dia })}>

                    {/* Número do dia */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full"
                        style={{
                          background: eHoje ? 'var(--cor-marca)' : 'transparent',
                          color: eHoje ? '#fff' : 'var(--cor-texto-muted)',
                        }}>
                        {dia}
                      </span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--cor-marca)' }}>
                        <Plus size={12} />
                      </span>
                    </div>

                    {/* Posts do dia */}
                    <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                      {psDia.slice(0, 3).map(p => (
                        <div key={p.id}
                          className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg text-xs cursor-pointer group/post"
                          style={{
                            background: `${COR_TIPO[p.tipo]}15`,
                            border: `1px solid ${COR_TIPO[p.tipo]}30`,
                          }}
                          onClick={() => setModal({ dia, post: p })}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: corPlataforma(p.plataforma) }} />
                          <span className="truncate flex-1" style={{ color: 'var(--cor-texto)' }}>{p.titulo}</span>
                          <button onClick={e => { e.stopPropagation(); apagarPost(p.id) }}
                            className="opacity-0 group-hover/post:opacity-100 transition-opacity flex-shrink-0"
                            style={{ color: 'var(--cor-erro)' }}>
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                      {psDia.length > 3 && (
                        <span className="text-xs px-1" style={{ color: 'var(--cor-texto-muted)' }}>
                          +{psDia.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Vista Semana */}
        {vista === 'semana' && (
          <div className="card p-0 overflow-hidden">
            <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--cor-borda)' }}>
              {diasSemana.map((d, i) => {
                const eHoje = d.toDateString() === hoje.toDateString()
                return (
                  <div key={i} className="py-3 text-center border-r last:border-r-0"
                    style={{ borderColor: 'var(--cor-borda)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--cor-texto-muted)' }}>{DIAS_SEMANA[i]}</div>
                    <div className="text-sm font-semibold w-8 h-8 mx-auto flex items-center justify-center rounded-full"
                      style={{
                        background: eHoje ? 'var(--cor-marca)' : 'transparent',
                        color: eHoje ? '#fff' : 'var(--cor-texto)',
                        fontFamily: 'var(--fonte-display)',
                      }}>
                      {d.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-7 min-h-[400px]">
              {diasSemana.map((d, i) => {
                const psDia = posts.filter(p =>
                  p.dia === d.getDate() && p.mes === d.getMonth() && p.ano === d.getFullYear()
                )
                return (
                  <div key={i} className="p-2 border-r last:border-r-0 cursor-pointer group"
                    style={{ borderColor: 'var(--cor-borda)' }}
                    onClick={() => setModal({ dia: d.getDate() })}>
                    <div className="flex flex-col gap-2">
                      {psDia.map(p => (
                        <div key={p.id}
                          className="p-2 rounded-xl cursor-pointer group/post"
                          style={{
                            background: `${COR_TIPO[p.tipo]}15`,
                            border: `1px solid ${COR_TIPO[p.tipo]}40`,
                          }}
                          onClick={e => { e.stopPropagation(); setModal({ dia: d.getDate(), post: p }) }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium" style={{ color: COR_TIPO[p.tipo] }}>{p.tipo}</span>
                            <button onClick={e => { e.stopPropagation(); apagarPost(p.id) }}
                              className="opacity-0 group-hover/post:opacity-100 transition-opacity"
                              style={{ color: 'var(--cor-erro)' }}>
                              <Trash2 size={10} />
                            </button>
                          </div>
                          <p className="text-xs leading-snug truncate" style={{ color: 'var(--cor-texto)' }}>{p.titulo}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: corPlataforma(p.plataforma) }} />
                            <span className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>{p.hora}</span>
                            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                              style={{ background: `${COR_ESTADO[p.estado]}20`, color: COR_ESTADO[p.estado] }}>
                              {p.estado}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                        <div className="flex items-center gap-1 text-xs py-1.5 rounded-lg justify-center"
                          style={{ color: 'var(--cor-marca)', border: '1px dashed rgba(124,123,250,0.3)' }}>
                          <Plus size={12} /> Adicionar
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Legenda */}
        <div className="flex flex-wrap gap-4 mt-4">
          {Object.entries(COR_TIPO).map(([tipo, cor]) => (
            <div key={tipo} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: cor }} />
              {tipo}
            </div>
          ))}
        </div>

      </LayoutPainel>

      {/* Modal */}
      {modal && (
        <ModalPost
          dia={modal.dia}
          mes={mesAtual}
          ano={anoAtual}
          post={modal.post}
          onGuardar={guardarPost}
          onFechar={() => setModal(null)}
        />
      )}
    </>
  )
}
