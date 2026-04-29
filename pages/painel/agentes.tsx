import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Sparkles, Loader } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

type Tarefa = {
  id: string
  titulo: string
  estado: string
  resultado: string | null
}

export default function AgentesIA() {
  const { utilizador } = useAuth()

  const [plano, setPlano] = useState('gratuito')
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [gerando, setGerando] = useState(false)

  // 🔒 Buscar plano
  useEffect(() => {
    if (!utilizador) return

    const carregarPlano = async () => {
      const { data } = await supabase
        .from('perfis')
        .select('plano')
        .eq('id', utilizador.id)
        .single()

      if (data?.plano) setPlano(data.plano)
    }

    carregarPlano()
  }, [utilizador])

  // 🚀 Gerar conteúdo (VERSÃO ANTIGA QUE FUNCIONA)
  const gerarConteudo = async () => {
    if (!utilizador) return

    setGerando(true)

    const tarefasBase = [
      'Plano de conteúdo',
      'Legenda Instagram',
      'Guião Reel',
      'Hashtags',
      'Briefing visual',
    ]

    for (let i = 0; i < tarefasBase.length; i++) {
      const titulo = tarefasBase[i]

      const nova = {
        id: Date.now() + i + '',
        titulo,
        estado: 'a_gerar',
        resultado: null,
      }

      setTarefas((prev) => [nova, ...prev])

      try {
        const res = await fetch('/api/ia/agente-executar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt_sistema: 'És um especialista em marketing digital.',
            tarefa: titulo,
          }),
        })

        const data = await res.json()

        setTarefas((prev) =>
          prev.map((t) =>
            t.id === nova.id
              ? { ...t, estado: 'feito', resultado: data.resultado }
              : t
          )
        )
      } catch {
        setTarefas((prev) =>
          prev.map((t) =>
            t.id === nova.id
              ? { ...t, estado: 'erro', resultado: 'Erro ao gerar.' }
              : t
          )
        )
      }
    }

    setGerando(false)
  }

  return (
    <>
      <Head>
        <title>Agentes IA — AdPulse</title>
      </Head>

      <LayoutPainel titulo="Agentes IA">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">

          {/* BOTÃO */}
          <button
            onClick={plano === 'agencia' ? gerarConteudo : undefined}
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
              <>🔒 Só plano Agência</>
            )}
          </button>

          {/* LISTA */}
          <div className="flex flex-col gap-3">
            {tarefas.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border"
                style={{
                  background: '#0a0a0f',
                  borderColor: '#222',
                }}
              >
                <p className="font-semibold">{t.titulo}</p>

                <p className="text-xs opacity-60">
                  {t.estado === 'a_gerar' && 'A gerar...'}
                  {t.estado === 'feito' && 'Concluído'}
                  {t.estado === 'erro' && 'Erro'}
                </p>

                {t.resultado && (
                  <pre className="mt-2 text-sm whitespace-pre-wrap">
                    {t.resultado}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </LayoutPainel>
    </>
  )
}
