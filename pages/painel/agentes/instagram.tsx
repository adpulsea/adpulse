// ============================================
// AdPulse — Agente de Conteúdo Instagram
// ============================================

import Head from 'next/head'
import { useState } from 'react'
import {
  Sparkles, Loader, Copy, Check, Calendar,
  TrendingUp, Image as ImageIcon, Hash, Zap,
  ChevronDown, ChevronUp, RefreshCw, Send
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'

type PostSemana = {
  dia: string
  hora: string
  formato: string
  tema: string
  hook: string
  legenda: string
  hashtags: string[]
  sugestao_imagem: string
  score_viral: number
}

type PlanoSemanal = {
  estrategia: string
  objetivo_semana: string
  dica_crescimento: string
  posts: PostSemana[]
}

const TEMAS_SUGERIDOS = [
  'Lançamento de funcionalidade',
  'Dica de criação de conteúdo',
  'Bastidores da AdPulse',
  'Testemunho de cliente',
  'Tendência viral da semana',
  'Tutorial rápido',
  'Motivação para criadores',
  'Comparação antes/depois de usar IA',
]

const OBJETIVOS = [
  'Crescer seguidores',
  'Aumentar engagement',
  'Gerar leads para a app',
  'Mostrar funcionalidades',
  'Construir comunidade',
]

export default function AgenteInstagram() {
  const { utilizador } = useAuth()
  const [objetivo, setObjetivo]     = useState('Gerar leads para a app')
  const [foco, setFoco]             = useState('')
  const [carregando, setCarr]       = useState(false)
  const [plano, setPlano]           = useState<PlanoSemanal | null>(null)
  const [expandido, setExpand]      = useState<number | null>(0)
  const [copiado, setCopiado]       = useState<string | null>(null)
  const [progresso, setProgresso]   = useState(0)

  const copiar = (texto: string, chave: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(chave)
    setTimeout(() => setCopiado(null), 2000)
  }

  const gerarPlano = async () => {
    setCarr(true)
    setPlano(null)
    setProgresso(0)

    // Simular progresso
    const intervalo = setInterval(() => {
      setProgresso(p => {
        if (p >= 90) { clearInterval(intervalo); return 90 }
        return p + Math.random() * 15
      })
    }, 400)

    try {
      const r = await fetch('/api/ia/agente-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objetivo, foco }),
      })
      const d = await r.json()
      clearInterval(intervalo)
      setProgresso(100)
      if (d.plano) {
        setPlano(d.plano)
        setExpand(0)
      }
    } catch (err) {
      console.error(err)
      clearInterval(intervalo)
    }
    setCarr(false)
  }

  const COR_FORMATO: Record<string, string> = {
    'Reel':      '#7c7bfa',
    'Carrossel': '#c084fc',
    'Story':     '#f472b6',
    'Post':      '#34d399',
  }

  return (
    <>
      <Head><title>Agente Instagram — AdPulse</title></Head>
      <LayoutPainel titulo="Agente Instagram AdPulse">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,123,250,0.1), rgba(192,132,252,0.1))', border: '1px solid rgba(124,123,250,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c7bfa, #c084fc)' }}>
                <span style={{ fontSize: 26 }}>📸</span>
              </div>
              <div>
                <h2 className="font-bold text-xl" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Agente de Conteúdo Instagram
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                  Cria um plano semanal completo para o Instagram da AdPulse — posts, hooks, legendas e estratégia de crescimento.
                </p>
              </div>
            </div>
          </div>

          {/* Configuração */}
          <div className="card flex flex-col gap-5">
            <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
              Configurar plano desta semana
            </h3>

            {/* Objetivo */}
            <div>
              <label className="label-campo">Objetivo principal da semana</label>
              <div className="flex flex-wrap gap-2">
                {OBJETIVOS.map(o => (
                  <button key={o} onClick={() => setObjetivo(o)}
                    className="px-3 py-2 rounded-xl text-sm transition-all"
                    style={{
                      background: objetivo === o ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                      border: `1px solid ${objetivo === o ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`,
                      color: objetivo === o ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                    }}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Foco especial */}
            <div>
              <label className="label-campo">Foco especial esta semana (opcional)</label>
              <input value={foco} onChange={e => setFoco(e.target.value)}
                placeholder="Ex: lançamento do plano Agência, promoção de Páscoa, nova funcionalidade..."
                className="input-campo w-full" />
            </div>

            {/* Temas sugeridos */}
            <div>
              <label className="label-campo">Temas sugeridos — clica para adicionar ao foco</label>
              <div className="flex flex-wrap gap-2">
                {TEMAS_SUGERIDOS.map(t => (
                  <button key={t} onClick={() => setFoco(f => f ? `${f}, ${t}` : t)}
                    className="px-3 py-1.5 rounded-xl text-xs transition-all"
                    style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,123,250,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--cor-marca)' }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--cor-borda)'; (e.currentTarget as HTMLElement).style.color = 'var(--cor-texto-muted)' }}>
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Barra de progresso */}
            {carregando && (
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: 'var(--cor-texto-muted)' }}>A criar o teu plano semanal...</span>
                  <span style={{ color: 'var(--cor-marca)' }}>{Math.round(progresso)}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'var(--cor-borda)' }}>
                  <div className="h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progresso}%`, background: 'linear-gradient(90deg, #7c7bfa, #c084fc)' }} />
                </div>
              </div>
            )}

            <button onClick={gerarPlano} disabled={carregando}
              className="btn-primario justify-center py-3"
              style={carregando ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
              {carregando
                ? <><Loader size={16} className="animate-spin" /> A gerar plano...</>
                : <><Sparkles size={16} /> Gerar plano semanal completo</>}
            </button>
          </div>

          {/* Resultado */}
          {plano && (
            <>
              {/* Estratégia */}
              <div className="card" style={{ background: 'rgba(124,123,250,0.06)', border: '1px solid rgba(124,123,250,0.2)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} style={{ color: 'var(--cor-marca)' }} />
                  <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>Estratégia da semana</h3>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--cor-texto-muted)' }}>{plano.estrategia}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl" style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--cor-aviso)' }}>🎯 Objetivo</p>
                    <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>{plano.objetivo_semana}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--cor-sucesso)' }}>💡 Dica de crescimento</p>
                    <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>{plano.dica_crescimento}</p>
                  </div>
                </div>
              </div>

              {/* Posts */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--fonte-display)' }}>
                    📅 Plano de 7 dias
                  </h3>
                  <button onClick={gerarPlano}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl"
                    style={{ color: 'var(--cor-texto-muted)', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                    <RefreshCw size={13} /> Regenerar
                  </button>
                </div>

                {plano.posts.map((post, i) => (
                  <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>

                    {/* Header do post */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer"
                      style={{ background: expandido === i ? 'rgba(124,123,250,0.05)' : 'transparent' }}
                      onClick={() => setExpand(expandido === i ? null : i)}>

                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                        style={{ background: `${COR_FORMATO[post.formato] || '#7c7bfa'}15`, border: `1px solid ${COR_FORMATO[post.formato] || '#7c7bfa'}30` }}>
                        {post.formato === 'Reel' ? '🎬' : post.formato === 'Carrossel' ? '🎠' : post.formato === 'Story' ? '📱' : '🖼️'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{post.dia}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${COR_FORMATO[post.formato] || '#7c7bfa'}15`, color: COR_FORMATO[post.formato] || '#7c7bfa', border: `1px solid ${COR_FORMATO[post.formato] || '#7c7bfa'}30` }}>
                            {post.formato}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>🕐 {post.hora}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: post.score_viral >= 80 ? 'rgba(52,211,153,0.1)' : 'rgba(124,123,250,0.1)', color: post.score_viral >= 80 ? 'var(--cor-sucesso)' : 'var(--cor-marca)', border: `1px solid ${post.score_viral >= 80 ? 'rgba(52,211,153,0.3)' : 'rgba(124,123,250,0.3)'}` }}>
                            🔥 {post.score_viral}/100
                          </span>
                        </div>
                        <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--cor-texto-muted)' }}>{post.tema}</p>
                      </div>

                      {expandido === i ? <ChevronUp size={16} style={{ color: 'var(--cor-texto-muted)', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: 'var(--cor-texto-muted)', flexShrink: 0 }} />}
                    </div>

                    {/* Conteúdo expandido */}
                    {expandido === i && (
                      <div className="flex flex-col gap-4 p-4 pt-0">
                        <div style={{ height: 1, background: 'var(--cor-borda)' }} />

                        {/* Hook */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Zap size={14} style={{ color: 'var(--cor-aviso)' }} />
                              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--cor-texto-muted)' }}>Hook</span>
                            </div>
                            <button onClick={() => copiar(post.hook, `hook-${i}`)}
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                              style={{ color: copiado === `hook-${i}` ? 'var(--cor-sucesso)' : 'var(--cor-texto-muted)', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                              {copiado === `hook-${i}` ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                            </button>
                          </div>
                          <div className="p-3 rounded-xl text-sm font-medium"
                            style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', color: 'var(--cor-texto)' }}>
                            {post.hook}
                          </div>
                        </div>

                        {/* Legenda */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--cor-texto-muted)' }}>Legenda</span>
                            <button onClick={() => copiar(`${post.legenda}\n\n${post.hashtags.join(' ')}`, `legenda-${i}`)}
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                              style={{ color: copiado === `legenda-${i}` ? 'var(--cor-sucesso)' : 'var(--cor-marca)', background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)' }}>
                              {copiado === `legenda-${i}` ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar tudo</>}
                            </button>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-line p-3 rounded-xl"
                            style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
                            {post.legenda}
                          </p>
                        </div>

                        {/* Hashtags */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Hash size={14} style={{ color: 'var(--cor-info)' }} />
                              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--cor-texto-muted)' }}>Hashtags</span>
                            </div>
                            <button onClick={() => copiar(post.hashtags.join(' '), `hashtags-${i}`)}
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                              style={{ color: copiado === `hashtags-${i}` ? 'var(--cor-sucesso)' : 'var(--cor-texto-muted)', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                              {copiado === `hashtags-${i}` ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {post.hashtags.map((h, j) => (
                              <span key={j} className="text-xs px-2.5 py-1 rounded-full"
                                style={{ background: 'rgba(96,165,250,0.1)', color: 'var(--cor-info)', border: '1px solid rgba(96,165,250,0.2)' }}>
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Sugestão de imagem */}
                        <div className="p-3 rounded-xl"
                          style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.2)' }}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <ImageIcon size={13} style={{ color: '#c084fc' }} />
                            <span className="text-xs font-semibold" style={{ color: '#c084fc' }}>Sugestão de imagem/visual</span>
                          </div>
                          <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>{post.sugestao_imagem}</p>
                        </div>

                        {/* Botão publicar */}
                        <button
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
                          style={{ background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.3)', color: 'var(--cor-marca)' }}>
                          <Send size={14} /> Guardar no calendário
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </LayoutPainel>
    </>
  )
}
