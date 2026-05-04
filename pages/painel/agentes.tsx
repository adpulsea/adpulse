import Head from 'next/head'
import { useState } from 'react'
import type { CSSProperties } from 'react'
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

const AGENTES = [
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

const FASES = [
  'Criação Rápida',
  'Inteligência',
  'Estratégia',
  'Criação',
  'Qualidade',
  'Execução',
  'Performance',
]

function corFase(fase: string) {
  if (fase === 'Criação Rápida') return '#f59e0b'
  if (fase === 'Inteligência') return '#22c55e'
  if (fase === 'Estratégia') return '#8b5cf6'
  if (fase === 'Criação') return '#ec4899'
  if (fase === 'Qualidade') return '#f59e0b'
  if (fase === 'Execução') return '#06b6d4'
  if (fase === 'Performance') return '#3b82f6'
  return '#7c7bfa'
}

function limparTexto(texto?: string) {
  return (texto || '')
    .replace(/[*_`>#-]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function hashtagsParaArray(hashtags?: string) {
  if (!hashtags) return []
  return hashtags
    .split(/\s+/)
    .map((h) => h.trim())
    .filter(Boolean)
    .map((h) => (h.startsWith('#') ? h : `#${h}`))
}

function horaValida(hora?: string) {
  if (!hora) return '09:00'
  return /^\d{2}:\d{2}$/.test(hora) ? hora : '09:00'
}

function dataComHora(hora?: string) {
  const agora = new Date()
  const [h, m] = horaValida(hora).split(':')

  const data = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate(),
    parseInt(h, 10),
    parseInt(m, 10),
    0,
    0
  )

  if (data.getTime() < agora.getTime()) {
    data.setDate(data.getDate() + 1)
  }

  return data.toISOString()
}

export default function AgentesIA() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [nicho, setNicho] = useState('marketing digital')
  const [plataforma, setPlataforma] = useState('instagram')
  const [objetivo, setObjetivo] = useState('crescer audiência e gerar leads')
  const [loadingRapido, setLoadingRapido] = useState(false)
  const [loadingGod, setLoadingGod] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [imagens, setImagens] = useState<Record<string, string>>({})
  const [gerandoImagem, setGerandoImagem] = useState<string | null>(null)
  const [guardando, setGuardando] = useState<string | null>(null)
  const [copiado, setCopiado] = useState<string | null>(null)

  const mostrarMensagem = (texto: string) => {
    setMensagem(texto)
    setTimeout(() => setMensagem(''), 4500)
  }

  const criarPlaceholderRapido = (): Tarefa => ({
    id: 'post_rapido_loading',
    agente_id: 'post_rapido',
    agente_nome: 'Post Rápido',
    agente_cargo: 'Criador Instantâneo',
    fase: 'Criação Rápida',
    titulo: 'A criar post rápido...',
    conteudo: 'A AdPulse está a criar um post pronto a publicar.',
    estado: 'a_trabalhar',
    formato: 'Post',
    plataforma,
    legenda: '',
    texto_criativo: '',
    hashtags: '',
    cta: '',
    prompt_imagem: '',
    hora_sugerida: '16:25',
  })

  const gerarPostRapido = async () => {
    if (loadingRapido || loadingGod) return

    setErro('')
    setMensagem('')
    setImagens({})
    setLoadingRapido(true)
    setTarefas([criarPlaceholderRapido()])

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
        throw new Error(data?.erro || data?.error || 'Erro ao gerar post rápido.')
      }

      const post = data?.post || data

      const tarefa: Tarefa = {
        id: `post_rapido_${Date.now()}`,
        agente_id: 'post_rapido',
        agente_nome: 'Post Rápido',
        agente_cargo: 'Criador Instantâneo',
        fase: 'Criação Rápida',
        titulo: post?.titulo || 'Post rápido AdPulse',
        conteudo:
          post?.conteudo ||
          `Post rápido para ${plataforma}, nicho ${nicho}, objetivo ${objetivo}.`,
        estado: 'concluido',
        formato: post?.formato || 'Post',
        plataforma: post?.plataforma || plataforma,
        legenda: post?.legenda || '',
        texto_criativo: post?.texto_criativo || '',
        hashtags: post?.hashtags || '',
        cta: post?.cta || '',
        prompt_imagem: post?.prompt_imagem || '',
        hora_sugerida: post?.hora_sugerida || '16:25',
      }

      setTarefas([tarefa])
      mostrarMensagem('Post rápido criado com sucesso.')
    } catch (e: any) {
      setErro(e?.message || 'Erro ao gerar post rápido.')
      setTarefas([])
    } finally {
      setLoadingRapido(false)
    }
  }

  const gerarCampanhaGodMode = async () => {
    if (loadingRapido || loadingGod) return

    setErro('')
    setMensagem('')
    setImagens({})
    setLoadingGod(true)

    const placeholders: Tarefa[] = AGENTES.filter((a) => a.id !== 'post_rapido').map((agente) => ({
      id: `${agente.id}_loading`,
      agente_id: agente.id,
      agente_nome: agente.nome,
      agente_cargo: agente.cargo,
      fase: agente.fase,
      titulo: 'A preparar...',
      conteudo: 'Este agente está a trabalhar na campanha.',
      estado: 'a_trabalhar',
      formato: 'Post',
      plataforma,
      legenda: '',
      texto_criativo: '',
      hashtags: '',
      cta: '',
      prompt_imagem: '',
      hora_sugerida: '16:25',
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
        throw new Error(data?.erro || data?.error || 'Erro ao gerar campanha.')
      }

      if (!Array.isArray(data?.tarefas)) {
        throw new Error('A API não devolveu tarefas válidas.')
      }

      setTarefas(data.tarefas)
      mostrarMensagem('Campanha GOD MODE criada com sucesso.')
    } catch (e: any) {
      setErro(e?.message || 'Erro ao gerar campanha GOD MODE.')
      setTarefas([])
    } finally {
      setLoadingGod(false)
    }
  }

  const gerarImagem = async (tarefa: Tarefa) => {
    if (tarefa.estado !== 'concluido') return

    setGerandoImagem(tarefa.id)

    try {
      const resp = await fetch('/api/ia/gerar-imagem-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: tarefa.titulo,
          conteudo: tarefa.conteudo,
          legenda: tarefa.legenda,
          texto_criativo: tarefa.texto_criativo,
          cta: tarefa.cta,
          prompt_imagem: tarefa.prompt_imagem,
          plataforma: tarefa.plataforma || plataforma,
          formato: tarefa.formato || 'Post',
          nicho,
          objetivo,
        }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data?.erro || data?.error || 'Erro ao gerar imagem.')
      }

      const imagem = data?.imagem_url || data?.imagem

      if (!imagem) {
        throw new Error('A API não devolveu imagem.')
      }

      setImagens((prev) => ({
        ...prev,
        [tarefa.id]: imagem,
      }))

      mostrarMensagem('Imagem relacionada criada e guardada com URL pública.')
    } catch (e: any) {
      alert(e?.message || 'Erro ao gerar imagem.')
    } finally {
      setGerandoImagem(null)
    }
  }

  const guardarNoCalendario = async (tarefa: Tarefa) => {
    if (tarefa.estado !== 'concluido') return

    setGuardando(tarefa.id)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const utilizadorId = session?.user?.id

      if (!utilizadorId) {
        throw new Error('Sessão não encontrada. Faz login novamente.')
      }

      const temImagem = !!imagens[tarefa.id]

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
        imagem_url: temImagem ? imagens[tarefa.id] : null,
        criado_em: dataComHora(tarefa.hora_sugerida),
      })

      if (error) throw error

      if (temImagem) {
        mostrarMensagem('Conteúdo com imagem guardado no calendário.')
      } else {
        mostrarMensagem('Conteúdo guardado no calendário sem imagem. Para publicar automaticamente no Instagram, gera uma imagem primeiro.')
      }
    } catch (e: any) {
      alert(e?.message || 'Erro ao guardar no calendário.')
    } finally {
      setGuardando(null)
    }
  }

  const copiarConteudo = async (tarefa: Tarefa) => {
    const texto = `TÍTULO:
${tarefa.titulo}

LEGENDA:
${limparTexto(tarefa.legenda || tarefa.conteudo)}

TEXTO DO CRIATIVO:
${limparTexto(tarefa.texto_criativo || '')}

HASHTAGS:
${tarefa.hashtags || ''}

CTA:
${limparTexto(tarefa.cta || '')}

PROMPT DE IMAGEM:
${limparTexto(tarefa.prompt_imagem || '')}

IMAGEM:
${imagens[tarefa.id] || 'Sem imagem.'}`

    await navigator.clipboard.writeText(texto)
    setCopiado(tarefa.id)
    setTimeout(() => setCopiado(null), 2000)
  }

  const copiarTudo = async () => {
    const texto = tarefas
      .map((t) => `${t.agente_nome} — ${t.titulo}\n\n${t.legenda || t.conteudo}\n\n${t.hashtags || ''}\n\nImagem: ${imagens[t.id] || '-'}`)
      .join('\n\n-----------------------\n\n')

    await navigator.clipboard.writeText(texto)
    mostrarMensagem('Tudo copiado.')
  }

  const abrirInstagram = () => {
    window.open('https://www.instagram.com/', '_blank')
  }

  return (
    <>
      <Head>
        <title>Equipa AdPulse — Conteúdo com IA</title>
      </Head>

      <LayoutPainel titulo="Equipa AdPulse — POST RÁPIDO ATIVO ⚡">
        <div style={{ maxWidth: 1250, margin: '0 auto' }}>
          <div style={heroStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
                  ⚡ AdPulse — Criador de Conteúdo Rápido
                </div>
                <div style={{ opacity: 0.75, fontSize: 14 }}>
                  Gera posts rápidos, guarda sem imagem ou cria uma imagem IA relacionada com o texto.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={gerarPostRapido}
                  disabled={loadingRapido || loadingGod}
                  style={buttonStyle('#f59e0b', loadingRapido || loadingGod)}
                >
                  {loadingRapido ? '⚡ A criar...' : '⚡ Gerar post rápido'}
                </button>

                <button
                  onClick={gerarCampanhaGodMode}
                  disabled={loadingRapido || loadingGod}
                  style={buttonStyle('#7c7bfa', loadingRapido || loadingGod)}
                >
                  {loadingGod ? '🤖 Equipa a trabalhar...' : '🚀 Gerar campanha GOD MODE'}
                </button>

                <button
                  onClick={copiarTudo}
                  disabled={!tarefas.length}
                  style={buttonStyle('#151523', !tarefas.length)}
                >
                  📋 Copiar tudo
                </button>

                <button onClick={abrirInstagram} style={buttonStyle('#151523')}>
                  📱 Abrir Instagram
                </button>
              </div>
            </div>

            <div style={inputGridStyle}>
              <div>
                <div style={labelStyle}>Nicho</div>
                <input value={nicho} onChange={(e) => setNicho(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <div style={labelStyle}>Plataforma</div>
                <select value={plataforma} onChange={(e) => setPlataforma(e.target.value)} style={inputStyle}>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>

              <div>
                <div style={labelStyle}>Objetivo</div>
                <input value={objetivo} onChange={(e) => setObjetivo(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={progressTrackStyle}>
              <div
                style={{
                  width: loadingRapido || loadingGod ? '45%' : tarefas.length ? '100%' : '0%',
                  height: '100%',
                  background: loadingRapido ? '#f59e0b' : '#7c7bfa',
                  transition: 'all 0.4s ease',
                }}
              />
            </div>
          </div>

          {mensagem && <div style={successStyle}>{mensagem}</div>}
          {erro && <div style={errorStyle}>{erro}</div>}

          <div style={agentsGridStyle}>
            {AGENTES.map((agente) => {
              const tarefa = tarefas.find((t) => t.agente_id === agente.id)
              const ativo = (loadingRapido && agente.id === 'post_rapido') || (loadingGod && agente.id !== 'post_rapido')

              return (
                <div
                  key={agente.id}
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    border: `1px solid ${corFase(agente.fase)}55`,
                    background: agente.id === 'post_rapido' ? 'rgba(50,38,10,0.85)' : 'rgba(10,18,16,0.85)',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{agente.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{agente.nome}</div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{agente.cargo}</div>
                  <div style={{ fontSize: 12, color: corFase(agente.fase), marginTop: 6 }}>{agente.fase}</div>
                  <div
                    style={{
                      fontSize: 12,
                      marginTop: 10,
                      color: tarefa?.estado === 'concluido' ? '#22c55e' : ativo ? '#f59e0b' : '#94a3b8',
                    }}
                  >
                    {tarefa?.estado === 'concluido' ? '✅ Concluído' : ativo ? '⏳ A trabalhar...' : 'Pronto'}
                  </div>
                </div>
              )
            })}
          </div>

          {FASES.map((fase) => {
            const lista = tarefas.filter((t) => t.fase === fase)
            if (!lista.length) return null

            return (
              <div key={fase} style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 20, marginBottom: 12 }}>
                  {fase} ({lista.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {lista.map((tarefa) => {
                    const temImagem = !!imagens[tarefa.id]

                    return (
                      <div key={tarefa.id} style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 17 }}>
                              {tarefa.agente_nome} — {tarefa.agente_cargo}
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>
                              {tarefa.fase} • {tarefa.titulo}
                            </div>
                          </div>

                          <div style={statusStyle(tarefa.estado)}>
                            {tarefa.estado === 'concluido' ? '✅ Concluído' : '⏳ A trabalhar'}
                          </div>
                        </div>

                        <div style={infoGridStyle}>
                          <InfoBox label="Formato" value={tarefa.formato || 'Post'} />
                          <InfoBox label="Plataforma" value={tarefa.plataforma || plataforma} />
                          <InfoBox label="Hora sugerida" value={tarefa.hora_sugerida || '16:25'} />
                          <InfoBox label="Imagem" value={temImagem ? 'Gerada' : 'Opcional'} />
                        </div>

                        <ContentBox label="Conteúdo completo" value={tarefa.conteudo} />
                        <ContentBox label="Legenda pronta" value={tarefa.legenda || 'Sem legenda específica.'} />
                        <ContentBox label="Texto do criativo" value={tarefa.texto_criativo || 'Sem texto específico.'} />
                        <ContentBox label="Hashtags" value={tarefa.hashtags || '#adpulse #marketingdigital'} />
                        <ContentBox label="CTA" value={tarefa.cta || 'Experimenta a AdPulse.'} />
                        <ContentBox label="Prompt de imagem" value={tarefa.prompt_imagem || 'Criar imagem relacionada com o conteúdo, sem texto escrito na imagem.'} />

                        {temImagem && (
                          <div style={imageBoxStyle}>
                            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>Imagem IA relacionada</div>
                            <img
                              src={imagens[tarefa.id]}
                              alt={tarefa.titulo}
                              style={{
                                width: '100%',
                                maxWidth: 500,
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.08)',
                                display: 'block',
                                background: '#050510',
                              }}
                            />
                            <div style={{ fontSize: 11, opacity: 0.65, marginTop: 8, wordBreak: 'break-all' }}>
                              {imagens[tarefa.id]}
                            </div>
                          </div>
                        )}

                        {!temImagem && (
                          <div style={warningStyle}>
                            Podes guardar este conteúdo sem imagem. Para publicação automática no Instagram, vais precisar de gerar imagem antes.
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                          <button onClick={() => copiarConteudo(tarefa)} style={buttonStyle('#151523')}>
                            {copiado === tarefa.id ? '✅ Copiado' : '📋 Copiar conteúdo'}
                          </button>

                          <button
                            onClick={() => gerarImagem(tarefa)}
                            disabled={gerandoImagem === tarefa.id || tarefa.estado !== 'concluido'}
                            style={buttonStyle('#7c7bfa', gerandoImagem === tarefa.id || tarefa.estado !== 'concluido')}
                          >
                            {gerandoImagem === tarefa.id ? '🎨 A gerar...' : '🎨 Gerar imagem IA'}
                          </button>

                          <button
                            onClick={() => guardarNoCalendario(tarefa)}
                            disabled={guardando === tarefa.id || tarefa.estado !== 'concluido'}
                            style={buttonStyle(temImagem ? '#14b8a6' : '#334155', guardando === tarefa.id || tarefa.estado !== 'concluido')}
                          >
                            {guardando === tarefa.id
                              ? '💾 A guardar...'
                              : temImagem
                                ? '💾 Guardar com imagem'
                                : '💾 Guardar sem imagem'}
                          </button>

                          <button onClick={abrirInstagram} style={buttonStyle('#151523')}>
                            📱 Ir ao Instagram
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </LayoutPainel>
    </>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoBoxStyle}>
      <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 6 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  )
}

function ContentBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={contentBoxStyle}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>{label}</div>
      <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.6 }}>
        {value}
      </div>
    </div>
  )
}

function buttonStyle(background: string, disabled = false): CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: 10,
    border: background === '#151523' || background === '#334155' ? '1px solid rgba(255,255,255,0.10)' : 'none',
    background,
    color: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 800,
    opacity: disabled ? 0.6 : 1,
  }
}

function statusStyle(estado: string): CSSProperties {
  return {
    padding: '6px 10px',
    borderRadius: 999,
    background: estado === 'concluido' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
    border: estado === 'concluido' ? '1px solid rgba(34,197,94,0.30)' : '1px solid rgba(245,158,11,0.30)',
    color: estado === 'concluido' ? '#22c55e' : '#f59e0b',
    fontSize: 12,
    fontWeight: 800,
    height: 'fit-content',
  }
}

const heroStyle: CSSProperties = {
  border: '1px solid rgba(124,123,250,0.35)',
  borderRadius: 18,
  padding: 20,
  background: 'linear-gradient(180deg, rgba(124,123,250,0.13), rgba(10,10,15,0.95))',
  marginBottom: 20,
}

const inputGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
  marginTop: 18,
}

const labelStyle: CSSProperties = {
  fontSize: 12,
  opacity: 0.65,
  marginBottom: 6,
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: 12,
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#10101a',
  color: '#fff',
  outline: 'none',
}

const progressTrackStyle: CSSProperties = {
  height: 6,
  borderRadius: 999,
  background: 'rgba(255,255,255,0.08)',
  marginTop: 18,
  overflow: 'hidden',
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

const errorStyle: CSSProperties = {
  marginBottom: 18,
  padding: 14,
  borderRadius: 12,
  background: 'rgba(248,113,113,0.10)',
  border: '1px solid rgba(248,113,113,0.28)',
  color: '#f87171',
  fontSize: 14,
}

const warningStyle: CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 12,
  background: 'rgba(245,158,11,0.10)',
  border: '1px solid rgba(245,158,11,0.28)',
  color: '#fbbf24',
  fontSize: 13,
}

const agentsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
  gap: 14,
  marginBottom: 24,
}

const cardStyle: CSSProperties = {
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#0e0f17',
  padding: 18,
}

const infoGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
  marginTop: 16,
  marginBottom: 14,
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

const imageBoxStyle: CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 12,
  background: '#111320',
  border: '1px solid rgba(255,255,255,0.08)',
}
