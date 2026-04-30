import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { supabase } from '@/lib/supabase'

type Tarefa = {
  id: string
  execucao_id?: string
  agente_id: string
  agente_nome: string
  agente_cargo: string
  fase: string
  titulo: string
  conteudo: string
  estado: string
  criado_em?: string
  data_publicacao?: string | null
  plataforma_publicacao?: string | null
  publicado_em?: string | null
}

type Agente = {
  id: string
  nome: string
  cargo: string
  fase: string
  emoji: string
}

const AGENTES: Agente[] = [
  { id: 'explorador', nome: 'Explorador', cargo: 'Chief Intelligence Officer', fase: 'Inteligência', emoji: '🌐' },
  { id: 'rui', nome: 'Rui Ferreira', cargo: 'Research & Tendências', fase: 'Inteligência', emoji: '🔬' },
  { id: 'sofia', nome: 'Sofia Martins', cargo: 'Estratégia de Conteúdo', fase: 'Estratégia', emoji: '🧠' },
  { id: 'joao', nome: 'João Silva', cargo: 'Copywriter & Hooks', fase: 'Criação', emoji: '✍️' },
  { id: 'ines', nome: 'Inês Rodrigues', cargo: 'Video Content Specialist', fase: 'Criação', emoji: '🎬' },
  { id: 'ana', nome: 'Ana Costa', cargo: 'Designer Visual', fase: 'Criação', emoji: '🎨' },
  { id: 'tiago', nome: 'Tiago Rocha', cargo: 'SEO & Hashtags', fase: 'Criação', emoji: '#️⃣' },
  { id: 'miguel', nome: 'Miguel Santos', cargo: 'Revisor de Conteúdo', fase: 'Qualidade', emoji: '🔍' },
  { id: 'mariana', nome: 'Mariana Sousa', cargo: 'Brand Voice', fase: 'Qualidade', emoji: '🎯' },
  { id: 'carla', nome: 'Carla Nunes', cargo: 'Publicação & Agendamento', fase: 'Execução', emoji: '📅' },
  { id: 'beatriz', nome: 'Beatriz Lima', cargo: 'Community Manager', fase: 'Execução', emoji: '💬' },
  { id: 'pedro', nome: 'Pedro Alves', cargo: 'Analytics & Performance', fase: 'Performance', emoji: '📊' },
  { id: 'antonio', nome: 'António Mendes', cargo: 'Growth Hacker', fase: 'Performance', emoji: '🚀' },
]

const FASES = ['Inteligência', 'Estratégia', 'Criação', 'Qualidade', 'Execução', 'Performance']

