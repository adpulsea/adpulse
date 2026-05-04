import Head from 'next/head'
import { useMemo, useState } from 'react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { supabase } from '@/lib/supabase'

type Tarefa = {
  id: string
  agente_id: string
  agente_nome: string
  agente_cargo: string
  fase: string
  titulo: string
  conteudo: string
  estado: string
  formato?: string
  plataforma?: string
  legenda?: string
  texto_criativo?: string
  hashtags?: string
  cta?: string
  prompt_imagem?: string
  hora_sugerida?: string
}

type AgenteUI = {
  id: string
  nome: string
  cargo: string
  fase: string
  emoji: string
}

const AGENTES_UI: AgenteUI[] = [
  { id: 'post_rapido', nome: 'Post Rápido', cargo: 'Criador Instantâneo', fase: 'Criação Rápida', emoji: '⚡' },
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

const FASES = ['Criação Rápida', 'Inteligência', 'Estratégia', 'Criação', 'Qualidade', 'Execução', 'Performance']

const corFase = (fase: string) => {
  switch (fase) {
    case 'Criação Rápida':
      return '#f59e0b'
    case 'Inteligência':
      return '#22c55e'
    case 'Estratégia':
      return '#8b5cf6'
    case 'Criação':
      return '#ec4899'
    case 'Qualidade':
      return '#f59e0b'
    case 'Execução':
      return '#06b6d4'
    case 'Performance':
      return '#3b82f6'
    default:
      return '#7c7bfa'
  }
}

const corEstado = (estado?: string) => {
  switch (estado) {
    case 'concluido':
      return '#22c55e'
    case 'a_trabalhar':
      return '#f59e0b'
    default:
      return '#94a3b8'
  }
}

function stripMarkdown(texto: string) {
  if (!texto) return ''
  return texto
    .replace(/[*_`>#-]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function hashtagsParaArray(hashtags?: string) {
  if (!hashtags) return []
  return hashtags
    .split(/\s+/)
    .map(h => h.trim())
    .filter(Boolean)
    .map(h => (h.startsWith('#') ? h : `#${h}`))
}

function horaValida(hora?: string) {
  if (!hora) return '09:00'
  return /^\d{2}:\d{2}$/.test(hora) ? hora : '09:00'
}

function dataComHora(hora: string) {
  const agora = new Date()
  const [h, m] = horaValida(hora).split(':')
  const d = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate(),
    parseInt(h, 10),
    parseInt(m, 10),
    0,
    0
  )

  if (d.getTime() < agora.getTime()) {
    d.setDate(d.getDate() + 1)
  }

  return d.toISOString()
}

export default function AgentesIA() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingRapido, setLoadingRapido] = useState(false)
  const [erro, setErro] = useState('')
  const [nicho, setNicho] = useState('marketing digital')
  const [plataforma, setPlataforma] = useState('instagram')
  const [objetivo, setObjetivo] = useState('crescer audiência e gerar leads')
  const [imagemPorTarefa, setImagemPorTarefa] = useState<Record<string, string>>({})
  const [gerandoImagemId, setGerandoImagemId] = useState<string | null>(null)
  const [guardandoId, setGuardandoId] = useState<string | null>(null)
  const [copiadoId, setCopiadoId] = useState<string | null>(null)

  const resumo = useMemo(() => {
    return FASES.map(fase => ({
      fase,
      total: tarefas.filter(t => t.fase === fase).length,
    }))
  }, [tarefas])

  const agentesStatus = useMemo(() => {
    return AGENTES_UI.map(agente => {
      const tarefa = tarefas.find(t => t.agente_id === agente.id)

      let status = 'Pronto'
      if ((loading || loadingRapido) && agente.id === 'post_rapido') status = 'A criar...'
      if (loading && agente.id !== 'post_rapido') status = 'A trabalhar...'
      if (tarefa?.estado === 'concluido') status = 'Concluído'

      return {
        ...agente,
        status,
      }
    })
  }, [tarefas, loading, loadingRapido])

  const copiar = async (texto: string, id: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiadoId(id)
      setTimeout(() => setCopiadoId(null), 1800)
    } catch {
      // silencioso
    }
  }

  const copiarTudo = async () => {
    const texto = tarefas
      .map(
        t => `=== ${t.agente_nome} — ${t.titulo} ===

${t.conteudo}

Legenda:
${t.legenda || '-'}

Texto do criativo:
${t.texto_criativo || '-'}

Hashtags:
${t.hashtags || '-'}

CTA:
${t.cta || '-'}

Prompt de imagem:
${t.prompt_imagem || '-'}`
      )
      .join('\n\n-------------------------------\n\n')

    try {
      await navigator.clipboard.writeText(texto)
      alert('Conteúdo copiado.')
    } catch {
      alert('Não foi possível copiar.')
    }
  }

  const abrirInstagram = () => {
    window.open('https://www.instagram.com/', '_blank')
  }

  const gerarPostRapido = async () => {
    if (loadingRapido || loading) return

    setErro('')
    setLoadingRapido(true)
    setImagemPorTarefa({})

    const placeholder: Tarefa = {
      id: 'post_rapido_placeholder',
      agente_id: 'post_rapido',
      agente_nome: 'Post Rápido',
      agente_cargo: 'Criador Instantâneo',
      fase: 'Criação Rápida',
      titulo: 'A criar post rápido...',
      conteudo: 'A AdPulse está a preparar uma legenda, texto do criativo, hashtags, CTA e prompt de imagem.',
      estado: 'a_trabalhar',
      formato: 'Post',
      plataforma,
      legenda: '',
      texto_criativo: '',
      hashtags: '',
      cta: '',
      prompt_imagem: '',
      hora_sugerida: '09:00',
    }

    setTarefas([placeholder])

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const resp = await fetch('/api/ia/post-rapido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          nicho,
          plataforma,
          objetivo,
        }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data?.error || data?.erro || 'Erro ao gerar post rápido.')
      }

      const post = data?.post || data

      const tarefaRapida: Tarefa = {
        id: `post_rapido_${Date.now()}`,
        agente_id: 'post_rapido',
        agente_nome: 'Post Rápido',
        agente_cargo: 'Criador Instantâneo',
        fase: 'Criação Rápida',
        titulo: post?.titulo || 'Post rápido AdPulse',
        conteudo:
          post?.conteudo ||
          `Post pronto para ${plataforma} no nicho ${nicho}, com foco em ${objetivo}.`,
        estado: 'concluido',
        formato: post?.formato || 'Post',
        plataforma: post?.plataforma || plataforma,
        legenda: post?.legenda || '',
        texto_criativo: post?.texto_criativo || '',
        hashtags: post?.hashtags || '',
        cta: post?.cta || '',
        prompt_imagem: post?.prompt_imagem || '',
        hora_sugerida: post?.hora_sugerida || '09:00',
      }

      setTarefas([tarefaRapida])
    } catch (e: any) {
      setErro(e?.message || 'Ocorreu um erro ao gerar o post rápido.')
      setTarefas([])
    } finally {
      setLoadingRapido(false)
    }
  }

  const gerarCampanha = async () => {
    if (loading || loadingRapido) return

    setErro('')
    setLoading(true)
    setImagemPorTarefa({})

    const placeholders: Tarefa[] = AGENTES_UI
      .filter(ag => ag.id !== 'post_rapido')
      .map(ag => ({
        id: ag.id,
        agente_id: ag.id,
        agente_nome: ag.nome,
        agente_cargo: ag.cargo,
        fase: ag.fase,
        titulo: 'A preparar...',
        conteudo: 'O agente está a trabalhar...',
        estado: 'a_trabalhar',
        formato: 'Post',
        plataforma,
      }))

    setTarefas(placeholders)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const resp = await fetch('/api/ia/equipa-adpulse-executar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          nicho,
          plataforma,
          objetivo,
        }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data?.error || data?.erro || 'Erro ao gerar campanha.')
      }

      if (Array.isArray(data?.tarefas)) {
        setTarefas(data.tarefas)
      } else {
        throw new Error('A API não devolveu tarefas válidas.')
      }
    } catch (e: any) {
      setErro(e?.message || 'Ocorreu um erro ao gerar a campanha.')
      setTarefas([])
    } finally {
      setLoading(false)
    }
  }

  const gerarImagem = async (tarefa: Tarefa) => {
    setGerandoImagemId(tarefa.id)

    try {
      const resp = await fetch('/api/ia/gerar-imagem-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: tarefa.titulo,
          conteudo: tarefa.conteudo,
          legenda: tarefa.legenda,
          texto_criativo: tarefa.texto_criativo,
          prompt_imagem: tarefa.prompt_imagem,
          plataforma: tarefa.plataforma || plataforma,
          formato: tarefa.formato || 'Post',
        }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data?.error || data?.erro || 'Erro ao gerar imagem.')
      }

      if (data?.imagem || data?.imagem_url) {
        setImagemPorTarefa(prev => ({
          ...prev,
          [tarefa.id]: data.imagem_url || data.imagem,
        }))
      } else {
        throw new Error('A imagem não foi devolvida.')
      }
    } catch (e: any) {
      alert(e?.message || 'Erro ao gerar imagem.')
    } finally {
      setGerandoImagemId(null)
    }
  }

  const guardarNoCalendario = async (tarefa: Tarefa) => {
    setGuardandoId(tarefa.id)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const utilizadorId = session?.user?.id

      if (!utilizadorId) {
        throw new Error('Sessão não encontrada. Faz login novamente.')
      }

      const { error } = await supabase.from('posts').insert({
        utilizador_id: utilizadorId,
        titulo: tarefa.titulo,
        legenda: tarefa.legenda || tarefa.conteudo,
        hashtags: hashtagsParaArray(tarefa.hashtags),
        hook: tarefa.texto_criativo || '',
        plataforma: (tarefa.plataforma || plataforma).toLowerCase(),
        formato: tarefa.formato || 'Post',
        estado: 'agendado',
        hora_publicacao: horaValida(tarefa.hora_sugerida),
        imagem_url: imagemPorTarefa[tarefa.id] || null,
        criado_em: dataComHora(tarefa.hora_sugerida || '09:00'),
      })

      if (error) throw error

      alert('Conteúdo guardado no calendário com sucesso.')
    } catch (e: any) {
      alert(e?.message || 'Erro ao guardar no calendário.')
    } finally {
      setGuardandoId(null)
    }
  }

  return (
    <>
      <Head>
        <title>Equipa AdPulse — GOD MODE</title>
      </Head>

      <LayoutPainel titulo="TESTE NOVO AGENTES 456">
        <div style={{ maxWidth: 1250, margin: '0 auto' }}>
          <div
            style={{
              border: '1px solid rgba(124,123,250,0.25)',
              borderRadius: 18,
              padding: 20,
              background: 'linear-gradient(180deg, rgba(124,123,250,0.10), rgba(124,123,250,0.03))',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>
                  🤖 Agência IA AdPulse
                </div>
                <div style={{ opacity: 0.8, fontSize: 14 }}>
                  Cria posts rápidos em segundos ou campanhas completas com a equipa de agentes.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={gerarPostRapido}
                  disabled={loadingRapido || loading}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#f59e0b',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: loadingRapido || loading ? 'not-allowed' : 'pointer',
                    opacity: loadingRapido || loading ? 0.7 : 1,
                  }}
                >
                  {loadingRapido ? '⚡ A criar post...' : '⚡ Gerar post rápido'}
                </button>

                <button
                  onClick={gerarCampanha}
                  disabled={loading || loadingRapido}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#7c7bfa',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: loading || loadingRapido ? 'not-allowed' : 'pointer',
                    opacity: loading || loadingRapido ? 0.7 : 1,
                  }}
                >
                  {loading ? '🤖 Equipa a trabalhar...' : '🚀 Gerar campanha GOD MODE'}
                </button>

                <button
                  onClick={copiarTudo}
                  disabled={!tarefas.length}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: '#151523',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: tarefas.length ? 'pointer' : 'not-allowed',
                    opacity: tarefas.length ? 1 : 0.5,
                  }}
                >
                  📋 Copiar tudo
                </button>

                <button
                  onClick={abrirInstagram}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: '#151523',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  📱 Abrir Instagram
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
                marginTop: 18,
              }}
            >
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Nicho</div>
                <input
                  value={nicho}
                  onChange={e => setNicho(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: '#10101a',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Plataforma</div>
                <select
                  value={plataforma}
                  onChange={e => setPlataforma(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: '#10101a',
                    color: '#fff',
                    outline: 'none',
                  }}
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Objetivo</div>
                <input
                  value={objetivo}
                  onChange={e => setObjetivo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: '#10101a',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                height: 6,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                marginTop: 18,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: loading || loadingRapido ? '45%' : tarefas.length ? '100%' : '0%',
                  height: '100%',
                  background: loadingRapido ? '#f59e0b' : '#7c7bfa',
                  transition: 'all 0.4s ease',
                }}
              />
            </div>
          </div>

          {!!erro && (
            <div
              style={{
                marginBottom: 18,
                padding: 14,
                borderRadius: 12,
                background: 'rgba(248,113,113,0.10)',
                border: '1px solid rgba(248,113,113,0.25)',
                color: '#f87171',
                fontSize: 14,
              }}
            >
              {erro}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 14,
              marginBottom: 22,
            }}
          >
            {agentesStatus.map(agente => (
              <div
                key={agente.id}
                style={{
                  borderRadius: 16,
                  padding: 16,
                  border: `1px solid ${corFase(agente.fase)}55`,
                  background: agente.id === 'post_rapido'
                    ? 'rgba(50,38,10,0.85)'
                    : 'rgba(10,18,16,0.85)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.15) inset',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 8 }}>{agente.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{agente.nome}</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{agente.cargo}</div>
                <div style={{ fontSize: 12, color: corFase(agente.fase), marginTop: 6 }}>{agente.fase}</div>
                <div
                  style={{
                    fontSize: 12,
                    marginTop: 10,
                    color: corEstado(
                      agente.status === 'Concluído'
                        ? 'concluido'
                        : loading || loadingRapido
                          ? 'a_trabalhar'
                          : 'pendente'
                    ),
                  }}
                >
                  {agente.status}
                </div>
              </div>
            ))}
          </div>

          {FASES.map(fase => {
            const lista = tarefas.filter(t => t.fase === fase)
            if (!loading && !loadingRapido && lista.length === 0) return null

            return (
              <div key={fase} style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 10, fontWeight: 700, fontSize: 20, color: '#fff' }}>
                  {fase} ({loading || loadingRapido ? lista.length : resumo.find(r => r.fase === fase)?.total || 0})
                </div>

                {(loading || loadingRapido) && !lista.length && (
                  <div style={{ opacity: 0.7, fontSize: 14 }}>A equipa está a trabalhar...</div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {lista.map(t => (
                    <div
                      key={t.id}
                      style={{
                        borderRadius: 16,
                        border: '1px solid rgba(255,255,255,0.10)',
                        background: '#0e0f17',
                        padding: 18,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          flexWrap: 'wrap',
                          marginBottom: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16 }}>
                            {t.agente_nome} — {t.agente_cargo}
                          </div>
                          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                            {t.fase} • {t.titulo}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            background: t.estado === 'concluido' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                            border: `1px solid ${t.estado === 'concluido' ? 'rgba(34,197,94,0.30)' : 'rgba(245,158,11,0.30)'}`,
                            color: t.estado === 'concluido' ? '#22c55e' : '#f59e0b',
                            fontSize: 12,
                            fontWeight: 700,
                            height: 'fit-content',
                          }}
                        >
                          {t.estado === 'concluido' ? '✅ Concluído' : '⏳ A trabalhar'}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: 12,
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            background: '#141624',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 6 }}>Formato</div>
                          <div style={{ fontWeight: 600 }}>{t.formato || 'Post'}</div>
                        </div>

                        <div
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            background: '#141624',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 6 }}>Plataforma</div>
                          <div style={{ fontWeight: 600 }}>{t.plataforma || plataforma}</div>
                        </div>

                        <div
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            background: '#141624',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 6 }}>Hora sugerida</div>
                          <div style={{ fontWeight: 600 }}>{t.hora_sugerida || '09:00'}</div>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: 14,
                          borderRadius: 12,
                          background: '#141624',
                          border: '1px solid rgba(255,255,255,0.06)',
                          marginBottom: 12,
                        }}
                      >
                        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Conteúdo completo</div>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.65 }}>
                          {t.conteudo}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            padding: 14,
                            borderRadius: 12,
                            background: '#141624',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Legenda pronta</div>
                          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.55 }}>
                            {t.legenda || 'Sem legenda específica.'}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: 14,
                            borderRadius: 12,
                            background: '#141624',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Texto do criativo</div>
                          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.55 }}>
                            {t.texto_criativo || 'Sem texto específico para o criativo.'}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: 14,
                            borderRadius: 12,
                            background: '#141624',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Hashtags</div>
                          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.55 }}>
                            {t.hashtags || '#adpulse #marketingdigital'}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: 14,
                            borderRadius: 12,
                            background: '#141624',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>CTA</div>
                          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.55 }}>
                            {t.cta || 'Experimenta grátis na AdPulse.'}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: 14,
                          borderRadius: 12,
                          background: '#141624',
                          border: '1px solid rgba(255,255,255,0.06)',
                          marginTop: 12,
                        }}
                      >
                        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Prompt de imagem</div>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.55 }}>
                          {t.prompt_imagem || 'Criar um criativo moderno para redes sociais, dark mode, visual tech e profissional.'}
                        </div>
                      </div>

                      {!!imagemPorTarefa[t.id] && (
                        <div
                          style={{
                            marginTop: 14,
                            padding: 14,
                            borderRadius: 12,
                            background: '#111320',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>Imagem gerada</div>
                          <img
                            src={imagemPorTarefa[t.id]}
                            alt={t.titulo}
                            style={{
                              width: '100%',
                              maxWidth: 500,
                              borderRadius: 12,
                              border: '1px solid rgba(255,255,255,0.08)',
                              display: 'block',
                            }}
                          />
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                        <button
                          onClick={() =>
                            copiar(
                              `Título:
${t.titulo}

Conteúdo:
${stripMarkdown(t.conteudo)}

Legenda:
${stripMarkdown(t.legenda || '')}

Texto do criativo:
${stripMarkdown(t.texto_criativo || '')}

Hashtags:
${t.hashtags || ''}

CTA:
${stripMarkdown(t.cta || '')}

Prompt de imagem:
${stripMarkdown(t.prompt_imagem || '')}`,
                              t.id
                            )
                          }
                          style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.10)',
                            background: copiadoId === t.id ? 'rgba(34,197,94,0.12)' : '#151523',
                            color: copiadoId === t.id ? '#22c55e' : '#fff',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          {copiadoId === t.id ? '✅ Copiado' : '📋 Copiar conteúdo'}
                        </button>

                        <button
                          onClick={() => gerarImagem(t)}
                          disabled={gerandoImagemId === t.id || t.estado !== 'concluido'}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: 'none',
                            background: '#7c7bfa',
                            color: '#fff',
                            cursor: gerandoImagemId === t.id || t.estado !== 'concluido' ? 'not-allowed' : 'pointer',
                            fontWeight: 700,
                            opacity: gerandoImagemId === t.id || t.estado !== 'concluido' ? 0.7 : 1,
                          }}
                        >
                          {gerandoImagemId === t.id ? '🎨 A gerar imagem...' : '🎨 Gerar imagem'}
                        </button>

                        <button
                          onClick={() => guardarNoCalendario(t)}
                          disabled={guardandoId === t.id || t.estado !== 'concluido'}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: 'none',
                            background: '#14b8a6',
                            color: '#fff',
                            cursor: guardandoId === t.id || t.estado !== 'concluido' ? 'not-allowed' : 'pointer',
                            fontWeight: 700,
                            opacity: guardandoId === t.id || t.estado !== 'concluido' ? 0.7 : 1,
                          }}
                        >
                          {guardandoId === t.id ? '💾 A guardar...' : '💾 Guardar no calendário'}
                        </button>

                        <button
                          onClick={abrirInstagram}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.10)',
                            background: '#151523',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          📱 Ir ao Instagram
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </LayoutPainel>
    </>
  )
}

