// ============================================
// AdPulse — Calendário de Conteúdo (Supabase)
// ============================================

import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  ChevronLeft, ChevronRight, Plus, Sparkles,
  Loader, X, Check, Trash2, Edit3, Send
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// ---- Tipos ----
type Post = {
  id: string
  titulo: string
  legenda?: string
  hashtags?: string[]
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

// ---- Modal de criação/edição ----
function ModalPost({
  post, dia, mes, ano, utilizadorId, onGuardar, onFechar
}: {
  post?: Post
  dia: number
  mes: number
  ano: number
  utilizadorId: string
  onGuardar: (p: Post) => void
  onFechar: () => void
}) {
  const [titulo, setTitulo]   = useState(post?.titulo || '')
  const [tipo, setTipo]       = useState<string>(post?.formato || 'Reel')
  const [plat, setPlat]       = useState(post?.plataforma || 'instagram')
  const [hora, setHora]       = useState(post?.hora_publicacao || '09:00')
  const [estado, setEstado]   = useState<Post['estado']>(post?.estado || 'rascunho')
  const [legenda, setLegenda] = useState(post?.legenda || '')
  const [gerando, setGerando] = useState(false)
  const [guardando, setGuard] = useState(false)

  const gerarComIA = async () => {
    if (!titulo.trim()) return
    setGerando(true)
    try {
      const r = await fetch('/api/ia/gerar-conteudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topico: titulo, plataforma: plat, tom: 'Informal', formato: tipo.toLowerCase() }),
      })
      const d = await r.json()
      if (d.legenda) setLegenda(d.legenda)
    } catch { /* silencioso */ }
    finally { setGerando(false) }
  }

  const guardar = async () => {
    if (!titulo.trim()) return
    setGuard(true)
    const dataPost = new Date(ano, mes, dia)
    const [h, m] = hora.split(':')
    dataPost.setHours(parseInt(h), parseInt(m))

    const dados = {
      utilizador_id: utilizadorId,
      titulo,
      legenda,
      plataforma: plat,
      formato: tipo,
      estado,
      hora_publicacao: hora,
      criado_em: dataPost.toISOString(),
    }

    try {
      if (post?.id) {
        const { data } = await supabase.from('posts').update(dados).eq('id', post.id).select().single()
        if (data) onGuardar({ ...data, dia, mes, ano })
      } else {
        const { data } = await supabase.from('posts').insert(dados).select().single()
        if (data) onGuardar({ ...data, dia, mes, ano })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setGuard(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: 'var(--cor-card)', border: '1px solid var(--cor-borda)' }}>

        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--fonte-display)' }}>
            {post ? 'Editar post' : `Novo post — ${dia} de ${MESES[mes]}`}
          </h3>
          <button onClick={onFechar} style={{ color: 'var(--cor-texto-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="label-campo">Tópico / Título</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder="Ex: Dica de produtividade para empreendedores"
            className="input-campo w-full" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-campo">Formato</label>
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
            <label className="label-campo">Plataforma</label>
            <div className="flex flex-col gap-1.5">
              {PLATAFORMAS.map(p => (
                <button key={p.id} onClick={() => setPlat(p.id)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left"
                  style={{
                    background: plat === p.id ? `${p.cor}15` : 'var(--cor-elevado)',
                    border: `1px solid ${plat === p.id ? p.cor + '40' : 'var(--cor-borda)'}`,
                    color: plat === p.id ? p.cor : 'var(--cor-texto-muted)',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-campo">Hora de publicação</label>
            <input type="time" value={hora} onChange={e => setHora(e.target.value)}
              className="input-campo w-full" />
          </div>
          <div>
            <label className="label-campo">Estado</label>
            <div className="flex flex-col gap-1.5">
              {(['rascunho','agendado','publicado'] as const).map(e => (
                <button key={e} onClick={() => setEstado(e)}
                  className="py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label-campo mb-0">Legenda (opcional)</label>
            <button onClick={gerarComIA} disabled={gerando || !titulo.trim()}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
              style={{ color: 'var(--cor-marca)', background: 'rgba(124,123,250,0.1)', opacity: gerando || !titulo.trim() ? 0.5 : 1, border: 'none', cursor: 'pointer' }}>
              {gerando ? <Loader size={10} className="animate-spin" /> : <Sparkles size={10} />}
              {gerando ? 'A gerar...' : 'Gerar com IA'}
            </button>
          </div>
          <textarea value={legenda} onChange={e => setLegenda(e.target.value)}
            placeholder="Legenda do post..."
            rows={3} className="input-campo w-full resize-none" />
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onFechar}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
            Cancelar
          </button>
          <button onClick={guardar} disabled={!titulo.trim() || guardando}
            className="flex-1 btn-primario py-2.5 justify-center"
            style={!titulo.trim() || guardando ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
            {guardando ? <Loader size={14} className="animate-spin" /> : <Check size={16} />}
            {guardando ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Componente principal ----
export default function Calendario() {
  const hoje = new Date()
  const { utilizador } = useAuth()
  const router = useRouter()

  const [mesAtual, setMes]    = useState(hoje.getMonth())
  const [anoAtual, setAno]    = useState(hoje.getFullYear())
  const [vista, setVista]     = useState<'mes' | 'semana'>('mes')
  const [posts, setPosts]     = useState<Post[]>([])
  const [carregando, setCarr] = useState(true)
  const [modal, setModal]     = useState<{ dia: number, post?: Post } | null>(null)
  const [gerando, setGerando] = useState(false)

  useEffect(() => {
    if (!utilizador) return
    const carregar = async () => {
      setCarr(true)
      const inicioMes = new Date(anoAtual, mesAtual, 1).toISOString()
      const fimMes = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59).toISOString()
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('utilizador_id', utilizador.id)
        .gte('criado_em', inicioMes)
        .lte('criado_em', fimMes)
        .order('criado_em')
      if (data) {
        setPosts(data.map(p => {
          const d = new Date(p.criado_em)
          return { ...p, dia: d.getDate(), mes: d.getMonth(), ano: d.getFullYear() }
        }))
      }
      setCarr(false)
    }
    carregar()
  }, [utilizador, mesAtual, anoAtual])

  const navMes = (dir: number) => {
    let m = mesAtual + dir, a = anoAtual
    if (m < 0)  { m = 11; a-- }
    if (m > 11) { m = 0;  a++ }
    setMes(m); setAno(a)
  }

  const diasNoMes   = new Date(anoAtual, mesAtual + 1, 0).getDate()
  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay()
  const postsNoDia  = (dia: number) => posts.filter(p => p.dia === dia && p.mes === mesAtual && p.ano === anoAtual)

  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay())
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicioSemana)
    d.setDate(inicioSemana.getDate() + i)
    return d
  })

  const gerarSemana = async () => {
    if (!utilizador) return
    setGerando(true)
    const topicos = ['Dica rápida de produtividade', '3 erros que estás a cometer', 'Tendência da semana', 'Bastidores do teu trabalho', 'Pergunta à tua audiência']
    for (let i = 0; i < 5; i++) {
      const data = new Date(inicioSemana)
      data.setDate(inicioSemana.getDate() + i + 1)
      const { data: novo } = await supabase.from('posts').insert({
        utilizador_id: utilizador.id,
        titulo: topicos[i],
        plataforma: 'instagram',
        formato: (['Reel','Carrossel','Story','Post','Reel'] as const)[i],
        estado: 'rascunho',
        hora_publicacao: i % 2 === 0 ? '09:00' : '18:00',
        criado_em: data.toISOString(),
      }).select().single()
      if (novo) {
        const d = new Date(novo.criado_em)
        setPosts(prev => [...prev, { ...novo, dia: d.getDate(), mes: d.getMonth(), ano: d.getFullYear() }])
      }
    }
    setGerando(false)
  }

  const guardarPost = (p: Post) => {
    setPosts(prev => prev.find(x => x.id === p.id) ? prev.map(x => x.id === p.id ? p : x) : [...prev, p])
    setModal(null)
  }

  const apagarPost = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const corPlataforma = (pl: string) => PLATAFORMAS.find(p => p.id === pl)?.cor || '#7c7bfa'
  const postsMes = posts.filter(p => p.mes === mesAtual && p.ano === anoAtual)

  return (
    <>
      <Head><title>Calendário — AdPulse</title></Head>
      <LayoutPainel titulo="Calendário de Conteúdo">

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navMes(-1)} className="p-2 rounded-xl" style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}><ChevronLeft size={16} /></button>
            <h2 className="text-lg font-semibold min-w-[160px] text-center" style={{ fontFamily: 'var(--fonte-display)' }}>{MESES[mesAtual]} {anoAtual}</h2>
            <button onClick={() => navMes(1)} className="p-2 rounded-xl" style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}><ChevronRight size={16} /></button>
            <button onClick={() => { setMes(hoje.getMonth()); setAno(hoje.getFullYear()) }} className="px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>Hoje</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--cor-borda)' }}>
              {(['mes','semana'] as const).map(v => (
                <button key={v} onClick={() => setVista(v)} className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{ background: vista === v ? 'var(--cor-marca)' : 'var(--cor-elevado)', color: vista === v ? '#fff' : 'var(--cor-texto-muted)' }}>
                  {v === 'mes' ? 'Mês' : 'Semana'}
                </button>
              ))}
            </div>
            <button onClick={gerarSemana} disabled={gerando} className="btn-primario" style={gerando ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
              {gerando ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {gerando ? 'A gerar...' : 'Gerar semana com IA'}
            </button>
            <button onClick={() => setModal({ dia: hoje.getDate() })} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)' }}>
              <Plus size={16} /> Novo post
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Posts planeados', valor: postsMes.length },
            { label: 'Agendados',       valor: postsMes.filter(p => p.estado === 'agendado').length },
            { label: 'Publicados',      valor: postsMes.filter(p => p.estado === 'publicado').length },
            { label: 'Rascunhos',       valor: postsMes.filter(p => p.estado === 'rascunho').length },
          ].map(s => (
            <div key={s.label} className="card text-center py-3">
              <div className="text-2xl font-bold mb-0.5" style={{ fontFamily: 'var(--fonte-display)', color: 'var(--cor-marca)' }}>{carregando ? '...' : s.valor}</div>
              <div className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {vista === 'mes' && (
          <div className="card p-0 overflow-hidden">
            <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--cor-borda)' }}>
              {DIAS_SEMANA.map(d => (
                <div key={d} className="py-3 text-center text-xs font-medium" style={{ color: 'var(--cor-texto-muted)' }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: primeiroDia }).map((_, i) => (
                <div key={`v-${i}`} className="min-h-[110px] border-r border-b p-2" style={{ borderColor: 'var(--cor-borda)', background: 'rgba(0,0,0,0.2)' }} />
              ))}
              {Array.from({ length: diasNoMes }, (_, i) => i + 1).map(dia => {
                const eHoje = dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear()
                const psDia = postsNoDia(dia)
                const col = (primeiroDia + dia - 1) % 7
                return (
                  <div key={dia}
                    className="min-h-[110px] border-b p-2 cursor-pointer group"
                    style={{ borderColor: 'var(--cor-borda)', borderRight: col === 6 ? 'none' : `1px solid var(--cor-borda)`, background: eHoje ? 'rgba(124,123,250,0.05)' : 'transparent' }}
                    onClick={() => setModal({ dia })}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full"
                        style={{ background: eHoje ? 'var(--cor-marca)' : 'transparent', color: eHoje ? '#fff' : 'var(--cor-texto-muted)' }}>
                        {dia}
                      </span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--cor-marca)' }}><Plus size={12} /></span>
                    </div>
                    <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                      {psDia.slice(0, 3).map(p => (
                        <div key={p.id} className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg text-xs group/post"
                          style={{ background: `${COR_TIPO[p.formato] || '#7c7bfa'}15`, border: `1px solid ${COR_TIPO[p.formato] || '#7c7bfa'}30` }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: corPlataforma(p.plataforma) }} />
                          <span className="truncate flex-1" style={{ color: 'var(--cor-texto)' }}>{p.titulo}</span>
                          <div className="opacity-0 group-hover/post:opacity-100 transition-opacity flex gap-1">
                            <button onClick={() => router.push(`/painel/publicar?id=${p.id}`)} title="Publicar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cor-marca)', padding: 0, display: 'flex' }}><Send size={10} /></button>
                            <button onClick={() => setModal({ dia, post: p })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cor-texto-muted)', padding: 0, display: 'flex' }}><Edit3 size={10} /></button>
                            <button onClick={() => apagarPost(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cor-erro)', padding: 0, display: 'flex' }}><Trash2 size={10} /></button>
                          </div>
                        </div>
                      ))}
                      {psDia.length > 3 && <span className="text-xs px-1" style={{ color: 'var(--cor-texto-muted)' }}>+{psDia.length - 3} mais</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {vista === 'semana' && (
          <div className="card p-0 overflow-hidden">
            <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--cor-borda)' }}>
              {diasSemana.map((d, i) => {
                const eHoje = d.toDateString() === hoje.toDateString()
                return (
                  <div key={i} className="py-3 text-center border-r last:border-r-0" style={{ borderColor: 'var(--cor-borda)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--cor-texto-muted)' }}>{DIAS_SEMANA[i]}</div>
                    <div className="text-sm font-semibold w-8 h-8 mx-auto flex items-center justify-center rounded-full"
                      style={{ background: eHoje ? 'var(--cor-marca)' : 'transparent', color: eHoje ? '#fff' : 'var(--cor-texto)', fontFamily: 'var(--fonte-display)' }}>
                      {d.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="grid grid-cols-7 min-h-[400px]">
              {diasSemana.map((d, i) => {
                const psDia = posts.filter(p => p.dia === d.getDate() && p.mes === d.getMonth() && p.ano === d.getFullYear())
                return (
                  <div key={i} className="p-2 border-r last:border-r-0 cursor-pointer group" style={{ borderColor: 'var(--cor-borda)' }} onClick={() => setModal({ dia: d.getDate() })}>
                    <div className="flex flex-col gap-2">
                      {psDia.map(p => (
                        <div key={p.id} className="p-2 rounded-xl" style={{ background: `${COR_TIPO[p.formato] || '#7c7bfa'}15`, border: `1px solid ${COR_TIPO[p.formato] || '#7c7bfa'}40` }} onClick={e => e.stopPropagation()}>
                          <p className="text-xs leading-snug truncate mb-1.5" style={{ color: 'var(--cor-texto)' }}>{p.titulo}</p>
                          <div className="flex items-center gap-1">
                            <button onClick={() => router.push(`/painel/publicar?id=${p.id}`)}
                              className="flex items-center gap-1 text-xs px-1.5 py-1 rounded-lg flex-1 justify-center"
                              style={{ background: 'rgba(124,123,250,0.15)', color: 'var(--cor-marca)', border: 'none', cursor: 'pointer' }}>
                              <Send size={10} /> Publicar
                            </button>
                            <button onClick={() => apagarPost(p.id)} className="p-1 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--cor-erro)', border: 'none', cursor: 'pointer' }}>
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 text-xs py-1.5 rounded-lg justify-center" style={{ color: 'var(--cor-marca)', border: '1px dashed rgba(124,123,250,0.3)' }}>
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

        <div className="flex flex-wrap gap-4 mt-4">
          {Object.entries(COR_TIPO).map(([tipo, cor]) => (
            <div key={tipo} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: cor }} />
              {tipo}
            </div>
          ))}
        </div>

      </LayoutPainel>

      {modal && utilizador && (
        <ModalPost
          dia={modal.dia}
          mes={mesAtual}
          ano={anoAtual}
          post={modal.post}
          utilizadorId={utilizador.id}
          onGuardar={guardarPost}
          onFechar={() => setModal(null)}
        />
      )}
    </>
  )
}
