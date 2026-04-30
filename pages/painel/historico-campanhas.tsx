import Head from 'next/head'
import { useEffect, useState } from 'react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { supabase } from '@/lib/supabase'

type Execucao = {
  id: string
  nicho: string
  plataforma: string
  objetivo: string
  estado: string
  criado_em: string
}

type Tarefa = {
  id: string
  execucao_id: string
  agente_nome: string
  agente_cargo: string
  fase: string
  titulo: string
  conteudo: string
  estado: string
}

export default function HistoricoCampanhas() {
  const [execucoes, setExecucoes] = useState<Execucao[]>([])
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [ativa, setAtiva] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregar()
  }, [])

  const carregar = async () => {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) {
      setLoading(false)
      return
    }

    const { data: execs } = await supabase
      .from('equipa_adpulse_execucoes')
      .select('*')
      .eq('utilizador_id', user.id)
      .order('criado_em', { ascending: false })

    const { data: tasks } = await supabase
      .from('equipa_adpulse_tarefas')
      .select('*')
      .eq('utilizador_id', user.id)
      .order('criado_em', { ascending: true })

    setExecucoes((execs || []) as Execucao[])
    setTarefas((tasks || []) as Tarefa[])
    setAtiva(execs?.[0]?.id || null)
    setLoading(false)
  }

  const tarefasDaCampanha = tarefas.filter((t) => t.execucao_id === ativa)

  const copiarCampanha = async () => {
    const texto = tarefasDaCampanha
      .map((t) => `## ${t.agente_nome} — ${t.titulo}\n\n${t.conteudo}`)
      .join('\n\n---\n\n')

    await navigator.clipboard.writeText(texto)
  }

  return (
    <>
      <Head>
        <title>Histórico de Campanhas — AdPulse</title>
      </Head>

      <LayoutPainel titulo="Histórico de Campanhas">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            📚 Histórico de Campanhas
          </h2>

          <p style={{ opacity: 0.65, marginBottom: 24 }}>
            Todas as campanhas criadas pela Equipa AdPulse ficam guardadas aqui.
          </p>

          {loading && <p>A carregar histórico...</p>}

          {!loading && execucoes.length === 0 && (
            <div style={card}>
              Ainda não tens campanhas guardadas.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
            <div>
              {execucoes.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setAtiva(e.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 14,
                    marginBottom: 10,
                    borderRadius: 12,
                    cursor: 'pointer',
                    background: ativa === e.id ? 'rgba(124,123,250,0.18)' : '#111',
                    border: ativa === e.id
                      ? '1px solid rgba(124,123,250,0.6)'
                      : '1px solid #333',
                    color: '#fff',
                  }}
                >
                  <strong>{e.nicho || 'Campanha'}</strong>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                    {e.plataforma} • {e.estado}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.45, marginTop: 4 }}>
                    {new Date(e.criado_em).toLocaleString('pt-PT')}
                  </div>
                </button>
              ))}
            </div>

            <div>
              {ativa && (
                <button onClick={copiarCampanha} style={botao}>
                  📋 Copiar campanha
                </button>
              )}

              {tarefasDaCampanha.map((t) => (
                <div key={t.id} style={card}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>{t.agente_nome}</strong> — {t.agente_cargo}
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 12 }}>
                    {t.fase} • {t.titulo} • {t.estado}
                  </div>

                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {t.conteudo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </LayoutPainel>
    </>
  )
}

const card: React.CSSProperties = {
  background: '#111',
  padding: 18,
  borderRadius: 14,
  marginBottom: 14,
  border: '1px solid #333',
}

const botao: React.CSSProperties = {
  padding: '12px 16px',
  background: '#7c7bfa',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  fontWeight: 700,
  marginBottom: 16,
}
