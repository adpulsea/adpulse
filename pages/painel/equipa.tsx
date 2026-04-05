// ============================================
// AdPulse — Gestão Interna de Equipa
// ============================================

import Head from 'next/head'
import { useState, useEffect } from 'react'
import {
  Users, CheckCircle, Clock, AlertCircle,
  Plus, Trash2, Edit3, ChevronRight,
  Sparkles, Image as ImageIcon, Eye, Send,
  BarChart2, Zap, Star
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import BloqueadoPro from '@/components/BloqueadoPro'
import { usePlano } from '@/hooks/usePlano'
import { supabase } from '@/lib/supabase'

// ---- Tipos ----
type EstadoTarefa = 'pendente' | 'em_progresso' | 'revisao' | 'concluido'
type Membro = {
  id: string
  nome: string
  funcao: string
  emoji: string
  cor: string
  tarefas_semana: number
  tarefas_concluidas: number
  estado: 'disponivel' | 'ocupado' | 'ausente'
}

type Tarefa = {
  id: string
  titulo: string
  descricao: string
  membro_id: string
  estado: EstadoTarefa
  prioridade: 'alta' | 'media' | 'baixa'
  plataforma: string
  data: string
}

// ---- Dados da equipa ----
const EQUIPA: Membro[] = [
  {
    id: 'estrategista',
    nome: 'Sofia Martins',
    funcao: 'Estrategista de Conteúdo',
    emoji: '🧠',
    cor: '#7c7bfa',
    tarefas_semana: 5,
    tarefas_concluidas: 3,
    estado: 'disponivel',
  },
  {
    id: 'copywriter',
    nome: 'João Silva',
    funcao: 'Copywriter & Prompts',
    emoji: '✍️',
    cor: '#c084fc',
    tarefas_semana: 7,
    tarefas_concluidas: 4,
    estado: 'ocupado',
  },
  {
    id: 'designer',
    nome: 'Ana Costa',
    funcao: 'Designer Visual',
    emoji: '🎨',
    cor: '#f472b6',
    tarefas_semana: 6,
    tarefas_concluidas: 2,
    estado: 'disponivel',
  },
  {
    id: 'revisor',
    nome: 'Miguel Santos',
    funcao: 'Revisor de Conteúdo',
    emoji: '🔍',
    cor: '#34d399',
    tarefas_semana: 8,
    tarefas_concluidas: 6,
    estado: 'disponivel',
  },
  {
    id: 'publisher',
    nome: 'Carla Nunes',
    funcao: 'Publisher & Agendamento',
    emoji: '🚀',
    cor: '#fbbf24',
    tarefas_semana: 4,
    tarefas_concluidas: 4,
    estado: 'disponivel',
  },
  {
    id: 'research',
    nome: 'Rui Ferreira',
    funcao: 'Research & Intelligence',
    emoji: '🔬',
    cor: '#60a5fa',
    tarefas_semana: 5,
    tarefas_concluidas: 2,
    estado: 'ocupado',
  },
]

const TAREFAS_INICIAIS: Tarefa[] = [
  { id: '1', titulo: 'Plano de conteúdo semana 16', descricao: 'Definir 7 temas para a semana', membro_id: 'estrategista', estado: 'concluido', prioridade: 'alta', plataforma: 'instagram', data: 'Seg' },
  { id: '2', titulo: 'Prompt Reel "Dica de IA"', descricao: 'Criar prompt para gerar legenda do Reel', membro_id: 'copywriter', estado: 'concluido', prioridade: 'alta', plataforma: 'instagram', data: 'Seg' },
  { id: '3', titulo: 'Imagem Reel "Dica de IA"', descricao: 'Design do thumbnail e overlay', membro_id: 'designer', estado: 'em_progresso', prioridade: 'alta', plataforma: 'instagram', data: 'Ter' },
  { id: '4', titulo: 'Revisão post "Bastidores"', descricao: 'Rever legenda, hashtags e imagem', membro_id: 'revisor', estado: 'revisao', prioridade: 'media', plataforma: 'instagram', data: 'Ter' },
  { id: '5', titulo: 'Publicar Reel segunda-feira', descricao: 'Agendar para as 09:00', membro_id: 'publisher', estado: 'concluido', prioridade: 'alta', plataforma: 'instagram', data: 'Seg' },
  { id: '6', titulo: 'Carrossel "5 funcionalidades"', descricao: 'Criar os 5 slides do carrossel', membro_id: 'designer', estado: 'pendente', prioridade: 'media', plataforma: 'instagram', data: 'Qua' },
  { id: '7', titulo: 'Legendas carrossel + hashtags', descricao: 'Escrever legenda e 15 hashtags', membro_id: 'copywriter', estado: 'em_progresso', prioridade: 'media', plataforma: 'instagram', data: 'Qua' },
  { id: '8', titulo: 'Estratégia mês de maio', descricao: 'Definir pilares e objetivos de maio', membro_id: 'estrategista', estado: 'pendente', prioridade: 'baixa', plataforma: 'geral', data: 'Sex' },
  { id: '9', titulo: 'Relatório novidades IA semana 16', descricao: 'GPT-4o, Claude 3.5, Gemini Flash — o que mudou', membro_id: 'research', estado: 'concluido', prioridade: 'alta', plataforma: 'geral', data: 'Seg' },
  { id: '10', titulo: 'Análise concorrentes Buffer e Later', descricao: 'Novas funcionalidades lançadas este mês', membro_id: 'research', estado: 'em_progresso', prioridade: 'alta', plataforma: 'geral', data: 'Ter' },
  { id: '11', titulo: 'Tendências virais Instagram abril', descricao: 'Formatos e temas em alta esta semana', membro_id: 'research', estado: 'em_progresso', prioridade: 'media', plataforma: 'instagram', data: 'Qua' },
  { id: '12', titulo: 'Sugestões de novas funcionalidades', descricao: 'Lista de melhorias para a AdPulse baseada na pesquisa', membro_id: 'research', estado: 'pendente', prioridade: 'media', plataforma: 'geral', data: 'Sex' },
]

const COR_ESTADO: Record<EstadoTarefa, string> = {
  pendente:    '#8888aa',
  em_progresso: '#60a5fa',
  revisao:     '#fbbf24',
  concluido:   '#34d399',
}

const LABEL_ESTADO: Record<EstadoTarefa, string> = {
  pendente:    'Pendente',
  em_progresso: 'Em progresso',
  revisao:     'Em revisão',
  concluido:   'Concluído',
}

const ICONE_ESTADO: Record<EstadoTarefa, any> = {
  pendente:    Clock,
  em_progresso: Zap,
  revisao:     Eye,
  concluido:   CheckCircle,
}

const COR_PRIORIDADE: Record<string, string> = {
  alta:  '#f87171',
  media: '#fbbf24',
  baixa: '#34d399',
}

const COR_MEMBRO: Record<string, string> = {
  estrategista: '#7c7bfa',
  copywriter:   '#c084fc',
  designer:     '#f472b6',
  revisor:      '#34d399',
  publisher:    '#fbbf24',
}

const FLUXO = [
  { id: 'pendente',     label: 'A fazer',       icone: Clock       },
  { id: 'em_progresso', label: 'Em progresso',  icone: Zap         },
  { id: 'revisao',      label: 'Em revisão',    icone: Eye         },
  { id: 'concluido',    label: 'Concluído',     icone: CheckCircle },
]

export default function GestaoEquipa() {
  const { isPro, carregando: carregandoPlano } = usePlano()

  // Todos os hooks ANTES de qualquer return
  const [tarefas, setTarefas]         = useState<Tarefa[]>([])
  const [vista, setVista]             = useState<'kanban' | 'equipa' | 'fluxo'>('kanban')
  const [membroFiltro, setFiltro]     = useState<string>('todos')
  const [modalNova, setModalNova]     = useState(false)
  const [carregandoTarefas, setCarrT] = useState(true)
  const [novaTarefa, setNovaTarefa]   = useState({ titulo: '', descricao: '', membro_id: 'estrategista', prioridade: 'media' as const, plataforma: 'instagram', data: 'Seg' })

  useEffect(() => {
    const carregar = async () => {
      setCarrT(true)
      const { data } = await supabase
        .from('tarefas_equipa')
        .select('*')
        .order('criado_em', { ascending: true })
      if (data) setTarefas(data)
      setCarrT(false)
    }
    carregar()
  }, [])

  if (carregandoPlano) return (
    <LayoutPainel titulo="Equipa">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--cor-marca)' }} />
      </div>
    </LayoutPainel>
  )

  if (!isPro) return (
    <LayoutPainel titulo="Equipa">
      <BloqueadoPro funcionalidade="Equipa" descricao="Gere a tua equipa de conteúdo com tarefas, fluxos e produtividade em tempo real." emoji="👥" />
    </LayoutPainel>
  )

  const criarTarefa = async () => {
    if (!novaTarefa.titulo.trim()) return
    const { data } = await supabase
      .from('tarefas_equipa')
      .insert({ ...novaTarefa, estado: 'pendente' })
      .select()
      .single()
    if (data) setTarefas(prev => [...prev, data])
    setNovaTarefa({ titulo: '', descricao: '', membro_id: 'estrategista', prioridade: 'media', plataforma: 'instagram', data: 'Seg' })
    setModalNova(false)
  }

  const moverTarefa = async (id: string, novoEstado: EstadoTarefa) => {
    await supabase.from('tarefas_equipa').update({ estado: novoEstado }).eq('id', id)
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, estado: novoEstado } : t))
  }

  const apagarTarefa = async (id: string) => {
    await supabase.from('tarefas_equipa').delete().eq('id', id)
    setTarefas(prev => prev.filter(t => t.id !== id))
  }

  const tarefasFiltradas = membroFiltro === 'todos'
    ? tarefas
    : tarefas.filter(t => t.membro_id === membroFiltro)

  const totalConcluidas = tarefas.filter(t => t.estado === 'concluido').length
  const totalTarefas    = tarefas.length
  const progresso       = Math.round((totalConcluidas / totalTarefas) * 100)

  return (
    <>
      <Head><title>Equipa AdPulse — Gestão Interna</title></Head>
      <LayoutPainel titulo="Equipa AdPulse">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,123,250,0.08), rgba(192,132,252,0.08))', border: '1px solid rgba(124,123,250,0.2)' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(124,123,250,0.2)', border: '1px solid rgba(124,123,250,0.3)' }}>
                  <Users size={22} style={{ color: 'var(--cor-marca)' }} />
                </div>
                <div>
                  <h2 className="font-bold text-xl" style={{ fontFamily: 'var(--fonte-display)' }}>
                    Equipa de Conteúdo AdPulse
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--cor-texto-muted)' }}>
                    {EQUIPA.length} membros · {totalTarefas} tarefas esta semana · {progresso}% concluído
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Progresso */}
                <div style={{ width: 120 }}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--cor-texto-muted)' }}>
                    <span>Progresso</span>
                    <span style={{ color: 'var(--cor-marca)' }}>{progresso}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--cor-borda)' }}>
                    <div className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progresso}%`, background: 'var(--cor-marca)' }} />
                  </div>
                </div>
                <button onClick={() => setModalNova(true)} className="btn-primario">
                  <Plus size={16} /> Nova tarefa
                </button>
              </div>
            </div>
          </div>

          {/* Vistas */}
          <div className="flex items-center gap-2">
            {[
              { id: 'kanban', label: '📋 Kanban' },
              { id: 'equipa', label: '👥 Equipa' },
              { id: 'fluxo',  label: '🔄 Fluxo' },
            ].map(v => (
              <button key={v.id} onClick={() => setVista(v.id as any)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: vista === v.id ? 'var(--cor-marca)' : 'var(--cor-elevado)',
                  color: vista === v.id ? '#fff' : 'var(--cor-texto-muted)',
                  border: `1px solid ${vista === v.id ? 'var(--cor-marca)' : 'var(--cor-borda)'}`,
                }}>
                {v.label}
              </button>
            ))}

            {/* Filtro por membro */}
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <button onClick={() => setFiltro('todos')}
                className="px-3 py-1.5 rounded-xl text-xs transition-all"
                style={{ background: membroFiltro === 'todos' ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)', border: `1px solid ${membroFiltro === 'todos' ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`, color: membroFiltro === 'todos' ? 'var(--cor-marca)' : 'var(--cor-texto-muted)' }}>
                Todos
              </button>
              {EQUIPA.map(m => (
                <button key={m.id} onClick={() => setFiltro(m.id)}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all"
                  style={{ background: membroFiltro === m.id ? `${m.cor}15` : 'var(--cor-elevado)', border: `1px solid ${membroFiltro === m.id ? m.cor + '40' : 'var(--cor-borda)'}`, color: membroFiltro === m.id ? m.cor : 'var(--cor-texto-muted)' }}>
                  {m.emoji} {m.nome.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Vista Kanban */}
          {vista === 'kanban' && (
            <div className="grid grid-cols-4 gap-4">
              {FLUXO.map(col => {
                const Icone = col.icone
                const tarefasCol = tarefasFiltradas.filter(t => t.estado === col.id)
                return (
                  <div key={col.id} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-1">
                      <Icone size={14} style={{ color: COR_ESTADO[col.id as EstadoTarefa] }} />
                      <span className="text-sm font-medium">{col.label}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full ml-auto"
                        style={{ background: `${COR_ESTADO[col.id as EstadoTarefa]}15`, color: COR_ESTADO[col.id as EstadoTarefa] }}>
                        {tarefasCol.length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {tarefasCol.map(t => {
                        const membro = EQUIPA.find(m => m.id === t.membro_id)
                        return (
                          <div key={t.id} className="card group"
                            style={{ padding: 12, border: `1px solid ${COR_ESTADO[t.estado]}20` }}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-sm font-medium leading-tight flex-1">{t.titulo}</p>
                              <button onClick={() => apagarTarefa(t.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                style={{ color: 'var(--cor-erro)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                                <Trash2 size={11} />
                              </button>
                            </div>
                            {t.descricao && (
                              <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--cor-texto-muted)' }}>{t.descricao}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-lg">{membro?.emoji}</span>
                                <span className="text-xs" style={{ color: membro?.cor }}>{membro?.nome.split(' ')[0]}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs px-1.5 py-0.5 rounded-full"
                                  style={{ background: `${COR_PRIORIDADE[t.prioridade]}15`, color: COR_PRIORIDADE[t.prioridade], fontSize: 10 }}>
                                  {t.prioridade}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{t.data}</span>
                              </div>
                            </div>
                            {/* Mover */}
                            {col.id !== 'concluido' && (
                              <button
                                onClick={() => {
                                  const estados: EstadoTarefa[] = ['pendente', 'em_progresso', 'revisao', 'concluido']
                                  const idx = estados.indexOf(t.estado)
                                  if (idx < estados.length - 1) moverTarefa(t.id, estados[idx + 1])
                                }}
                                className="flex items-center gap-1 text-xs mt-2 w-full justify-center py-1 rounded-lg transition-all"
                                style={{ color: 'var(--cor-texto-muted)', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                                Avançar <ChevronRight size={10} />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Vista Equipa */}
          {vista === 'equipa' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EQUIPA.map(m => {
                const tarefasMembro = tarefas.filter(t => t.membro_id === m.id)
                const concluidas    = tarefasMembro.filter(t => t.estado === 'concluido').length
                const progresso     = tarefasMembro.length > 0 ? Math.round((concluidas / tarefasMembro.length) * 100) : 0
                return (
                  <div key={m.id} className="card flex flex-col gap-4"
                    style={{ border: `1px solid ${m.cor}20` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: `${m.cor}15`, border: `1px solid ${m.cor}30` }}>
                        {m.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{m.nome}</p>
                          <span className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: m.estado === 'disponivel' ? '#34d399' : m.estado === 'ocupado' ? '#fbbf24' : '#f87171' }} />
                        </div>
                        <p className="text-xs" style={{ color: m.cor }}>{m.funcao}</p>
                      </div>
                    </div>

                    {/* Progresso */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--cor-texto-muted)' }}>
                        <span>{concluidas}/{tarefasMembro.length} tarefas</span>
                        <span style={{ color: m.cor }}>{progresso}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'var(--cor-borda)' }}>
                        <div className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progresso}%`, background: m.cor }} />
                      </div>
                    </div>

                    {/* Tarefas do membro */}
                    <div className="flex flex-col gap-1.5">
                      {tarefasMembro.slice(0, 3).map(t => (
                        <div key={t.id} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg"
                          style={{ background: 'var(--cor-elevado)' }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: COR_ESTADO[t.estado] }} />
                          <span className="truncate flex-1" style={{ color: 'var(--cor-texto-muted)' }}>{t.titulo}</span>
                          <span className="text-xs flex-shrink-0" style={{ color: COR_ESTADO[t.estado], fontSize: 10 }}>
                            {LABEL_ESTADO[t.estado]}
                          </span>
                        </div>
                      ))}
                      {tarefasMembro.length > 3 && (
                        <p className="text-xs text-center" style={{ color: 'var(--cor-texto-fraco)' }}>
                          +{tarefasMembro.length - 3} mais
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Vista Fluxo */}
          {vista === 'fluxo' && (
            <div className="card flex flex-col gap-6">
              <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                Fluxo de produção de conteúdo
              </h3>
              {EQUIPA.map((m, i) => (
                <div key={m.id} className="flex items-start gap-4">
                  {/* Linha vertical */}
                  <div className="flex flex-col items-center flex-shrink-0" style={{ width: 40 }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: `${m.cor}15`, border: `1px solid ${m.cor}30` }}>
                      {m.emoji}
                    </div>
                    {i < EQUIPA.length - 1 && (
                      <div className="w-0.5 flex-1 mt-2" style={{ background: `${m.cor}30`, minHeight: 24 }} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">{m.nome}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${m.cor}15`, color: m.cor, border: `1px solid ${m.cor}25` }}>
                        {m.funcao}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tarefas.filter(t => t.membro_id === m.id).map(t => (
                        <div key={t.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs"
                          style={{ background: `${COR_ESTADO[t.estado]}10`, border: `1px solid ${COR_ESTADO[t.estado]}25`, color: 'var(--cor-texto-muted)' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: COR_ESTADO[t.estado] }} />
                          {t.titulo}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal nova tarefa */}
        {modalNova && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-md card flex flex-col gap-4">
              <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--fonte-display)' }}>Nova tarefa</h3>

              <div>
                <label className="label-campo">Título</label>
                <input value={novaTarefa.titulo} onChange={e => setNovaTarefa(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ex: Criar imagem do Reel" className="input-campo w-full" />
              </div>

              <div>
                <label className="label-campo">Descrição</label>
                <textarea value={novaTarefa.descricao} onChange={e => setNovaTarefa(p => ({ ...p, descricao: e.target.value }))}
                  placeholder="Detalhes da tarefa..." rows={2} className="input-campo w-full resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-campo">Responsável</label>
                  <select value={novaTarefa.membro_id} onChange={e => setNovaTarefa(p => ({ ...p, membro_id: e.target.value }))}
                    className="input-campo w-full">
                    {EQUIPA.map(m => (
                      <option key={m.id} value={m.id}>{m.emoji} {m.nome.split(' ')[0]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-campo">Prioridade</label>
                  <select value={novaTarefa.prioridade} onChange={e => setNovaTarefa(p => ({ ...p, prioridade: e.target.value as any }))}
                    className="input-campo w-full">
                    <option value="alta">🔴 Alta</option>
                    <option value="media">🟡 Média</option>
                    <option value="baixa">🟢 Baixa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-campo">Plataforma</label>
                  <select value={novaTarefa.plataforma} onChange={e => setNovaTarefa(p => ({ ...p, plataforma: e.target.value }))}
                    className="input-campo w-full">
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="geral">Geral</option>
                  </select>
                </div>
                <div>
                  <label className="label-campo">Dia</label>
                  <select value={novaTarefa.data} onChange={e => setNovaTarefa(p => ({ ...p, data: e.target.value }))}
                    className="input-campo w-full">
                    {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setModalNova(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
                  Cancelar
                </button>
                <button onClick={criarTarefa} disabled={!novaTarefa.titulo.trim()}
                  className="flex-1 btn-primario justify-center py-2.5"
                  style={!novaTarefa.titulo.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                  <Plus size={16} /> Criar tarefa
                </button>
              </div>
            </div>
          </div>
        )}
      </LayoutPainel>
    </>
  )
}