export default function AgentesIA() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [progresso, setProgresso] = useState(0)
  const [agenteAtivo, setAgenteAtivo] = useState<string | null>(null)
  const [execucaoId, setExecucaoId] = useState<string | null>(null)
  const [publicandoId, setPublicandoId] = useState<string | null>(null)
  const [agendandoId, setAgendandoId] = useState<string | null>(null)
  const [datasAgendamento, setDatasAgendamento] = useState<Record<string, string>>({})

  const tarefasPorAgente = useMemo(() => {
    const mapa: Record<string, Tarefa | undefined> = {}
    tarefas.forEach((t) => {
      mapa[t.agente_id] = t
    })
    return mapa
  }, [tarefas])

  useEffect(() => {
    carregarUltimasTarefas()
  }, [])

  const carregarUltimasTarefas = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) return

    const { data } = await supabase
      .from('equipa_adpulse_tarefas')
      .select('*')
      .eq('utilizador_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(13)

    if (data && data.length > 0) {
      setTarefas(data.reverse() as Tarefa[])
      setProgresso(data.length)
      setExecucaoId(data[0]?.execucao_id || null)
    }
  }

  const gerar = async () => {
    if (loading) return

    setLoading(true)
    setErro('')
    setMensagem('')
    setTarefas([])
    setProgresso(0)
    setExecucaoId(null)

    let simulador = 0
    const intervalo = setInterval(() => {
      simulador = Math.min(simulador + 1, AGENTES.length - 1)
      setAgenteAtivo(AGENTES[simulador]?.id || null)
    }, 900)

    setAgenteAtivo(AGENTES[0].id)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setErro('Sessão inválida. Faz logout e login novamente.')
        clearInterval(intervalo)
        setLoading(false)
        return
      }

      const resp = await fetch('/api/ia/equipa-adpulse-executar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          nicho: 'marketing digital',
          plataforma: 'instagram',
          objetivo: 'crescer audiência e gerar leads',
        }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        setErro(data?.erro || data?.detalhe || 'Erro ao gerar campanha.')
        clearInterval(intervalo)
        setLoading(false)
        setAgenteAtivo(null)
        return
      }

      if (data?.execucao?.id) {
        setExecucaoId(data.execucao.id)
      }

      if (data?.tarefas) {
        setTarefas([])

        for (let i = 0; i < data.tarefas.length; i++) {
          const tarefa = data.tarefas[i]
          setAgenteAtivo(tarefa.agente_id)
          await new Promise((r) => setTimeout(r, 180))
          setTarefas((prev) => [...prev, tarefa])
          setProgresso(i + 1)
        }

        setMensagem('✅ Campanha gerada e guardada no Supabase.')
      } else {
        setErro('A API respondeu, mas não devolveu tarefas.')
      }
    } catch (e: any) {
      setErro(e?.message || 'Erro inesperado.')
    }

    clearInterval(intervalo)
    setAgenteAtivo(null)
    setLoading(false)
  }

  const aprovar = async (id: string) => {
    await supabase
      .from('equipa_adpulse_tarefas')
      .update({
        estado: 'aprovado',
        aprovado_em: new Date().toISOString(),
      })
      .eq('id', id)

    setTarefas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: 'aprovado' } : t))
    )
  }

  const agendarPublicacao = async (tarefa: Tarefa) => {
    const dataSelecionada = datasAgendamento[tarefa.id]

    if (!dataSelecionada) {
      setErro('Escolhe uma data e hora para agendar.')
      return
    }

    setAgendandoId(tarefa.id)
    setErro('')
    setMensagem('')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setErro('Sessão inválida. Faz logout e login novamente.')
        setAgendandoId(null)
        return
      }

      const resp = await fetch('/api/ia/agendar-publicacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          tarefa_id: tarefa.id,
          data_publicacao: new Date(dataSelecionada).toISOString(),
          plataforma: 'instagram',
          legenda: tarefa.conteudo,
        }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        setErro(data?.erro || 'Erro ao agendar publicação.')
        setAgendandoId(null)
        return
      }

      setTarefas((prev) =>
        prev.map((t) =>
          t.id === tarefa.id
            ? {
                ...t,
                estado: 'agendado',
                data_publicacao: data.tarefa?.data_publicacao || new Date(dataSelecionada).toISOString(),
                plataforma_publicacao: 'instagram',
              }
            : t
        )
      )

      setMensagem('📅 Publicação agendada com sucesso.')
    } catch (e: any) {
      setErro(e?.message || 'Erro inesperado ao agendar.')
    }

    setAgendandoId(null)
  }

  const publicarInstagram = async (id: string) => {
    setPublicandoId(id)
    setErro('')
    setMensagem('')

    try {
      const resp = await fetch('/api/ia/publicar-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarefa_id: id }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        setErro(data?.erro || 'Erro ao publicar no Instagram.')
        setPublicandoId(null)
        return
      }

      setTarefas((prev) =>
        prev.map((t) => (t.id === id ? { ...t, estado: 'publicado' } : t))
      )

      setMensagem(data?.mensagem || '🚀 Publicado no Instagram.')
    } catch (e: any) {
      setErro(e?.message || 'Erro inesperado ao publicar.')
    }

    setPublicandoId(null)
  }

  const guardarCampanha = async () => {
    if (!execucaoId) {
      setMensagem('✅ A campanha já está guardada nas tarefas.')
      return
    }

    await supabase
      .from('equipa_adpulse_execucoes')
      .update({ estado: 'guardado' })
      .eq('id', execucaoId)

    setMensagem('✅ Campanha guardada no histórico.')
  }

  const copiarTudo = async () => {
    const texto = tarefas
      .map((t) => `## ${t.agente_nome} — ${t.titulo}\n\n${t.conteudo}`)
      .join('\n\n---\n\n')

    await navigator.clipboard.writeText(texto)
    setMensagem('✅ Campanha copiada.')
  }

  const formatarData = (valor?: string | null) => {
    if (!valor) return ''
    return new Date(valor).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <Head>
        <title>Equipa AdPulse GOD MODE</title>
      </Head>

      <LayoutPainel titulo="Equipa AdPulse — GOD MODE 🚀">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={heroCard}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
              🤖 Agência IA AdPulse
            </h2>

            <p style={{ opacity: 0.65, marginBottom: 18 }}>
              13 agentes especializados a pensar, criar, rever, planear e preparar a tua campanha.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={gerar}
                disabled={loading}
                style={{
                  padding: '14px 22px',
                  background: '#7c7bfa',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 800,
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? `🤖 Equipa a pensar... (${progresso}/13)` : '🚀 Gerar campanha GOD MODE'}
              </button>

              {tarefas.length > 0 && (
                <>
                  <button onClick={guardarCampanha} style={botaoSecundario}>
                    💾 Guardar campanha
                  </button>

                  <button onClick={copiarTudo} style={botaoSecundario}>
                    📋 Copiar tudo
                  </button>
                </>
              )}
            </div>

            {(loading || tarefas.length > 0) && (
              <div style={barraFundo}>
                <div
                  style={{
                    width: `${(progresso / 13) * 100}%`,
                    height: '100%',
                    background: '#7c7bfa',
                    transition: 'all 0.3s ease',
                  }}
                />
              </div>
            )}

            {erro && <div style={erroBox}>{erro}</div>}
            {mensagem && <div style={mensagemBox}>{mensagem}</div>}
          </div>

          <div style={gridAgentes}>
            {AGENTES.map((agente) => {
              const tarefa = tarefasPorAgente[agente.id]
              const ativo = agenteAtivo === agente.id
              const concluido = !!tarefa

              return (
                <div
                  key={agente.id}
                  style={{
                    background: ativo
                      ? 'rgba(124,123,250,0.18)'
                      : concluido
                        ? 'rgba(34,197,94,0.08)'
                        : '#111',
                    border: ativo
                      ? '1px solid rgba(124,123,250,0.65)'
                      : concluido
                        ? '1px solid rgba(34,197,94,0.35)'
                        : '1px solid #27272a',
                    borderRadius: 16,
                    padding: 16,
                    minHeight: 118,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{agente.emoji}</div>
                  <strong>{agente.nome}</strong>
                  <div style={{ fontSize: 12, color: '#a78bfa', marginTop: 2 }}>
                    {agente.cargo}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
                    {agente.fase}
                  </div>

                  <div style={{ marginTop: 12, fontSize: 12 }}>
                    {ativo && '🧠 A pensar...'}
                    {!ativo && concluido && '✅ Concluído'}
                    {!ativo && !concluido && '⏳ A aguardar'}
                  </div>
                </div>
              )
            })}
          </div>

          {FASES.map((fase) => {
            const lista = tarefas.filter((t) => t.fase === fase)

            return (
              <div key={fase} style={{ marginBottom: 28 }}>
                <h3 style={{ marginBottom: 12 }}>
                  {fase} ({lista.length})
                </h3>

                {lista.length === 0 && loading && (
                  <p style={{ opacity: 0.55 }}>A equipa está a trabalhar...</p>
                )}

                {lista.map((t) => (
                  <div key={t.id} style={cardResultado}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>{t.agente_nome}</strong> — {t.agente_cargo}
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 12 }}>
                      {t.fase} • {t.titulo}
                    </div>

                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {t.conteudo}
                    </p>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                      {t.estado !== 'aprovado' && t.estado !== 'publicado' && t.estado !== 'agendado' && (
                        <button onClick={() => aprovar(t.id)} style={botaoAprovar}>
                          ✅ Aprovar
                        </button>
                      )}

                      {t.estado === 'aprovado' && (
                        <>
                          <input
                            type="datetime-local"
                            value={datasAgendamento[t.id] || ''}
                            onChange={(e) =>
                              setDatasAgendamento((prev) => ({
                                ...prev,
                                [t.id]: e.target.value,
                              }))
                            }
                            style={inputData}
                          />

                          <button
                            onClick={() => agendarPublicacao(t)}
                            disabled={agendandoId === t.id}
                            style={botaoAgendar}
                          >
                            {agendandoId === t.id ? 'A agendar...' : '📅 Agendar'}
                          </button>

                          <button
                            onClick={() => publicarInstagram(t.id)}
                            disabled={publicandoId === t.id}
                            style={{
                              padding: '8px 12px',
                              background: '#3b82f6',
                              border: 'none',
                              borderRadius: 8,
                              color: '#fff',
                              cursor: publicandoId === t.id ? 'not-allowed' : 'pointer',
                              fontWeight: 700,
                              opacity: publicandoId === t.id ? 0.7 : 1,
                            }}
                          >
                            {publicandoId === t.id ? 'A publicar...' : '🚀 Publicar agora'}
                          </button>
                        </>
                      )}

                      {t.estado === 'aprovado' && (
                        <span style={{ color: '#22c55e', display: 'block', paddingTop: 8 }}>
                          ✔️ Aprovado
                        </span>
                      )}

                      {t.estado === 'agendado' && (
                        <span style={{ color: '#fbbf24', display: 'block', paddingTop: 8 }}>
                          📅 Agendado para {formatarData(t.data_publicacao)}
                        </span>
                      )}

                      {t.estado === 'publicado' && (
                        <span style={{ color: '#60a5fa', display: 'block', paddingTop: 8 }}>
                          🚀 Publicado
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </LayoutPainel>
    </>
  )
}

const heroCard: CSSProperties = {
  background: 'rgba(124,123,250,0.08)',
  border: '1px solid rgba(124,123,250,0.25)',
  borderRadius: 18,
  padding: 22,
  marginBottom: 22,
}

const gridAgentes: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 14,
  marginBottom: 30,
}

const botaoSecundario: CSSProperties = {
  padding: '14px 18px',
  background: '#18181b',
  color: '#fff',
  border: '1px solid #333',
  borderRadius: 12,
  cursor: 'pointer',
  fontWeight: 700,
}

const botaoAprovar: CSSProperties = {
  padding: '8px 12px',
  background: '#22c55e',
  border: 'none',
  borderRadius: 8,
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
}

const botaoAgendar: CSSProperties = {
  padding: '8px 12px',
  background: '#f59e0b',
  border: 'none',
  borderRadius: 8,
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
}

const inputData: CSSProperties = {
  background: '#18181b',
  color: '#fff',
  border: '1px solid #333',
  borderRadius: 8,
  padding: '8px 10px',
}

const cardResultado: CSSProperties = {
  background: '#111',
  padding: 20,
  borderRadius: 14,
  marginBottom: 14,
  border: '1px solid #333',
}

const barraFundo: CSSProperties = {
  height: 8,
  background: '#222',
  borderRadius: 99,
  marginTop: 18,
  overflow: 'hidden',
}

const erroBox: CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 10,
  background: 'rgba(248,113,113,0.12)',
  border: '1px solid rgba(248,113,113,0.35)',
  color: '#f87171',
  fontSize: 14,
}

const mensagemBox: CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 10,
  background: 'rgba(34,197,94,0.1)',
  border: '1px solid rgba(34,197,94,0.3)',
  color: '#22c55e',
  fontSize: 14,
}
