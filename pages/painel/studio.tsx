// ============================================
// AdPulse — AI Content Studio (COM GUARDAR)
// ============================================

import Head from 'next/head'
import { useState, useEffect } from 'react'
import {
  Sparkles,
  Copy,
  RefreshCw,
  Hash,
  Zap,
  TrendingUp,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader,
  Save,
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { usePlano } from '@/hooks/usePlano'

// ================== CONFIG ==================

const FORMATOS = [
  { id: 'reel', label: 'Reel', emoji: '🎬' },
  { id: 'carrossel', label: 'Carrossel', emoji: '📸' },
  { id: 'story', label: 'Story', emoji: '⭕' },
  { id: 'post', label: 'Post', emoji: '🖼️' },
  { id: 'short', label: 'Short', emoji: '▶️' },
]

const PLATAFORMAS = [
  { id: 'instagram', label: 'Instagram', cor: '#E1306C' },
  { id: 'tiktok', label: 'TikTok', cor: '#00f2ea' },
  { id: 'youtube', label: 'YouTube', cor: '#FF0000' },
  { id: 'linkedin', label: 'LinkedIn', cor: '#0077B5' },
]

const MODOS = [
  { id: 'normal', label: 'Normal', emoji: '✨' },
  { id: 'viral', label: 'Viral', emoji: '🔥' },
  { id: 'autoridade', label: 'Autoridade', emoji: '👑' },
  { id: 'polemico', label: 'Polémico', emoji: '⚡' },
  { id: 'educativo', label: 'Educativo', emoji: '🎓' },
]

// ================== TIPOS ==================

type ResultadoIA = {
  hook: string
  legenda: string
  hashtags: string[]
  slides: { tipo: string; conteudo: string }[]
}

// ================== COMPONENTE ==================

export default function StudioConteudo() {
  const { utilizador } = useAuth()
  const { isPro } = usePlano()

  const [topico, setTopico] = useState('')
  const [formato, setFormato] = useState('reel')
  const [plataforma, setPlataforma] = useState('instagram')
  const [modo, setModo] = useState('viral')

  const [resultado, setResultado] = useState<ResultadoIA | null>(null)

  const [carregando, setCarregando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensagem, setMensagem] = useState('')

// ================== GERAR ==================

  const gerarConteudo = async () => {
    if (!topico) return

    setCarregando(true)
    setMensagem('')

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/ia/gerar-conteudo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
        body: JSON.stringify({
          topico,
          formato,
          plataforma,
          modo,
        }),
      })

      const data = await res.json()
      setResultado(data)

    } catch {
      setMensagem('Erro ao gerar conteúdo')
    } finally {
      setCarregando(false)
    }
  }

// ================== GUARDAR ==================

  const guardarConteudo = async () => {
    if (!resultado || !utilizador) return

    setGuardando(true)
    setMensagem('')

    try {
      const { error } = await supabase.from('conteudos_guardados').insert({
        utilizador_id: utilizador.id,
        topico,
        formato,
        plataforma,
        modo,
        hook: resultado.hook,
        legenda: resultado.legenda,
        hashtags: resultado.hashtags,
        slides: resultado.slides,
      })

      if (error) throw error

      setMensagem('✅ Conteúdo guardado com sucesso')

    } catch {
      setMensagem('❌ Erro ao guardar')
    } finally {
      setGuardando(false)
    }
  }

// ================== UI ==================

  return (
    <>
      <Head>
        <title>AI Content Studio — AdPulse</title>
      </Head>

      <LayoutPainel titulo="AI Content Studio">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          {/* INPUT */}
          <div className="card flex flex-col gap-4">
            <textarea
              value={topico}
              onChange={(e) => setTopico(e.target.value)}
              placeholder="Sobre o que queres criar conteúdo?"
              className="input-campo"
            />

            {/* MODOS */}
            <div className="flex gap-2 flex-wrap">
              {MODOS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModo(m.id)}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: modo === m.id ? '#7c7bfa' : '#111',
                    color: modo === m.id ? '#fff' : '#aaa',
                  }}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={gerarConteudo}
              className="btn-primario"
            >
              {carregando ? 'A gerar...' : 'Gerar conteúdo'}
            </button>
          </div>

          {/* RESULTADO */}
          {resultado && (
            <div className="card flex flex-col gap-4">

              <h3>Hook</h3>
              <p>{resultado.hook}</p>

              <h3>Legenda</h3>
              <p>{resultado.legenda}</p>

              <h3>Hashtags</h3>
              <p>{resultado.hashtags.join(' ')}</p>

              {/* BOTÃO GUARDAR */}
              <button
                onClick={guardarConteudo}
                disabled={guardando}
                className="btn-primario flex items-center gap-2 justify-center"
              >
                <Save size={16} />
                {guardando ? 'A guardar...' : 'Guardar na biblioteca'}
              </button>

              {mensagem && (
                <p style={{ textAlign: 'center' }}>{mensagem}</p>
              )}
            </div>
          )}
        </div>
      </LayoutPainel>
    </>
  )
}
