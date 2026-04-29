import Head from 'next/head'
import { useEffect, useState } from 'react'
import {
  Sparkles,
  Loader,
  Copy,
  Check,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Bell,
  Lock,
  Crown,
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

type EstadoTarefa =
  | 'pendente'
  | 'em_progresso'
  | 'aguarda_aprovacao'
  | 'aprovado'
  | 'publicado'
  | 'rejeitado'

type Tarefa = {
  id: string
  agente_id: string
  agente: string
  cargo: string
  tipo: string
  titulo: string
  conteudo: string
  resultado: string
  estado: EstadoTarefa
  criado_em: string
  aprovado_em?: string | null
}

type Agente = {
  id: string
  nome: string
  cargo: string
  avatar: string
  cor: string
  descricao: string
}

const AGENTES: Agente[] = [
  { id: 'sofia', nome: 'Sofia Martins', cargo: 'Estratégia de Conteúdo', avatar: '🧠', cor: '#7c7bfa', descricao: 'Cria planos de conteúdo completos.' },
  { id: 'joao', nome: 'João Silva', cargo: 'Copywriter & Hooks', avatar: '✍️', cor: '#f472b6', descricao: 'Cria hooks, legendas e CTAs.' },
  { id: 'ana', nome: 'Ana Costa', cargo: 'Designer Visual', avatar: '🎨', cor: '#34d399', descricao: 'Cria briefings visuais.' },
  { id: 'miguel', nome: 'Miguel Santos', cargo: 'Revisor de Conteúdo', avatar: '🔍', cor: '#fbbf24', descricao: 'Revê e melhora o conteúdo.' },
  { id: 'rui', nome: 'Rui Ferreira', cargo: 'Research & Tendências', avatar: '🔬', cor: '#f87171', descricao: 'Procura oportunidades virais.' },
  { id: 'carla', nome: 'Carla Nunes', cargo: 'Publicação & Agendamento', avatar: '📅', cor: '#60a5fa', descricao: 'Organiza horários e calendário.' },
  { id: 'tiago', nome: 'Tiago Rocha', cargo: 'SEO & Hashtags', avatar: '#️⃣', cor: '#fb923c', descricao: 'Cria hashtags e SEO social.' },
  { id: 'beatriz', nome: 'Beatriz Lima', cargo: 'Community Manager', avatar: '💬', cor: '#a78bfa', descricao: 'Cria respostas e engagement.' },
  { id: 'ines', nome: 'Inês Rodrigues', cargo: 'Video Content Specialist', avatar: '🎬', cor: '#2dd4bf', descricao: 'Cria guiões para vídeo.' },
  { id: 'pedro', nome: 'Pedro Alves', cargo: 'Analytics & Performance', avatar: '📊', cor: '#e879f9', descricao: 'Analisa métricas e performance.' },
  { id: 'mariana', nome: 'Mariana Sousa', cargo: 'Brand Voice', avatar: '🎯', cor: '#4ade80', descricao: 'Garante o tom de marca.' },
  { id: 'antonio', nome: 'António Mendes', cargo: 'Growth Hacker', avatar: '🚀', cor: '#f59e0b', descricao: 'Cria táticas de crescimento.' },
  { id: 'explorador', nome: 'Explorador', cargo: 'Chief Intelligence Officer', avatar: '🌐', cor: '#00f5d4', descricao: 'Monitoriza IA, algoritmos e inovação.' },
]

const COR_ESTADO: Record<EstadoTarefa, string> = {
  pendente: 'rgba(156,163,175,0.15)',
  em_progresso: 'rgba(251,191,36,0.15)',
  aguarda_aprovacao: 'rgba(124,123,250,0.15)',
  aprovado: 'rgba(52,211,153,0.15)',
  publicado: 'rgba(96,165,250,0.15)',
  rejeitado: 'rgba(248,113,113,0.15)',
}

const TEXTO_ESTADO: Record<EstadoTarefa, string> = {
  pendente: '#9ca3af',
  em_progresso: '#fbbf24',
  aguarda_aprovacao: '#7c7bfa',
  aprovado: '#34d399',
  publicado: '#60a5fa',
  rejeitado: '#f87171',
}

const LABEL_ESTADO: Record<EstadoTarefa, string> = {
  pendente: 'Pendente',
  em_progresso: 'A trabalhar',
  aguarda_aprovacao: 'Aguarda aprovação',
  aprovado: 'Aprovado',
  publicado: 'Publicado',
  rejeitado: 'Rejeitado',
}

export default function AgentesIA() {
  const { utilizador } = useAuth()

  const [plano, setPlano] = useState('gratuito')
  const [vista, setVista] = useState<'equipa' | 'aprovacao' | 'aprovado' | 'publicado'>('equipa')
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [gerandoDia, setGerandoDia] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [nicho, setNicho] = useState('marketing digital')
  const [plataforma, setPlataforma] = useState('instagram')
  const [objetivo, setObjetivo] = useState('criar conteúdo do dia')

  useEffect(() => {
    if (!utilizador) return

    carregarTudo()
  }, [utilizador])

  const carregarTudo = async () => {
    if (!utilizador) return

    setCarregando(true)

    const { data: perfil } = await supabase
      .from('perfis')
      .select('plano')
      .eq('id', utilizador.id)
      .single()

    if (perfil?.plano) setPlano(perfil.plano)

    const { data } = await supabase
      .from('agentes_tarefas')
      .select('*')
      .eq('utilizador_id', utilizador.id)
      .order('criado_em', { ascending: false })
      .limit(200)

    if (data) {
      setTarefas(
        data.map((t: any) => ({
          id: t.id,
          agente_id: t.agente_id || '',
          agente: t.agente || '',
          cargo: t.cargo || '',
          tipo: t.tipo || '',
          titulo: t.titulo || 'Conteúdo gerado',
          conteudo: t.conteudo || t.resultado || '',
          resultado: t.resultado || t.conteudo || '',
          estado: t.estado || 'aguarda_aprovacao',
          criado_em: t.criado_em,
          aprovado_em: t.aprovado_em,
        }))
      )
    }

    setCarregando(false)
  }

  const gerarConteudoDia = async () => {
    if (!utilizador) return

    if (plano !== 'agencia') {
      return
    }

    setGerandoDia(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch('/api/ia/agentes-gerar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          nicho,
          plataforma,
          objetivo,
        }),
      })

      const data = await res.json()

      if (data.sucesso) {
        await carregarTudo()
        setVista('aprovacao')
      }
    } finally {
      setGerandoDia(false)
    }
  }

  const atualizarEstado = async (tarefaId: string, estado: EstadoTarefa) => {
    const updateData: any = { estado }

    if (estado === 'aprovado') {
      updateData.aprovado_em = new Date().toISOString()
    }

    await supabase.from('agentes_tarefas').update(updateData).eq('id', tarefaId)

    setTarefas((prev) =>
      prev.map((t) =>
        t.id === tarefaId
          ? {
              ...t,
              estado,
              aprovado_em: updateData.aprovado_em || t.aprovado_em,
            }
          : t
      )
    )
  }

  const copiar = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 2000)
  }

  const tarefasParaAprovar = tarefas.filter((t) => t.estado === 'aguarda_aprovacao')
  const tarefasAprovadas = tarefas.filter((t) => t.estado === 'aprovado')
  const tarefasPublicadas = tarefas.filter((t) => t.estado === 'publicado')

  const tarefasPorAgente = (agenteId: string) =>
    tarefas.filter((t) => t.agente_id === agenteId || t.agente === AGENTES.find((a) => a.id === agenteId)?.nome)

  return (
    <>
      <Head>
        <title>Equipa AdPulse — AdPulse</title>
      </Head>

      <LayoutPainel titulo="Equipa AdPulse">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div
            className="card"
            style={{
              background:
                'linear-gradient(135deg, rgba(124,123,250,0.1), rgba(244,114,182,0.08))',
              border: '1px solid rgba(124,123,250,0.2)',
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    background: 'rgba(124,123,250,0.15)',
                    border: '1px solid rgba(124,123,250,0.3)',
                  }}
                >
                  🤖
                </div>

                <div>
                  <h2
                    className="font-bold text-xl"
                    style={{ fontFamily: 'var(--fonte-display)' }}
                  >
                    Equipa AdPulse
                  </h2>

                  <p className="text-sm mt-0.5" style={{ color: 'var(--cor-texto-muted)' }}>
                    13 agentes IA · {tarefas.length} tarefas totais · exclusivo Agência
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {tarefasParaAprovar.length > 0 && (
                  <button
                    onClick={() => setVista('aprovacao')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium relative"
                    style={{
                      background: 'rgba(124,123,250,0.15)',
                      color: 'var(--cor-marca)',
                      border: '1px solid rgba(124,123,250,0.3)',
                    }}
                  >
                    <Bell size={15} />
                    {tarefasParaAprovar.length} para aprovar
                  </button>
                )}

                <button
                  onClick={gerarConteudoDia}
                  disabled={gerandoDia || plano !== 'agencia'}
                  className="btn-primario"
                  style={
                    plano !== 'agencia'
                      ? { opacity: 0.5, cursor: 'not-allowed' }
                      : {}
                  }
                >
                  {gerandoDia ? (
                    <>
                      <Loader size={16} className="animate-spin" /> A gerar...
                    </>
                  ) : plano === 'agencia' ? (
                    <>
                      <Sparkles size={16} /> Gerar conteúdo do dia
                    </>
                  ) : (
                    <>
                      <Lock size={16} /> Só plano Agência
                    </>
                  )}
                </button>
              </div>
            </div>

            {plano !== 'agencia' && (
              <div
                className="mt-5 p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                style={{
                  background: 'rgba(192,132,252,0.08)',
                  border: '1px solid rgba(192,132,252,0.2)',
                }}
              >
                <div>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Crown size={15} style={{ color: '#c084fc' }} />
                    Equipa AdPulse disponível no plano Agência
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                    Desbloqueia 13 agentes IA que criam plano, copy, hooks, hashtags, guiões e estratégia.
                  </p>
                </div>

                <a
                  href="/precos"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-center"
                  style={{
                    background: '#c084fc',
                    color: '#fff',
                    textDecoration: 'none',
                  }}
                >
                  Fazer upgrade para Agência
                </a>
              </div>
            )}

            {plano === 'agencia' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
                <input
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  placeholder="Nicho"
                  className="input-campo"
                />

                <select
                  value={plataforma}
                  onChange={(e) => setPlataforma(e.target.value)}
                  className="input-campo"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="linkedin">LinkedIn</option>
                </select>

                <input
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  placeholder="Objetivo"
                  className="input-campo"
                />
              </div>
            )}

            <div
              className="flex items-center gap-2 mt-5 pt-5 overflow-x-auto"
              style={{ borderTop: '1px solid rgba(124,123,250,0.15)' }}
            >
              {[
                { id: 'equipa', label: 'Equipa', emoji: '👥' },
                { id: 'aprovacao', label: `Aprovação (${tarefasParaAprovar.length})`, emoji: '⏳' },
                { id: 'aprovado', label: `Aprovado (${tarefasAprovadas.length})`, emoji: '✅' },
                { id: 'publicado', label: `Publicado (${tarefasPublicadas.length})`, emoji: '🚀' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setVista(tab.id as any)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                  style={{
                    background: vista === tab.id ? 'var(--cor-marca)' : 'var(--cor-elevado)',
                    color: vista === tab.id ? '#fff' : 'var(--cor-texto-muted)',
                    border: `1px solid ${
                      vista === tab.id ? 'var(--cor-marca)' : 'var(--cor-borda)'
                    }`,
                  }}
                >
                  {tab.emoji} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {carregando ? (
            <div className="card flex items-center justify-center py-20">
              <Loader size={24} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
            </div>
          ) : (
            <>
              {vista === 'equipa' && (
                <div
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                  style={{
                    filter: plano !== 'agencia' ? 'grayscale(0.4)' : 'none',
                  }}
                >
                  {AGENTES.map((agente) => {
                    const lista = tarefasPorAgente(agente.id)
                    const paraAprovar = lista.filter((t) => t.estado === 'aguarda_aprovacao').length
                    const concluidas = lista.filter((t) =>
                      ['aprovado', 'publicado'].includes(t.estado)
                    ).length
                    const progresso = lista.length > 0 ? Math.round((concluidas / lista.length) * 100) : 0

                    return (
                      <div key={agente.id} className="card flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                            style={{
                              background: `${agente.cor}20`,
                              border: `1px solid ${agente.cor}40`,
                            }}
                          >
                            {agente.avatar}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{agente.nome}</p>
                            <p className="text-xs mt-0.5" style={{ color: agente.cor }}>
                              {agente.cargo}
                            </p>
                          </div>

                          {paraAprovar > 0 && (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: 'var(--cor-marca)', color: '#fff' }}
                            >
                              {paraAprovar}
                            </div>
                          )}
                        </div>

                        <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
                          {agente.descricao}
                        </p>

                        {lista.length > 0 && (
                          <div>
                            <div
                              className="flex justify-between mb-1.5 text-xs"
                              style={{ color: 'var(--cor-texto-fraco)' }}
                            >
                              <span>
                                {concluidas}/{lista.length} tarefas
                              </span>
                              <span>{progresso}%</span>
                            </div>

                            <div
                              className="h-1.5 rounded-full overflow-hidden"
                              style={{ background: 'var(--cor-elevado)' }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${progresso}%`, background: agente.cor }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                          {lista.slice(0, 3).map((tarefa) => (
                            <div
                              key={tarefa.id}
                              className="flex items-center gap-2 px-2.5 py-2 rounded-xl"
                              style={{
                                background: COR_ESTADO[tarefa.estado],
                                border: `1px solid ${TEXTO_ESTADO[tarefa.estado]}30`,
                              }}
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: TEXTO_ESTADO[tarefa.estado] }}
                              />
                              <span className="text-xs flex-1 truncate">{tarefa.titulo}</span>
                              <span
                                className="text-xs"
                                style={{ color: TEXTO_ESTADO[tarefa.estado] }}
                              >
                                {LABEL_ESTADO[tarefa.estado]}
                              </span>
                            </div>
                          ))}

                          {lista.length === 0 && (
                            <p
                              className="text-xs py-2 text-center"
                              style={{ color: 'var(--cor-texto-fraco)' }}
                            >
                              Sem tarefas ainda
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {vista === 'aprovacao' && (
                <ListaTarefas
                  tarefas={tarefasParaAprovar}
                  vazioEmoji="✅"
                  vazioTitulo="Tudo aprovado!"
                  vazioTexto="Não há conteúdo à espera de aprovação."
                  copiar={copiar}
                  copiado={copiado}
                  acoes={(tarefa) => (
                    <div className="flex gap-3">
                      <button
                        onClick={() => atualizarEstado(tarefa.id, 'aprovado')}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
                        style={{
                          background: 'rgba(52,211,153,0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(52,211,153,0.3)',
                        }}
                      >
                        <ThumbsUp size={15} /> Aprovar
                      </button>

                      <button
                        onClick={() => atualizarEstado(tarefa.id, 'rejeitado')}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                        style={{
                          background: 'rgba(248,113,113,0.1)',
                          color: '#f87171',
                          border: '1px solid rgba(248,113,113,0.2)',
                        }}
                      >
                        <ThumbsDown size={15} />
                      </button>
                    </div>
                  )}
                />
              )}

              {vista === 'aprovado' && (
                <ListaTarefas
                  tarefas={tarefasAprovadas}
                  vazioEmoji="📋"
                  vazioTitulo="Sem conteúdo aprovado"
                  vazioTexto="Aprova conteúdo na aba Aprovação primeiro."
                  copiar={copiar}
                  copiado={copiado}
                  acoes={(tarefa) => (
                    <button
                      onClick={() => atualizarEstado(tarefa.id, 'publicado')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
                      style={{
                        background: 'rgba(96,165,250,0.15)',
                        color: '#60a5fa',
                        border: '1px solid rgba(96,165,250,0.3)',
                      }}
                    >
                      🚀 Marcar como publicado
                    </button>
                  )}
                />
              )}

              {vista === 'publicado' && (
                <ListaTarefas
                  tarefas={tarefasPublicadas}
                  vazioEmoji="🚀"
                  vazioTitulo="Sem conteúdo publicado ainda"
                  vazioTexto="Quando marcares conteúdo como publicado, aparece aqui."
                  copiar={copiar}
                  copiado={copiado}
                />
              )}
            </>
          )}
        </div>
      </LayoutPainel>
    </>
  )
}

function ListaTarefas({
  tarefas,
  vazioEmoji,
  vazioTitulo,
  vazioTexto,
  copiar,
  copiado,
  acoes,
}: {
  tarefas: Tarefa[]
  vazioEmoji: string
  vazioTitulo: string
  vazioTexto: string
  copiar: (texto: string, id: string) => void
  copiado: string | null
  acoes?: (tarefa: Tarefa) => React.ReactNode
}) {
  if (tarefas.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 gap-4">
        <div className="text-5xl">{vazioEmoji}</div>
        <p className="font-semibold">{vazioTitulo}</p>
        <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
          {vazioTexto}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {tarefas.map((tarefa) => (
        <div key={tarefa.id} className="card flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: 'rgba(124,123,250,0.15)',
                border: '1px solid rgba(124,123,250,0.3)',
              }}
            >
              🤖
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold">
                {tarefa.agente}{' '}
                <span style={{ color: 'var(--cor-texto-fraco)', fontWeight: 'normal' }}>
                  · {tarefa.cargo}
                </span>
              </p>

              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--cor-marca)' }}>
                {tarefa.titulo}
              </p>
            </div>

            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                background: COR_ESTADO[tarefa.estado],
                color: TEXTO_ESTADO[tarefa.estado],
              }}
            >
              {LABEL_ESTADO[tarefa.estado]}
            </span>
          </div>

          <div
            className="p-4 rounded-xl text-sm whitespace-pre-wrap leading-relaxed"
            style={{
              background: 'var(--cor-elevado)',
              border: '1px solid var(--cor-borda)',
              color: 'var(--cor-texto-muted)',
              maxHeight: 420,
              overflowY: 'auto',
            }}
          >
            {tarefa.resultado || tarefa.conteudo}
          </div>

          <button
            onClick={() => copiar(tarefa.resultado || tarefa.conteudo || '', tarefa.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs self-end"
            style={{
              background:
                copiado === tarefa.id ? 'rgba(52,211,153,0.15)' : 'var(--cor-elevado)',
              color: copiado === tarefa.id ? '#34d399' : 'var(--cor-texto-muted)',
              border: `1px solid ${
                copiado === tarefa.id ? 'rgba(52,211,153,0.3)' : 'var(--cor-borda)'
              }`,
            }}
          >
            {copiado === tarefa.id ? (
              <>
                <Check size={12} /> Copiado!
              </>
            ) : (
              <>
                <Copy size={12} /> Copiar conteúdo
              </>
            )}
          </button>

          {acoes && acoes(tarefa)}
        </div>
      ))}
    </div>
  )
}
