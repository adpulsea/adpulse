import Head from 'next/head'
import { useEffect, useState } from 'react'
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

  const carregar = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const resp = await fetch('/api/ia/equipa-adpulse-executar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        nicho: 'marketing digital',
        plataforma: 'instagram',
        objetivo: 'crescer audiência e gerar leads',
      }),
    })

    const data = await resp.json()

    if (data.tarefas) {
      setTarefas(data.tarefas)
    }
  }

  const gerar = async () => {
    setLoading(true)
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
          
          <button
            onClick={gerar}
            style={{
              padding: 14,
              background: '#7c7bfa',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              marginBottom: 20,
              fontWeight: 'bold',
            }}
          >
            {loading ? 'A gerar equipa...' : '🚀 Gerar campanha do dia'}
          </button>

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
                <span style={{ color: '#22c55e', marginTop: 10, display: 'block' }}>
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
