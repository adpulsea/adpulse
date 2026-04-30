import Head from 'next/head'
import { useState } from 'react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { supabase } from '@/lib/supabase'

type Tarefa = {
  id: string
  agente_nome: string
  agente_cargo: string
  fase: string
  titulo: string
  conteudo: string
  estado: string
}

const fases = [
  'Inteligência',
  'Estratégia',
  'Criação',
  'Qualidade',
  'Execução',
  'Performance',
]

export default function AgentesIA() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [progresso, setProgresso] = useState(0)

  const gerar = async () => {
    if (loading) return

    setLoading(true)
    setErro('')
    setProgresso(0)
    setTarefas([])

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      setErro('Sessão inválida.')
      setLoading(false)
      return
    }

    try {
      const resp = await fetch('/api/ia/equipa-adpulse-executar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          nicho: 'marketing digital',
          plataforma: 'instagram',
          objetivo: 'crescer audiência',
        }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        setErro(data?.erro || 'Erro na geração')
        setLoading(false)
        return
      }

      if (data.tarefas) {
        // Simula chegada progressiva
        for (let i = 0; i < data.tarefas.length; i++) {
          await new Promise((r) => setTimeout(r, 120))
          setTarefas((prev) => [...prev, data.tarefas[i]])
          setProgresso(i + 1)
        }
      }
    } catch (e: any) {
      setErro(e?.message || 'Erro inesperado')
    }

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
      prev.map((t) =>
        t.id === id ? { ...t, estado: 'aprovado' } : t
      )
    )
  }

  const porFase = (fase: string) =>
    tarefas.filter((t) => t.fase === fase)

  return (
    <>
      <Head>
        <title>Equipa AdPulse PRO</title>
      </Head>

      <LayoutPainel titulo="Equipa AdPulse — PRO 🚀">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* BOTÃO */}
          <button
            onClick={gerar}
            disabled={loading}
            style={{
              padding: 16,
              background: '#7c7bfa',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              marginBottom: 20,
              fontWeight: 700,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? `🤖 Equipa a trabalhar... (${progresso}/13)`
              : '🚀 Gerar campanha PRO'}
          </button>

          {/* PROGRESS BAR */}
          {loading && (
            <div
              style={{
                height: 8,
                background: '#222',
                borderRadius: 10,
                marginBottom: 20,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(progresso / 13) * 100}%`,
                  height: '100%',
                  background: '#7c7bfa',
                  transition: 'all 0.3s',
                }}
              />
            </div>
          )}

          {/* ERRO */}
          {erro && <p style={{ color: 'red' }}>{erro}</p>}

          {/* FASES */}
          {fases.map((fase) => {
            const lista = porFase(fase)

            return (
              <div key={fase} style={{ marginBottom: 25 }}>
                <h3 style={{ marginBottom: 10 }}>
                  {fase} ({lista.length})
                </h3>

                {lista.length === 0 && loading && (
                  <p style={{ opacity: 0.5 }}>
                    A equipa está a trabalhar...
                  </p>
                )}

                {lista.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: '#111',
                      padding: 15,
                      borderRadius: 10,
                      marginBottom: 10,
                      border: '1px solid #333',
                    }}
                  >
                    <strong>{t.agente_nome}</strong>

                    <p style={{ fontSize: 12, opacity: 0.6 }}>
                      {t.titulo}
                    </p>

                    <p style={{ whiteSpace: 'pre-wrap' }}>
                      {t.conteudo}
                    </p>

                    {t.estado !== 'aprovado' && (
                      <button
                        onClick={() => aprovar(t.id)}
                        style={{
                          marginTop: 10,
                          background: '#22c55e',
                          border: 'none',
                          padding: 6,
                          color: '#fff',
                          borderRadius: 6,
                        }}
                      >
                        Aprovar
                      </button>
                    )}
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
