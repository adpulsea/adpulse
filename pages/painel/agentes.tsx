import Head from 'next/head'
import { useState } from 'react'
import LayoutPainel from '@/components/layout/LayoutPainel'

type Tarefa = {
  id: string
  titulo: string
  resultado: string
  estado: 'pendente' | 'concluido'
}

type Agente = {
  id: string
  nome: string
  prompt: string
  tarefas: Tarefa[]
}

const AGENTES_BASE: Agente[] = [
  {
    id: 'copy',
    nome: 'Copywriter',
    prompt: 'És um copywriter especialista em redes sociais. Cria conteúdo viral.',
    tarefas: [],
  },
  {
    id: 'video',
    nome: 'Criador de Vídeo',
    prompt: 'És especialista em guiões para Reels e TikTok.',
    tarefas: [],
  },
  {
    id: 'estrategia',
    nome: 'Estrategista',
    prompt: 'És especialista em estratégia de conteúdo para redes sociais.',
    tarefas: [],
  },
]

export default function AgentesIA() {
  const [agentes, setAgentes] = useState<Agente[]>(AGENTES_BASE)
  const [loading, setLoading] = useState(false)

  const gerarConteudo = async () => {
    setLoading(true)

    const novosAgentes = [...agentes]

    for (let agente of novosAgentes) {
      try {
        const resp = await fetch('/api/ia/agente-executar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt_sistema: agente.prompt,
            tarefa: 'Cria conteúdo para hoje para redes sociais',
          }),
        })

        const data = await resp.json()

        if (!resp.ok) throw new Error()

        agente.tarefas.unshift({
          id: Date.now().toString(),
          titulo: 'Conteúdo do dia',
          resultado: data.resultado,
          estado: 'concluido',
        })
      } catch {
        agente.tarefas.unshift({
          id: Date.now().toString(),
          titulo: 'Erro',
          resultado: 'Erro ao gerar conteúdo',
          estado: 'concluido',
        })
      }
    }

    setAgentes([...novosAgentes])
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Agentes IA — AdPulse</title>
      </Head>

      <LayoutPainel titulo="Agentes IA">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          
          <button
            onClick={gerarConteudo}
            style={{
              padding: '12px 20px',
              background: '#7c7bfa',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              marginBottom: 20,
            }}
          >
            {loading ? 'A gerar...' : 'Gerar conteúdo do dia'}
          </button>

          {agentes.map((agente) => (
            <div
              key={agente.id}
              style={{
                background: '#111',
                padding: 20,
                borderRadius: 12,
                marginBottom: 15,
                border: '1px solid #333',
              }}
            >
              <h3>{agente.nome}</h3>

              {agente.tarefas.length === 0 && (
                <p style={{ opacity: 0.6 }}>Sem tarefas ainda</p>
              )}

              {agente.tarefas.map((t) => (
                <div
                  key={t.id}
                  style={{
                    marginTop: 10,
                    padding: 10,
                    background: '#1a1a1a',
                    borderRadius: 8,
                  }}
                >
                  <strong>{t.titulo}</strong>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: 5 }}>
                    {t.resultado}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </LayoutPainel>
    </>
  )
}
