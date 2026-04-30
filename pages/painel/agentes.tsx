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
  criado_em: string
}

export default function AgentesIA() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [progresso, setProgresso] = useState(0)

  const carregar = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      setErro('Sessão inválida. Faz login novamente.')
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
          objetivo: 'crescer audiência e gerar leads',
        }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        setErro(data?.erro || data?.detalhe || 'Erro ao gerar conteúdo.')
        return
      }

      if (data.tarefas) {
        setTarefas(data.tarefas)
        setProgresso(data.tarefas.length)
      }
    } catch (e: any) {
      setErro(e?.message || 'Erro inesperado.')
    }
  }

  const gerar = async () => {
    if (loading) return

    setLoading(true)
    setErro('')
    setProgresso(0)
    setTarefas([])

    await carregar()

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

  return (
    <>
      <Head>
        <title>Equipa AdPulse</title>
      </Head>

      <LayoutPainel titulo="Equipa AdPulse — Agência IA">
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>

          {/* BOTÃO */}
          <button
            onClick={gerar}
            disabled={loading}
            style={{
              padding: 14,
              background: '#7c7bfa',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 20,
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? `🤖 Equipa a trabalhar... (${progresso}/13)`
              : '🚀 Gerar campanha do dia'}
          </button>

          {/* ERRO */}
          {erro && (
            <div
              style={{
                marginBottom: 20,
                padding: 12,
                borderRadius: 8,
                background: 'rgba(248,113,113,0.1)',
                color: '#f87171',
                border: '1px solid rgba(248,113,113,0.3)',
              }}
            >
              {erro}
            </div>
          )}

          {/* SEM RESULTADOS */}
          {!loading && tarefas.length === 0 && (
            <p style={{ opacity: 0.6 }}>
              Ainda não geraste conteúdo hoje.
            </p>
          )}

          {/* LISTA */}
          {tarefas.map((t) => (
            <div
              key={t.id}
              style={{
                background: '#111',
                padding: 20,
                borderRadius: 12,
                marginBottom: 15,
                border: '1px solid #333',
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <strong>{t.agente_nome}</strong> — {t.agente_cargo}
              </div>

              <div style={{ fontSize: 12, opacity: 0.6 }}>
                {t.fase} • {t.titulo}
              </div>

              <p style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>
                {t.conteudo}
              </p>

              {t.estado !== 'aprovado' && (
                <button
                  onClick={() => aprovar(t.id)}
                  style={{
                    marginTop: 10,
                    padding: '8px 12px',
                    background: '#22c55e',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Aprovar
                </button>
              )}

              {t.estado === 'aprovado' && (
                <span
                  style={{
                    color: '#22c55e',
                    marginTop: 10,
                    display: 'block',
                  }}
                >
                  ✔️ Aprovado
                </span>
              )}
            </div>
          ))}
        </div>
      </LayoutPainel>
    </>
  )
}
