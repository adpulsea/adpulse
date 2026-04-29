import Head from 'next/head'
import { useEffect, useState } from 'react'
import {
  Sparkles,
  Loader,
  Copy,
  Check,
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
  | 'aguarda_aprovacao'
  | 'aprovado'
  | 'publicado'
  | 'rejeitado'
  | 'em_progresso'

type Agente = {
  id: string
  nome: string
  cargo: string
  avatar: string
  cor: string
  tarefa: string
  prompt: string
}

type Tarefa = {
  id: string
  agente_id: string
  agente: string
  cargo: string
  titulo: string
  resultado: string
  estado: EstadoTarefa
  criado_em: string
  aprovado_em?: string | null
}

const AGENTES: Agente[] = [
  { id: 'sofia', nome: 'Sofia Martins', cargo: 'Estratégia de Conteúdo', avatar: '🧠', cor: '#7c7bfa', tarefa: 'Plano de conteúdo do dia', prompt: 'Cria um plano de conteúdo completo para hoje.' },
  { id: 'joao', nome: 'João Silva', cargo: 'Copywriter & Hooks', avatar: '✍️', cor: '#f472b6', tarefa: 'Copy e hooks virais', prompt: 'Cria hooks, legenda Instagram, copy TikTok e CTA.' },
  { id: 'ana', nome: 'Ana Costa', cargo: 'Designer Visual', avatar: '🎨', cor: '#34d399', tarefa: 'Briefing visual', prompt: 'Cria briefing visual detalhado para posts, stories e reels.' },
  { id: 'miguel', nome: 'Miguel Santos', cargo: 'Revisor de Conteúdo', avatar: '🔍', cor: '#fbbf24', tarefa: 'Revisão de conteúdo', prompt: 'Revê o conteúdo, melhora clareza, CTA e tom de marca.' },
  { id: 'rui', nome: 'Rui Ferreira', cargo: 'Research & Tendências', avatar: '🔬', cor: '#f87171', tarefa: 'Tendências do dia', prompt: 'Identifica tendências e oportunidades virais para hoje.' },
  { id: 'carla', nome: 'Carla Nunes', cargo: 'Publicação & Agendamento', avatar: '📅', cor: '#60a5fa', tarefa: 'Calendário de publicação', prompt: 'Define horários e ordem de publicação para hoje.' },
  { id: 'tiago', nome: 'Tiago Rocha', cargo: 'SEO & Hashtags', avatar: '#️⃣', cor: '#fb923c', tarefa: 'Hashtags e SEO social', prompt: 'Cria hashtags e otimização social para cada plataforma.' },
  { id: 'beatriz', nome: 'Beatriz Lima', cargo: 'Community Manager', avatar: '💬', cor: '#a78bfa', tarefa: 'Engagement e respostas', prompt: 'Cria perguntas, respostas a comentários e templates de DM.' },
  { id: 'ines', nome: 'Inês Rodrigues', cargo: 'Video Content Specialist', avatar: '🎬', cor: '#2dd4bf', tarefa: 'Guiões de vídeo', prompt: 'Cria guiões para Reel, TikTok e YouTube Shorts.' },
  { id: 'pedro', nome: 'Pedro Alves', cargo: 'Analytics & Performance', avatar: '📊', cor: '#e879f9', tarefa: 'Performance e métricas', prompt: 'Cria recomendações de performance e KPIs para acompanhar.' },
  { id: 'mariana', nome: 'Mariana Sousa', cargo: 'Brand Voice', avatar: '🎯', cor: '#4ade80', tarefa: 'Brand voice', prompt: 'Garante tom de voz moderno, direto e português europeu.' },
  { id: 'antonio', nome: 'António Mendes', cargo: 'Growth Hacker', avatar: '🚀', cor: '#f59e0b', tarefa: 'Tática de crescimento', prompt: 'Cria uma tática de crescimento prática para implementar hoje.' },
  { id: 'explorador', nome: 'Explorador', cargo: 'Chief Intelligence Officer', avatar: '🌐', cor: '#00f5d4', tarefa: 'Briefing de inteligência', prompt: 'Cria briefing sobre IA, redes sociais, algoritmos e oportunidades.' },
]

const COR_ESTADO: Record<EstadoTarefa, string> = {
  em_progresso: 'rgba(251,191,36,0.15)',
  aguarda_aprovacao: 'rgba(124,123,250,0.15)',
  aprovado: 'rgba(52,211,153,0.15)',
  publicado: 'rgba(96,165,250,0.15)',
  rejeitado: 'rgba(248,113,113,0.15)',
}

const TEXTO_ESTADO: Record<EstadoTarefa, string> = {
  em_progresso: '#fbbf24',
  aguarda_aprovacao: '#7c7bfa',
  aprovado: '#34d399',
  publicado: '#60a5fa',
  rejeitado: '#f87171',
}

const LABEL_ESTADO: Record<EstadoTarefa, string> = {
  em_progresso: 'A gerar...',
  aguarda_aprovacao: 'Aguarda aprovação',
  aprovado: 'Aprovado',
  publicado: 'Publicado',
  rejeitado: 'Rejeitado',
}

export default function AgentesIA() {
  const { utilizador } = useAuth()

  const [plano, setPlano] = useState('gratuito')
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [vista, setVista] = useState<'equipa' | 'aprovacao' | 'aprovado' | 'publicado'>('equipa')
  const [gerando, setGerando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [copiado, setCopiado] = useState<string | null>(null)

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
          titulo: t.titulo || 'Conteúdo gerado',
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
    if (!utilizador || plano !== 'agencia') return

    setGerando(true)
    setVista('equipa')

    for (const agente of AGENTES) {
      const { data: tarefaCriada, error } = await supabase
        .from('agentes_tarefas')
        .insert({
          utilizador_id: utilizador.id,
          agente_id: agente.id,
          agente: agente.nome,
          cargo: agente.cargo,
          tipo: agente.tarefa,
          titulo: agente.tarefa,
          descricao: agente.prompt,
          conteudo: '',
          resultado: '',
          estado: 'em_progresso',
          origem: 'equipa_adpulse',
        })
        .select()
        .single()

      if (error || !tarefaCriada) continue

      const tarefaTemp: Tarefa = {
        id: tarefaCriada.id,
        agente_id: agente.id,
        agente: agente.nome,
        cargo: agente.cargo,
        titulo: agente.tarefa,
        resultado: '',
        estado: 'em_progresso',
        criado_em: tarefaCriada.criado_em,
      }

      setTarefas((prev) => [tarefaTemp, ...prev])

      try {
        const res = await fetch('/api/ia/agente-executar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt_sistema: `
És ${agente.nome}, ${agente.cargo}, da Equipa AdPulse.

A AdPulse é uma plataforma portuguesa de marketing digital com IA.
Cria conteúdo em português de Portugal.
Sê direto, prático, moderno e pronto a publicar.

A tua função: ${agente.prompt}
`,
            tarefa: agente.tarefa,
          }),
        })

        const data = await res.json()
        const resultado = data.resultado || 'Conteúdo gerado.'

        await supabase
          .from('agentes_tarefas')
          .update({
            resultado,
            conteudo: resultado,
            estado: 'aguarda_aprovacao',
          })
          .eq('id', tarefaCriada.id)

        setTarefas((prev) =>
          prev.map((t) =>
            t.id === tarefaCriada.id
              ? { ...t, resultado, estado: 'aguarda_aprovacao' }
              : t
          )
        )
      } catch {
        const resultado = 'Erro ao gerar conteúdo deste agente.'

        await supabase
          .from('agentes_tarefas')
          .update({
            resultado,
            conteudo: resultado,
            estado: 'rejeitado',
          })
          .eq('id', tarefaCriada.id)

        setTarefas((prev) =>
          prev.map((t) =>
            t.id === tarefaCriada.id
              ? { ...t, resultado, estado: 'rejeitado' }
              : t
          )
        )
      }
    }

    setGerando(false)
    setVista('aprovacao')
  }

  const atualizarEstado = async (id: string, estado: EstadoTarefa) => {
    const dados: any = { estado }

    if (estado === 'aprovado') {
      dados.aprovado_em = new Date().toISOString()
    }

    await supabase.from('agentes_tarefas').update(dados).eq('id', id)

    setTarefas((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, estado, aprovado_em: dados.aprovado_em || t.aprovado_em }
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
    tarefas.filter((t) => t.agente_id === agenteId)

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
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
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
                  disabled={gerando || plano !== 'agencia'}
                  className="btn-primario"
                  style={
                    plano !== 'agencia'
                      ? { opacity: 0.5, cursor: 'not-allowed' }
                      : {}
                  }
                >
                  {gerando ? (
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
                    Equipa AdPulse disponível apenas no plano Agência
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                    Desbloqueia 13 agentes IA para criarem conteúdo automaticamente.
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
                  className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap"
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {AGENTES.map((agente) => {
                    const lista = tarefasPorAgente(agente.id)
                    const paraAprovar = lista.filter((t) => t.estado === 'aguarda_aprovacao').length

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

                          <div className="flex-1">
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
                          {agente.prompt}
                        </p>

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
                  vazio="Tudo aprovado!"
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
                  vazio="Sem conteúdo aprovado"
                  copiar={copiar}
                  copiado={copiado}
                  acoes={(tarefa) => (
                    <button
                      onClick={() => atualizarEstado(tarefa.id, 'publicado')}
                      className="w-full py-2.5 rounded-xl text-sm font-medium"
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
                  vazio="Sem conteúdo publicado ainda"
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
  vazio,
  copiar,
  copiado,
  acoes,
}: {
  tarefas: Tarefa[]
  vazio: string
  copiar: (texto: string, id: string) => void
  copiado: string | null
  acoes?: (tarefa: Tarefa) => React.ReactNode
}) {
  if (tarefas.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 gap-4">
        <div className="text-5xl">✅</div>
        <p className="font-semibold">{vazio}</p>
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
            {tarefa.resultado}
          </div>

          <button
            onClick={() => copiar(tarefa.resultado || '', tarefa.id)}
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
